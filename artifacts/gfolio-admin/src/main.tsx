import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setBaseUrl } from "@workspace/api-client-react";
import { defaultApiConfig } from "@/lib/api-config";

setBaseUrl(`${defaultApiConfig.baseUrl}${defaultApiConfig.prefix}`);
createRoot(document.getElementById("root")!).render(<App />);
