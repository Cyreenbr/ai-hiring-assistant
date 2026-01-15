import { useState, useEffect } from "react";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import Sidebar from "./Sidebar";
import DashboardView from "./DashboardView";
import AnalysisView from "./AnalysisView";
import CandidatesView from "./CandidatesView";
import InterviewsView from "./InterviewsView";
import StatisticsView from "./StatisticsView";
import { styles } from "./styles";
import { getScoreColor, getScoreBadge, getStatusBadge } from "./utils";
import {
  isAuthenticated,
  getCurrentUser,
  logout as authLogout,
} from "./services/authService";

function App() {
  // États d'authentification
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [authView, setAuthView] = useState("login");
  const [checkingAuth, setCheckingAuth] = useState(true);

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

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated()) {
        try {
          const userData = await getCurrentUser();
          setUser(userData);
          setIsAuth(true);
        } catch (error) {
          console.error("Auth check failed:", error);
          setIsAuth(false);
        }
      }
      setCheckingAuth(false);
    };

    checkAuth();
  }, []);

  // Handlers d'authentification
  const handleLoginSuccess = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
      setIsAuth(true);
    } catch (error) {
      console.error("Failed to get user:", error);
    }
  };

  const handleRegisterSuccess = () => {
    setAuthView("login");
  };

  const handleLogout = () => {
    authLogout();
    setIsAuth(false);
    setUser(null);
    setActiveTab("home");
  };

  // Handlers existants
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

  // Affichage pendant la vérification de l'auth
  if (checkingAuth) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(to bottom right, #dbeafe, #e0e7ff, #f3e8ff)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              border: "4px solid #e5e7eb",
              borderTopColor: "#6366f1",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p style={{ color: "#6b7280" }}>Chargement...</p>
        </div>
      </div>
    );
  }

  // Affichage de l'authentification
  if (!isAuth) {
    if (authView === "login") {
      return (
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onSwitchToRegister={() => setAuthView("register")}
        />
      );
    } else {
      return (
        <RegisterPage
          onRegisterSuccess={handleRegisterSuccess}
          onSwitchToLogin={() => setAuthView("login")}
        />
      );
    }
  }

  // Application principale (après authentification)
  return (
    <div style={styles.container}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        styles={styles}
        user={user}
        onLogout={handleLogout}
      />

      <div style={styles.mainContent}>
        {activeTab === "home" && (
          <DashboardView
            candidates={candidates}
            styles={styles}
            getStatusBadge={getStatusBadge}
            getScoreColor={getScoreColor}
            user={user}
          />
        )}

        {activeTab === "analysis" && user?.role === "hr" && (
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

        {activeTab === "interviews" && <InterviewsView styles={styles} />}

        {activeTab === "statistics" && <StatisticsView styles={styles} />}
      </div>
    </div>
  );
}

export default App;