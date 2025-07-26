import React, { ChangeEvent } from "react";
import { X } from "lucide-react"; // Optional: Use Lucide for a nice cross icon (optional)

interface FilesSelectorState {
  files: File[];
}

class FilesSelector extends React.Component<{}, FilesSelectorState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      files: [],
    };
  }

  handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      this.setState({ files: Array.from(event.target.files) });
    }
  };

  removeFile = (index: number) => {
    this.setState((prevState) => {
      const newFiles = [...prevState.files];
      newFiles.splice(index, 1);
      return { files: newFiles };
    });
  };

  render() {
    const { files } = this.state;

    return (
      <div className="p-4 max-w-2xl mx-auto">
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Upload your file(s)</span>
          </label>
          <input
            type="file"
            multiple
            onChange={this.handleFileChange}
            className="file-input file-input-bordered w-full"
          />
        </div>

        {files.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Selected Files:</h2>
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="card relative shadow-md bg-base-100 p-4"
                >
                  <button
                    onClick={() => this.removeFile(index)}
                    className="btn btn-sm btn-circle btn-ghost absolute top-2 right-2"
                    aria-label="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <h3 className="font-bold">{file.name}</h3>
                  <p className="text-sm text-gray-500">
                    Type: {file.type || "N/A"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Size: {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default FilesSelector;
