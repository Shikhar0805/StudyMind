import { Link, useLocation } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import HeaderControls from "./HeaderControls";

export default function Layout({ children }) {
  const location = useLocation();
  const showFooter = location.pathname !== "/dashboard";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      {/* Abstract background blobs for high-fidelity aesthetics */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-foreground/10 rounded-full opacity-20" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-foreground/05 rounded-full opacity-15" />
        <div className="absolute -bottom-40 right-1/4 w-96 h-96 bg-foreground/10 rounded-full opacity-20" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 w-full glass-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-xl text-primary border border-primary/20">
              <GraduationCap className="h-6 w-6" />
            </div>
            <span className="text-xl font-black tracking-tight text-foreground">
              StudyMind  AI
            </span>
          </Link>

          <nav className="flex items-center gap-6">
            <HeaderControls />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
