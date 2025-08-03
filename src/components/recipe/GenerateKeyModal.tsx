import React, { useState } from "react";

interface Props {
  encryptionType: "rsa" | "ecdsa";
  isOpen: boolean;
  onClose: () => void;
}

const RSA_KEY_SIZES = [2048, 3072, 4096];
const ECDSA_CURVES = ["P-256", "P-384", "P-521", "secp256k1"];

const GenerateKeyModal: React.FC<Props> = ({
  encryptionType,
  isOpen,
  onClose,
}) => {
  const [keySize, setKeySize] = useState(RSA_KEY_SIZES[0]);
  const [curve, setCurve] = useState(ECDSA_CURVES[0]);
  const [format, setFormat] = useState<"pem" | "der">("pem");
  const [passphrase, setPassphrase] = useState("");

  if (!isOpen) return null;

  const arrayBufferToBase64 = (buf: ArrayBuffer) => {
    const binary = String.fromCharCode(...new Uint8Array(buf));
    return window.btoa(binary);
  };

  const deriveKey = async (pass: string, salt: Uint8Array) => {
    const enc = new TextEncoder();
    const passKey = await window.crypto.subtle.importKey(
      "raw",
      enc.encode(pass),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );

    return window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      passKey,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
  };

  const encryptPrivateKey = async (privateKeyBytes: ArrayBuffer, pass: string) => {
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // AES-GCM IV length

    const key = await deriveKey(pass, salt);
    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv,
      },
      key,
      privateKeyBytes
    );

    const combined = new Uint8Array(salt.byteLength + iv.byteLength + encrypted.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.byteLength);
    combined.set(new Uint8Array(encrypted), salt.byteLength + iv.byteLength);

    return arrayBufferToBase64(combined.buffer);
  };

  const toPEM = (buffer: ArrayBuffer, type: string) => {
    const b64 = arrayBufferToBase64(buffer);
    const formatted = b64.match(/.{1,64}/g)?.join("\n");
    return `-----BEGIN ${type}-----\n${formatted}\n-----END ${type}-----`;
  };

  const download = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };  

  const generateKey = async () => {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      let keyPair: CryptoKeyPair;

      if (encryptionType === "rsa") {
        keyPair = await window.crypto.subtle.generateKey(
          {
            name: "RSA-OAEP",
            modulusLength: keySize,
            publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
            hash: "SHA-256",
          },
          true,
          ["encrypt", "decrypt"]
        );
      } else if (encryptionType === "ecdsa") {
        keyPair = await window.crypto.subtle.generateKey(
          {
            name: "ECDSA",
            namedCurve: curve,
          },
          true,
          ["sign", "verify"]
        );
      } else {
        alert("Unsupported encryption type.");
        return;
      }

      const exportedPrivate = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
      const exportedPublic = await crypto.subtle.exportKey("spki", keyPair.publicKey);

      if (passphrase.trim() !== "") {
        const encryptedPrivateKeyB64 = await encryptPrivateKey(exportedPrivate, passphrase);
        const encryptedBuffer = base64ToArrayBuffer(encryptedPrivateKeyB64);
        const encryptedPEM = toPEM(encryptedBuffer, "ENCRYPTED PRIVATE KEY");  // <-- your custom header
        download(`private_key_${timestamp}.pem`, encryptedPEM);
      } else {
        const privatePEM = toPEM(exportedPrivate, "PRIVATE KEY");
        const ext = format === "pem" ? "pem" : "der";
        download(`private_key_${timestamp}.${ext}`, privatePEM);
      }
      

      const publicPEM = toPEM(exportedPublic, "PUBLIC KEY");
      download(`public_key_${timestamp}.pem`, publicPEM);

      onClose();
    } catch (err: any) {
      alert("Key generation failed: " + err.message);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        backgroundColor: "rgba(255,255,255,0.25)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-2xl font-bold"
          aria-label="Close"
          type="button"
        >
          &times;
        </button>

        <h3 className="text-xl font-semibold mb-4">
          Generate {encryptionType.toUpperCase()} Key
        </h3>

        {encryptionType === "rsa" && (
          <div className="mb-4">
            <label className="block font-medium mb-1">Key Size</label>
            <select
              className="select select-bordered w-full"
              value={keySize}
              onChange={(e) => setKeySize(parseInt(e.target.value))}
            >
              {RSA_KEY_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size} bits
                </option>
              ))}
            </select>
          </div>
        )}

        {encryptionType === "ecdsa" && (
          <div className="mb-4">
            <label className="block font-medium mb-1">Curve</label>
            <select
              className="select select-bordered w-full"
              value={curve}
              onChange={(e) => setCurve(e.target.value)}
            >
              {ECDSA_CURVES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mb-4">
          <label className="block font-medium mb-1">Format</label>
          <select
            className="select select-bordered w-full"
            value={format}
            onChange={(e) => setFormat(e.target.value as "pem" | "der")}
          >
            <option value="pem">PEM</option>
            <option value="der" disabled>
              DER (not implemented)
            </option>
          </select>
        </div>

        <div className="mb-6">
          <label className="block font-medium mb-1">Passphrase (optional)</label>
          <input
            type="password"
            className="input input-bordered w-full"
            placeholder="Enter passphrase to encrypt private key"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
          />
        </div>

        <button
          type="button"
          onClick={generateKey}
          className="btn btn-primary w-full"
        >
          Generate Key
        </button>
      </div>
    </div>
  );
};

export default GenerateKeyModal;
