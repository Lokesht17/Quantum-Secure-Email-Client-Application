import { useState } from "react";
import { Email } from "@/types/email";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, Unlock, Download, Paperclip, Shield, Clock, Eye, EyeOff, Star, Trash2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { decryptMessage, kyberDecryptMessage, loadPrivateKey } from "@/lib/crypto";
import { useAuth } from "@/contexts/AuthContext";

interface EmailDetailProps {
  email: Email;
  onBack: () => void;
  onDelete?: () => void;
  onToggleStar?: () => void;
}

export function EmailDetail({ email, onBack, onDelete, onToggleStar }: EmailDetailProps) {
  const { user } = useAuth();
  const [decrypted, setDecrypted] = useState(!email.isEncrypted);
  const [decrypting, setDecrypting] = useState(false);
  const [body, setBody] = useState(email.isEncrypted ? "" : email.body);
  const [decryptPassword, setDecryptPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [starred, setStarred] = useState(email.isStarred);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Is this a Kyber-encrypted email?
  const isKyberEmail = !!email.kyberCiphertext;

  const handleDecrypt = async () => {
    if (!decryptPassword) {
      toast.error("Please enter the decryption password");
      return;
    }
    if (decryptPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setDecrypting(true);

    try {
      let decryptedText: string;

      if (isKyberEmail && user) {
        // ✅ Quantum-secure path — Kyber768 decapsulation + AES-256-GCM
        const privateKey = loadPrivateKey(user.id, decryptPassword);

        if (!privateKey) {
          toast.error("Wrong password — could not load your private key");
          setDecrypting(false);
          return;
        }

        decryptedText = await kyberDecryptMessage(
          email.body,
          email.kyberCiphertext!,
          privateKey
        );
      } else {
        // ✅ Fallback path — PBKDF2 + AES-256-GCM (old emails still work)
        decryptedText = await decryptMessage(email.body, decryptPassword);
      }

      setBody(decryptedText);
      setDecrypted(true);
      toast.success(
        isKyberEmail
          ? "Quantum-decrypted successfully ⚛️🔓"
          : "Message decrypted successfully 🔓"
      );
    } catch (err) {
      toast.error("Wrong password — could not decrypt message");
    } finally {
      setDecrypting(false);
    }
  };

  const handleStar = async () => {
    const newStarred = !starred;
    setStarred(newStarred);
    await supabase
      .from("emails")
      .update({ is_starred: newStarred })
      .eq("id", email.id);
    onToggleStar?.();
  };

  const handleDelete = async () => {
    await supabase
      .from("emails")
      .update({ folder: "trash" })
      .eq("id", email.id);
    toast.success("Email moved to trash");
    onDelete?.();
  };

  const handleDownloadAttachment = async (storagePath: string, fileName: string) => {
    setDownloadingId(storagePath);
    try {
      const { data, error } = await supabase.storage
        .from("attachments")
        .createSignedUrl(storagePath, 60);

      if (error || !data?.signedUrl) {
        toast.error("Failed to get download link");
        return;
      }

      const link = document.createElement("a");
      link.href = data.signedUrl;
      link.download = fileName;
      link.click();
      toast.success(`Downloading ${fileName}`);
    } catch (err) {
      toast.error("Download failed");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-3xl mx-auto"
    >
      {/* Back + Actions */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to list
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleStar}
            className="text-muted-foreground hover:text-warning"
          >
            <Star className={`w-4 h-4 ${starred ? "fill-warning text-warning" : ""}`} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 shadow-card">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-foreground mb-2">{email.subject}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                From: <strong className="text-foreground">{email.sender}</strong>{" "}
                ({email.senderEmail})
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              <span>To: {email.recipient}</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {format(new Date(email.timestamp), "PPpp")}
              </span>
            </div>
            {email.cc && (
              <div className="text-sm text-muted-foreground mt-1">
                CC: {email.cc}
              </div>
            )}
          </div>

          {/* Encryption badge — shows Kyber or standard */}
          {email.isEncrypted && (
            <div className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border ${
              isKyberEmail
                ? "bg-accent/10 text-accent border-accent/30"
                : "bg-emerald-light text-accent border-accent/20"
            }`}>
              {isKyberEmail ? (
                <><Zap className="w-3 h-3" /> {decrypted ? "Kyber Decrypted" : "Kyber Encrypted"}</>
              ) : (
                <><Shield className="w-3 h-3" /> {decrypted ? "Decrypted" : "Encrypted"}</>
              )}
            </div>
          )}
        </div>

        {/* Encryption banner */}
        {email.isEncrypted && !decrypted && (
          <div className="bg-secondary rounded-lg p-6 text-center mb-6 border border-border">
            {isKyberEmail ? (
              <Zap className="w-10 h-10 text-accent mx-auto mb-3" />
            ) : (
              <Lock className="w-10 h-10 text-accent mx-auto mb-3" />
            )}

            <p className="text-foreground font-medium mb-1">
              {isKyberEmail
                ? "Quantum-secured with CRYSTALS-Kyber768"
                : "This message is encrypted"}
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              {isKyberEmail
                ? "Enter your account password to decapsulate the Kyber shared secret and decrypt"
                : "Enter the encryption password set by the sender to decrypt this message"}
            </p>

            {/* Decryption pipeline visual */}
            <div className="flex items-center justify-center gap-2 mb-4 text-xs text-muted-foreground">
              {isKyberEmail ? (
                <>
                  <span className="px-2 py-1 rounded bg-card border border-border text-accent">Kyber768</span>
                  <span>→</span>
                  <span className="px-2 py-1 rounded bg-card border border-border">Shared Secret</span>
                  <span>→</span>
                  <span className="px-2 py-1 rounded bg-card border border-border">AES-256-GCM</span>
                  <span>→</span>
                  <span className="px-2 py-1 rounded bg-card border border-border">Plaintext</span>
                </>
              ) : (
                <>
                  <span className="px-2 py-1 rounded bg-card border border-border">PBKDF2</span>
                  <span>→</span>
                  <span className="px-2 py-1 rounded bg-card border border-border">AES-256-GCM</span>
                  <span>→</span>
                  <span className="px-2 py-1 rounded bg-card border border-border">Plaintext</span>
                </>
              )}
            </div>

            <div className="max-w-xs mx-auto mb-4">
              <Label className="text-xs text-muted-foreground text-left block mb-1">
                {isKyberEmail ? "Account Password" : "Decryption Password"}
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={decryptPassword}
                  onChange={(e) => setDecryptPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleDecrypt()}
                  placeholder="Enter password"
                  className="bg-card border-border pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              onClick={handleDecrypt}
              disabled={decrypting || !decryptPassword}
              className="bg-gradient-primary text-accent-foreground font-semibold hover:opacity-90"
            >
              {decrypting ? (
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isKyberEmail ? "Decapsulating..." : "Decrypting..."}
                </span>
              ) : isKyberEmail ? (
                <><Zap className="w-4 h-4 mr-2" /> Quantum Decrypt</>
              ) : (
                <><Unlock className="w-4 h-4 mr-2" /> Decrypt Message</>
              )}
            </Button>
          </div>
        )}

        {/* Decrypted body */}
        {decrypted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-foreground leading-relaxed whitespace-pre-wrap text-sm"
          >
            {body}
          </motion.div>
        )}

        {/* Attachments */}
        {email.attachments && email.attachments.length > 0 && (
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <Paperclip className="w-3 h-3" /> Attachments
            </p>
            <div className="flex flex-wrap gap-2">
              {email.attachments.map((att) => (
                <div
                  key={att.name}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary border border-border text-sm"
                >
                  <Paperclip className="w-3 h-3 text-muted-foreground" />
                  <span className="text-foreground">{att.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({(att.size / 1000000).toFixed(1)}MB)
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-accent"
                    disabled={downloadingId === att.storagePath}
                    onClick={() => handleDownloadAttachment(att.storagePath, att.name)}
                  >
                    {downloadingId === att.storagePath ? (
                      <span className="w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Download className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}