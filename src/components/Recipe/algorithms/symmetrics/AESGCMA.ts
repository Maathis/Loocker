import { EncryptionAlgorithm } from "../EncryptionAlgorithm";
import { SymmetricAlgorithm } from "./SymmetricAlgo";

export class AESGCMAlgorithm extends SymmetricAlgorithm {
  private static readonly IV_LENGTH = 12; // bytes
  private cryptoKey: CryptoKey | null = null;

  constructor() {
    super("aes256gcm", "AES-256-GCM");
  }

  private padKeyTo256Bits(key: Buffer): Uint8Array {
    const keyBytes = new Uint8Array(key.buffer, key.byteOffset, key.byteLength);
    const padded = new Uint8Array(32);
    padded.set(keyBytes.slice(0, 32));
    return padded;
  }

  async setKey(key: Buffer) {
    const key256 = this.padKeyTo256Bits(key);

    console.log("Key (hex):", EncryptionAlgorithm.toHex(key256));

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
    const plaintext = typeof data === "string" ? new TextEncoder().encode(data) : data;

    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv,
      },
      this.cryptoKey,
      plaintext
    );

    const encryptedBytes = new Uint8Array(encrypted);
    const tagLength = 16;
    const cipherOnly = encryptedBytes.slice(0, encryptedBytes.length - tagLength);
    const gcmTag = encryptedBytes.slice(encryptedBytes.length - tagLength);

    const result = new Uint8Array(iv.length + encryptedBytes.length);
    result.set(iv);
    result.set(encryptedBytes, iv.length);

    // For the debug
    // console.log("==== DATA FOR CYBERCHEF DECRYPTION ====");
    // console.log("IV (hex):", EncryptionAlgorithm.toHex(iv));
    // console.log("Ciphertext full (hex):", EncryptionAlgorithm.toHex(result));
    // console.log("Ciphertext without tag (hex):", EncryptionAlgorithm.toHex(cipherOnly));
    // console.log("GCM Tag (hex):", EncryptionAlgorithm.toHex(gcmTag));
    // console.log("=======================================");

    return result;
  }

  async decrypt(encryptedData: Uint8Array | string): Promise<Uint8Array> {
    if (!this.cryptoKey) throw new Error("Key not set.");

    const input = typeof encryptedData === "string"
      ? Uint8Array.from(atob(encryptedData), (c) => c.charCodeAt(0))
      : encryptedData;

    const minLength = AESGCMAlgorithm.IV_LENGTH + 16;
    if (input.length < minLength) {
      throw new Error(`Encrypted data is too short. Minimum expected length is ${minLength}, got ${input.length}`);
    }

    const iv = input.slice(0, AESGCMAlgorithm.IV_LENGTH);
    const ciphertextWithTag = input.slice(AESGCMAlgorithm.IV_LENGTH);

    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
      },
      this.cryptoKey,
      ciphertextWithTag
    );

    return new Uint8Array(decrypted);
  }

}
