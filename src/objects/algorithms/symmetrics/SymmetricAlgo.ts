// types/SymmetricAlgorithm.ts
import { EncryptionAlgorithm, KeySource } from "../EncryptionAlgorithm";

/**
 * Abstract base class for symmetric algorithms using raw Buffer keys
 */
export abstract class SymmetricAlgorithm extends EncryptionAlgorithm {
  protected key: Uint8Array;

  constructor(value: string, label: string, keySource: KeySource) {
    super(value, label, keySource);
  }

  setKey(key: Uint8Array) {
    this.key = key;
  }

  getKey(): Uint8Array {
    return this.key;
  }
}