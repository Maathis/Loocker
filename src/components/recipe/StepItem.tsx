import React, { useState } from "react";
import { GripVertical, Trash2, Eye, EyeOff } from "lucide-react";
import KeyFileInput from "./KeyFileInput";
import { Step } from "./RecipeConfigurator";
import { ALGORITHMS, ENCRYPTION_TYPES } from "./RecipeAlgorithm";
import { GenerateKeyModal } from "./GenerateKeyModal";
import { KeyRole } from "src/objects/algorithms/asymmetrics/AsymmetricAlgo";
import { RSAAlgorithm } from "../../objects/algorithms/asymmetrics/RSAAlgorithm";

interface Props {
  step: Step;
  index: number;
  onTypeChange: (index: number, value: string) => void;
  onAlgorithmChange: (index: number, value: string) => void;
  onKeyTypeChange: (index: number, value: string) => void;
  onPassphraseChange: (index: number, value: string) => void;
  onKeyFileChange: (index: number, key: CryptoKey, keyRole?: KeyRole) => void;
  onRemove: (index: number) => void;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (index: number) => void;
}

const StepItem: React.FC<Props> = ({
  step,
  index,
  onTypeChange,
  onAlgorithmChange,
  onKeyTypeChange,
  onPassphraseChange,
  onKeyFileChange,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
}) => {
  const algorithmsForType = step.type
    ? ALGORITHMS[step.type as keyof typeof ALGORITHMS]
    : {};
  const algorithmKeys = Object.keys(algorithmsForType);

  const [showPassphrase, setShowPassphrase] = useState(false);
  const [isGenerateModalOpen, setGenerateModalOpen] = useState(false);

  const handleImportAsyncKey = async (index: number, fileName: string, fileContent: string, role: KeyRole) => {
    const buffer = RSAAlgorithm.pemToArrayBuffer(fileContent);

    const keyImported = await crypto.subtle.importKey(
      (role === "public" ? "spki" : "pkcs8"),
      buffer,
      { name: "RSA-OAEP", hash: "SHA-256" },
      true,
      (role === "public" ? ["encrypt"] : ["decrypt"])
    );

    onKeyFileChange(index, keyImported, role);
  };

  return (
    <>
      <div
        key={step.id}
        className="relative flex flex-col gap-3 border border-base-200 rounded-xl p-4 shadow hover:shadow-md transition bg-base-200"
        draggable
        onDragStart={() => onDragStart(index)}
        onDragOver={onDragOver}
        onDrop={() => onDrop(index)}
      >
        <div className="absolute left-3 top-1/2 -translate-y-1/2 cursor-move text-base-content">
          <GripVertical className="w-5 h-5" />
        </div>

        <div className="flex flex-col gap-3 ml-10">
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-3 w-full">
            <select
              className="select select-bordered w-full sm:w-40 bg-base-300 border-base-200 text-base-content"
              value={step.type}
              onChange={(e) => onTypeChange(index, e.target.value)}
            >
              <option value="" disabled>
                Select encryption type
              </option>
              {ENCRYPTION_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {step.type && (
              <select
                className="select select-bordered w-full sm:w-40 bg-base-300 border-base-200 text-base-content"
                value={step.algorithm || ""}
                onChange={(e) => onAlgorithmChange(index, e.target.value)}
              >
                <option value="" disabled>
                  Select algorithm
                </option>
                {algorithmKeys.map((key) => (
                  <option key={key} value={key}>
                    {algorithmsForType[key].getLabel()}
                  </option>
                ))}
              </select>
            )}

            {step.algorithm && (
              <select
                className="select select-bordered w-full sm:w-40 bg-base-300 border-base-200 text-base-content"
                value={step.keyType || ""}
                onChange={(e) => onKeyTypeChange(index, e.target.value)}
              >
                <option value="" disabled>
                  Select key type
                </option>
                {algorithmsForType[step.algorithm]
                  .getKeySource()
                  .map((value: string) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
              </select>
            )}
          </div>

          <div className="flex justify-center w-full mt-2 gap-4 flex-wrap">
            {step.keyType === "passphrase" && (
              <div className="relative w-full max-w-xs">
                <input
                  type={showPassphrase ? "text" : "password"}
                  placeholder="Enter passphrase"
                  className="input input-bordered w-full pr-10 bg-base-300 border-base-200 text-base-content"
                  value={step.passphrase || ""}
                  onChange={(e) => onPassphraseChange(index, e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-accent"
                  onClick={() => setShowPassphrase(!showPassphrase)}
                  aria-label={showPassphrase ? "Hide passphrase" : "Show passphrase"}
                >
                  {showPassphrase ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            )}

            {step.type === "asymmetric" && step.keyType === "keyfile" && (
              <>
                <KeyFileInput
                  stepIndex={index}
                  label="Public Key"
                  onChangeFile={(fileName, content) =>
                    handleImportAsyncKey(index, fileName, content, "public")
                  }
                />
                <KeyFileInput
                  stepIndex={index}
                  label="Private Key"
                  onChangeFile={(fileName, content) =>
                    handleImportAsyncKey(index, fileName, content, "private")
                  }
                />

                <button
                type="button"
                className="btn btn-sm btn-outline"
                onClick={() => setGenerateModalOpen(true)}
                aria-label={`Generate key pair`}
                >
                  Generate key pair
                </button>
              </>

            )}
          </div>

          <div className="flex justify-end">
            <button
              className="btn btn-sm btn-circle btn-ghost hover:bg-error hover:text-error-content text-base-content"
              onClick={() => onRemove(index)}
              aria-label="Remove step"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <GenerateKeyModal
        algorithmType={step.algorithm}
        isOpen={isGenerateModalOpen}
        onClose={() => setGenerateModalOpen(false)}
        onKeysGenerated={(keys) => {
          onKeyFileChange(index, keys.publicKey, "public");
          onKeyFileChange(index, keys.privateKey, "private");
        }}
      />
    </>
  );
};

export default StepItem;
