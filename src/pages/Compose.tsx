import { useState, useRef } from "react";
import { encryptMessage, kyberEncryptMessage } from "@/lib/crypto";
import { motion } from "framer-motion";
import { Send, Paperclip, X, Shield, Lock, Eye, EyeOff, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

export default function Compose() {
  const { user } = useAuth();
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [usingKyber, setUsingKyber] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [encryptionPassword, setEncryptionPassword] = useState("");
  const [confirmEncryptionPassword, setConfirmEncryptionPassword] = useState("");
  const [showEncryptionPassword, setShowEncryptionPassword] = useState(false);

  const checkRecipientRegistered = async (email: string): Promise<string | null> => {
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email.trim())
      .single();
    return data?.id || null;
  };

  const handleSendClick = async () => {
    if (!to || !subject) {
      toast.error("Please fill in recipient and subject");
      return;
    }
    if (!body.trim()) {
      toast.error("Please write a message");
      return;
    }

    const recipientId = await checkRecipientRegistered(to.trim());
    if (!recipientId) {
      toast.error("Recipient email is not registered with the application");
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("public_key")
      .eq("email", to.trim())
      .single();

    setUsingKyber(!!profileData?.public_key);
    setShowPasswordDialog(true);
  };

  const handleConfirmSend = async () => {
    if (!encryptionPassword) {
      toast.error("Please enter an encryption password");
      return;
    }
    if (encryptionPassword.length < 8) {
      toast.error("Encryption password must be at least 8 characters");
      return;
    }
    if (encryptionPassword !== confirmEncryptionPassword) {
      toast.error("Encryption passwords do not match");
      return;
    }
    if (!user) {
      toast.error("You must be logged in to send emails");
      return;
    }

    setShowPasswordDialog(false);
    setSending(true);

    try {
      // Step 1: Get recipient's full profile
      const { data: recipientProfile, error: recipientError } = await supabase
        .from("profiles")
        .select("id, public_key")
        .eq("email", to.trim())
        .single();

      if (recipientError || !recipientProfile) {
        toast.error("Could not find recipient. Please try again.");
        setSending(false);
        return;
      }

      // Step 2: Encrypt body
      let encryptedBody: string;
      let kyberCiphertext: string | null = null;

      if (recipientProfile.public_key) {
        toast.info("Using CRYSTALS-Kyber quantum-secure encryption... 🔐");
        const result = await kyberEncryptMessage(body, recipientProfile.public_key);
        encryptedBody = result.encryptedBody;
        kyberCiphertext = result.kyberCiphertext;
      } else {
        encryptedBody = await encryptMessage(body, encryptionPassword);
      }

      // ✅ Preview is hidden — never shows real content
      const emailPayload = {
        sender: user.fullName,
        sender_email: user.email,
        recipient: to.trim(),
        subject,
        preview: "🔐 Encrypted Message",
        body: encryptedBody,
        is_encrypted: true,
        kyber_ciphertext: kyberCiphertext,
        cc: cc || null,
        bcc: bcc || null,
      };

      // Step 3: Insert SENT copy for sender
      const { data: sentEmail, error: sentError } = await supabase
        .from("emails")
        .insert({
          ...emailPayload,
          folder: "sent",
          owner_id: user.id,
        })
        .select()
        .single();

      if (sentError) throw sentError;

      // Step 4: Insert INBOX copy for recipient
      const { data: inboxEmail, error: inboxError } = await supabase
        .from("emails")
        .insert({
          ...emailPayload,
          folder: "inbox",
          owner_id: recipientProfile.id,
        })
        .select()
        .single();

      if (inboxError) throw inboxError;

      // Step 5: Upload attachments and link to both copies
      if (attachments.length > 0) {
        for (const file of attachments) {
          // ✅ Unique path using timestamp to avoid conflicts
          const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
          const path = `${sentEmail.id}/${Date.now()}_${safeName}`;

          const { error: uploadError } = await supabase.storage
            .from("attachments")
            .upload(path, file, {
              cacheControl: "3600",
              upsert: false,
            });

          if (uploadError) {
            console.error("Upload error:", uploadError);
            toast.error(`Failed to upload ${file.name}: ${uploadError.message}`);
            continue;
          }

          const attachmentRow = {
            name: file.name,
            size: file.size,
            type: file.type,
            storage_path: path,
          };

          // Link to sender's sent copy
          await supabase.from("email_attachments").insert({
            ...attachmentRow,
            email_id: sentEmail.id,
          });

          // Link to recipient's inbox copy
          await supabase.from("email_attachments").insert({
            ...attachmentRow,
            email_id: inboxEmail.id,
          });
        }
      }

      if (kyberCiphertext) {
        toast.success("Sent with CRYSTALS-Kyber quantum-secure encryption! ⚛️🔐");
      } else {
        toast.success("Encrypted email sent securely! 🔐");
      }

      // Reset form
      setTo("");
      setCc("");
      setBcc("");
      setSubject("");
      setBody("");
      setEncryptionPassword("");
      setConfirmEncryptionPassword("");
      setAttachments([]);
      setUsingKyber(false);

    } catch (error: any) {
      console.error("Send error:", error);
      toast.error(error.message || "Failed to send email");
    } finally {
      setSending(false);
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const maxSize = 25 * 1024 * 1024;
    const valid = Array.from(files).filter((f) => {
      if (f.size > maxSize) {
        toast.error(`${f.name} exceeds 25MB limit`);
        return false;
      }
      return true;
    });
    setAttachments((prev) => [...prev, ...valid]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
            <Send className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Compose Secure Email</h1>
            <p className="text-xs text-muted-foreground">
              End-to-end encrypted with CRYSTALS-Kyber768 + AES-256-GCM
            </p>
          </div>
        </div>

        <div
          className="bg-card rounded-xl border border-border p-6 shadow-card space-y-4"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">To</Label>
              <Input
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="recipient@gmail.com"
                className="bg-secondary border-border mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">CC</Label>
                <Input
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                  placeholder="cc@gmail.com"
                  className="bg-secondary border-border mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">BCC</Label>
                <Input
                  value={bcc}
                  onChange={(e) => setBcc(e.target.value)}
                  placeholder="bcc@gmail.com"
                  className="bg-secondary border-border mt-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Subject</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject"
                className="bg-secondary border-border mt-1"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Message</Label>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your secure message..."
                rows={10}
                className="bg-secondary border-border mt-1 resize-none"
              />
            </div>
          </div>

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachments.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary border border-border text-xs"
                >
                  <Paperclip className="w-3 h-3 text-muted-foreground" />
                  <span className="text-foreground">{f.name}</span>
                  <span className="text-muted-foreground">
                    ({(f.size / 1024).toFixed(0)}KB)
                  </span>
                  <button
                    onClick={() => setAttachments((a) => a.filter((_, j) => j !== i))}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="border-border"
              >
                <Paperclip className="w-4 h-4 mr-2" /> Attach
              </Button>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-3">
                <Shield className="w-3.5 h-3.5 text-accent" />
                Kyber768 + AES-256-GCM
              </div>
            </div>
            <Button
              onClick={handleSendClick}
              disabled={sending}
              className="bg-gradient-primary text-accent-foreground font-semibold hover:opacity-90 px-6"
            >
              {sending ? "Encrypting & Sending..." : "Send Secure Email"}
              <Send className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Encryption Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-accent" />
              Encryption Password
            </DialogTitle>
            <DialogDescription>
              {usingKyber ? (
                <span className="flex items-center gap-1.5 text-accent font-medium">
                  <Zap className="w-3.5 h-3.5" />
                  CRYSTALS-Kyber768 quantum-secure encryption will be used.
                  Password protects your private key.
                </span>
              ) : (
                "Set a password to encrypt this email. The recipient must know this password to decrypt the message."
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-1">
            {usingKyber ? (
              <>
                <span className="px-2 py-1 rounded bg-secondary border border-border text-accent">Kyber768</span>
                <span>→</span>
                <span className="px-2 py-1 rounded bg-secondary border border-border">Shared Secret</span>
                <span>→</span>
                <span className="px-2 py-1 rounded bg-secondary border border-border">AES-256-GCM</span>
              </>
            ) : (
              <>
                <span className="px-2 py-1 rounded bg-secondary border border-border">PBKDF2</span>
                <span>→</span>
                <span className="px-2 py-1 rounded bg-secondary border border-border">AES-256-GCM</span>
              </>
            )}
          </div>

          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs text-muted-foreground">
                {usingKyber ? "Private Key Password" : "Encryption Password"}
              </Label>
              <div className="relative mt-1">
                <Input
                  type={showEncryptionPassword ? "text" : "password"}
                  value={encryptionPassword}
                  onChange={(e) => setEncryptionPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="bg-secondary border-border pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowEncryptionPassword(!showEncryptionPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showEncryptionPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Confirm Password</Label>
              <Input
                type="password"
                value={confirmEncryptionPassword}
                onChange={(e) => setConfirmEncryptionPassword(e.target.value)}
                placeholder="Re-enter password"
                className="bg-secondary border-border mt-1"
              />
            </div>
            {encryptionPassword &&
              confirmEncryptionPassword &&
              encryptionPassword !== confirmEncryptionPassword && (
                <p className="text-xs text-destructive">Passwords do not match</p>
              )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPasswordDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmSend}
              className="bg-gradient-primary text-accent-foreground font-semibold hover:opacity-90"
            >
              {usingKyber ? (
                <><Zap className="w-4 h-4 mr-2" /> Quantum Encrypt & Send</>
              ) : (
                <><Lock className="w-4 h-4 mr-2" /> Encrypt & Send</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
