import { Routes, Route } from "react-router-dom";
import Index from "./UI/pages/index";
import Dashboard from "./UI/pages/dashboard";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default AppRoutes;
