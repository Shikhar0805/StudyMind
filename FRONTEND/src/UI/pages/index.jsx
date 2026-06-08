import { useNavigate } from "react-router-dom";
import { BookOpen, Calendar, HelpCircle, Layers, Lightbulb } from "lucide-react";
import { ScrollAnimate } from "../components/ScrollAnimate";
import Layout from "../components/Layout";

const features = [
  {
    icon: Calendar,
    title: "Study Planner",
    desc: "Convert text or syllabus outlines into a step-by-step prep checklist that matches your calendar.",
    color: "from-foreground/10 to-foreground/5"
  },
  {
    icon: HelpCircle,
    title: "Practice Quizzes",
    desc: "Quiz yourself directly on your uploaded notes. Get immediate feedback with question-by-question explanations.",
    color: "from-foreground/10 to-foreground/5"
  },
  {
    icon: Lightbulb,
    title: "Mnemonics",
    desc: "Generate custom acronyms and memory aids for tough concepts helping you to remember them during exams.",
    color: "from-foreground/10 to-foreground/5"
  }
];

export function Index() {
  const navigate = useNavigate();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="text-center py-16 md:py-24 relative overflow-hidden">
        <ScrollAnimate className="max-w-3xl mx-auto flex flex-col items-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none mb-6">
            Break down tough topics. <br />
            <span className="text-foreground">
              Remember them easily.
            </span>
          </h1>
          <p className="mb-10 text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Drop in your syllabus topics, paste lecture notes, or upload a textbook PDF. StudyMind AI will turn your study materials into structured guides, quizzes, and memory aids.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="btn text-base px-12 py-3.5 bg-primary text-primary-foreground transition duration-200 cursor-pointer"
          >
            Study Now &rarr;
          </button>
        </ScrollAnimate>
      </section>

      {/* Features Grid */}
      <section className="py-16 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight">Structured study guides in clicks</h2>
            <p className="text-muted-foreground mt-2">Simple workspace options to organize messy study material</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, desc, color }, idx) => (
              <ScrollAnimate key={idx}>
                <div className="h-full flex flex-col glass-card rounded-2xl p-6 border border-border/60 hover:-translate-y-1 hover:border-primary/30 transition-all duration-300">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${color} w-fit mb-4`}>
                    <Icon className="h-6 w-6 text-foreground" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">{desc}</p>
                </div>
              </ScrollAnimate>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight">How It Works</h2>
            <p className="text-muted-foreground mt-2">Go from raw notes to targeted practice without the extra steps.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              { num: "01", title: "Add Your Content", desc: "Type a core subject, paste raw lecture notes, or drag in a textbook chapter PDF." },
              { num: "02", title: "Choose a Study Mode", desc: "Select from roadmaps to plan your studies, test your knowledge with quizzes, utilize mnemonics for memory retention." },
              { num: "03", title: "Test Yourself & Save", desc: "Run through the roadmap, learn through the quizzes, remember using mnemonics, and export PDF's as well. On the go." }
            ].map(({ num, title, desc }, idx) => (
              <ScrollAnimate key={idx}>
                <div className="text-center p-6 bg-card/40 border border-border/40 rounded-2xl">
                  <div className="text-4xl font-black text-primary/30 mb-4 font-mono">{num}</div>
                  <h3 className="text-lg font-bold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </ScrollAnimate>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="py-12">
        <ScrollAnimate>
          <div className="rounded-3xl bg-card border border-border p-10 md:p-16 text-center max-w-4xl mx-auto relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-primary/10 rounded-full opacity-25 pointer-events-none" />
            <h2 className="text-2xl sm:text-3xl font-black mb-4">Ready to clean up your notes?</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto text-sm sm:text-base">
              No logins, no account setups, and no limits. Open the workspace to get started.
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="btn px-12 py-3.5 bg-primary text-primary-foreground transition duration-200 cursor-pointer"
            >
              Open Workspace
            </button>
          </div>
        </ScrollAnimate>
      </section>
    </Layout>
  );
}

export default Index;
