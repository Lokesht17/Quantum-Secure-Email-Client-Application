import { motion } from "framer-motion";
import { Shield, Lock, ShieldCheck, AlertTriangle, Eye, ArrowRight, ShieldOff, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const gmailRisks = [
  {
    icon: ShieldOff,
    title: "No End-to-End Encryption",
    desc: "Standard Gmail uses TLS for transport only. Google can read your emails on their servers — they're stored in plaintext.",
  },
  {
    icon: AlertTriangle,
    title: "Vulnerable to Data Breaches",
    desc: "Centralized storage means a single breach can expose millions of accounts. Your emails are only as safe as Google's servers.",
  },
  {
    icon: Eye,
    title: "Scanned for Advertising",
    desc: "Gmail historically scans email content for targeted ads. Your private conversations contribute to profiling and data harvesting.",
  },
];

const secureAdvantages = [
  {
    icon: Lock,
    title: "Password-Based E2E Encryption",
    desc: "Every email is encrypted with a password only the sender and recipient know. Not even our servers can decrypt your messages.",
  },
  {
    icon: Shield,
    title: "Post-Quantum Protection",
    desc: "CRYSTALS-Kyber key exchange ensures your emails remain secure even against future quantum computers that could break RSA/ECC.",
  },
  {
    icon: CheckCircle2,
    title: "Zero-Knowledge Architecture",
    desc: "We never see your decrypted content. Keys are derived client-side from your password using PBKDF2, and encryption happens in your browser.",
  },
];

export default function Dashboard() {
  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative rounded-2xl overflow-hidden bg-card border border-border p-10"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-accent-foreground" />
            </div>
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-emerald-light text-accent border border-accent/20">
              Post-Quantum Protected
            </span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Quantum Secure<br />
            <span className="text-accent">Email Client</span>
          </h1>
          <p className="text-muted-foreground max-w-lg text-lg leading-relaxed">
            Secure communication powered by Post-Quantum Cryptography. Your emails are protected against both classical and quantum computing threats.
          </p>
          <div className="flex gap-3 mt-6">
            <Link to="/compose">
              <Button className="bg-gradient-primary text-accent-foreground font-semibold hover:opacity-90 px-6">
                Compose Secure Email
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/inbox">
              <Button variant="outline" className="border-border hover:bg-secondary font-medium">
                Open Inbox
              </Button>
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Why Normal Gmail Isn't Safe */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-foreground mb-2">Why Standard Email Isn't Safe</h2>
          <p className="text-muted-foreground mb-6">Traditional email services like Gmail leave your messages exposed to multiple risks.</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-4">
          {gmailRisks.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i + 0.2, duration: 0.5 }}
              className="bg-card rounded-xl border border-border p-6 hover:shadow-elevated transition-shadow"
            >
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center mb-4">
                <item.icon className="w-5 h-5 text-destructive" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How Quantum Secure Email Protects You */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-foreground mb-2">How Quantum Secure Email Protects You</h2>
          <p className="text-muted-foreground mb-6">Our approach ensures true privacy with military-grade, future-proof encryption.</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-4">
          {secureAdvantages.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i + 0.4, duration: 0.5 }}
              className="bg-card rounded-xl border border-border p-6 hover:shadow-elevated transition-shadow"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-light flex items-center justify-center mb-4">
                <item.icon className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
