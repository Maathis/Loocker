import { AESGCMAlgorithm } from "../../objects/algorithms/symmetrics/AESGCMA";

export const ENCRYPTION_TYPES = [
    { value: "symmetric", label: "Symmetric" },
    { value: "asymmetric", label: "Asymmetric" },
  ];
  
export const ALGORITHMS: Record<
  "symmetric" | "asymmetric",
  Record<string, AESGCMAlgorithm>
> = {
  symmetric: {
    "aes256gcm": new AESGCMAlgorithm()
  },
  asymmetric: {
    "aes256gcm": new AESGCMAlgorithm()
  }
};


export const KEY_TYPES = [
    { value: "passphrase", label: "Passphrase" },
    { value: "keyfile", label: "Key File" },
];