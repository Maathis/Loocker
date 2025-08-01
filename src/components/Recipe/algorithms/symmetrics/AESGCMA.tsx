// types/AESGCMAlgorithm.ts
import { EncryptionAlgorithm } from "../EncryptionAlgorithm";
import { SymmetricAlgorithm } from "./SymmetricAlgo";

export class AESGCMAlgorithm extends SymmetricAlgorithm {
  private static readonly IV_LENGTH = 12; // bytes
  private cryptoKey: CryptoKey | null = null;

  constructor() {
    super("aes256gcm", "AES-256-GCM");
  }

  private padKeyTo256Bits(key: Buffer): Uint8Array {
    const encoder = new TextEncoder();
    const keyBytes = encoder.encode(key.toString());
    const padded = new Uint8Array(32); // 32 bytes = 256 bits
    padded.set(keyBytes.slice(0, 32)); // copie au max 32 bytes
    // Si keyBytes < 32, le reste reste à 0 (padding avec des zéros)
    return padded;
  }

  async setKey(key: Buffer) {
    const key256 = this.padKeyTo256Bits(key);
    

    console.log("key256 (hex) : ", AESGCMAlgorithm.toHex(key256));
    console.log("key256 (base64) : ", AESGCMAlgorithm.toBase64(key256));
  
    if (key256.length !== 32) {
      throw new Error("Key must be 32 bytes (256 bits) for AES-256-GCM.");
    }
  
    this.cryptoKey = await window.crypto.subtle.importKey(
      "raw",
      key256,
      { name: "AES-GCM" },
      false,
      ["encrypt", "decrypt"]
    );
  }
  

  async encrypt(data: Uint8Array | string): Promise<Uint8Array> {
    if (!this.cryptoKey) throw new Error("Key not set.");

    const iv = window.crypto.getRandomValues(new Uint8Array(AESGCMAlgorithm.IV_LENGTH));

    const plaintext =
      typeof data === "string" ? new TextEncoder().encode(data) : new Uint8Array(data);

    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv,
      },
      this.cryptoKey,
      plaintext
    );

    const encryptedBytes = new Uint8Array(encrypted);

    // Concatenate IV + encrypted result
    const result = new Uint8Array(iv.length + encryptedBytes.length);
    result.set(iv);
    result.set(encryptedBytes, iv.length);

    return result;
  }

  async decrypt(encryptedData: Uint8Array | string): Promise<string> {
    if (!this.cryptoKey) throw new Error("Key not set.");

    const input =
      typeof encryptedData === "string"
        ? Uint8Array.from(atob(encryptedData), (c) => c.charCodeAt(0))
        : encryptedData;

    const iv = input.slice(0, AESGCMAlgorithm.IV_LENGTH);
    const ciphertext = input.slice(AESGCMAlgorithm.IV_LENGTH);

    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
      },
      this.cryptoKey,
      ciphertext
    );

    return new TextDecoder().decode(decrypted);
  }
}