export type KeySourceValue = "passphrase" | "keyfile";

export type KeySource = Array<KeySourceValue> & {
  0?: KeySourceValue;
  1?: Exclude<KeySourceValue, typeof this[0]>;
};

export abstract class EncryptionAlgorithm {

  protected label: string;

  protected keySource: KeySource;

  constructor(label: string, keySource: KeySource) {
    this.label = label;
    this.keySource = keySource;
  }

  getLabel(): string {
    return this.label;
  }

  getKeySource(): KeySource {
    return this.keySource;
  }

  /**
   * Encrypts input data.
   * @param data Plain data to encrypt
   * @returns Encrypted data as Uint8Array or base64-encoded string
   */
  abstract encrypt(data: Uint8Array | string): Promise<Uint8Array>;

  /**
   * Decrypts input data.
   * @param encryptedData Encrypted input data
   * @returns Decrypted data as Uint8Array or string
   */
  abstract decrypt(encryptedData: Uint8Array | string): Promise<Uint8Array>;

  public static toHex(buffer: Uint8Array): string {
    return Array.from(buffer)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  public static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    const chunkSize = 0x8000;
  
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
  
    return btoa(binary);
  }  
  
  public static uint8toBase64(buffer: Uint8Array): string {
    // btoa attend une string en "binary string" (chars code < 256)
    let binary = '';
    buffer.forEach(b => binary += String.fromCharCode(b));
    return btoa(binary);
  }

  public static base64ToArrayBuffer(b64: string): ArrayBuffer {
    const binary = atob(b64);
    return Uint8Array.from(binary, (c) => c.charCodeAt(0)).buffer;
  }
  
}
