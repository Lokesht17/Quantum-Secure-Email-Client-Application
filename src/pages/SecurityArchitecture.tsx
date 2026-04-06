import { motion } from "framer-motion";
import { Shield, Lock, Key, ArrowDown, FileKey, Server, Inbox } from "lucide-react";

const algorithms = [
  {
    icon: Key,
    title: "CRYSTALS-Kyber",
    subtitle: "Post-Quantum Key Exchange",
    desc: "A lattice-based key encapsulation mechanism selected by NIST for post-quantum standardization. Resistant to attacks from both classical and quantum computers.",
  },
  {
    icon: Lock,
    title: "AES-256-GCM",
    subtitle: "Symmetric Encryption",
    desc: "Military-grade authenticated encryption providing both confidentiality and integrity. Used to encrypt email content and attachments with a 256-bit key.",
  },
  {
    icon: FileKey,
    title: "PBKDF2 / Argon2",
    subtitle: "Password Key Derivation",
    desc: "Derives a strong cryptographic key from the user's password using iterative hashing with salt, making brute-force attacks computationally infeasible.",
  },
];

const flowSteps = [
  { icon: Shield, label: "User Message", desc: "Compose your email content" },
  { icon: FileKey, label: "Password Key Derivation", desc: "PBKDF2/Argon2 derives key from password" },
  { icon: Key, label: "Kyber Secure Key Exchange", desc: "Post-quantum key encapsulation" },
  { icon: Lock, label: "AES-256 Encryption", desc: "Content encrypted with derived session key" },
  { icon: Server, label: "Secure Email Storage", desc: "Ciphertext stored on server" },
  { icon: Inbox, label: "Receiver Decryption", desc: "Password + Kyber key decrypts message" },
];

export default function SecurityArchitecture() {
  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground mb-2">Security Architecture</h1>
        <p className="text-muted-foreground">
          How Quantum Secure Email protects your communications using post-quantum cryptography.
        </p>
      </motion.div>

      {/* Post-Quantum Encryption Model */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-xl border border-border p-6 shadow-card"
      >
        <h2 className="text-lg font-semibold text-foreground mb-2">Post-Quantum Encryption Model</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Our system combines three cryptographic primitives to provide end-to-end security that is resistant
          to quantum computing threats: <strong>CRYSTALS-Kyber</strong> for key exchange,{" "}
          <strong>AES-256-GCM</strong> for message encryption, and <strong>PBKDF2/Argon2</strong> for
          password-based key derivation. This layered approach ensures that even if one layer is compromised,
          your data remains protected.
        </p>
      </motion.section>

      {/* Algorithm Details */}
      <section className="grid md:grid-cols-3 gap-4">
        {algorithms.map((alg, i) => (
          <motion.div
            key={alg.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.08 }}
            className="bg-card rounded-xl border border-border p-5 shadow-card hover:shadow-elevated transition-shadow"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-light flex items-center justify-center mb-4">
              <alg.icon className="w-5 h-5 text-accent" />
            </div>
            <h3 className="font-semibold text-foreground mb-0.5">{alg.title}</h3>
            <p className="text-xs text-accent font-medium mb-2">{alg.subtitle}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{alg.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Encryption Workflow Diagram */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-lg font-semibold text-foreground mb-6">Encryption Workflow</h2>
        <div className="flex flex-col items-center gap-1">
          {flowSteps.map((step, i) => (
            <div key={step.label} className="flex flex-col items-center">
              <div className="flex items-center gap-4 bg-card border border-border rounded-xl px-6 py-4 w-full max-w-md shadow-card">
                <div className="w-10 h-10 rounded-lg bg-emerald-light flex items-center justify-center shrink-0">
                  <step.icon className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{step.label}</p>
                  <p className="text-xs text-muted-foreground">{step.desc}</p>
                </div>
              </div>
              {i < flowSteps.length - 1 && (
                <ArrowDown className="w-4 h-4 text-muted-foreground my-1" />
              )}
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
