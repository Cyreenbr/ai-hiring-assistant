import { Search, Mail, Phone, Eye } from "lucide-react";

const Candidates = ({
  candidates,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  styles,
  getStatusBadge,
  getScoreColor,
}) => {
  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || c.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
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
};

export default Candidates;