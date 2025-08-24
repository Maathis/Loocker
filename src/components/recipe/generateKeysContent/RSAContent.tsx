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

  const generateKeys = async () => {
    try {
      setLoading(true);

      // Generate RSA key pair
      const keyPair = await crypto.subtle.generateKey(
        {
          name: "RSA-OAEP",
          modulusLength: keySize, // 1024 | 2048 | 4096
          publicExponent: new Uint8Array([1, 0, 1]), // 0x10001
          hash: "SHA-256",
        },
        true, // extractable
        ["encrypt", "decrypt"]
      );

      const exportedPublicKey = await crypto.subtle.exportKey("spki", keyPair.publicKey);
      const exportedPrivateKey = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

      const publicKeyB64 = RSAAlgorithm.arrayBufferToPem(exportedPublicKey, "public");
      const privateKeyB64 = RSAAlgorithm.arrayBufferToPem(exportedPrivateKey, "private");
      setGeneratedBase64({ publicKey: publicKeyB64, privateKey: privateKeyB64 });

      const keys = { publicKey: keyPair.publicKey, privateKey: keyPair.privateKey };
      setGenerated(keys);
      onGenerate?.(keys);
    } catch (err) {
      console.error("RSA key generation failed", err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Copied to clipboard!");
    });
  };

  return (
    <div>
      <p className="mb-2">Generate a new RSA key pair</p>

      <label className="block mb-2">
        Key Length:
        <select
          className="ml-2 border rounded p-1"
          value={keySize}
          onChange={(e) => setKeySize(parseInt(e.target.value))}
        >
          <option value={1024}>1024</option>
          <option value={2048}>2048</option>
          <option value={4096}>4096</option>
        </select>
      </label>

      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={generateKeys}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Keys"}
      </button>

      {generated && (
        <div className="mt-4 flex items-center space-x-4">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded flex-1"
            onClick={() => copyToClipboard(generatedBase64.publicKey)}
          >
            Copy Public Key
          </button>

          <div className="w-px bg-gray-300 h-8"></div>

          <button
            className="bg-yellow-500 text-white px-4 py-2 rounded flex-1"
            onClick={() => copyToClipboard(generatedBase64.privateKey)}
          >
            Copy Private Key
          </button>
        </div>
      )}
    </div>
  );
};
