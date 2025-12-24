import { useState } from "react";
import {
  Upload,
  Trash2,
  Briefcase,
  Users,
  Award,
  TrendingUp,
  FileText,
} from "lucide-react";

function App() {
  const [jobText, setJobText] = useState("");
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

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

  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(to bottom right, #dbeafe, #e0e7ff, #f3e8ff)",
      padding: "20px",
      display: "flex",
      justifyContent: "center",
    },
    maxWidth: {
      width: "100%",
      maxWidth: "1200px",
    },
    header: {
      textAlign: "center",
      marginBottom: "48px",
    },
    iconContainer: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: "64px",
      height: "64px",
      background: "#4f46e5",
      borderRadius: "16px",
      marginBottom: "16px",
    },
    title: {
      fontSize: "36px",
      fontWeight: "bold",
      color: "#111827",
      marginBottom: "8px",
    },
    subtitle: {
      color: "#6b7280",
      fontSize: "16px",
    },
    card: {
      background: "white",
      borderRadius: "16px",
      boxShadow:
        "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      padding: "32px",
      marginBottom: "32px",
    },
    label: {
      display: "flex",
      alignItems: "center",
      fontSize: "18px",
      fontWeight: "600",
      color: "#1f2937",
      marginBottom: "12px",
    },
    textarea: {
      width: "100%",
      height: "160px",
      padding: "12px 16px",
      border: "2px solid #e5e7eb",
      borderRadius: "12px",
      fontSize: "15px",
      outline: "none",
      resize: "none",
      transition: "all 0.2s",
    },
    uploadZone: {
      border: "2px dashed #d1d5db",
      borderRadius: "12px",
      padding: "32px",
      textAlign: "center",
      cursor: "pointer",
      transition: "all 0.2s",
    },
    uploadIcon: {
      width: "48px",
      height: "48px",
      background: "#e0e7ff",
      borderRadius: "50%",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "12px",
    },
    fileItem: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      background: "#f9fafb",
      padding: "12px 16px",
      borderRadius: "8px",
      marginBottom: "8px",
      transition: "background 0.2s",
    },
    fileIcon: {
      width: "32px",
      height: "32px",
      background: "#e0e7ff",
      borderRadius: "8px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginRight: "12px",
    },
    button: {
      width: "100%",
      padding: "16px",
      background: "linear-gradient(to right, #4f46e5, #7c3aed)",
      color: "white",
      border: "none",
      borderRadius: "12px",
      fontSize: "18px",
      fontWeight: "600",
      cursor: "pointer",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      transition: "all 0.2s",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    buttonDisabled: {
      background: "linear-gradient(to right, #d1d5db, #d1d5db)",
      cursor: "not-allowed",
    },
    statsContainer: {
      display: "inline-flex",
      alignItems: "center",
      gap: "32px",
      background: "linear-gradient(to right, #eef2ff, #faf5ff)",
      padding: "16px 32px",
      borderRadius: "12px",
    },
    statItem: {
      textAlign: "center",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      marginTop: "24px",
    },
    th: {
      textAlign: "left",
      padding: "16px",
      fontWeight: "600",
      color: "#374151",
      borderBottom: "2px solid #e5e7eb",
    },
    td: {
      padding: "16px",
      borderBottom: "1px solid #f3f4f6",
    },
    scoreBadge: {
      padding: "4px 12px",
      borderRadius: "20px",
      fontWeight: "bold",
      fontSize: "14px",
      display: "inline-block",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.maxWidth}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.iconContainer}>
            <Briefcase size={32} color="white" />
          </div>
          <h1 style={styles.title}>AI Hiring Assistantttttttt</h1>
          <p style={styles.subtitle}>
            Analysez et classez vos candidats intelligemment
          </p>
        </div>

        {/* Main Card */}
        <div style={styles.card}>
          {/* Job Description */}
          <div style={{ marginBottom: "32px" }}>
            <label style={styles.label}>
              <FileText
                size={20}
                color="#4f46e5"
                style={{ marginRight: "8px" }}
              />
              Description du poste
            </label>
            <textarea
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
              placeholder="Décrivez en détail le poste, les compétences requises, l'expérience souhaitée..."
              style={styles.textarea}
              onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            />
          </div>

          {/* File Upload */}
          <div style={{ marginBottom: "32px" }}>
            <label style={styles.label}>
              <Upload
                size={20}
                color="#4f46e5"
                style={{ marginRight: "8px" }}
              />
              CV des candidats (PDF)
            </label>
            <div
              style={styles.uploadZone}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "#818cf8")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "#d1d5db")
              }
            >
              <input
                type="file"
                multiple
                accept="application/pdf"
                onChange={handleFiles}
                style={{ display: "none" }}
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                style={{ cursor: "pointer", display: "block" }}
              >
                <div style={styles.uploadIcon}>
                  <Upload size={24} color="#4f46e5" />
                </div>
                <div
                  style={{
                    color: "#374151",
                    fontWeight: "500",
                    marginBottom: "4px",
                  }}
                >
                  Cliquez pour sélectionner des fichiers
                </div>
                <div style={{ color: "#9ca3af", fontSize: "14px" }}>
                  ou glissez-déposez vos CV ici
                </div>
              </label>
            </div>
          </div>

          {/* Selected Files */}
          {files.length > 0 && (
            <div style={{ marginBottom: "32px" }}>
              <h3 style={{ ...styles.label, marginBottom: "12px" }}>
                <Users
                  size={20}
                  color="#4f46e5"
                  style={{ marginRight: "8px" }}
                />
                CV sélectionnés ({files.length})
              </h3>
              <div>
                {files.map((file, index) => (
                  <div
                    key={index}
                    style={styles.fileItem}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f3f4f6")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "#f9fafb")
                    }
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <div style={styles.fileIcon}>
                        <FileText size={16} color="#4f46e5" />
                      </div>
                      <span style={{ color: "#374151", fontWeight: "500" }}>
                        {file.name}
                      </span>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      style={{
                        border: "none",
                        background: "transparent",
                        padding: "8px",
                        cursor: "pointer",
                        borderRadius: "8px",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#fee2e2")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <Trash2 size={16} color="#dc2626" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={loading || !jobText || files.length === 0}
            style={{
              ...styles.button,
              ...(loading || !jobText || files.length === 0
                ? styles.buttonDisabled
                : {}),
            }}
            onMouseEnter={(e) => {
              if (!loading && jobText && files.length > 0) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 20px 25px -5px rgba(0, 0, 0, 0.15)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 10px 15px -3px rgba(0, 0, 0, 0.1)";
            }}
          >
            {loading ? (
              <>
                <svg
                  style={{
                    animation: "spin 1s linear infinite",
                    marginRight: "12px",
                    width: "20px",
                    height: "20px",
                  }}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    style={{ opacity: 0.25 }}
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    style={{ opacity: 0.75 }}
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Analyse en cours...
              </>
            ) : (
              <>
                <TrendingUp size={20} style={{ marginRight: "8px" }} />
                Analyser et Classer les Candidats
              </>
            )}
          </button>
        </div>

        {/* Results */}
        {results && (
          <div style={styles.card}>
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <h2
                style={{
                  fontSize: "30px",
                  fontWeight: "bold",
                  color: "#111827",
                  marginBottom: "16px",
                }}
              >
                📊 Résultats de l'Analyse
              </h2>
              <div style={styles.statsContainer}>
                <div style={styles.statItem}>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#6b7280",
                      marginBottom: "4px",
                    }}
                  >
                    Poste
                  </p>
                  <p
                    style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      color: "#4f46e5",
                    }}
                  >
                    {results.job_title}
                  </p>
                </div>
                <div
                  style={{
                    width: "1px",
                    height: "48px",
                    background: "#d1d5db",
                  }}
                />
                <div style={styles.statItem}>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#6b7280",
                      marginBottom: "4px",
                    }}
                  >
                    Candidats
                  </p>
                  <p
                    style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      color: "#7c3aed",
                    }}
                  >
                    {results.candidate_count}
                  </p>
                </div>
              </div>
            </div>

            {/* Candidates Table */}
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Rang</th>
                    <th style={styles.th}>Candidat</th>
                    <th style={{ ...styles.th, textAlign: "center" }}>
                      Score Global
                    </th>
                    <th style={{ ...styles.th, textAlign: "center" }}>
                      Technique
                    </th>
                    <th style={{ ...styles.th, textAlign: "center" }}>
                      Soft Skills
                    </th>
                    <th style={{ ...styles.th, textAlign: "center" }}>
                      Expérience
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {results.ranked_candidates.map((candidate, index) => (
                    <tr
                      key={index}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#f9fafb")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <td style={styles.td}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          {index === 0 && (
                            <Award
                              size={20}
                              color="#eab308"
                              style={{ marginRight: "8px" }}
                            />
                          )}
                          <span
                            style={{ fontWeight: "bold", color: "#374151" }}
                          >
                            #{index + 1}
                          </span>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span style={{ fontWeight: "600", color: "#1f2937" }}>
                          {candidate.candidate_name}
                        </span>
                      </td>
                      <td style={{ ...styles.td, textAlign: "center" }}>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              ...styles.scoreBadge,
                              ...getScoreColor(candidate.scores.global),
                            }}
                          >
                            {candidate.scores.global}
                          </span>
                          <span
                            style={{
                              fontSize: "12px",
                              color: "#9ca3af",
                              marginTop: "4px",
                            }}
                          >
                            {getScoreBadge(candidate.scores.global)}
                          </span>
                        </div>
                      </td>
                      <td style={{ ...styles.td, textAlign: "center" }}>
                        <span style={{ fontWeight: "600", color: "#374151" }}>
                          {candidate.scores.technical}
                        </span>
                      </td>
                      <td style={{ ...styles.td, textAlign: "center" }}>
                        <span style={{ fontWeight: "600", color: "#374151" }}>
                          {candidate.scores.soft_skills}
                        </span>
                      </td>
                      <td style={{ ...styles.td, textAlign: "center" }}>
                        <span style={{ fontWeight: "600", color: "#374151" }}>
                          {candidate.scores.experience}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default App;
