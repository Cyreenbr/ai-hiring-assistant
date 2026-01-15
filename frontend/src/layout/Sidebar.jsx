import {
  Briefcase,
  Home,
  TrendingUp,
  Users,
  Calendar,
  BarChart3,
} from "lucide-react";

const Sidebar = ({ activeTab, setActiveTab, styles }) => {
  return (
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
  );
};

export default Sidebar;