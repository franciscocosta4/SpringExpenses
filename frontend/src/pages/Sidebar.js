import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Sidebar({ setAuth }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8080/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {}
    setAuth(false);
    navigate("/login");
  };

  const navItems = [
    { path: "/dashboard", icon: "◈", label: "Dashboard" },
    { path: "/expenses", icon: "↓", label: "Despesas" },
    { path: "/incomes", icon: "↑", label: "Receitas" },
  ];

  const formatTime = (d) =>
    d.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const formatDate = (d) =>
    d.toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-ticker">FINTRACK</div>
        <div className="sidebar-logo-name">
          Spring<span>Exp</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-nav-section">
          <div className="sidebar-nav-section-label">Navegação</div>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-nav-item ${location.pathname === item.path ? "active" : ""}`}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-time">{formatTime(time)}</div>
        <button className="sidebar-logout" onClick={handleLogout}>
          <span>⏻</span>
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}