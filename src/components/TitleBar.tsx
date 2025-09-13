import React, { useEffect } from "react"

const Titlebar: React.FC = () => {

    useEffect(() => {
        const titlebar = document.querySelector(".titlebar") as HTMLElement | null;
        if (!titlebar) return;

        function updateTitlebarPadding(isMaximized: boolean) {
            titlebar.style.padding = isMaximized ? "0 0px" : "0 8px";
        }

        window.electron.onWindowSizeUpdate(titlebar);

        window.electron.removeAllWindowSizeUpdate()
    }, []);
    
  const handleAction = (action: "minimize" | "maximize" | "close") => {
    window.electron.updateWindow(action);
  }

  return (
    <div className="titlebar flex items-center h-8">
        <div className="app-title text-white font-medium text-sm">Loocker</div>
        <div className="window-controls flex ml-auto">
            <button className="win-btn" onClick={() => handleAction("minimize")}>
            —
            </button>
            <button className="win-btn" onClick={() => handleAction("maximize")}>
            ▢
            </button>
            <button
            className="win-btn close-btn"
            onClick={() => handleAction("close")}
            >
            ✕
            </button>
        </div>
    </div>
  )
}

export default Titlebar
