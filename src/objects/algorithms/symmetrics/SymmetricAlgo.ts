import { EncryptionAlgorithm, KeySource } from "../EncryptionAlgorithm";

/**
 * Abstract base class for symmetric algorithms
 */
export abstract class SymmetricAlgorithm extends EncryptionAlgorithm {
  protected key: Uint8Array;

  constructor(label: string, keySource: KeySource) {
    super(label, keySource);
  }

  setKey(key: Uint8Array) {
    this.key = key;
  }

  getKey(): Uint8Array {
    return this.key;
  }
}