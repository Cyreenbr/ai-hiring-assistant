import { useState } from "react";
import {
  Upload,
  Trash2,
  Briefcase,
  Users,
  Award,
  TrendingUp,
  FileText,
  Calendar,
  Mail,
  MessageSquare,
  BarChart3,
  Settings,
  Home,
  UserPlus,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Download,
  Eye,
  Phone,
  MapPin,
  Linkedin,
  Star,
} from "lucide-react";

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

  const getScoreColor = (score) => {
    if (score >= 80) return { color: "#059669", background: "#ecfdf5" };
    if (score >= 60) return { color: "#2563eb", background: "#eff6ff" };
    if (score >= 40) return { color: "#d97706", background: "#fefce8" };
    return { color: "#dc2626", background: "#fef2f2" };
  };

  const getScoreBadge = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Bon";
    if (score >= 40) return "Moyen";
    return "Faible";
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: "En attente", color: "#f59e0b", bg: "#fef3c7" },
      shortlisted: { label: "Présélectionné", color: "#3b82f6", bg: "#dbeafe" },
      interview: { label: "Entretien", color: "#8b5cf6", bg: "#ede9fe" },
      accepted: { label: "Accepté", color: "#10b981", bg: "#d1fae5" },
      rejected: { label: "Rejeté", color: "#ef4444", bg: "#fee2e2" },
    };
    return statusConfig[status] || statusConfig.pending;
  };

  // Filtrage des candidats
  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || c.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(to bottom right, #dbeafe, #e0e7ff, #f3e8ff)",
      display: "flex",
    },
    sidebar: {
      width: "280px",
      background: "linear-gradient(to bottom, #1e293b, #334155)",
      padding: "24px",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },
    sidebarButton: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "12px 16px",
      background: "transparent",
      border: "none",
      borderRadius: "8px",
      color: "#cbd5e1",
      cursor: "pointer",
      fontSize: "15px",
      fontWeight: "500",
      transition: "all 0.2s",
      textAlign: "left",
    },
    sidebarButtonActive: {
      background: "rgba(99, 102, 241, 0.2)",
      color: "#a5b4fc",
    },
    mainContent: {
      flex: 1,
      padding: "32px",
      overflowY: "auto",
    },
    header: {
      marginBottom: "32px",
    },
    headerTitle: {
      fontSize: "32px",
      fontWeight: "bold",
      color: "#111827",
      marginBottom: "8px",
    },
    headerSubtitle: {
      color: "#6b7280",
      fontSize: "16px",
    },
    card: {
      background: "white",
      borderRadius: "16px",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      padding: "24px",
      marginBottom: "24px",
    },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "20px",
      marginBottom: "32px",
    },
    statCard: {
      background: "white",
      padding: "20px",
      borderRadius: "12px",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    },
    button: {
      padding: "12px 24px",
      background: "linear-gradient(to right, #4f46e5, #7c3aed)",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontSize: "15px",
      fontWeight: "600",
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      transition: "all 0.2s",
    },
    input: {
      width: "100%",
      padding: "10px 14px",
      border: "2px solid #e5e7eb",
      borderRadius: "8px",
      fontSize: "15px",
      outline: "none",
      transition: "all 0.2s",
    },
    textarea: {
      width: "100%",
      height: "120px",
      padding: "12px 16px",
      border: "2px solid #e5e7eb",
      borderRadius: "12px",
      fontSize: "15px",
      outline: "none",
      resize: "none",
      transition: "all 0.2s",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
    },
    th: {
      textAlign: "left",
      padding: "12px 16px",
      fontWeight: "600",
      color: "#374151",
      borderBottom: "2px solid #e5e7eb",
      fontSize: "14px",
    },
    td: {
      padding: "12px 16px",
      borderBottom: "1px solid #f3f4f6",
    },
  };

  // Composant Dashboard
  const DashboardView = () => (
    <div>
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>📊 Tableau de Bord</h1>
        <p style={styles.headerSubtitle}>
          Vue d'ensemble de votre processus de recrutement
        </p>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                padding: "10px",
                background: "#dbeafe",
                borderRadius: "8px",
              }}
            >
              <Users size={24} color="#2563eb" />
            </div>
            <div>
              <p style={{ fontSize: "12px", color: "#6b7280" }}>
                Total Candidats
              </p>
              <p
                style={{
                  fontSize: "28px",
                  fontWeight: "bold",
                  color: "#1f2937",
                }}
              >
                {candidates.length}
              </p>
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                padding: "10px",
                background: "#fef3c7",
                borderRadius: "8px",
              }}
            >
              <Clock size={24} color="#f59e0b" />
            </div>
            <div>
              <p style={{ fontSize: "12px", color: "#6b7280" }}>En attente</p>
              <p
                style={{
                  fontSize: "28px",
                  fontWeight: "bold",
                  color: "#1f2937",
                }}
              >
                {candidates.filter((c) => c.status === "pending").length}
              </p>
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                padding: "10px",
                background: "#ede9fe",
                borderRadius: "8px",
              }}
            >
              <Calendar size={24} color="#8b5cf6" />
            </div>
            <div>
              <p style={{ fontSize: "12px", color: "#6b7280" }}>Entretiens</p>
              <p
                style={{
                  fontSize: "28px",
                  fontWeight: "bold",
                  color: "#1f2937",
                }}
              >
                {candidates.filter((c) => c.status === "interview").length}
              </p>
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                padding: "10px",
                background: "#d1fae5",
                borderRadius: "8px",
              }}
            >
              <CheckCircle size={24} color="#10b981" />
            </div>
            <div>
              <p style={{ fontSize: "12px", color: "#6b7280" }}>Acceptés</p>
              <p
                style={{
                  fontSize: "28px",
                  fontWeight: "bold",
                  color: "#1f2937",
                }}
              >
                {candidates.filter((c) => c.status === "accepted").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <h3
          style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}
        >
          🎯 Candidats Récents
        </h3>
        {candidates.length === 0 ? (
          <p style={{ color: "#6b7280", textAlign: "center", padding: "40px" }}>
            Aucun candidat pour le moment. Commencez par analyser des CV !
          </p>
        ) : (
          <div>
            {candidates.slice(0, 5).map((candidate) => {
              const status = getStatusBadge(candidate.status);
              return (
                <div
                  key={candidate.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px",
                    borderBottom: "1px solid #f3f4f6",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: "bold",
                      }}
                    >
                      {candidate.name.charAt(0)}
                    </div>
                    <div>
                      <p style={{ fontWeight: "600", color: "#1f2937" }}>
                        {candidate.name}
                      </p>
                      <p style={{ fontSize: "14px", color: "#6b7280" }}>
                        {candidate.email}
                      </p>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: "12px",
                        fontSize: "13px",
                        fontWeight: "600",
                        color: status.color,
                        background: status.bg,
                      }}
                    >
                      {status.label}
                    </span>
                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: "12px",
                        fontSize: "13px",
                        fontWeight: "bold",
                        ...getScoreColor(candidate.score),
                      }}
                    >
                      {candidate.score}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  // Composant Analyse CV (existant)
  const AnalysisView = () => (
    <div>
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>🔍 Analyse de CV</h1>
        <p style={styles.headerSubtitle}>
          Analysez et classez vos candidats intelligemment
        </p>
      </div>

      <div style={styles.card}>
        <div style={{ marginBottom: "24px" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "16px",
              fontWeight: "600",
              marginBottom: "8px",
            }}
          >
            <FileText size={18} color="#4f46e5" />
            Description du poste
          </label>
          <textarea
            value={jobText}
            onChange={(e) => setJobText(e.target.value)}
            placeholder="Décrivez en détail le poste, les compétences requises, l'expérience souhaitée..."
            style={styles.textarea}
          />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "16px",
              fontWeight: "600",
              marginBottom: "8px",
            }}
          >
            <Upload size={18} color="#4f46e5" />
            CV des candidats (PDF)
          </label>
          <div
            style={{
              border: "2px dashed #d1d5db",
              borderRadius: "12px",
              padding: "32px",
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            <input
              type="file"
              multiple
              accept="application/pdf"
              onChange={handleFiles}
              style={{ display: "none" }}
              id="file-upload"
            />
            <label htmlFor="file-upload" style={{ cursor: "pointer" }}>
              <Upload size={32} color="#6366f1" />
              <p style={{ marginTop: "12px", fontWeight: "500" }}>
                Cliquez pour sélectionner des fichiers
              </p>
            </label>
          </div>
        </div>

        {files.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "600",
                marginBottom: "12px",
              }}
            >
              CV sélectionnés ({files.length})
            </h3>
            {files.map((file, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px",
                  background: "#f9fafb",
                  borderRadius: "8px",
                  marginBottom: "8px",
                }}
              >
                <span>{file.name}</span>
                <button
                  onClick={() => removeFile(index)}
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                  }}
                >
                  <Trash2 size={16} color="#dc2626" />
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={loading || !jobText || files.length === 0}
          style={{
            ...styles.button,
            width: "100%",
            justifyContent: "center",
            opacity: loading || !jobText || files.length === 0 ? 0.5 : 1,
          }}
        >
          {loading ? "Analyse en cours..." : "Analyser les Candidats"}
        </button>
      </div>

      {results && (
        <div style={styles.card}>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              marginBottom: "24px",
            }}
          >
            📊 Résultats de l'Analyse
          </h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Rang</th>
                <th style={styles.th}>Candidat</th>
                <th style={styles.th}>Score Global</th>
                <th style={styles.th}>Technique</th>
                <th style={styles.th}>Soft Skills</th>
                <th style={styles.th}>Expérience</th>
              </tr>
            </thead>
            <tbody>
              {results.ranked_candidates.map((candidate, index) => (
                <tr key={index}>
                  <td style={styles.td}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {index === 0 && <Award size={18} color="#eab308" />}
                      <span style={{ fontWeight: "bold" }}>#{index + 1}</span>
                    </div>
                  </td>
                  <td style={styles.td}>{candidate.candidate_name}</td>
                  <td style={styles.td}>
                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: "12px",
                        fontWeight: "bold",
                        ...getScoreColor(candidate.scores.global),
                      }}
                    >
                      {candidate.scores.global}
                    </span>
                  </td>
                  <td style={styles.td}>{candidate.scores.technical}</td>
                  <td style={styles.td}>{candidate.scores.soft_skills}</td>
                  <td style={styles.td}>{candidate.scores.experience}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // Composant Gestion Candidats
  const CandidatesView = () => (
    <div>
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>👥 Gestion des Candidats</h1>
        <p style={styles.headerSubtitle}>Gérez et suivez tous vos candidats</p>
      </div>

      <div style={{ ...styles.card, marginBottom: "24px" }}>
        <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Search
              size={20}
              color="#9ca3af"
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
            <input
              type="text"
              placeholder="Rechercher un candidat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ ...styles.input, paddingLeft: "40px" }}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ ...styles.input, width: "200px" }}
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="shortlisted">Présélectionné</option>
            <option value="interview">Entretien</option>
            <option value="accepted">Accepté</option>
            <option value="rejected">Rejeté</option>
          </select>
        </div>
      </div>

      <div style={styles.card}>
        {filteredCandidates.length === 0 ? (
          <p style={{ textAlign: "center", color: "#6b7280", padding: "40px" }}>
            Aucun candidat trouvé
          </p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Candidat</th>
                <th style={styles.th}>Contact</th>
                <th style={styles.th}>Score</th>
                <th style={styles.th}>Statut</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.map((candidate) => {
                const status = getStatusBadge(candidate.status);
                return (
                  <tr key={candidate.id}>
                    <td style={styles.td}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background:
                              "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: "bold",
                            fontSize: "14px",
                          }}
                        >
                          {candidate.name.charAt(0)}
                        </div>
                        <div>
                          <p style={{ fontWeight: "600", color: "#1f2937" }}>
                            {candidate.name}
                          </p>
                          <p style={{ fontSize: "13px", color: "#6b7280" }}>
                            {candidate.location}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "13px",
                          }}
                        >
                          <Mail size={14} color="#6b7280" />
                          <span style={{ color: "#4b5563" }}>
                            {candidate.email}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "13px",
                          }}
                        >
                          <Phone size={14} color="#6b7280" />
                          <span style={{ color: "#4b5563" }}>
                            {candidate.phone}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          padding: "4px 12px",
                          borderRadius: "12px",
                          fontWeight: "bold",
                          fontSize: "14px",
                          ...getScoreColor(candidate.score),
                        }}
                      >
                        {candidate.score}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          padding: "6px 12px",
                          borderRadius: "12px",
                          fontSize: "13px",
                          fontWeight: "600",
                          color: status.color,
                          background: status.bg,
                        }}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ fontSize: "14px", color: "#6b7280" }}>
                        {candidate.appliedDate}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          style={{
                            padding: "6px 12px",
                            border: "1px solid #e5e7eb",
                            background: "white",
                            borderRadius: "6px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Eye size={14} />
                          <span style={{ fontSize: "13px" }}>Voir</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  // Composant Entretiens
  const InterviewsView = () => (
    <div>
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>📅 Entretiens</h1>
        <p style={styles.headerSubtitle}>Planifiez et gérez vos entretiens</p>
      </div>

      <div style={styles.card}>
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "#6b7280",
          }}
        >
          <Calendar
            size={64}
            color="#d1d5db"
            style={{ margin: "0 auto 16px" }}
          />
          <h3
            style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "8px",
            }}
          >
            Fonctionnalité à venir
          </h3>
          <p>
            Le système de planification d'entretiens sera disponible
            prochainement.
          </p>
        </div>
      </div>
    </div>
  );

  // Composant Statistiques
  const StatisticsView = () => (
    <div>
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>📈 Statistiques</h1>
        <p style={styles.headerSubtitle}>
          Analysez vos performances de recrutement
        </p>
      </div>

      <div style={styles.card}>
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "#6b7280",
          }}
        >
          <BarChart3
            size={64}
            color="#d1d5db"
            style={{ margin: "0 auto 16px" }}
          />
          <h3
            style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "8px",
            }}
          >
            Fonctionnalité à venir
          </h3>
          <p>Les statistiques détaillées seront disponibles prochainement.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={{ marginBottom: "32px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              background: "#6366f1",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "12px",
            }}
          >
            <Briefcase size={24} color="white" />
          </div>
          <h2 style={{ color: "white", fontSize: "20px", fontWeight: "bold" }}>
            AI Recruiter
          </h2>
        </div>

        <button
          onClick={() => setActiveTab("home")}
          style={{
            ...styles.sidebarButton,
            ...(activeTab === "home" ? styles.sidebarButtonActive : {}),
          }}
        >
          <Home size={20} />
          Tableau de bord
        </button>

        <button
          onClick={() => setActiveTab("analysis")}
          style={{
            ...styles.sidebarButton,
            ...(activeTab === "analysis" ? styles.sidebarButtonActive : {}),
          }}
        >
          <TrendingUp size={20} />
          Analyse CV
        </button>

        <button
          onClick={() => setActiveTab("candidates")}
          style={{
            ...styles.sidebarButton,
            ...(activeTab === "candidates" ? styles.sidebarButtonActive : {}),
          }}
        >
          <Users size={20} />
          Candidats
        </button>

        <button
          onClick={() => setActiveTab("interviews")}
          style={{
            ...styles.sidebarButton,
            ...(activeTab === "interviews" ? styles.sidebarButtonActive : {}),
          }}
        >
          <Calendar size={20} />
          Entretiens
        </button>

        <button
          onClick={() => setActiveTab("statistics")}
          style={{
            ...styles.sidebarButton,
            ...(activeTab === "statistics" ? styles.sidebarButtonActive : {}),
          }}
        >
          <BarChart3 size={20} />
          Statistiques
        </button>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {activeTab === "home" && <DashboardView />}
        {activeTab === "analysis" && <AnalysisView />}
        {activeTab === "candidates" && <CandidatesView />}
        {activeTab === "interviews" && <InterviewsView />}
        {activeTab === "statistics" && <StatisticsView />}
      </div>
    </div>
  );
}

export default App;
