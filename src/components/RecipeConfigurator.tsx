import React from "react";
import { GripVertical, Trash2 } from "lucide-react";

interface Step {
  id: string;
  type: string;
  extra?: string;
}

interface State {
  steps: Step[];
  dragIndex: number | null;
  recipeName: string;
  version: string;
}

const TYPE_OPTIONS = [
  { value: "mix", label: "Mix" },
  { value: "bake", label: "Bake" },
  { value: "wait", label: "Wait" },
];

let idCounter = 1;

class RecipeConfigurator extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      steps: [{ id: "step-1", type: "mix" }],
      dragIndex: null,
      recipeName: "My Recipe",
      version: this.getAppVersion(),
    };
  }

  getAppVersion() {
    try {
      // Assumes preload exposes electron.version via contextBridge
      return (window as any).appVersion || "1.0.0";
    } catch {
      return "1.0.0";
    }
  }

  handleSelectChange = (index: number, value: string) => {
    const steps = [...this.state.steps];
    steps[index].type = value;
    if (value !== "bake") delete steps[index].extra;
    this.setState({ steps });
  };

  handleExtraChange = (index: number, value: string) => {
    const steps = [...this.state.steps];
    steps[index].extra = value;
    this.setState({ steps });
  };

  handleRemove = (index: number) => {
    const steps = [...this.state.steps];
    steps.splice(index, 1);
    this.setState({ steps });
  };

  handleAddStep = () => {
    const newStep = { id: `step-${++idCounter}`, type: "mix" };
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

  exportRecipe = () => {
    const { recipeName, version, steps } = this.state;
    const data = {
      name: recipeName,
      version: version,
      values: steps.map(({ type, extra }) => ({ type, ...(extra ? { extra } : {}) })),
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${recipeName.replace(/\s+/g, "_").toLowerCase() || "recipe"}.json`;
    link.click();

    URL.revokeObjectURL(url);
  };

  importRecipe = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result as string;
        const json = JSON.parse(result);

        const steps = (json.values || []).map((v: any, i: number) => ({
          id: `step-${++idCounter}`,
          type: v.type,
          extra: v.extra,
        }));

        this.setState({
          recipeName: json.name || "Unnamed Recipe",
          version: this.getAppVersion(),
          steps: steps.length > 0 ? steps : [{ id: `step-${++idCounter}`, type: "mix" }],
        });
      } catch (err) {
        alert("Failed to import recipe: Invalid JSON format.");
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // reset input
  };

  renderStep = (step: Step, index: number) => (
    <div
      key={step.id}
      className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 bg-base-100 border border-base-200 rounded-xl p-4 shadow hover:shadow-md transition"
      draggable
      onDragStart={() => this.handleDragStart(index)}
      onDragOver={this.handleDragOver}
      onDrop={() => this.handleDrop(index)}
    >
      <div className="flex items-center gap-3 w-full sm:w-auto">
        {/* Drag Handle */}
        <div className="text-gray-400 cursor-move">
          <GripVertical className="w-5 h-5" />
        </div>

        {/* Type Selector */}
        <select
          className="select select-bordered w-full sm:w-40"
          value={step.type}
          onChange={(e) => this.handleSelectChange(index, e.target.value)}
        >
          <option disabled>Select type</option>
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Conditional input */}
        {step.type === "bake" && (
          <input
            type="text"
            className="input input-bordered w-full sm:w-40"
            placeholder="Temperature (°C)"
            value={step.extra || ""}
            onChange={(e) => this.handleExtraChange(index, e.target.value)}
          />
        )}
      </div>

      {/* Remove Button */}
      <button
        className="btn btn-sm btn-circle btn-ghost hover:bg-error hover:text-white text-gray-500"
        onClick={() => this.handleRemove(index)}
        aria-label="Remove step"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );

  render() {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold text-center">🍳 Recipe Configurator</h2>

        {/* Name + Version */}
        <div className="grid sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Recipe name"
            className="input input-bordered w-full"
            value={this.state.recipeName}
            onChange={(e) => this.setState({ recipeName: e.target.value })}
          />
          <input
            type="text"
            placeholder="Version"
            className="input input-bordered w-full"
            value={this.state.version}
            onChange={(e) => this.setState({ version: e.target.value })}
            disabled
          />
        </div>

        {/* Step list */}
        <div className="space-y-4">
          {this.state.steps.map((step, index) => this.renderStep(step, index))}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap justify-center sm:justify-between items-center gap-4 pt-4 border-t border-base-200">
          <button className="btn btn-primary" onClick={this.handleAddStep}>
            ➕ Add Step
          </button>

          <div className="flex flex-wrap gap-2">
            <label className="btn btn-outline btn-secondary cursor-pointer">
              📥 Import
              <input
                type="file"
                accept=".json"
                onChange={this.importRecipe}
                className="hidden"
              />
            </label>
            <button className="btn btn-outline btn-accent" onClick={this.exportRecipe}>
              📤 Export
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default RecipeConfigurator;
