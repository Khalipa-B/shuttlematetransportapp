import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initOfflineStorage } from "./lib/offlineStorage";

// Initialize offline storage for PWA functionality
initOfflineStorage()
  .then(() => {
    console.log("Offline storage initialized");
  })
  .catch((error) => {
    console.error("Failed to initialize offline storage:", error);
  });

// Create root and render the app
createRoot(document.getElementById("root")!).render(<App />);
