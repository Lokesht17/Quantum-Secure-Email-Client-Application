import { useState } from "react";
import { Email } from "@/types/email";
import { Star, Lock, Paperclip, Pin, Trash2, MailOpen, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface EmailCardProps {
  email: Email;
  onClick: () => void;
  onToggleStar?: () => void;
  onToggleRead?: () => void;
  onDelete?: () => void;
}

export function EmailCard({ email, onClick, onToggleStar, onToggleRead, onDelete }: EmailCardProps) {
  const [starred, setStarred] = useState(email.isStarred);
  const [isRead, setIsRead] = useState(email.isRead);

  const handleStar = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStarred(!starred);
    onToggleStar?.();
  };

  const handleToggleRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRead(!isRead);
    onToggleRead?.();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer border transition-all duration-200 group",
        isRead
          ? "bg-card border-transparent hover:border-border hover:shadow-card"
          : "bg-card border-border shadow-card"
      )}
    >
      {/* Star */}
      <button onClick={handleStar} className="shrink-0">
        <Star
          className={cn(
            "w-4 h-4 transition-colors",
            starred
              ? "fill-warning text-warning"
              : "text-muted-foreground hover:text-warning"
          )}
        />
      </button>

      {email.isPinned && <Pin className="w-3 h-3 text-accent shrink-0" />}

      {/* Email Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={cn("text-sm truncate", !isRead && "font-semibold text-foreground")}>
            {email.sender}
          </span>
          {email.isEncrypted && <Lock className="w-3 h-3 text-accent shrink-0" />}
          {email.attachments && email.attachments.length > 0 && (
            <Paperclip className="w-3 h-3 text-muted-foreground shrink-0" />
          )}
        </div>
        <p className={cn("text-sm truncate", !isRead ? "text-foreground" : "text-muted-foreground")}>
          {email.subject}
        </p>
        <p className="text-xs text-muted-foreground truncate mt-0.5">{email.preview}</p>
      </div>

      {/* Timestamp */}
      <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">
        {formatDistanceToNow(new Date(email.timestamp), { addSuffix: true })}
      </span>

      {/* Action buttons — visible on hover */}
      <div className="hidden group-hover:flex items-center gap-1 shrink-0">
        <button
          onClick={handleToggleRead}
          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title={isRead ? "Mark unread" : "Mark read"}
        >
          {isRead ? <Mail className="w-3.5 h-3.5" /> : <MailOpen className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={handleDelete}
          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}