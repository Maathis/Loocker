import React from "react";
import RecipeConfigurator, { Step } from "../components/Recipe/RecipeConfigurator";
import FilesSelector from "../components/FilesSelector";
import { ExportModal } from "../components/ExportModal";

interface State {
  files: File[];
  steps: Step[];
}

interface State {
  files: File[];
  steps: Step[];
  isExportModalOpen: boolean;
}


async function exportFilesToLocalFolder(files: File[], folderHandle: FileSystemDirectoryHandle) {
  if (!folderHandle) throw new Error('Folder handle is required');

  for (const file of files) {
    try {
      // Get (or create) the file handle in the directory
      const fileHandle = await folderHandle.getFileHandle(file.name, { create: true });
      // Create a writable stream
      const writable = await fileHandle.createWritable();
      // Write the file contents
      await writable.write(file);
      // Close the file and save changes
      await writable.close();
    } catch (error) {
      console.error(`Failed to save file ${file.name}:`, error);
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
      await exportFilesToLocalFolder(files, folderHandle);
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