// types/SymmetricAlgorithm.ts
import { EncryptionAlgorithm, KeySource } from "../EncryptionAlgorithm";

/**
 * Abstract base class for symmetric algorithms using raw Buffer keys
 */
export abstract class SymmetricAlgorithm extends EncryptionAlgorithm {
  protected key: Buffer;

  constructor(value: string, label: string, keySource: KeySource) {
    super(value, label, keySource);
  }

  setKey(key: Buffer) {
    this.key = key;
  }

  getKey(): Buffer {
    return this.key;
  }
}