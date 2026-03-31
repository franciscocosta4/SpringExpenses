import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../LoginPage.css";

export default function LoginPage({ setAuth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        setAuth(true);
        navigate("/dashboard");
      } else {
        const msg = await res.text();
        setError(msg || "Credenciais inválidas");
      }
    } catch {
      setError("Erro de conexão com o servidor");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (d) =>
    d.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-brand">
          <div className="login-brand-ticker">SISTEMA FINANCEIRO</div>
          <div className="login-brand-name">
            Spring<span>Expenses</span>
          </div>
        </div>

        <div className="login-card">
          <div className="login-card-corner login-card-corner--br" />

          {error && <div className="login-error">⚠ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="login-form-group">
              <label className="login-label">Email</label>
              <input
                className="login-input"
                type="email"
                placeholder="utilizador@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="login-form-group">
              <label className="login-label">Password</label>
              <input
                className="login-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? "A autenticar..." : "Entrar"}
            </button>
          </form>

          <div className="login-footer">
            Sem conta?{" "}
            <Link to="/register">Registar aqui</Link>
          </div>
        </div>

        <div className="login-status-bar">
          <span>
            <span className="login-status-dot" />
            SISTEMA ONLINE
          </span>
          <span>{formatTime(time)}</span>
        </div>
      </div>
    </div>
  );
}