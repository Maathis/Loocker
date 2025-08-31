import React from "react";
import { RSAContent } from "./generateKeysContent/RSAContent";
import { AsymmetricAlgorithms } from "./RecipeAlgorithm";

// Key content components could be extended for other algorithms

interface Props {
  algorithmType?: AsymmetricAlgorithms;
  isOpen: boolean;
  onClose: () => void;
  onKeysGenerated: (keys: { publicKey: CryptoKey; privateKey: CryptoKey }) => void;
}

export const GenerateKeyModal: React.FC<Props> = ({
  algorithmType,
  isOpen,
  onClose,
  onKeysGenerated,
}) => {
  if (!isOpen) return null;

  const handleGenerate = (keys: any) => {
    onKeysGenerated(keys);
  };

  const renderContent = () => {
    switch (algorithmType) {
      case "rsa":
        return <RSAContent onGenerate={handleGenerate} />;
      default:
        return <p className="text-gray-500">No generator available for this algorithm.</p>;
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/20 z-50">
      <div className="p-6 bg-base-200 rounded-2xl shadow-lg w-[500px] max-w-full text-base-content">
        <h2 className="text-xl font-bold mb-4 text-center text-primary">
          Generate {algorithmType === "symmetric" ? "Symmetric" : "Asymmetric"} Keys
        </h2>

        <div className="mb-4">{renderContent()}</div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            className="btn btn-outline text-base-content border-base-300 hover:bg-base-300"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
