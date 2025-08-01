import React from "react";
import RecipeConfigurator, { Step } from "../components/Recipe/RecipeConfigurator";
import FilesSelector from "../components/FilesSelector";
import { ExportModal } from "../components/ExportModal";
import { ALGORITHMS } from "../components/Recipe/RecipeAlgorithm"; // adjust path

interface State {
  files: File[];
  steps: Step[];
}

interface State {
  files: File[];
  steps: Step[];
  isExportModalOpen: boolean;
}


export async function encryptFileWithRecipe(file: File, steps: Step[]): Promise<File> {
  let fileData = await file.arrayBuffer();
  let dataToEncrypt: Uint8Array | string = new Uint8Array(fileData);

  for (const step of steps) {
    if (!step.algorithm || !step.type || !step.keyType) continue;

    const typeKey = step.type as keyof typeof ALGORITHMS;
    const algorithmKey = step.algorithm as keyof typeof ALGORITHMS[typeof typeKey];

    const algorithmInstance = ALGORITHMS[typeKey]?.[algorithmKey];


    if (!algorithmInstance) continue;

    // Provide key source (passphrase or keyfile content) if your EncryptionAlgorithm
    // subclasses expect the key material via constructor or setter,
    // but since your class takes a string 'value' in constructor, you might need
    // to instantiate per step. So instead of using existing instance, instantiate a new one:

    // Example:
    // const AlgClass = ALGORITHM_CLASSES[step.type][step.algorithm];
    // const algorithm = new AlgClass(keyMaterial, algorithmInstance.getLabel());

    // But if you only have instances, you can add a method to re-init key or create per step

    // For demo, let's assume you create a new instance per step with keyMaterial:

    const keyMaterial = step.keyType === "passphrase"
      ? step.passphrase
      : step.keyFileContent;

    if (!keyMaterial) continue;

    if (typeof keyMaterial === 'string') {

      const encoder = new TextEncoder();
      const keyBuffer = encoder.encode(keyMaterial);
      await algorithmInstance.setKey(keyBuffer as Buffer);
    } else {
      await algorithmInstance.setKey(keyMaterial);
    }
    
    // Encrypt data for this step
    dataToEncrypt = await algorithmInstance.encrypt(dataToEncrypt);
  }

  // Return new encrypted file
  return new File([dataToEncrypt], file.name + ".enc", { type: "application/octet-stream" });
}

export async function exportFilesToLocalFolder(
  files: File[],
  folderHandle: FileSystemDirectoryHandle,
  steps: Step[]
) {
  if (!folderHandle) throw new Error("Folder handle is required");

  for (const file of files) {
    try {
      const encryptedFile = await encryptFileWithRecipe(file, steps);
      const fileHandle = await folderHandle.getFileHandle(encryptedFile.name, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(encryptedFile);
      await writable.close();
    } catch (error) {
      console.error(`Failed to encrypt or save file ${file.name}:`, error);
    }
  }
}

export class Dashboard extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      files: [],
      steps: [],
      isExportModalOpen: false
    };
  }

  openExportModal = () => {
    this.setState({ isExportModalOpen: true });
  };

  closeExportModal = () => {
    this.setState({ isExportModalOpen: false });
  };

  onExport = async (
    method: string,
    files: File[],
    folderHandle?: FileSystemDirectoryHandle
  ) => {
    if (method === 'local') {
      if (!folderHandle) {
        alert('No folder selected');
        return;
      }
      await exportFilesToLocalFolder(files, folderHandle, this.state.steps);
      alert('Files exported locally!');
    } else if (method === 'googleDrive') {
      // Implement Google Drive export logic here
    } else if (method === 'dropbox') {
      // Implement Dropbox export logic here
    }
    this.closeExportModal();
  };

  render() {
    return (
      <>
        <FilesSelector onUpdateFiles={(files) => this.setState({ files })} />
        <RecipeConfigurator onUpdateRecipe={(steps) => this.setState({ steps })} />

        <button onClick={this.openExportModal} disabled={this.state.files.length === 0}>
          Export Files
        </button>

        <ExportModal
          visible={this.state.isExportModalOpen}
          files={this.state.files}
          onClose={this.closeExportModal}
          onExport={this.onExport}
        />
      </>
    );
  }
}