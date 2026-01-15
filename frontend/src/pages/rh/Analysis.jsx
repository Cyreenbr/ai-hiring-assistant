import { Upload, Trash2, FileText, Award } from "lucide-react";

const Analysis = ({
  jobText,
  setJobText,
  files,
  handleFiles,
  removeFile,
  handleAnalyze,
  loading,
  results,
  styles,
  getScoreColor,
}) => {
  return (
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
};

export default Analysis;