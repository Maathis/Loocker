import React, { useState } from "react";

interface Props {
  stepIndex: number;
  keyFileName?: string;
  onChangeFile: (fileName: string, fileContent: string) => void;
  onOpenGenerateModal: () => void;
}

const KeyFileInput: React.FC<Props> = ({ stepIndex, keyFileName, onChangeFile, onOpenGenerateModal }) => {
  const [localFileName, setLocalFileName] = useState(keyFileName || "");

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
      <input
        type="file"
        accept="*/*"
        id={`keyfile-input-${stepIndex}`}
        className="file-input file-input-bordered w-full"
        onChange={handleFileChange}
      />

      {/* Divider */}
      <div className="w-px h-8 bg-gray-300" />

      <button
        type="button"
        className="btn btn-sm btn-outline"
        onClick={onOpenGenerateModal}
        aria-label="Generate Key"
      >
        Generate Key
      </button>
    </div>
  );
};

export default KeyFileInput;
