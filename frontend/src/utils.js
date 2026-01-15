export const getScoreColor = (score) => {
  if (score >= 80) return { color: "#059669", background: "#ecfdf5" };
  if (score >= 60) return { color: "#2563eb", background: "#eff6ff" };
  if (score >= 40) return { color: "#d97706", background: "#fefce8" };
  return { color: "#dc2626", background: "#fef2f2" };
};

export const getScoreBadge = (score) => {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Bon";
  if (score >= 40) return "Moyen";
  return "Faible";
};

export const getStatusBadge = (status) => {
  const statusConfig = {
    pending: { label: "En attente", color: "#f59e0b", bg: "#fef3c7" },
    shortlisted: { label: "Présélectionné", color: "#3b82f6", bg: "#dbeafe" },
    interview: { label: "Entretien", color: "#8b5cf6", bg: "#ede9fe" },
    accepted: { label: "Accepté", color: "#10b981", bg: "#d1fae5" },
    rejected: { label: "Rejeté", color: "#ef4444", bg: "#fee2e2" },
  };
  return statusConfig[status] || statusConfig.pending;
};