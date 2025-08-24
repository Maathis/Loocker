import React, { useState, useEffect } from "react";

interface Props {
  stepIndex: number;
  label?: string; // optional label for asymmetric keys
  onChangeFile: (fileName: string, fileContent: string) => void;
  onOpenGenerateModal: () => void;
}

const KeyFileInput: React.FC<Props> = ({
  stepIndex,
  label,
  onChangeFile,
  onOpenGenerateModal,
}) => {
  const [localFileName, setLocalFileName] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      setLocalFileName(file.name);
      onChangeFile(file.name, content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex items-center gap-3 w-full max-w-md">
      {label && <span className="text-sm font-medium">{label}:</span>}

      <input
        type="file"
        accept="*/*"
        id={`keyfile-input-${stepIndex}-${label || "key"}`}
        className="file-input file-input-bordered w-full"
        onChange={handleFileChange}
      />

      {/* Divider */}
      <div className="w-px h-8 bg-gray-300" />

      <button
        type="button"
        className="btn btn-sm btn-outline"
        onClick={onOpenGenerateModal}
        aria-label={`Generate ${label || "Key"}`}
      >
        Generate
      </button>
    </div>
  );
};

export default KeyFileInput;
