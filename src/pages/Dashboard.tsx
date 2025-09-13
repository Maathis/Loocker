import React from "react";
import RecipeConfigurator, { Step } from "../components/recipe/RecipeConfigurator";
import FilesSelector from "../components/fileselector/FilesSelector";
import { SaveEncryptModal } from "../components/SaveEncryptModal";
import { SaveDecryptModal } from "../components/SaveDecryptModal";
import { ALGORITHMS } from "../components/recipe/RecipeAlgorithm";
import { SymmetricAlgorithm } from "../objects/algorithms/symmetrics/SymmetricAlgo";
import { AsymmetricAlgorithm } from "../objects/algorithms/asymmetrics/AsymmetricAlgo";
import Titlebar from "../components/TitleBar";
import { ModalContext, NotificationModalContextProps } from "../components/notification/NotificationModalContext";

interface State {
  files: File[];
  steps: Step[];
  isSaveEncryptModalOpen: boolean;
  isSaveDecryptModalOpen: boolean;
  filesSelected: boolean;
}


interface State {
  files: File[];
  steps: Step[];
  isSaveEncryptModalOpen: boolean;
  isSaveDecryptModalOpen: boolean;
}

async function encryptFileWithRecipe(file: File, steps: Step[]): Promise<File> {
  let fileData = await file.arrayBuffer();
  let dataToEncrypt: Uint8Array = new Uint8Array(fileData);

  for (const step of steps) {
    if (!step.algorithm || !step.type || !step.keyType) continue;

    const typeKey = step.type as keyof typeof ALGORITHMS;
    const algorithmKey = step.algorithm as keyof typeof ALGORITHMS[typeof typeKey];
    const algorithmInstance = ALGORITHMS[typeKey]?.[algorithmKey];
    if (!algorithmInstance) continue;

    if(algorithmInstance instanceof SymmetricAlgorithm) {
      const keyMaterial = step.keyType === "passphrase" ? step.passphrase : step.keyFileContent;
      if (!keyMaterial) continue;
  
      const keyBuffer = typeof keyMaterial === 'string'
        ? new TextEncoder().encode(keyMaterial)
        : keyMaterial;

      await (algorithmInstance as SymmetricAlgorithm).setKey(keyBuffer);
    } else {
      await (algorithmInstance as AsymmetricAlgorithm).setPublicKey(step.publicKey);
      await (algorithmInstance as AsymmetricAlgorithm).setPrivateKey(step.privateKey);
    }

    dataToEncrypt = await algorithmInstance.encrypt(dataToEncrypt);
  }

  return new File([dataToEncrypt], file.name + ".enc", { type: "application/octet-stream" });
}

async function decryptFileWithRecipe(file: File, steps: Step[]): Promise<File> {
  let fileData = await file.arrayBuffer();
  let dataToDecrypt: Uint8Array = new Uint8Array(fileData);

  for (const step of steps.slice().reverse()) {

    if (!step.algorithm || !step.type || !step.keyType) continue;

    const typeKey = step.type as keyof typeof ALGORITHMS;
    const algorithmKey = step.algorithm as keyof typeof ALGORITHMS[typeof typeKey];
    const algorithmInstance = ALGORITHMS[typeKey]?.[algorithmKey];
    if (!algorithmInstance) continue;
    
    if(algorithmInstance instanceof SymmetricAlgorithm) {
      const keyMaterial = step.keyType === "passphrase" ? step.passphrase : step.keyFileContent;
      if (!keyMaterial) continue;

      const keyBuffer = typeof keyMaterial === 'string'
        ? new TextEncoder().encode(keyMaterial)
        : keyMaterial;
      
      await (algorithmInstance as SymmetricAlgorithm).setKey(keyBuffer);
    } else {
      await (algorithmInstance as AsymmetricAlgorithm).setPublicKey(step.publicKey);
      await (algorithmInstance as AsymmetricAlgorithm).setPrivateKey(step.privateKey);
    }
    
    dataToDecrypt = await algorithmInstance.decrypt(dataToDecrypt);
  }

  let filenameOutput = file.name;
  if (filenameOutput.endsWith('.enc')) {
    filenameOutput = filenameOutput.slice(0, -4);
  }

  return new File([dataToDecrypt], filenameOutput, { type: "application/octet-stream" });
}

async function exportEncryptFilesToLocalFolder(
  files: File[],
  folderHandle: FileSystemDirectoryHandle,
  showModal: NotificationModalContextProps['showModal'],
  steps: Step[]
) {
  if (!folderHandle) throw new Error("Folder handle is required");

  let errorOccured = false;
  let outputName = "";
  let errorMsg = "";
  for (const file of files) {
    try {
      const encryptedFile = await encryptFileWithRecipe(file, steps);
      const fileHandle = await folderHandle.getFileHandle(encryptedFile.name, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(encryptedFile);
      await writable.close();
      outputName = folderHandle.name;
    } catch (error) {
      errorOccured = true;
      outputName = file.name;
      errorMsg = error;
    }
  }
  
  if(!errorOccured) {
    showModal("success", "File(s) encrypted and saved", `File(s) encrypted and saved to ${outputName}`);
  } else {
    showModal("error", "Failed to encrypt or save file(s)", `Failed to encrypt or save file ${outputName} (${errorMsg})`);
  }
}

async function exportDecryptFilesToLocalFolder(
  files: File[],
  folderHandle: FileSystemDirectoryHandle,
  showModal: NotificationModalContextProps['showModal'],
  steps: Step[]
) {
  if (!folderHandle) throw new Error("Folder handle is required");

  let errorOccured = false;
  let outputName = "";
  let errorMsg = "";
  for (const file of files) {
    try {
      const decryptedFile = await decryptFileWithRecipe(file, steps);
      const fileHandle = await folderHandle.getFileHandle(decryptedFile.name, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(decryptedFile);
      await writable.close();
      outputName = folderHandle.name;
    } catch (error) {
      errorOccured = true;
      outputName = file.name;
      errorMsg = error;
    }
  }

  if(!errorOccured) {
    showModal("success", "File(s) decrypted and saved", `File(s) decrypted and saved to ${outputName}`);
  } else {
    showModal("error", "Failed to decrypt or save file(s)", `Failed to decrypt or save file ${outputName} (${errorMsg})`);
  }
}

export class Dashboard extends React.Component<{}, State> {

  constructor(props: {}) {
    super(props);
    this.state = {
      files: [],
      steps: [],
      isSaveEncryptModalOpen: false,
      isSaveDecryptModalOpen: false,
      filesSelected: false,
    };
  }

  openSaveEncryptModal = () => this.setState({ isSaveEncryptModalOpen: true });
  closeSaveEncryptModal = () => this.setState({ isSaveEncryptModalOpen: false });

  openSaveDecryptModal = () => this.setState({ isSaveDecryptModalOpen: true });
  closeSaveDecryptModal = () => this.setState({ isSaveDecryptModalOpen: false });

  onExportEncrypt = async (method: string, files: File[], showModal: NotificationModalContextProps['showModal'], folderHandle?: FileSystemDirectoryHandle) => {
    if (method === 'local' && folderHandle) {
      await exportEncryptFilesToLocalFolder(files, folderHandle, showModal, this.state.steps);
    }
    this.closeSaveEncryptModal();
  };

  onExportDecrypt = async (method: string, files: File[], showModal: NotificationModalContextProps['showModal'], folderHandle?: FileSystemDirectoryHandle) => {
    if (method === 'local' && folderHandle) {
      await exportDecryptFilesToLocalFolder(files, folderHandle, showModal, this.state.steps);
    }
    this.closeSaveDecryptModal();
  };

  handleFilesUpdate = (files: File[]) => {
    const hasFiles = files.length > 0;
    // If files just selected, set filesSelected true to start animation
    if (hasFiles && !this.state.filesSelected) {
      this.setState({ files, filesSelected: true });
    } else if (!hasFiles && this.state.filesSelected) {
      // If no files, reset to initial state
      this.setState({ files, filesSelected: false });
    } else {
      // Just update files if no change to selected state
      this.setState({ files });
    }
  };

  render() {
    const {
      files,
      steps,
      filesSelected,
      isSaveEncryptModalOpen,
      isSaveDecryptModalOpen,
    } = this.state;
  
    return (
      <ModalContext.Consumer>
        {({ showModal }) => (
          <div className="app-shell relative h-screen w-full">
            <Titlebar/>
            <div className="relative h-screen w-full bg-base-200 flex items-center justify-center overflow-hidden p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row w-full max-w-7xl mx-auto transition-all duration-700 ease-in-out gap-0 sm:gap-6">
                <div
                  className={`
                    transition-transform duration-700 ease-in-out
                    w-full sm:w-1/2 max-w-full
                    ${filesSelected ? "sm:translate-x-0" : "sm:translate-x-[50%]"}
                    flex justify-center
                  `}
                >
                  <div className="w-full max-w-[720px]">
                    <FilesSelector onUpdateFiles={this.handleFilesUpdate} />
                  </div>
                </div>
        
                {filesSelected && (
                  <div className="divider lg:divider-horizontal"></div>
                )}
        
                <div
                  className={`
                    transition-all duration-700 ease-in-out
                    w-full sm:w-1/2
                    transform ${filesSelected ? "opacity-100 translate-x-0" : "opacity-0 sm:translate-x-[50%]"}
                    pointer-events-${filesSelected ? "auto" : "none"}
                  `}
                >
                  {filesSelected && (
                    <div className="bg-base-200 rounded-lg shadow-lg p-4 sm:p-6 max-h-[85vh] overflow-auto text-base-content">
                      <RecipeConfigurator
                        onUpdateRecipe={(steps) => this.setState({ steps })}
                      />

                      <div className="mt-8 flex gap-4 justify-center w-full max-w-md mx-auto">
                        <button
                          className="btn btn-primary"
                          onClick={this.openSaveEncryptModal}
                          disabled={files.length === 0}
                        >
                          Encrypt files
                        </button>

                        <button
                          className="btn btn-secondary"
                          onClick={this.openSaveDecryptModal}
                          disabled={files.length === 0}
                        >
                          Decrypt files
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
        
              <SaveEncryptModal
                visible={isSaveEncryptModalOpen}
                files={files}
                onClose={this.closeSaveEncryptModal}
                onExport={(method: string, files: File[], folderHandle?: FileSystemDirectoryHandle) => this.onExportEncrypt(method, files, showModal, folderHandle)}
              />
        
              <SaveDecryptModal
                visible={isSaveDecryptModalOpen}
                files={files}
                onClose={this.closeSaveDecryptModal}
                onExport={(method: string, files: File[], folderHandle?: FileSystemDirectoryHandle) => this.onExportDecrypt(method, files, showModal, folderHandle)}
              />
            </div>
          </div>
        )}
      </ModalContext.Consumer>
    );
  }
  
}
