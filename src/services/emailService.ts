import { Email, EmailFolder } from "@/types/email";

// Mock email data
const mockEmails: Email[] = [
  {
    id: "1",
    sender: "Alice Chen",
    senderEmail: "alice.chen@gmail.com",
    recipient: "you@gmail.com",
    subject: "Quantum Key Distribution Update",
    preview: "The latest QKD protocol has been tested successfully across our network nodes...",
    body: "Hi,\n\nThe latest QKD protocol has been tested successfully across our network nodes. The key exchange rates have improved by 40% compared to our previous implementation.\n\nWe're now ready to move to Phase 2 of the deployment. Please review the attached technical specifications.\n\nBest regards,\nAlice",
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    isRead: false,
    isStarred: true,
    isPinned: false,
    isEncrypted: true,
    folder: "inbox",
    attachments: [{ name: "QKD_Specs_v2.pdf", size: 2400000, type: "application/pdf" }],
  },
  {
    id: "2",
    sender: "Dr. Bob Martinez",
    senderEmail: "bob.martinez@gmail.com",
    recipient: "you@gmail.com",
    subject: "Re: Post-Quantum Cryptography Conference",
    preview: "Looking forward to your presentation on lattice-based cryptography...",
    body: "Dear colleague,\n\nLooking forward to your presentation on lattice-based cryptography at next month's conference. The committee was very impressed with your abstract.\n\nCould you send me your slides by Friday?\n\nBest,\nDr. Martinez",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    isRead: true,
    isStarred: false,
    isPinned: true,
    isEncrypted: true,
    folder: "inbox",
  },
  {
    id: "3",
    sender: "Security Team",
    senderEmail: "security@gmail.com",
    recipient: "you@gmail.com",
    subject: "Monthly Security Audit Report",
    preview: "Your account security score is 98/100. All quantum-safe protocols are active...",
    body: "Security Report Summary\n\nYour account security score: 98/100\n\nAll quantum-safe protocols are active and functioning correctly.\n\n- CRYSTALS-Kyber key exchange: Active\n- AES-256-GCM encryption: Active\n- Zero-knowledge proofs: Enabled\n\nNo suspicious activity detected.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    isRead: true,
    isStarred: false,
    isPinned: false,
    isEncrypted: false,
    folder: "inbox",
  },
  {
    id: "4",
    sender: "Eve Thompson",
    senderEmail: "eve.thompson@gmail.com",
    recipient: "you@gmail.com",
    subject: "Encrypted File Transfer Complete",
    preview: "The encrypted dataset has been successfully transferred using our quantum channel...",
    body: "Hi,\n\nThe encrypted dataset has been successfully transferred using our quantum channel. All 15GB of data was transmitted with zero errors.\n\nDecryption key has been sent via a separate quantum-secured channel.\n\nRegards,\nEve",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
    isRead: false,
    isStarred: false,
    isPinned: false,
    isEncrypted: true,
    folder: "inbox",
    attachments: [{ name: "dataset_encrypted.qbin", size: 15000000, type: "application/octet-stream" }],
  },
  {
    id: "5",
    sender: "You",
    senderEmail: "you@gmail.com",
    recipient: "alice.chen@gmail.com",
    subject: "Re: Quantum Key Distribution Update",
    preview: "Thanks Alice, I'll review the specs and get back to you by EOD...",
    body: "Thanks Alice,\n\nI'll review the specs and get back to you by EOD. The improvement in key exchange rates sounds promising.\n\nBest,\nYou",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    isRead: true,
    isStarred: false,
    isPinned: false,
    isEncrypted: true,
    folder: "sent",
  },
  {
    id: "6",
    sender: "Spam Bot",
    senderEmail: "totallylegit@scam.com",
    recipient: "you@gmail.com",
    subject: "You've won a FREE quantum computer!!!",
    preview: "Click here to claim your free 1000-qubit quantum computer...",
    body: "CONGRATULATIONS! You've been selected to receive a FREE quantum computer!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    isRead: false,
    isStarred: false,
    isPinned: false,
    isEncrypted: false,
    folder: "spam",
  },
];

export const emailService = {
  getEmails: (folder: EmailFolder): Promise<Email[]> => {
    return Promise.resolve(mockEmails.filter((e) => e.folder === folder));
  },

  getEmailById: (id: string): Promise<Email | undefined> => {
    return Promise.resolve(mockEmails.find((e) => e.id === id));
  },

  sendEmail: (email: Partial<Email>): Promise<{ success: boolean }> => {
    console.log("Sending encrypted email:", email);
    return Promise.resolve({ success: true });
  },

  deleteEmail: (id: string): Promise<void> => {
    const idx = mockEmails.findIndex((e) => e.id === id);
    if (idx !== -1) mockEmails[idx].folder = "trash";
    return Promise.resolve();
  },

  toggleStar: (id: string): Promise<void> => {
    const email = mockEmails.find((e) => e.id === id);
    if (email) email.isStarred = !email.isStarred;
    return Promise.resolve();
  },

  markAsRead: (id: string): Promise<void> => {
    const email = mockEmails.find((e) => e.id === id);
    if (email) email.isRead = true;
    return Promise.resolve();
  },

  toggleRead: (id: string): Promise<void> => {
    const email = mockEmails.find((e) => e.id === id);
    if (email) email.isRead = !email.isRead;
    return Promise.resolve();
  },

  decryptMessage: (id: string): Promise<string> => {
    const email = mockEmails.find((e) => e.id === id);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(email?.body || "Unable to decrypt message.");
      }, 1500);
    });
  },

  getStats: () => {
    return {
      totalInbox: mockEmails.filter((e) => e.folder === "inbox").length,
      unread: mockEmails.filter((e) => e.folder === "inbox" && !e.isRead).length,
      sent: mockEmails.filter((e) => e.folder === "sent").length,
      spam: mockEmails.filter((e) => e.folder === "spam").length,
    };
  },
};
