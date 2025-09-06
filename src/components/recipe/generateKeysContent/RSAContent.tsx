import React, { useState } from "react";
import { RSAAlgorithm } from "../../../objects/algorithms/asymmetrics/RSAAlgorithm";

interface Props {
  onGenerate?: (keys: { publicKey: CryptoKey; privateKey: CryptoKey }) => void;
}

export const RSAContent: React.FC<Props> = ({ onGenerate }) => {
  const [keySize, setKeySize] = useState<number>(2048);
  const [loading, setLoading] = useState(false);

  const [generated, setGenerated] = useState<{ publicKey: CryptoKey; privateKey: CryptoKey } | null>(null);
  const [generatedBase64, setGeneratedBase64] = useState<{ publicKey: string; privateKey: string } | null>(null);

  const [copied, setCopied] = useState<{ public?: boolean; private?: boolean }>({});

  const generateKeys = async () => {
    try {
      setLoading(true);

      const keyPair = await crypto.subtle.generateKey(
        {
          name: "RSA-OAEP",
          modulusLength: keySize,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
      );

      const exportedPublicKey = await crypto.subtle.exportKey("spki", keyPair.publicKey);
      const exportedPrivateKey = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

      const publicKeyB64 = RSAAlgorithm.arrayBufferToPem(exportedPublicKey, "public");
      const privateKeyB64 = RSAAlgorithm.arrayBufferToPem(exportedPrivateKey, "private");
      setGeneratedBase64({ publicKey: publicKeyB64, privateKey: privateKeyB64 });

      setGenerated({ publicKey: keyPair.publicKey, privateKey: keyPair.privateKey });
      onGenerate?.({ publicKey: keyPair.publicKey, privateKey: keyPair.privateKey });
    } catch (err) {
      console.error("RSA key generation failed", err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: "public" | "private") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied({ ...copied, [type]: true });
      setTimeout(() => setCopied({ ...copied, [type]: false }), 1500);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const saveToFile = (text: string, filename: string) => {
    const blob = new Blob([text], { type: "application/x-pem-file" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="text-base-content">
      <p className="mb-2">Generate a new RSA key pair</p>

      <label className="block mb-2">
        Key Length:
        <select
          className="ml-2 border border-base-300 rounded p-1 bg-base-200 text-base-content"
          value={keySize}
          onChange={(e) => setKeySize(parseInt(e.target.value))}
        >
          <option value={1024}>1024</option>
          <option value={2048}>2048</option>
          <option value={4096}>4096</option>
        </select>
      </label>

      <button
        className="bg-primary text-primary-content px-4 py-2 rounded mb-4"
        onClick={generateKeys}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Keys"}
      </button>

      {generated && generatedBase64 && (
        <div className="flex flex-col space-y-4">
          {/* First Row: Save Buttons */}
          <div className="flex items-center space-x-2">
            <button
              className="flex-1 px-4 py-2 rounded text-center bg-primary text-primary-content transition-all"
              onClick={() => saveToFile(generatedBase64.publicKey, "public_key.pem")}
            >
              Save Public Key
            </button>
            <button
              className="flex-1 px-4 py-2 rounded text-center bg-primary text-primary-content transition-all"
              onClick={() => saveToFile(generatedBase64.privateKey, "private_key.pem")}
            >
              Save Private Key
            </button>
          </div>

          {/* Second Row: Copy Buttons */}
          <div className="flex items-center space-x-2">
            <button
              className={`flex-1 px-4 py-2 rounded text-center transition-all ${
                copied.public ? "bg-success text-success-content" : "btn btn-soft"
              }`}
              onClick={() => copyToClipboard(generatedBase64.publicKey, "public")}
            >
              {copied.public ? "Copied!" : "Copy Public Key"}
            </button>
            <button
              className={`flex-1 px-4 py-2 rounded text-center transition-all ${
                copied.private ? "bg-success text-success-content" : "btn btn-soft"
              }`}
              onClick={() => copyToClipboard(generatedBase64.privateKey, "private")}
            >
              {copied.private ? "Copied!" : "Copy Private Key"}
            </button>
          </div>
        </div>
      )}


    </div>
  );
};
