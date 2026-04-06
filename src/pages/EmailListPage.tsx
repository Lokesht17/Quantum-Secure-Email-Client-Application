import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Email, EmailFolder } from "@/types/email";
import { EmailCard } from "@/components/EmailCard";
import { EmailDetail } from "@/components/EmailDetail";
import { Inbox as InboxIcon, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

interface EmailListPageProps {
  folder: EmailFolder;
  title: string;
}

export default function EmailListPage({ folder, title }: EmailListPageProps) {
  const { user } = useAuth();
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchEmails = async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("emails")
      .select("*, email_attachments(*)")
      .eq("folder", folder)
      .eq("owner_id", user.id)
      .order("timestamp", { ascending: false });

    if (error) {
      console.error("Error fetching emails:", error.message);
    } else {
      const mapped: Email[] = (data || []).map((e: any) => ({
        id: e.id,
        sender: e.sender,
        senderEmail: e.sender_email,
        recipient: e.recipient,
        subject: e.subject,
        preview: e.preview,
        body: e.body,
        timestamp: new Date(e.timestamp),
        isRead: e.is_read,
        isStarred: e.is_starred,
        isPinned: e.is_pinned,
        isEncrypted: e.is_encrypted,
        folder: e.folder,
        cc: e.cc,
        bcc: e.bcc,
        kyberCiphertext: e.kyber_ciphertext ?? null, // ✅ Kyber field mapped
        attachments: (e.email_attachments || []).map((a: any) => ({
          name: a.name,
          size: a.size,
          type: a.type,
          storagePath: a.storage_path,
        })),
      }));
      setEmails(mapped);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchEmails();
  }, [folder, user]);

  // Real-time updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`emails-${folder}-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "emails",
          filter: `owner_id=eq.${user.id}`,
        },
        () => {
          fetchEmails();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [folder, user]);

  const handleToggleStar = async (emailId: string, current: boolean) => {
    await supabase
      .from("emails")
      .update({ is_starred: !current })
      .eq("id", emailId);

    setEmails((prev) =>
      prev.map((e) => (e.id === emailId ? { ...e, isStarred: !current } : e))
    );
  };

  const handleToggleRead = async (emailId: string, current: boolean) => {
    await supabase
      .from("emails")
      .update({ is_read: !current })
      .eq("id", emailId);

    setEmails((prev) =>
      prev.map((e) => (e.id === emailId ? { ...e, isRead: !current } : e))
    );
  };

  const handleDelete = async (emailId: string) => {
    await supabase
      .from("emails")
      .update({ folder: "trash" })
      .eq("id", emailId);

    setEmails((prev) => prev.filter((e) => e.id !== emailId));
  };

  const handleEmailClick = async (email: Email) => {
    if (!email.isRead) {
      await supabase
        .from("emails")
        .update({ is_read: true })
        .eq("id", email.id);

      setEmails((prev) =>
        prev.map((e) => (e.id === email.id ? { ...e, isRead: true } : e))
      );
    }
    setSelectedEmail(email);
  };

  const filtered = emails.filter(
    (e) =>
      e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.sender.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Unread count for inbox badge
  const unreadCount =
    folder === "inbox"
      ? emails.filter((e) => !e.isRead).length
      : filtered.length;

  if (selectedEmail) {
    return (
      <EmailDetail
        email={selectedEmail}
        onBack={() => setSelectedEmail(null)}
        onDelete={() => {
          handleDelete(selectedEmail.id);
          setSelectedEmail(null);
        }}
        onToggleStar={() =>
          handleToggleStar(selectedEmail.id, selectedEmail.isStarred)
        }
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <InboxIcon className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">{title}</h1>

          {/* Only show badge if count > 0 */}
          {unreadCount > 0 && (
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {folder === "inbox" ? `${unreadCount} unread` : unreadCount}
            </span>
          )}
        </div>

        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted border-border text-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p>Loading emails...</p>
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <InboxIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No emails in {title.toLowerCase()}</p>
            </div>
          ) : (
            filtered.map((email, i) => (
              <motion.div
                key={email.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <EmailCard
                  email={email}
                  onClick={() => handleEmailClick(email)}
                  onToggleStar={() => handleToggleStar(email.id, email.isStarred)}
                  onToggleRead={() => handleToggleRead(email.id, email.isRead)}
                  onDelete={() => handleDelete(email.id)}
                />
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}