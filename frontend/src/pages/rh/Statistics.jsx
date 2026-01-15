import { BarChart3 } from "lucide-react";

const Statistics = ({ styles }) => {
  return (
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
};

export default Statistics;