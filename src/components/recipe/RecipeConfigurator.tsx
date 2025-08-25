import React from "react";
import StepItem from "./StepItem";
import { KeyRole } from "src/objects/algorithms/asymmetrics/AsymmetricAlgo";
import { RSAAlgorithm } from "../../objects/algorithms/asymmetrics/RSAAlgorithm";

export interface Step {
  id: string;
  type: "symmetric" | "asymmetric" | "";  // encryption type
  algorithm?: string;                     // e.g., "aes", "rsa"
  keyType?: "passphrase" | "keyfile";     // key source type

  // Passphrase (for symmetric)
  passphrase?: string;                     // stored passphrase if keyType === "passphrase"

  // Single key file (for symmetric keyfile)
  keyFileName?: string;                    // file name if keyType === "keyfile" && symmetric
  keyFileContent?: string;                 // base64 or text content of key file

  // Asymmetric key files
  publicKey?: CryptoKey;           // base64/text content of public key
  privateKey?: CryptoKey;          // base64/text content of private key
}

interface Props {
  onUpdateRecipe: (newData: Step[]) => void;
}

interface State extends Props {
  steps: Step[];
  dragIndex: number | null;
  recipeName: string;
  version: string;
  exportModalOpen: boolean;
  exportIncludePassphrase: boolean;
  exportIncludeKeyFiles: boolean;
}

let idCounter = 1;

class RecipeConfigurator extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      steps: [{ id: "step-1", type: "", algorithm: undefined, keyType: undefined }],
      dragIndex: null,
      recipeName: "My Recipe",
      version: this.getAppVersion(),
      onUpdateRecipe: props.onUpdateRecipe,
      exportModalOpen: false,
      exportIncludePassphrase: false,
      exportIncludeKeyFiles: false,
    };
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevState.steps !== this.state.steps) {
      this.props.onUpdateRecipe(this.state.steps);
    }
  }

  getAppVersion() {
    try {
      return (window as any).appVersion || "1.0.0";
    } catch {
      return "1.0.0";
    }
  }

  handleTypeChange = (index: number, value: string) => {
    const steps = [...this.state.steps];
    steps[index].type = value as "" | "symmetric" | "asymmetric";
    delete steps[index].algorithm;
    delete steps[index].keyType;
    delete steps[index].passphrase;
    delete steps[index].keyFileName;
    delete steps[index].keyFileContent;
    this.setState({ steps });
  };

  handleAlgorithmChange = (index: number, value: string) => {
    const steps = [...this.state.steps];
    steps[index].algorithm = value;
    this.setState({ steps });
  };

  handleKeyTypeChange = (index: number, value: string) => {
    const steps = [...this.state.steps];
    steps[index].keyType = value as "passphrase" | "keyfile";
    delete steps[index].passphrase;
    delete steps[index].keyFileName;
    delete steps[index].keyFileContent;
    this.setState({ steps });
  };

  handlePassphraseChange = (index: number, value: string) => {
    const steps = [...this.state.steps];
    steps[index].passphrase = value;
    this.setState({ steps });
  };

  handleKeyFileChange = (index: number, key: CryptoKey, keyRole?: KeyRole) => {
    const steps = [...this.state.steps];
    if(steps[index].type === "asymmetric") {
      if(keyRole == "public") {
        steps[index].publicKey = key;
      } else if(keyRole == "private") {
        steps[index].privateKey = key;
      }
    }
    this.setState({ steps });
  };

  handleRemove = (index: number) => {
    const steps = [...this.state.steps];
    steps.splice(index, 1);
    this.setState({ steps });
  };

  handleAddStep = () => {
    const newStep: Step = { id: `step-${++idCounter}`, type: "", algorithm: undefined, keyType: undefined };
    this.setState((prev) => ({
      steps: [...prev.steps, newStep],
    }));
  };

  handleDragStart = (index: number) => {
    this.setState({ dragIndex: index });
  };

  handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  handleDrop = (dropIndex: number) => {
    const { dragIndex, steps } = this.state;
    if (dragIndex === null || dragIndex === dropIndex) return;

    const updatedSteps = [...steps];
    const [draggedItem] = updatedSteps.splice(dragIndex, 1);
    updatedSteps.splice(dropIndex, 0, draggedItem);

    this.setState({ steps: updatedSteps, dragIndex: null });
  };

  openExportModal = () => {
    this.setState({ exportModalOpen: true });
  };

  closeExportModal = () => {
    this.setState({ exportModalOpen: false });
  };

  exportRecipe = async () => {
    const { recipeName, version, steps, exportIncludePassphrase, exportIncludeKeyFiles } = this.state;
    const values = await Promise.all(steps.map(async (step) => {
      const base: any = {
        type: step.type,
        algorithm: step.algorithm,
        keyType: step.keyType,
      };

      if (exportIncludePassphrase && step.keyType === "passphrase") {
        base.passphrase = step.passphrase;
      }

      if(step.type == "asymmetric") {
        if (exportIncludeKeyFiles && step.keyType === "keyfile") {
          const exportedPublicKey = await crypto.subtle.exportKey("spki", step.publicKey);
          const exportedPrivateKey = await crypto.subtle.exportKey("pkcs8", step.privateKey);
    
          base.publicKey = RSAAlgorithm.arrayBufferToPem(exportedPublicKey, "public");
          base.privateKey = RSAAlgorithm.arrayBufferToPem(exportedPrivateKey, "private");
        }
      }
      return base;
    }));

    const exportData = {
      recipeName,
      version,
      steps: values,
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${recipeName.replace(/\s+/g, "_")}_export.json`;
    link.click();
    URL.revokeObjectURL(url);
    this.closeExportModal();
  };

  // inside your class
  importRecipe = async () => {
    const filePath: string = await window.electron.openFileDialog({
      filters: [{ name: "JSON", extensions: ["json"] }],
    });

    if (!filePath) return;

    // read file contents via ipc
    const fileContent: string = await window.electron.readFile(filePath);
    const data = JSON.parse(fileContent);

    const parsedSteps: Step[] = await Promise.all(
      data.steps.map(async (step: any, idx: number) => {
        const parsed: Step = {
          id: `step-${idx + 1}`,
          type: step.type,
          algorithm: step.algorithm,
          keyType: step.keyType,
        };

        if (step.keyType === "passphrase") {
          parsed.passphrase = step.passphrase;
        }

        if (step.type === "asymmetric" && step.keyType === "keyfile") {
          if (step.publicKey) {
            parsed.publicKey = await RSAAlgorithm.pemToCryptoKey(step.publicKey, "public");
          }
          if (step.privateKey) {
            parsed.privateKey = await RSAAlgorithm.pemToCryptoKey(step.privateKey, "private");
          }
        }

        return parsed;
      })
    );

    this.setState({
      recipeName: data.recipeName || "Imported Recipe",
      version: data.version || "1.0.0",
      steps: parsedSteps,
    });
  };

  renderExportModal = () => {
    const { exportModalOpen, exportIncludePassphrase, exportIncludeKeyFiles } = this.state;
    if (!exportModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
          <h3 className="text-lg font-semibold mb-4">Export Options</h3>
          <label className="flex items-center gap-2 mb-3 cursor-pointer">
            <input
              type="checkbox"
              checked={exportIncludePassphrase}
              onChange={(e) => this.setState({ exportIncludePassphrase: e.target.checked })}
              className="checkbox checkbox-primary"
            />
            <span>Include Passphrases</span>
          </label>
          <label className="flex items-center gap-2 mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={exportIncludeKeyFiles}
              onChange={(e) => this.setState({ exportIncludeKeyFiles: e.target.checked })}
              className="checkbox checkbox-primary"
            />
            <span>Include Key Files (content included)</span>
          </label>
          <div className="flex justify-end gap-2">
            <button
              className="btn btn-outline"
              onClick={this.closeExportModal}
              type="button"
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={this.exportRecipe}
              type="button"
            >
              Export
            </button>
          </div>
        </div>
      </div>
    );
  };

  render() {
    const { steps } = this.state;
    return (
      <div className="max-w-5xl mx-auto p-6 sm:p-4 w-full">
        {/* Header with Add Step */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-center sm:text-left w-full sm:w-auto">
            Recipe Configurator
          </h2>
          <button className="btn btn-primary w-full sm:w-auto" onClick={this.handleAddStep} type="button">
            Add Step
          </button>
        </div>

        {/* Steps List */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <StepItem
              key={step.id}
              step={step}
              index={index}
              onTypeChange={this.handleTypeChange}
              onAlgorithmChange={this.handleAlgorithmChange}
              onKeyTypeChange={this.handleKeyTypeChange}
              onPassphraseChange={this.handlePassphraseChange}
              onKeyFileChange={this.handleKeyFileChange}
              onRemove={this.handleRemove}
              onDragStart={this.handleDragStart}
              onDragOver={this.handleDragOver}
              onDrop={this.handleDrop}
            />
          ))}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-2">
          <button
            className="btn btn-secondary w-full sm:w-auto"
            onClick={this.openExportModal}
            type="button"
          >
            Export Recipe
          </button>
          <button
            className="btn btn-outline w-full sm:w-auto"
            onClick={this.importRecipe}
            type="button"
          >
            Import Recipe
          </button>
        </div>

        {this.renderExportModal()}
      </div>
    );
  }
}

export default RecipeConfigurator;
