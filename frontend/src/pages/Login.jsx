import { useState } from "react";
import { Mail, Lock, Briefcase, Eye, EyeOff } from "lucide-react";
import { login } from "../services/authService";

const Login = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(formData);
      onLoginSuccess();
    } catch (err) {
      setError(err.message || "Échec de la connexion");
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
    },
    card: {
      background: "white",
      borderRadius: "20px",
      boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
      padding: "40px",
      width: "100%",
      maxWidth: "450px",
    },
    logo: {
      width: "60px",
      height: "60px",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 20px",
    },
    title: {
      fontSize: "28px",
      fontWeight: "bold",
      color: "#1f2937",
      textAlign: "center",
      marginBottom: "8px",
    },
    subtitle: {
      color: "#6b7280",
      textAlign: "center",
      marginBottom: "32px",
    },
    inputGroup: {
      marginBottom: "20px",
      position: "relative",
    },
    label: {
      display: "block",
      fontSize: "14px",
      fontWeight: "600",
      color: "#374151",
      marginBottom: "8px",
    },
    input: {
      width: "100%",
      padding: "12px 16px 12px 44px",
      border: "2px solid #e5e7eb",
      borderRadius: "10px",
      fontSize: "15px",
      outline: "none",
      transition: "all 0.2s",
      boxSizing: "border-box",
    },
    icon: {
      position: "absolute",
      left: "14px",
      top: "38px",
      color: "#9ca3af",
    },
    eyeIcon: {
      position: "absolute",
      right: "14px",
      top: "38px",
      cursor: "pointer",
      color: "#9ca3af",
    },
    button: {
      width: "100%",
      padding: "14px",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      border: "none",
      borderRadius: "10px",
      fontSize: "16px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.2s",
      marginTop: "24px",
    },
    error: {
      background: "#fee2e2",
      color: "#dc2626",
      padding: "12px",
      borderRadius: "8px",
      fontSize: "14px",
      marginBottom: "16px",
      textAlign: "center",
    },
    footer: {
      textAlign: "center",
      marginTop: "24px",
      color: "#6b7280",
    },
    link: {
      color: "#667eea",
      fontWeight: "600",
      cursor: "pointer",
      textDecoration: "none",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <Briefcase size={32} color="white" />
        </div>
        <h1 style={styles.title}>Connexion</h1>
        <p style={styles.subtitle}>
          Accédez à votre plateforme de recrutement
        </p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <Mail size={20} style={styles.icon} />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="votre@email.com"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Mot de passe</label>
            <Lock size={20} style={styles.icon} />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              style={styles.input}
              required
            />
            <div
              onClick={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <div style={styles.footer}>
          <p>
            Pas encore de compte ?{" "}
            <span onClick={onSwitchToRegister} style={styles.link}>
              S'inscrire
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;