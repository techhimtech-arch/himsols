import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { installErrorLogger } from "./lib/errorLogger";

installErrorLogger();

createRoot(document.getElementById("root")!).render(<App />);
