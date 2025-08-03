export type KeySourceValue = "passphrase" | "keyfile";

export type KeySource = Array<KeySourceValue> & {
  0?: KeySourceValue;
  1?: Exclude<KeySourceValue, typeof this[0]>;
};

export abstract class EncryptionAlgorithm {

  protected label: string;

  protected keySource: KeySource;

  constructor(value: string, label: string, keySource: KeySource) {
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
  abstract encrypt(data: Uint8Array | string): Promise<Uint8Array | string>;

  /**
   * Decrypts input data.
   * @param encryptedData Encrypted input data
   * @returns Decrypted data as Uint8Array or string
   */
  abstract decrypt(encryptedData: Uint8Array | string): Promise<Uint8Array | string>;

  public static toHex(buffer: Uint8Array): string {
    return Array.from(buffer)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
  
  // Convertit Uint8Array en base64
  public static toBase64(buffer: Uint8Array): string {
    // btoa attend une string en "binary string" (chars code < 256)
    let binary = '';
    buffer.forEach(b => binary += String.fromCharCode(b));
    return btoa(binary);
  }
}
