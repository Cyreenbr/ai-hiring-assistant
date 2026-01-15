import { Users, Clock, Calendar, CheckCircle } from "lucide-react";

const Dashboard = ({ candidates, styles, getStatusBadge, getScoreColor }) => {
  return (
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
};

export default Dashboard;