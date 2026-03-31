import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../RegisterPage.css";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/register", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      if (res.ok) {
        setIsError(false);
        setMessage("Conta criada com sucesso. A redirecionar...");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        const msg = await res.text();
        setIsError(true);
        setMessage(msg || "Erro no registo");
      }
    } catch {
      setIsError(true);
      setMessage("Erro de conexão com o servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-brand">
          <div className="register-brand-ticker">NOVA CONTA</div>
          <div className="register-brand-name">
            Spring<span>Expenses</span>
          </div>
        </div>

        <div className="register-card">
          <div className="register-card-corner register-card-corner--bl" />

          {message && (
            <div
              className={`register-message ${
                isError ? "register-message--error" : "register-message--success"
              }`}
            >
              {isError ? "⚠ " : "✓ "}
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="register-form-group">
              <label className="register-label">Nome</label>
              <input
                className="register-input"
                type="text"
                placeholder="O teu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="register-form-group">
              <label className="register-label">Email</label>
              <input
                className="register-input"
                type="email"
                placeholder="utilizador@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="register-form-group">
              <label className="register-label">Password</label>
              <input
                className="register-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button className="register-btn" type="submit" disabled={loading}>
              {loading ? "A criar conta..." : "Criar Conta"}
            </button>
          </form>

          <div className="register-footer">
            Já tens conta?{" "}
            <Link to="/login">Fazer login</Link>
          </div>
        </div>

        <div className="register-status-bar">
          <span>SSL ENCRIPTADO</span>
          <span>DADOS SEGUROS</span>
        </div>
      </div>
    </div>
  );
}