import { EncryptionAlgorithm, KeySource } from "../EncryptionAlgorithm";

export type KeyRole = "public" | "private";

/**
 * Abstract base class for asymmetric algorithms
 */
export abstract class AsymmetricAlgorithm extends EncryptionAlgorithm {
  protected publicKey: CryptoKey;
  protected privateKey: CryptoKey;

  constructor(label: string) {
    super(label, ["keyfile"]);
  }

  setPublicKey(publicKey: CryptoKey) {
    this.publicKey = publicKey;
  }

  getPublicKey(): CryptoKey {
    return this.publicKey;
  }

  setPrivateKey(privateKey: CryptoKey) {
    this.privateKey = privateKey;
  }

  getPrivateKey(): CryptoKey {
    return this.privateKey;
  }

}