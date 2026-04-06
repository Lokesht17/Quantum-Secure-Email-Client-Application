// ============================================================
// EXISTING AES-256-GCM FUNCTIONS (unchanged)
// ============================================================

const getCrypto = () => {
  if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
    return window.crypto;
  }
  throw new Error("Web Crypto API is not available. Please use HTTPS or localhost.");
};

const deriveKey = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
  const subtle = getCrypto().subtle;
  const encoder = new TextEncoder();

  const keyMaterial = await subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
};

export const encryptMessage = async (plainText: string, password: string): Promise<string> => {
  const subtle = getCrypto().subtle;
  const encoder = new TextEncoder();
  const salt = getCrypto().getRandomValues(new Uint8Array(16));
  const iv = getCrypto().getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);

  const encrypted = await subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(plainText)
  );

  const combined = new Uint8Array([...salt, ...iv, ...new Uint8Array(encrypted)]);
  return btoa(String.fromCharCode(...combined));
};

export const decryptMessage = async (encryptedBase64: string, password: string): Promise<string> => {
  const subtle = getCrypto().subtle;
  const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));

  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 28);
  const data = combined.slice(28);
  const key = await deriveKey(password, salt);

  const decrypted = await subtle.decrypt({ name: "AES-GCM", iv }, key, data);
  return new TextDecoder().decode(decrypted);
};

// ============================================================
// AES HELPERS FOR RAW KEY BYTES (used with Kyber shared secret)
// ============================================================

const aesEncryptWithKey = async (plainText: string, keyBytes: Uint8Array): Promise<string> => {
  const subtle = getCrypto().subtle;
  const iv = getCrypto().getRandomValues(new Uint8Array(12));

  const key = await subtle.importKey(
    "raw", keyBytes.slice(0, 32),
    { name: "AES-GCM" }, false, ["encrypt"]
  );

  const encrypted = await subtle.encrypt(
    { name: "AES-GCM", iv }, key,
    new TextEncoder().encode(plainText)
  );

  const combined = new Uint8Array([...iv, ...new Uint8Array(encrypted)]);
  return btoa(String.fromCharCode(...combined));
};

const aesDecryptWithKey = async (encryptedBase64: string, keyBytes: Uint8Array): Promise<string> => {
  const subtle = getCrypto().subtle;
  const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));

  const iv = combined.slice(0, 12);
  const data = combined.slice(12);

  const key = await subtle.importKey(
    "raw", keyBytes.slice(0, 32),
    { name: "AES-GCM" }, false, ["decrypt"]
  );

  const decrypted = await subtle.decrypt({ name: "AES-GCM", iv }, key, data);
  return new TextDecoder().decode(decrypted);
};

// ============================================================
// REAL CRYSTALS-Kyber768 IMPLEMENTATION ⚛️
// generateKeyPair() → [publicKey, privateKey]
// encap(publicKey)  → [ciphertext, sharedSecret]
// decap(ciphertext, privateKey) → sharedSecret
// ============================================================

const getKyber = async () => {
  const { Kyber768 } = await import("crystals-kyber-js");
  return new Kyber768();
};

export const generateKyberKeyPair = async (): Promise<{
  publicKey: string;
  privateKey: string;
}> => {
  const kyber = await getKyber();
  const [publicKey, privateKey] = await kyber.generateKeyPair();

  return {
    publicKey: btoa(String.fromCharCode(...publicKey)),
    privateKey: btoa(String.fromCharCode(...privateKey)),
  };
};

export const storePrivateKey = (userId: string, privateKey: string, password: string) => {
  const encoded = btoa(unescape(encodeURIComponent(`${password}::SPLIT::${privateKey}`)));
  localStorage.setItem(`kyber_pk_${userId}`, encoded);
};

export const loadPrivateKey = (userId: string, password: string): string | null => {
  const encoded = localStorage.getItem(`kyber_pk_${userId}`);
  if (!encoded) return null;
  try {
    const decoded = decodeURIComponent(escape(atob(encoded)));
    const splitIndex = decoded.indexOf("::SPLIT::");
    if (splitIndex === -1) return null;
    const storedPassword = decoded.substring(0, splitIndex);
    const privateKey = decoded.substring(splitIndex + 9);
    if (storedPassword !== password) return null;
    return privateKey;
  } catch {
    return null;
  }
};

export const kyberEncryptMessage = async (
  plainText: string,
  recipientPublicKeyBase64: string
): Promise<{ encryptedBody: string; kyberCiphertext: string }> => {
  const kyber = await getKyber();

  // Convert base64 public key to Uint8Array
  const publicKeyBytes = Uint8Array.from(
    atob(recipientPublicKeyBase64),
    c => c.charCodeAt(0)
  );

  // Kyber768 encapsulation
  // Returns [ciphertext, sharedSecret]
  const [ciphertextBytes, sharedSecret] = await kyber.encap(publicKeyBytes);

  // Encrypt message with the Kyber shared secret as AES-256-GCM key
  const encryptedBody = await aesEncryptWithKey(plainText, sharedSecret);

  return {
    encryptedBody,
    kyberCiphertext: btoa(String.fromCharCode(...ciphertextBytes)),
  };
};

export const kyberDecryptMessage = async (
  encryptedBody: string,
  kyberCiphertextBase64: string,
  privateKeyBase64: string
): Promise<string> => {
  const kyber = await getKyber();

  // Convert base64 strings back to Uint8Arrays
  const privateKeyBytes = Uint8Array.from(
    atob(privateKeyBase64),
    c => c.charCodeAt(0)
  );

  const ciphertextBytes = Uint8Array.from(
    atob(kyberCiphertextBase64),
    c => c.charCodeAt(0)
  );

  // Kyber768 decapsulation — recovers exact same shared secret
  const sharedSecret = await kyber.decap(ciphertextBytes, privateKeyBytes);

  // Decrypt message using recovered shared secret
  return aesDecryptWithKey(encryptedBody, sharedSecret);
};