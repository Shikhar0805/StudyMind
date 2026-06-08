import { useState, useRef } from "react";
import {
  Calendar, HelpCircle, Lightbulb,
  Upload, BookOpen, CheckCircle, Download, AlertTriangle,
  Loader2
} from "lucide-react";
import { jsPDF } from "jspdf";
import { generateResource } from "../../services/study.api";
import Layout from "../components/Layout";

const TABS = [
  { id: "study-plan", icon: Calendar, label: "Study Roadmap" },
  { id: "quiz", icon: HelpCircle, label: "Quiz" },
  { id: "mnemonic", icon: Lightbulb, label: "Mnemonics" },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("study-plan");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [subject, setSubject] = useState("");
  const [notesText, setNotesText] = useState("");
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const [activePlan, setActivePlan] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [activeMnemonic, setActiveMnemonic] = useState(null);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== "application/pdf") {
      setError("Only PDF files are supported.");
      setFile(null);
      if (fileInputRef.current) 
      fileInputRef.current.value = "";
    } else { setError(null); setFile(f); }
  };

  const clearForm = () => {
    setSubject(""); setNotesText(""); setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!subject.trim()) { setError("Please specify a subject/topic."); return; }

    setLoading(true); setError(null); setSuccess(null);
    if (activeTab === "study-plan") setActivePlan(null);
    if (activeTab === "quiz") setActiveQuiz(null);
    if (activeTab === "mnemonic") setActiveMnemonic(null);

    try {
      const params = { type: activeTab, subject: subject.trim(), text: notesText.trim(), file };
      if (activeTab === "study-plan") params.timeline = "7 days";

      const result = await generateResource(params);
      if (activeTab === "study-plan") setActivePlan(result.resource);
      if (activeTab === "quiz") setActiveQuiz(result.resource);
      if (activeTab === "mnemonic") {
        setActiveMnemonic(result.resource);
      }
      setSuccess("Study guide generated!");
      clearForm();
    } catch (err) {
      setError(err.message || "Failed to generate resource. Please try again.");
    } finally { setLoading(false); }
  };

  // PDF Export
  const exportPDF = (type) => {
    const doc = new jsPDF();
    let y = 20;
    const pageCheck = (space = 20) => { if (y > 270 - space) { doc.addPage(); y = 20; } };
    const wrap = (text, x, maxW = 170) => {
      doc.splitTextToSize(text, maxW).forEach((line) => { pageCheck(); doc.text(line, x, y); y += 5; });
    };

    if (type === "study-plan" && activePlan) {
      const d = activePlan.generatedData;
      const timelineText = d.timeline || "7 days";
      doc.setFont("helvetica", "bold"); doc.setFontSize(22);
      doc.text(d.title || "Study Roadmap", 15, y); y += 15;
      doc.setFont("helvetica", "normal"); doc.setFontSize(12);
      doc.text(`Subject: ${activePlan.subject}`, 15, y); y += 6;
      doc.text(`Timeline: ${timelineText}`, 15, y); y += 12;

      d.schedule.forEach((day) => {
        pageCheck(40);
        doc.setFont("helvetica", "bold"); doc.setFontSize(14);
        doc.text(`Day ${day.day}: ${day.topic}`, 15, y); y += 8;
        doc.setFont("helvetica", "normal"); doc.setFontSize(11);
        day.focusAreas.forEach((a) => { doc.text(`• ${a}`, 25, y); y += 5; }); y += 3;
        if (day.resources?.length) { day.resources.forEach((r) => { doc.text(`• ${r}`, 25, y); y += 5; }); }
        y += 8;
      });

      if (d.generalTips?.length) {
        pageCheck(30); doc.setFont("helvetica", "bold"); doc.setFontSize(14);
        doc.text("General Study Tips", 15, y); y += 8;
        doc.setFont("helvetica", "normal"); doc.setFontSize(11);
        d.generalTips.forEach((tip) => wrap(`• ${tip}`, 15));
      }
      doc.save(`${activePlan.subject}_Study_Plan.pdf`);
    }

    if (type === "quiz" && activeQuiz) {
      const d = activeQuiz.generatedData;
      doc.setFont("helvetica", "bold"); doc.setFontSize(22);
      doc.text(d.title || "Quiz", 15, y); y += 15;
      doc.setFont("helvetica", "normal"); doc.setFontSize(12);
      doc.text(`Topic: ${d.topic}`, 15, y); y += 12;

      d.questions.forEach((q, i) => {
        pageCheck(40);
        doc.setFont("helvetica", "bold"); doc.setFontSize(12);
        wrap(`${i + 1}. ${q.question}`, 15);
        doc.setFont("helvetica", "normal"); doc.setFontSize(11);
        q.options.forEach((opt, oi) => {
          wrap(`  ${String.fromCharCode(65 + oi)}) ${opt}`, 20, 160);
        });
        if (typeof q.correctAnswerIndex === "number") {
          const correctLetter = String.fromCharCode(65 + q.correctAnswerIndex);
          y += 2;
          wrap(`Correct Answer: ${correctLetter}`, 20, 160);
        }
        y += 8;
      });
      doc.save(`${activeQuiz.subject}_Quiz.pdf`);
    }

    if (type === "mnemonic" && activeMnemonic) {
      const d = activeMnemonic.generatedData;
      doc.setFont("helvetica", "bold"); doc.setFontSize(22);
      doc.text(d.title || "Mnemonics", 15, y); y += 15;
      doc.setFont("helvetica", "normal"); doc.setFontSize(12);
      doc.text(`Subject: ${activeMnemonic.subject}`, 15, y); y += 12;

      if (d.mnemonics?.length) {
        doc.setFont("helvetica", "bold"); doc.setFontSize(14);
        doc.text("Mnemonics", 15, y); y += 10;
        doc.setFont("helvetica", "normal"); doc.setFontSize(11);
        d.mnemonics.forEach((item, idx) => {
          pageCheck(40);
          doc.setFont("helvetica", "bold"); doc.setFontSize(12);
          doc.text(`${idx + 1}. ${item.mnemonic}`, 15, y); y += 8;
          doc.setFont("helvetica", "normal"); doc.setFontSize(11);
          wrap(`Concept: ${item.concept}`, 18);
          wrap(`Memory Aid: ${item.memoryAid}`, 18);
          y += 6;
        });
      }

      doc.save(`${activeMnemonic.subject}_Mnemonics.pdf`);
    }
  };

  return (
    <Layout>
      {error && (
        <div className="mb-6 p-4 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive flex items-center gap-3 animate-scale-in">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-3 animate-scale-in">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Tab Selector */}
          <div className="glass-card rounded-2xl p-4 border border-border">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 px-2">Study Tools</h3>
            <div className="flex flex-col gap-1">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button key={tab.id} onClick={() => { setActiveTab(tab.id); setError(null); setSuccess(null); }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium transition cursor-pointer ${
                      active ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-foreground/80 hover:bg-muted"
                    }`}>
                    <Icon className="h-5 w-5" /><span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generator Form */}
          {activeTab !== "history" && (
            <div className="glass-card rounded-2xl p-6 border border-border">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" /><span>Setup Workspace</span>
              </h3>
              <form onSubmit={handleGenerate} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Subject / Specific Topic</label>
                  <input type="text" required placeholder="Enter the subject or specific study topic"
                    value={subject} onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Reference Textbook / Syllabus (PDF)</label>
                  <div onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-4 border border-dashed border-border hover:border-primary/50 rounded-xl bg-card/50 cursor-pointer transition text-center">
                    <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                    <span className="text-xs font-medium text-foreground">{file ? file.name : "Upload a PDF file (Max 5MB)"}</span>
                    {file && <span className="text-[10px] text-primary mt-1 font-semibold">PDF Selected</span>}
                  </div>
                  <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground flex justify-between">
                    <span>Or paste your notes (optional)</span>
                    {notesText && <button type="button" onClick={() => setNotesText("")} className="text-[10px] text-destructive hover:underline">Clear</button>}
                  </label>
                  <textarea rows={4} placeholder="Paste textbook text, syllabus details, or study instructions"
                    value={notesText} onChange={(e) => setNotesText(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-xs focus:border-primary/50 focus:ring-1 focus:ring-primary/50 resize-y" />
                </div>

                {activeTab === "study-plan" && (
                  <div className="text-xs text-muted-foreground">
                    A one-week study roadmap will be generated automatically.
                  </div>
                )}


                <button type="submit" disabled={loading}
                  className="btn w-full mt-2 bg-primary text-primary-foreground font-bold hover:shadow-lg shadow-primary/10 transition cursor-pointer flex items-center justify-center gap-2">
                  {loading ? (<><Loader2 className="h-4 w-4 animate-spin" /><span>Generating...</span></>) : <span>Generate</span>}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Column: Workspace */}
        <div className="lg:col-span-8 flex flex-col gap-6 min-h-[450px]">

          {/* STUDY PLAN */}
          {activeTab === "study-plan" && (
            <div className="glass-card rounded-2xl p-6 border border-border h-full flex flex-col">
              {activePlan ? (
                <div>
                  <div className="flex items-center justify-between gap-4 border-b border-border pb-4 mb-6">
                    <div>
                      <h2 className="text-xl font-bold">{activePlan.generatedData.title}</h2>
                      <p className="text-xs text-muted-foreground mt-1">
                        Subject: <span className="text-foreground font-medium">{activePlan.subject}</span> • Timeline: {activePlan.generatedData.timeline}
                      </p>
                    </div>
                    <button onClick={() => exportPDF("study-plan")}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-secondary-foreground text-xs font-bold rounded-lg hover:bg-muted transition cursor-pointer shrink-0">
                      <Download className="h-4 w-4" /><span>Download PDF</span>
                    </button>
                  </div>
                  <div className="flex flex-col gap-6">
                    {activePlan.generatedData.schedule.map((day, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-border bg-card/30">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-black">Day {day.day}</div>
                          <h4 className="text-sm font-extrabold">{day.topic}</h4>
                        </div>
                        <div className="mb-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Focus Areas</span>
                          <ul className="list-disc pl-5 text-xs text-foreground/80 flex flex-col gap-1.5">
                            {day.focusAreas.map((a, i) => <li key={i}>{a}</li>)}
                          </ul>
                        </div>
                        {day.resources?.length > 0 && (
                          <div className="mb-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Reference Pages</span>
                            <ul className="list-disc pl-4 text-xs text-muted-foreground flex flex-col gap-0.5">
                              {day.resources.map((r, ri) => <li key={ri}>{r}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-border rounded-xl bg-card/25">
                  <Calendar className="h-10 w-10 text-muted-foreground/60 mb-3" />
                  <h4 className="text-base font-bold text-foreground">No study plan yet</h4>
                  <p className="text-xs text-muted-foreground max-w-sm mt-1">Fill out the fields on the left and click Generate to build your daily study timeline.</p>
                </div>
              )}
            </div>
          )}

          {/* QUIZ — simplified: just questions, options, answer. Download only. */}
          {activeTab === "quiz" && (
            <div className="glass-card rounded-2xl p-6 border border-border h-full flex flex-col">
              {activeQuiz ? (
                <div>
                  <div className="flex items-center justify-between gap-4 border-b border-border pb-4 mb-6">
                    <div>
                      <h2 className="text-xl font-bold">{activeQuiz.generatedData.title}</h2>
                      <p className="text-xs text-muted-foreground mt-1">
                        Topic: <span className="text-foreground font-medium">{activeQuiz.generatedData.topic}</span> • {activeQuiz.generatedData.questions.length} Questions
                      </p>
                    </div>
                    <button onClick={() => exportPDF("quiz")}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-secondary-foreground text-xs font-bold rounded-lg hover:bg-muted transition cursor-pointer shrink-0">
                      <Download className="h-4 w-4" /><span>Download PDF</span>
                    </button>
                  </div>
                  <div className="flex flex-col gap-6">
                    {activeQuiz.generatedData.questions.map((q, i) => (
                      <div key={q.id || i} className="p-5 rounded-xl border border-border bg-card/40">
                        <h4 className="text-sm font-extrabold mb-3">{i + 1}. {q.question}</h4>
                        <div className="flex flex-col gap-2 mb-3">
                          {q.options.map((opt, oi) => (
                            <div key={oi} className={`px-4 py-2.5 rounded-xl border text-xs ${
                              oi === q.correctAnswerIndex
                                ? "border-primary bg-primary/10 text-primary font-bold"
                                : "border-border bg-card/60"
                            }`}>
                              <span className="font-bold mr-2">{String.fromCharCode(65 + oi)})</span>{opt}
                              {oi === q.correctAnswerIndex && <span className="ml-2 text-[10px] font-black uppercase">✓ Correct</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-border rounded-xl bg-card/25">
                  <HelpCircle className="h-10 w-10 text-muted-foreground/60 mb-3" />
                  <h4 className="text-base font-bold text-foreground">No quiz generated yet</h4>
                  <p className="text-xs text-muted-foreground max-w-sm mt-1">Fill out the fields on the left and click Generate to build a practice quiz.</p>
                </div>
              )}
            </div>
          )}

          {/* MNEMONIC LAB */}
          {activeTab === "mnemonic" && (
            <div className="glass-card rounded-2xl p-6 border border-border h-full flex flex-col">
              {activeMnemonic ? (
                <div>
                              <div className="flex items-center justify-between gap-4 border-b border-border pb-4 mb-6">
                    <div>
                      <h2 className="text-xl font-bold">{activeMnemonic.generatedData.title}</h2>
                      <p className="text-xs text-muted-foreground mt-1">
                        Subject: <span className="text-foreground font-medium">{activeMnemonic.subject}</span>
                      </p>
                    </div>
                    <button onClick={() => exportPDF("mnemonic")}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-secondary-foreground text-xs font-bold rounded-lg hover:bg-muted transition cursor-pointer shrink-0">
                      <Download className="h-4 w-4" /><span>Download PDF</span>
                    </button>
                  </div>

                  <div className="mb-6 flex flex-col gap-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mnemonics & Acronyms</h3>
                    {activeMnemonic.generatedData.mnemonics.map((item, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-start gap-4">
                        <div className="p-2.5 rounded-lg bg-primary text-primary-foreground font-black text-sm shrink-0">{item.mnemonic}</div>
                        <div>
                          <h4 className="text-xs font-bold text-primary">{item.concept}</h4>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.memoryAid}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-border rounded-xl bg-card/25">
                  <Lightbulb className="h-10 w-10 text-muted-foreground/60 mb-3" />
                  <h4 className="text-base font-bold text-foreground">No mnemonics yet</h4>
                  <p className="text-xs text-muted-foreground max-w-sm mt-1">Fill out the fields on the left and click Generate to create mnemonics.</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
}
