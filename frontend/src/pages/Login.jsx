import { useAuth } from "../auth/AuthContext";

const Login = () => {
  const { login } = useAuth();

  return (
    <div>
      <button
        onClick={() =>
          login({ id: 1, role: "RH", token: "fake-jwt" })
        }
      >
        Login RH
      </button>

      <button
        onClick={() =>
          login({ id: 2, role: "CANDIDATE", token: "fake-jwt" })
        }
      >
        Login Candidat
      </button>
    </div>
  );
};

export default Login;
