import { useState } from "react";
import Sidebar from "./layout/Sidebar";
import DashboardView from "./pages/rh/Dashboard";
import AnalysisView from "./pages/rh/Analysis";
import CandidatesView from "./pages/rh/Candidates";
import InterviewsView from "./pages/rh/Interviews";
import StatisticsView from "./pages/rh/Statistics";
import { styles } from "./styles/styles";
import { getScoreColor, getScoreBadge, getStatusBadge } from "./utils";

function App() {
  // États principaux
  const [activeTab, setActiveTab] = useState("home");
  const [jobText, setJobText] = useState("");
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  // États pour les autres fonctionnalités
  const [candidates, setCandidates] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Handlers
  const handleFiles = (e) => {
    const selected = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selected]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (!jobText || files.length === 0) {
      alert("Veuillez fournir une offre + au moins 1 CV.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("job_description", jobText);
    files.forEach((f) => formData.append("cvs", f));

    try {
      const response = await fetch("http://localhost:8000/api/match/multi", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResults(data);

      // Ajouter les candidats à la liste
      if (data.ranked_candidates) {
        const newCandidates = data.ranked_candidates.map((c, i) => ({
          id: Date.now() + i,
          name: c.candidate_name,
          email: `${c.candidate_name
            .toLowerCase()
            .replace(/\s+/g, ".")}@email.com`,
          phone: "+33 6 XX XX XX XX",
          location: "France",
          status: "pending",
          score: c.scores.global,
          technical: c.scores.technical,
          softSkills: c.scores.soft_skills,
          experience: c.scores.experience,
          appliedDate: new Date().toLocaleDateString("fr-FR"),
          notes: "",
        }));
        setCandidates((prev) => [...prev, ...newCandidates]);
      }
    } catch (err) {
      console.error(err);
      alert("Erreur côté backend.");
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        styles={styles} 
      />

      {/* Main Content */}
      <div style={styles.mainContent}>
        {activeTab === "home" && (
          <DashboardView
            candidates={candidates}
            styles={styles}
            getStatusBadge={getStatusBadge}
            getScoreColor={getScoreColor}
          />
        )}
        
        {activeTab === "analysis" && (
          <AnalysisView
            jobText={jobText}
            setJobText={setJobText}
            files={files}
            handleFiles={handleFiles}
            removeFile={removeFile}
            handleAnalyze={handleAnalyze}
            loading={loading}
            results={results}
            styles={styles}
            getScoreColor={getScoreColor}
          />
        )}
        
        {activeTab === "candidates" && (
          <CandidatesView
            candidates={candidates}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            styles={styles}
            getStatusBadge={getStatusBadge}
            getScoreColor={getScoreColor}
          />
        )}
        
        {activeTab === "interviews" && (
          <InterviewsView styles={styles} />
        )}
        
        {activeTab === "statistics" && (
          <StatisticsView styles={styles} />
        )}
      </div>
    </div>
  );
}

export default App;