import React from 'react';

interface SaveEncryptModalProps {
  files: File[];
  visible: boolean;
  onClose: () => void;
  onExport: (method: string, files: File[], folderHandle?: FileSystemDirectoryHandle) => void;
}

interface SaveEncryptModalState {
  selectedMethod: string;
  folderHandle?: FileSystemDirectoryHandle; // For local folder handle
  folderName?: string;
  exporting: boolean;
}

export class SaveEncryptModal extends React.Component<SaveEncryptModalProps, SaveEncryptModalState> {
  constructor(props: SaveEncryptModalProps) {
    super(props);
    this.state = {
      selectedMethod: 'local',
      exporting: false,
    };
  }

  handleMethodChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ selectedMethod: event.target.value, folderHandle: undefined, folderName: undefined });
  };

  pickFolder = async () => {
    try {
      // @ts-ignore
      const folderHandle = await window.showDirectoryPicker();
      this.setState({ folderHandle, folderName: folderHandle.name });
    } catch (err) {
      console.warn('Folder picking cancelled or not supported', err);
    }
  };

  handleExport = async () => {
    if (this.state.selectedMethod === 'local' && !this.state.folderHandle) {
      alert('Please select a folder to export files locally.');
      return;
    }

    this.setState({ exporting: true });
    await this.props.onExport(this.state.selectedMethod, this.props.files, this.state.folderHandle);
    this.setState({ exporting: false });
  };

  render() {
    if (!this.props.visible) return null;

    return (
      <>
        <input type="checkbox" id="export-modal" className="modal-toggle" checked={this.props.visible} readOnly />
        <div className="modal modal-open">
          <div className="modal-box max-w-lg max-h-[80vh] overflow-auto">
            <h3 className="font-bold text-lg mb-4">Select Export Method</h3>

            <div className="form-control w-full max-w-xs mb-4">
              <label className="label">
                <span className="label-text">Export method:</span>
              </label>
              <select
                className="select select-bordered"
                value={this.state.selectedMethod}
                onChange={this.handleMethodChange}
              >
                <option value="local">Local</option>
                <option value="googleDrive">Google Drive</option>
                <option value="dropbox">Dropbox</option>
              </select>
            </div>

            {this.state.selectedMethod === 'local' && (
              <div className="mb-4">
                <button className="btn btn-outline btn-sm" onClick={this.pickFolder}>
                  {this.state.folderName ? `Selected folder: ${this.state.folderName}` : 'Choose Folder'}
                </button>
              </div>
            )}

            <div>
              <h4 className="font-semibold mb-2">Files to export:</h4>
              <ul className="list-disc pl-5 max-h-40 overflow-auto border rounded p-2 bg-base-200">
                {this.props.files.length === 0 ? (
                  <li>No files selected</li>
                ) : (
                  this.props.files.map((file, i) => <li key={i}>{file.name}</li>)
                )}
              </ul>
            </div>

            <div className="modal-action mt-6">
              <button
                className={`btn btn-primary ${this.props.files.length === 0 || (this.state.selectedMethod === 'local' && !this.state.folderHandle) ? 'btn-disabled' : ''}`}
                onClick={this.handleExport}
                disabled={this.props.files.length === 0 || (this.state.selectedMethod === 'local' && !this.state.folderHandle) || this.state.exporting}
              >
                {this.state.exporting ? 'Exporting...' : 'Export'}
              </button>
              <button className="btn btn-outline" onClick={this.props.onClose} disabled={this.state.exporting}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }
}