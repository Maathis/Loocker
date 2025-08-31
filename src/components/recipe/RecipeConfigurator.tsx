import React from "react";
import StepItem from "./StepItem";
import { KeyRole } from "src/objects/algorithms/asymmetrics/AsymmetricAlgo";
import { RSAAlgorithm } from "../../objects/algorithms/asymmetrics/RSAAlgorithm";
import { HardDriveDownload, Upload } from "lucide-react";

export interface Step {
  id: string;
  type: "symmetric" | "asymmetric" | "";
  algorithm?: string;
  keyType?: "passphrase" | "keyfile";
  passphrase?: string;
  keyFileName?: string;
  keyFileContent?: string;
  publicKey?: CryptoKey;
  privateKey?: CryptoKey;
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

  // ===== Handlers (keep your existing logic) =====
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
    if (steps[index].type === "asymmetric") {
      if (keyRole === "public") steps[index].publicKey = key;
      else if (keyRole === "private") steps[index].privateKey = key;
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

  openExportModal = () => this.setState({ exportModalOpen: true });
  closeExportModal = () => this.setState({ exportModalOpen: false });

  // ===== Export / Import logic (keep existing) =====
  exportRecipe = async () => {
    const { recipeName, version, steps, exportIncludePassphrase, exportIncludeKeyFiles } = this.state;
    const values = await Promise.all(steps.map(async (step) => {
      const base: any = { type: step.type, algorithm: step.algorithm, keyType: step.keyType };
      if (exportIncludePassphrase && step.keyType === "passphrase") base.passphrase = step.passphrase;
      if (step.type === "asymmetric" && step.keyType === "keyfile" && exportIncludeKeyFiles) {
        const exportedPublicKey = await crypto.subtle.exportKey("spki", step.publicKey!);
        const exportedPrivateKey = await crypto.subtle.exportKey("pkcs8", step.privateKey!);
        base.publicKey = RSAAlgorithm.arrayBufferToPem(exportedPublicKey, "public");
        base.privateKey = RSAAlgorithm.arrayBufferToPem(exportedPrivateKey, "private");
      }
      return base;
    }));

    const exportData = { recipeName, version, steps: values };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${recipeName.replace(/\s+/g, "_")}_export.json`;
    link.click();
    URL.revokeObjectURL(url);
    this.closeExportModal();
  };

  importRecipe = async () => {
    const filePath: string = await window.electron.openFileDialog({ filters: [{ name: "JSON", extensions: ["json"] }] });
    if (!filePath) return;
    const fileContent: string = await window.electron.readFile(filePath);
    const data = JSON.parse(fileContent);

    const parsedSteps: Step[] = await Promise.all(data.steps.map(async (step: any, idx: number) => {
      const parsed: Step = { id: `step-${idx + 1}`, type: step.type, algorithm: step.algorithm, keyType: step.keyType };
      if (step.keyType === "passphrase") parsed.passphrase = step.passphrase;
      if (step.type === "asymmetric" && step.keyType === "keyfile") {
        if (step.publicKey) parsed.publicKey = await RSAAlgorithm.pemToCryptoKey(step.publicKey, "public");
        if (step.privateKey) parsed.privateKey = await RSAAlgorithm.pemToCryptoKey(step.privateKey, "private");
      }
      return parsed;
    }));

    this.setState({ recipeName: data.recipeName || "Imported Recipe", version: data.version || "1.0.0", steps: parsedSteps });
  };

  renderExportModal = () => {
    const { exportModalOpen, exportIncludePassphrase, exportIncludeKeyFiles } = this.state;
    if (!exportModalOpen) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm bg-black/20">
        <div className="bg-base-200 rounded-lg shadow-lg p-6 max-w-sm w-full text-base-content">
          <h3 className="text-lg font-semibold mb-4 text-primary">Export Options</h3>

          <label className="flex items-center gap-2 mb-3 cursor-pointer">
            <input
              type="checkbox"
              checked={exportIncludePassphrase}
              onChange={(e) =>
                this.setState({ exportIncludePassphrase: e.target.checked })
              }
              className="checkbox checkbox-primary"
            />
            <span>Include Passphrases</span>
          </label>

          <label className="flex items-center gap-2 mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={exportIncludeKeyFiles}
              onChange={(e) =>
                this.setState({ exportIncludeKeyFiles: e.target.checked })
              }
              className="checkbox checkbox-primary"
            />
            <span>Include Key Files (content included)</span>
          </label>

          <div className="flex justify-end gap-2">
            <button
              className="btn btn-outline text-base-content border-base-300 hover:bg-base-300"
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
        {/* Header: Title + Icon Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4 mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold">
            Recipe Configurator
          </h2>

          {/* Icon buttons on the right */}
          <div className="flex gap-2">
            <button
              className="btn btn-sm btn-ghost p-2"
              onClick={this.openExportModal}
              aria-label="Export Recipe"
            >
              <HardDriveDownload className="w-5 h-5" />
            </button>
            <button
              className="btn btn-sm btn-ghost p-2"
              onClick={this.importRecipe}
              aria-label="Import Recipe"
            >
              <Upload className="w-5 h-5" />
            </button>
          </div>
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

        {/* Centered Add Step button */}
        <div className="flex justify-center mt-4">
          <button className="btn btn-soft btn-outline" onClick={this.handleAddStep} type="button">
            Add Step
          </button>
        </div>

        {this.renderExportModal()}
      </div>
    );
  }
}

export default RecipeConfigurator;
