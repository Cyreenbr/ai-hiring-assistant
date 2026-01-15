const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Enregistrement
export const register = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Registration failed");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Connexion
export const login = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Login failed");
    }

    const data = await response.json();
    
    // Stocker le token
    localStorage.setItem("token", data.access_token);
    
    return data;
  } catch (error) {
    throw error;
  }
};

// Déconnexion
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// Récupérer les infos de l'utilisateur connecté
export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem("token");
    
    if (!token) {
      throw new Error("No token found");
    }

    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get user info");
    }

    const user = await response.json();
    localStorage.setItem("user", JSON.stringify(user));
    
    return user;
  } catch (error) {
    logout();
    throw error;
  }
};

// Vérifier si l'utilisateur est connecté
export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

// Récupérer le token
export const getToken = () => {
  return localStorage.getItem("token");
};

// Récupérer l'utilisateur du localStorage
export const getStoredUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};