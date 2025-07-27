import React, { useState } from "react";
import { GripVertical, Trash2, Eye, EyeOff } from "lucide-react";
import KeyFileInput from "./KeyFileInput";
import GenerateKeyModal from "./GenerateKeyModal";
import { Step } from "./RecipeConfigurator";

interface Props {
  step: Step;
  index: number;
  onTypeChange: (index: number, value: string) => void;
  onAlgorithmChange: (index: number, value: string) => void;
  onKeyTypeChange: (index: number, value: string) => void;
  onPassphraseChange: (index: number, value: string) => void;
  onKeyFileChange: (index: number, fileName: string, fileContent: string) => void;
  onRemove: (index: number) => void;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (index: number) => void;
}

const ENCRYPTION_TYPES = [
  { value: "symmetric", label: "Symmetric" },
  { value: "asymmetric", label: "Asymmetric" },
];

const ALGORITHMS = {
  symmetric: [
    { value: "aes", label: "AES" },
    { value: "des", label: "DES" },
  ],
  asymmetric: [
    { value: "rsa", label: "RSA" },
    { value: "ecdsa", label: "ECDSA" },
  ],
};

const KEY_TYPES = [
  { value: "passphrase", label: "Passphrase" },
  { value: "keyfile", label: "Key File" },
];

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
  const algorithmsForType = step.type ? ALGORITHMS[step.type as keyof typeof ALGORITHMS] : [];

  const [showPassphrase, setShowPassphrase] = useState(false);
  const [isGenerateModalOpen, setGenerateModalOpen] = useState(false);

  const handleGenerateKey = (fileName: string, fileContent: string) => {
    onKeyFileChange(index, fileName, fileContent);
  };

  return (
    <>
      <div
        key={step.id}
        className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 bg-base-100 border border-base-200 rounded-xl p-4 shadow hover:shadow-md transition"
        draggable
        onDragStart={() => onDragStart(index)}
        onDragOver={onDragOver}
        onDrop={() => onDrop(index)}
      >
        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          {/* Drag Handle */}
          <div className="text-gray-400 cursor-move">
            <GripVertical className="w-5 h-5" />
          </div>

          {/* Encryption Type */}
          <select
            className="select select-bordered w-full sm:w-40"
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

          {/* Algorithm - only show if type selected */}
          {step.type && (
            <select
              className="select select-bordered w-full sm:w-40"
              value={step.algorithm || ""}
              onChange={(e) => onAlgorithmChange(index, e.target.value)}
            >
              <option value="" disabled>
                Select algorithm
              </option>
              {algorithmsForType.map((alg) => (
                <option key={alg.value} value={alg.value}>
                  {alg.label}
                </option>
              ))}
            </select>
          )}

          {/* Key Type - only show if algorithm selected */}
          {step.algorithm && (
            <select
              className="select select-bordered w-full sm:w-40"
              value={step.keyType || ""}
              onChange={(e) => onKeyTypeChange(index, e.target.value)}
            >
              <option value="" disabled>
                Select key type
              </option>
              {KEY_TYPES.map((key) => (
                <option key={key.value} value={key.value}>
                  {key.label}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Key input (passphrase or keyfile) */}
        <div className="flex items-center w-full sm:w-auto mt-3 sm:mt-0">
          {step.keyType === "passphrase" && (
            <div className="relative w-full max-w-xs">
              <input
                type={showPassphrase ? "text" : "password"}
                placeholder="Enter passphrase"
                className="input input-bordered w-full pr-10"
                value={step.passphrase || ""}
                onChange={(e) => onPassphraseChange(index, e.target.value)}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassphrase(!showPassphrase)}
                aria-label={showPassphrase ? "Hide passphrase" : "Show passphrase"}
              >
                {showPassphrase ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          )}

          {step.keyType === "keyfile" && (
            <KeyFileInput
              stepIndex={index}
              keyFileName={step.keyFileName}
              onChangeFile={(fileName, content) => onKeyFileChange(index, fileName, content)}
              onOpenGenerateModal={() => setGenerateModalOpen(true)}
            />
          )}
        </div>

        {/* Remove Button */}
        <button
          className="btn btn-sm btn-circle btn-ghost hover:bg-error hover:text-white text-gray-500"
          onClick={() => onRemove(index)}
          aria-label="Remove step"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

        <GenerateKeyModal
        encryptionType={step.algorithm}
        isOpen={isGenerateModalOpen}
        onClose={() => setGenerateModalOpen(false)}
        onGenerate={(name, content) => {
            console.log("Generated key filename:", name);
            console.log("Generated key content:", content);
            // Save or use the generated key
        }}
        onSelectFolder={async () => {
            // Call Electron API or fallback:
            // Example:
            // const result = await window.api.selectFolder();
            // return result;
            return null;
        }}
        />

    </>
  );
};

export default StepItem;
