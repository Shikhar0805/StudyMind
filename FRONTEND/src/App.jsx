import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./app.routes";
import { ThemeProvider } from "./UI/theme/ThemeContext";

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppRoutes />
      </Router>
    </ThemeProvider>
  );
}
