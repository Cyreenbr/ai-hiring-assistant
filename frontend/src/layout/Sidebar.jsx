import {
  Briefcase,
  Home,
  TrendingUp,
  Users,
  Calendar,
  BarChart3,
  LogOut,
  User,
} from "lucide-react";

const Sidebar = ({ activeTab, setActiveTab, styles, user, onLogout }) => {
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

      {/* Info utilisateur */}
      {user && (
        <div
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "bold",
              }}
            >
              {user.full_name?.charAt(0) || "U"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  color: "white",
                  fontWeight: "600",
                  fontSize: "14px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user.full_name}
              </p>
              <p
                style={{
                  color: "#cbd5e1",
                  fontSize: "12px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user.email}
              </p>
            </div>
          </div>
          <div
            style={{
              display: "inline-block",
              padding: "4px 10px",
              background:
                user.role === "hr"
                  ? "rgba(99, 102, 241, 0.3)"
                  : "rgba(139, 92, 246, 0.3)",
              borderRadius: "6px",
              fontSize: "11px",
              fontWeight: "600",
              color: "white",
              textTransform: "uppercase",
            }}
          >
            {user.role === "hr" ? "Recruteur" : "Candidat"}
          </div>
        </div>
      )}

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

      {/* Afficher "Analyse CV" uniquement pour les RH */}
      {user?.role === "hr" && (
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
      )}

      <button
        onClick={() => setActiveTab("candidates")}
        style={{
          ...styles.sidebarButton,
          ...(activeTab === "candidates" ? styles.sidebarButtonActive : {}),
        }}
      >
        <Users size={20} />
        {user?.role === "hr" ? "Candidats" : "Mes candidatures"}
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

      {/* Bouton de déconnexion */}
      <div style={{ marginTop: "auto", paddingTop: "24px" }}>
        <button
          onClick={onLogout}
          style={{
            ...styles.sidebarButton,
            background: "rgba(239, 68, 68, 0.1)",
            color: "#fca5a5",
          }}
        >
          <LogOut size={20} />
          Déconnexion
        </button>
      </div>
    </div>
  );
};

export default Sidebar;