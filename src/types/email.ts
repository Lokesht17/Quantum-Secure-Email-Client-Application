export type EmailFolder = "inbox" | "sent" | "spam" | "trash";

export interface EmailAttachment {
  name: string;
  size: number;
  type: string;
  storagePath: string;
}

export interface Email {
  id: string;
  sender: string;
  senderEmail: string;
  recipient: string;
  subject: string;
  preview: string;
  body: string;
  timestamp: Date;
  isRead: boolean;
  isStarred: boolean;
  isPinned: boolean;
  isEncrypted: boolean;
  folder: EmailFolder;
  attachments?: EmailAttachment[];
  cc?: string;
  bcc?: string;
  kyberCiphertext?: string | null; // ✅ CRYSTALS-Kyber768 ciphertext for PQC emails
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  createdAt: Date;
  securityStatus: "active" | "warning" | "critical";
}