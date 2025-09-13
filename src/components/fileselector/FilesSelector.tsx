import React, { ChangeEvent, DragEvent } from "react";
import { X, File } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onUpdateFiles: (newData: File[]) => void;
}

interface FilesSelectorState extends Props {
  files: File[];
  isDragging: boolean;
}

interface FileCardProps {
  file: File;
  onRemove: () => void;
}

const FileCard: React.FC<FileCardProps> = ({ file, onRemove }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.2 }}
    className="card relative shadow-md bg-base-100 p-5 w-full h-full rounded-xl"
  >
    <button
      onClick={onRemove}
      className="btn btn-sm btn-circle btn-ghost absolute top-3 right-3"
      aria-label="Remove file"
    >
      <X className="w-5 h-5" />
    </button>

    <h3 className="font-semibold text-base truncate">{file.name}</h3>
    <p className="text-sm text-gray-600 break-words">
      Type: {file.type || "N/A"}
    </p>
    <p className="text-sm text-gray-600">
      Size: {(file.size / 1024).toFixed(2)} KB
    </p>

  </motion.div>
);

export default class FilesSelector extends React.Component<Props, FilesSelectorState> {
  fileInputRef: React.RefObject<HTMLInputElement>;

  constructor(props: Props) {
    super(props);
    this.state = {
      files: [],
      isDragging: false,
      onUpdateFiles: props.onUpdateFiles,
    };
    this.fileInputRef = React.createRef();
  }

  componentDidUpdate(prevProps: Props, prevState: FilesSelectorState) {
    if (prevState.files !== this.state.files) {
      this.props.onUpdateFiles(this.state.files);
    }
  }

  handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      this.appendFiles(newFiles);
    }
    if (this.fileInputRef.current) {
      this.fileInputRef.current.value = "";
    }
  };

  handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    this.setState({ isDragging: false });
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length) {
      this.appendFiles(droppedFiles);
    }
  };

  handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    this.setState({ isDragging: true });
  };

  handleDragLeave = () => {
    this.setState({ isDragging: false });
  };

  removeFile = (index: number) => {
    this.setState((prevState) => {
      const newFiles = [...prevState.files];
      newFiles.splice(index, 1);
      return { files: newFiles };
    });
  };

  appendFiles = (incomingFiles: File[]) => {
    this.setState((prevState) => {
      const existingFiles = prevState.files;
      const combined = [...existingFiles];
      for (const file of incomingFiles) {
        const exists = combined.some(
          (f) => f.name === file.name && f.size === file.size
        );
        if (!exists) {
          combined.push(file);
        }
      }
      return { files: combined };
    });
  };

  triggerFileSelect = () => {
    this.fileInputRef.current?.click();
  };

  render() {
    const { files, isDragging } = this.state;

    return (
      <div className="p-4 w-full max-w-[720px] mx-auto box-border">
        <motion.div
          initial={false}
          animate={{
            scale: isDragging ? 1.02 : 1,
            backgroundColor: isDragging ? "#f1f5f9" : "transparent",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={`border-2 border-dashed border-primary rounded-xl cursor-pointer flex flex-col items-center justify-center h-64 text-center transition-colors duration-200 ${
            isDragging ? "bg-base-200" : ""
          }`}
          onClick={this.triggerFileSelect}
          onDrop={this.handleDrop}
          onDragOver={this.handleDragOver}
          onDragLeave={this.handleDragLeave}
        >
          <File className="w-16 h-16 text-primary" />
          <p className="mt-2 text-lg text-base-content">
            Click or drag files here to upload
          </p>
        </motion.div>

        <input
          type="file"
          multiple
          ref={this.fileInputRef}
          onChange={this.handleFileChange}
          className="hidden"
        />

        {files.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4">Selected file(s):</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AnimatePresence>
                {files.map((file, index) => (
                  <FileCard
                    key={file.name + file.size}
                    file={file}
                    onRemove={() => this.removeFile(index)}
                  />
                ))}
              </AnimatePresence>
            </div>

          </div>
        )}
      </div>
    );
  }
}
