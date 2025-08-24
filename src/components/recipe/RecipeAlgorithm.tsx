import { EncryptionAlgorithm, KeySourceValue } from "src/objects/algorithms/EncryptionAlgorithm";
import { AESGCMAlgorithm } from "../../objects/algorithms/symmetrics/AESGCMA";
import { RSAAlgorithm } from "../../objects/algorithms/asymmetrics/RSAAlgorithm";

export const ENCRYPTION_TYPES = [
    { value: "symmetric", label: "Symmetric" },
    { value: "asymmetric", label: "Asymmetric" },
  ];
  
export type AsymmetricAlgorithms = keyof typeof ALGORITHMS["asymmetric"];

export const ALGORITHMS: Record<
  "symmetric" | "asymmetric",
  Record<string, EncryptionAlgorithm>
> = {
  symmetric: {
    "aes256gcm": new AESGCMAlgorithm()
  },
  asymmetric: {
    "rsa": new RSAAlgorithm()
  }
};


export const KEY_TYPES: Record<KeySourceValue, { label: string }> = {
  passphrase: { label: "Passphrase" },
  keyfile: { label: "Key File" },
};