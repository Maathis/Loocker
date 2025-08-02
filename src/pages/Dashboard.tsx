import React from "react";
import RecipeConfigurator, { Step } from "../components/Recipe/RecipeConfigurator";
import FilesSelector from "../components/FilesSelector";
import { SaveEncryptModal } from "../components/SaveEncryptModal";
import { SaveDecryptModal } from "../components/SaveDecryptModal";
import { ALGORITHMS } from "../components/Recipe/RecipeAlgorithm";

interface State {
  files: File[];
  steps: Step[];
  isSaveEncryptModalOpen: boolean;
  isSaveDecryptModalOpen: boolean;
}

export async function encryptFileWithRecipe(file: File, steps: Step[]): Promise<File> {
  let fileData = await file.arrayBuffer();
  let dataToEncrypt: Uint8Array = new Uint8Array(fileData);

  for (const step of steps) {
    if (!step.algorithm || !step.type || !step.keyType) continue;

    const typeKey = step.type as keyof typeof ALGORITHMS;
    const algorithmKey = step.algorithm as keyof typeof ALGORITHMS[typeof typeKey];
    const algorithmInstance = ALGORITHMS[typeKey]?.[algorithmKey];
    if (!algorithmInstance) continue;

    const keyMaterial = step.keyType === "passphrase" ? step.passphrase : step.keyFileContent;
    if (!keyMaterial) continue;

    const keyBuffer = typeof keyMaterial === 'string'
      ? new TextEncoder().encode(keyMaterial)
      : keyMaterial;

    await algorithmInstance.setKey(keyBuffer);
    dataToEncrypt = await algorithmInstance.encrypt(dataToEncrypt);
  }

  return new File([dataToEncrypt], file.name + ".enc", { type: "application/octet-stream" });
}

export async function decryptFileWithRecipe(file: File, steps: Step[]): Promise<File> {
  let fileData = await file.arrayBuffer();
  let dataToDecrypt: Uint8Array = new Uint8Array(fileData);

  for (const step of steps.slice().reverse()) {
    if (!step.algorithm || !step.type || !step.keyType) continue;

    const typeKey = step.type as keyof typeof ALGORITHMS;
    const algorithmKey = step.algorithm as keyof typeof ALGORITHMS[typeof typeKey];
    const algorithmInstance = ALGORITHMS[typeKey]?.[algorithmKey];
    if (!algorithmInstance) continue;

    const keyMaterial = step.keyType === "passphrase" ? step.passphrase : step.keyFileContent;
    if (!keyMaterial) continue;

    const keyBuffer = typeof keyMaterial === 'string'
      ? new TextEncoder().encode(keyMaterial)
      : keyMaterial;

    await algorithmInstance.setKey(keyBuffer);

    let result = await algorithmInstance.decrypt(dataToDecrypt);
    if (!(result instanceof Uint8Array)) {
      console.warn("Decrypt returned a string — encoding it to Uint8Array");
      result = new TextEncoder().encode(result as string);
    }
    dataToDecrypt = result;
  }

  let filenameOutput = file.name;
  if (filenameOutput.endsWith('.enc')) {
    filenameOutput = filenameOutput.slice(0, -4);
  }

  return new File([dataToDecrypt], filenameOutput, { type: "application/octet-stream" });
}

export async function exportEncryptFilesToLocalFolder(
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

export async function exportDecryptFilesToLocalFolder(
  files: File[],
  folderHandle: FileSystemDirectoryHandle,
  steps: Step[]
) {
  if (!folderHandle) throw new Error("Folder handle is required");

  for (const file of files) {
    try {
      const decryptedFile = await decryptFileWithRecipe(file, steps);
      const fileHandle = await folderHandle.getFileHandle(decryptedFile.name, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(decryptedFile);
      await writable.close();
    } catch (error) {
      console.error(`Failed to decrypt or save file ${file.name}:`, error);
    }
  }
}

export class Dashboard extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      files: [],
      steps: [],
      isSaveEncryptModalOpen: false,
      isSaveDecryptModalOpen: false
    };
  }

  openSaveEncryptModal = () => this.setState({ isSaveEncryptModalOpen: true });
  closeSaveEncryptModal = () => this.setState({ isSaveEncryptModalOpen: false });

  openSaveDecryptModal = () => this.setState({ isSaveDecryptModalOpen: true });
  closeSaveDecryptModal = () => this.setState({ isSaveDecryptModalOpen: false });

  onExportEncrypt = async (method: string, files: File[], folderHandle?: FileSystemDirectoryHandle) => {
    if (method === 'local' && folderHandle) {
      await exportEncryptFilesToLocalFolder(files, folderHandle, this.state.steps);
      alert('Files exported locally!');
    }
    this.closeSaveEncryptModal();
  };

  onExportDecrypt = async (method: string, files: File[], folderHandle?: FileSystemDirectoryHandle) => {
    if (method === 'local' && folderHandle) {
      await exportDecryptFilesToLocalFolder(files, folderHandle, this.state.steps);
      alert('Files exported locally!');
    }
    this.closeSaveDecryptModal();
  };

  render() {
    return (
      <>
        <FilesSelector onUpdateFiles={(files) => this.setState({ files })} />
        <RecipeConfigurator onUpdateRecipe={(steps) => this.setState({ steps })} />

        <button onClick={this.openSaveEncryptModal} disabled={this.state.files.length === 0}>
          Save encrypt files
        </button>

        <br />

        <button onClick={this.openSaveDecryptModal} disabled={this.state.files.length === 0}>
          Save decrypt Files
        </button>

        <SaveEncryptModal
          visible={this.state.isSaveEncryptModalOpen}
          files={this.state.files}
          onClose={this.closeSaveEncryptModal}
          onExport={this.onExportEncrypt}
        />

        <SaveDecryptModal
          visible={this.state.isSaveDecryptModalOpen}
          files={this.state.files}
          onClose={this.closeSaveDecryptModal}
          onExport={this.onExportDecrypt}
        />
      </>
    );
  }
}
