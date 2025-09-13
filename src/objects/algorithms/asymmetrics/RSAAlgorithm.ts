import { AsymmetricAlgorithm, KeyRole } from "./AsymmetricAlgo";

export class RSAAlgorithm extends AsymmetricAlgorithm {

  constructor() {
    super("RSA-OAEP");
  }

  async encrypt(data: Uint8Array | string): Promise<Uint8Array> {
    if (!this.publicKey) throw new Error("Public key not set");

    const bufferData = typeof data === "string" ? new TextEncoder().encode(data) : data;

    const encrypted = await crypto.subtle.encrypt(
      {
        name: "RSA-OAEP",
      },
      this.publicKey,
      bufferData
    );
  
    return new Uint8Array(encrypted);
  }  

  async decrypt(encryptedData: Uint8Array): Promise<Uint8Array> {
    if (!this.privateKey) throw new Error("Private key not set");

    const decrypted = await crypto.subtle.decrypt(
      { name: "RSA-OAEP" },
      this.privateKey,
      encryptedData
    );

    return new Uint8Array(decrypted);
  }

  public static arrayBufferToPem(buffer: ArrayBuffer, role: KeyRole) {
    const binary = String.fromCharCode(...new Uint8Array(buffer));

    const base64 = btoa(binary);

    const formatted = base64.match(/.{1,64}/g)?.join("\n") ?? "";

    const upperRole = role.toUpperCase();

    return `-----BEGIN ${upperRole} KEY-----\n${formatted}\n-----END ${upperRole} KEY-----`;
  }

  public static pemToArrayBuffer(pem: string): ArrayBuffer {
    // Remove header, footer, and line breaks
    const base64 = pem
      .replace(/-----BEGIN [A-Z ]+-----/, "")
      .replace(/-----END [A-Z ]+-----/, "")
      .replace(/\s+/g, "");
  
    console.log("base64 = ", base64);
    const binary = atob(base64);
    const buffer = new ArrayBuffer(binary.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < binary.length; i++) {
      view[i] = binary.charCodeAt(i);
    }
    return buffer;
  }

  public static async pemToCryptoKey(pem: string, role: KeyRole): Promise<CryptoKey> {
    const keyBuffer = this.pemToArrayBuffer(pem);
    return await crypto.subtle.importKey(
      (role === "public" ? "spki" : "pkcs8"),
      keyBuffer,
      { name: "RSA-OAEP", hash: "SHA-256" },
      true,
      (role === "public" ? ["encrypt"] : ["decrypt"])
    );
  }

}
