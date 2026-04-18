```markdown
# 🔐 Quantum Secure Email Client

A secure email client with real end-to-end encryption using post-quantum cryptography. Unlike Gmail, the server never sees your message — everything is encrypted in your browser before sending.

---

## 🌐 Live Demo
[your-vercel-url.vercel.app](https://your-vercel-url.vercel.app)

> Register two accounts and send an encrypted email to see it in action.

---

## 💡 What It Does

- Send and receive emails that are encrypted end-to-end
- Uses CRYSTALS-Kyber768 — a quantum-safe encryption algorithm
- Even the database cannot read your messages
- Real-time inbox updates without page refresh
- Secure file attachments
- User authentication with session persistence

---

## 🛠️ Tools & Technologies

### Frontend
| Tool | Use |
|---|---|
| React 18 | UI framework |
| TypeScript | Type-safe code |
| Vite | Build tool |
| TailwindCSS | Styling |
| ShadCN UI | UI components |
| Framer Motion | Animations |
| React Router v6 | Page routing |
| React Context API | State management |
| Lucide React | Icons |
| date-fns | Date formatting |
| Sonner | Toast notifications |

### Cryptography
| Tool | Use |
|---|---|
| crystals-kyber-js | CRYSTALS-Kyber768 post-quantum encryption |
| Web Crypto API | AES-256-GCM encryption (browser built-in) |
| PBKDF2 | Password-based key derivation |

### Backend
| Tool | Use |
|---|---|
| Supabase | Backend as a service |
| PostgreSQL | Database for users and emails |
| Supabase Auth | Login and session management |
| Supabase Storage | File attachment storage |
| Supabase Realtime | Live inbox updates |
| Row Level Security | Per-user data protection |

### Deployment
| Tool | Use |
|---|---|
| Vercel | Hosting and auto-deployment |
| GitHub | Version control |

---

## 🔐 How Encryption Works

When you send an email:
1. Your message is encrypted using **AES-256-GCM** with a shared secret
2. The shared secret is generated using **CRYSTALS-Kyber768** key encapsulation
3. Only the encrypted ciphertext is stored in the database
4. The recipient uses their **private key** (stored only in their browser) to decrypt

**Original message:**
```
Hello, meeting confirmed for 3 PM tomorrow.
```
**What gets stored in the database:**
```
MLnL0f1ZbD3qv3476HFbW4T5UEbMqbv... (unreadable ciphertext)
```

---

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/your-username/quantum-secure-email.git
cd quantum-secure-email

# Install dependencies
npm install --legacy-peer-deps

# Add environment variables
# Create .env file with:
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Run locally
npm run dev
```

Open `http://localhost:8080`

---

## 👨‍💻 Developer

**Lokesh T**
Final Year Project — [Your College] | [Your Department] | [Year]
```
