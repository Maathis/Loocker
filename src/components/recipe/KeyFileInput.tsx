import React, { useState } from "react";

interface Props {
  stepIndex: number;
  label?: string;
  onChangeFile: (fileName: string, fileContent: string) => void;
}

const KeyFileInput: React.FC<Props> = ({
  stepIndex,
  label,
  onChangeFile
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
    </div>
  );
};

export default KeyFileInput;
