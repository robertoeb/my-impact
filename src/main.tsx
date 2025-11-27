import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AppProvider } from "./contexts/AppContext";
import { ReportProvider } from "./contexts/ReportContext";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AppProvider>
      <ReportProvider>
        <App />
      </ReportProvider>
    </AppProvider>
  </React.StrictMode>,
);
