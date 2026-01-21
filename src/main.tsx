/**
 * Application entry point
 * @author Senior Full-Stack Developer
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

// Get root element with proper error handling
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('Root element not found. Please ensure index.html contains a div with id="root".');
}

// Create and render the application
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
