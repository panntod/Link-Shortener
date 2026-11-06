import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import "./styles.css";

const path = window.location.pathname.replace(/\/+$/, "");
const Page = path === "/dashboard" ? Dashboard : Home;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Page />
  </StrictMode>
);
