import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "./Sidebar";
import "../DashboardPage.css";

const API = "http://localhost:8080";

function StatCard({ label, value, sub, badge, variant = "green" }) {
  return (
    <div className={`stat-card stat-card--${variant}`}>
      {badge && (
        <span
          className={`stat-card-badge ${
            badge.startsWith("+")
              ? "stat-card-badge--up"
              : badge.startsWith("!")
                ? "stat-card-badge--warn"
                : "stat-card-badge--down"
          }`}
        >
          {badge}
        </span>
      )}
      <div className="stat-card-label">{label}</div>
      <div className="stat-card-value">{value ?? "—"}</div>
      {sub && <div className="stat-card-sub">{sub}</div>}
    </div>
  );
}

function formatEur(n) {
  if (n == null) return "—";
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(n);
}

function formatDate(str) {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "short",
  });
}

export default function DashboardPage({ setAuth }) {
  const [data, setData] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const headers = { Accept: "application/json" };
    const opts = { credentials: "include", headers };

    Promise.all([
      fetch(`${API}/dashboard`, opts), // ← dados agregados (totais, médias, etc.)
      fetch(`${API}/expenses`, opts), // ← lista de despesas
      fetch(`${API}/incomes`, opts), // ← lista de receitas
    ])
      .then(async ([dashRes, expRes, incRes]) => {
        // Se o dashboard falhar → erro de autenticação
        if (!dashRes.ok) throw new Error("Sessão expirada ou acesso negado");

        // ↓ Aqui estás a converter a resposta JSON da API
        const dash = await dashRes.json().catch(() => ({}));  
        const exp = expRes.ok ? await expRes.json().catch(() => []) : [];
        const inc = incRes.ok ? await incRes.json().catch(() => []) : [];

        // ↓ Guardas os dados vindos da API no estado
        setData(dash); // ← vem diretamente da API /dashboard
        setExpenses(exp); // ← vem da API /expenses
        setIncomes(inc); // ← vem da API /incomes
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const totalExpenses = data?.totalExpenses ?? data?.total_expenses ?? null;
  const totalIncome = data?.totalIncome ?? data?.total_income ?? null;
  const balance =
    data?.balance ??
    (totalIncome != null && totalExpenses != null
      ? totalIncome - totalExpenses
      : null);
  const avgExpenses = data?.avgExpenses ?? data?.avg_expenses ?? null;
  const isOverspending = data?.overspending ?? data?.isOverspending ?? false;
  const currentMonthExp = data?.currentMonthExpenses ?? null;

  const recentExpenses = expenses.slice(0, 6);
  const recentIncomes = incomes.slice(0, 6);

  const formatTime = (d) =>
    d.toLocaleTimeString("pt-PT", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  const formatFullDate = (d) =>
    d.toLocaleDateString("pt-PT", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="dashboard-layout">
      <Sidebar setAuth={setAuth} />

      <main className="dashboard-main">
        {/* Top Bar */}
        <div className="topbar">
          <div className="topbar-breadcrumb">
            SPRING<span>EXPENSES</span> / DASHBOARD
          </div>
          <div className="topbar-right">
            <div className="topbar-live-badge">
              <span className="topbar-live-dot" />
              LIVE
            </div>
            <div className="topbar-date">
              {formatTime(time)} · {formatFullDate(time)}
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          {/* Error */}
          {error && (
            <div className="alert-overspend">
              <span className="alert-overspend-icon">⚠</span>
              <div className="alert-overspend-text">
                <div className="alert-overspend-title">Erro de Ligação</div>
                <div className="alert-overspend-desc">{error}</div>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="stats-grid">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="stat-card">
                  <div
                    className="skeleton"
                    style={{ height: 10, width: "60%", marginBottom: 12 }}
                  />
                  <div
                    className="skeleton"
                    style={{ height: 28, width: "80%", marginBottom: 8 }}
                  />
                  <div
                    className="skeleton"
                    style={{ height: 8, width: "40%" }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Stats */}
          {!loading && !error && (
            <>
              <div>
                <div className="section-header">
                  <div className="section-title">Resumo — Últimos 30 dias</div>
                </div>
                <div className="stats-grid">
                  <StatCard
                    label="Receita Total"
                    value={formatEur(totalIncome)}
                    sub="30 dias"
                    badge="+REC"
                    variant="green"
                  />
                  <StatCard
                    label="Despesas Totais"
                    value={formatEur(totalExpenses)}
                    sub="30 dias"
                    badge="-EXP"
                    variant="red"
                  />
                  <StatCard
                    label="Saldo"
                    value={formatEur(balance)}
                    sub="receita - despesas"
                    badge={balance >= 0 ? "+OK" : "!NEG"}
                    variant={balance >= 0 ? "green" : "red"}
                  />
                  <StatCard
                    label="Média Despesas"
                    value={formatEur(avgExpenses)}
                    sub="últimos 90 dias"
                    badge="~AVG"
                    variant="amber"
                  />
                </div>
              </div>

              {/* Overspending Alert */}
              {isOverspending ? (
                <div className="alert-overspend">
                  <span className="alert-overspend-icon">⚠</span>
                  <div className="alert-overspend-text">
                    <div className="alert-overspend-title">
                      Alerta: Gastos Acima da Média
                    </div>
                    <div className="alert-overspend-desc">
                      Este mês gastaste {formatEur(currentMonthExp)} — acima da
                      média de {formatEur(avgExpenses)} / 90 dias. Revê as tuas
                      despesas.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="alert-ok">
                  <span className="alert-overspend-icon">✓</span>
                  <div className="alert-overspend-text">
                    <div className="alert-ok-title">Gastos Dentro da Média</div>
                    <div className="alert-ok-desc">
                      Os teus gastos estão dentro dos limites históricos.
                      {avgExpenses
                        ? ` Média 90 dias: ${formatEur(avgExpenses)}.`
                        : ""}
                    </div>
                  </div>
                </div>
              )}

              {/* Avg bar */}
              {avgExpenses && totalExpenses && (
                <div className="table-panel">
                  <div className="table-panel-header">
                    <span className="table-panel-title">Consumo vs Média</span>
                  </div>
                  <div className="avg-bar-container">
                    <div className="avg-bar-label">
                      <span>
                        Este mês: {formatEur(currentMonthExp ?? totalExpenses)}
                      </span>
                      <span>Média 90d: {formatEur(avgExpenses)}</span>
                    </div>
                    <div className="avg-bar-track">
                      <div
                        className={`avg-bar-fill ${isOverspending ? "avg-bar-fill--over" : ""}`}
                        style={{
                          width: `${Math.min(
                            100,
                            ((currentMonthExp ?? totalExpenses) /
                              (avgExpenses * 1.5)) *
                              100,
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Tables */}
              <div className="two-col">
                {/* Despesas recentes */}
                <div className="table-panel">
                  <div className="table-panel-header">
                    <span className="table-panel-title">Últimas Despesas</span>
                    <Link to="/expenses" className="table-panel-btn">
                      Ver todas →
                    </Link>
                  </div>
                  {recentExpenses.length === 0 ? (
                    <div className="table-empty">Sem despesas registadas</div>
                  ) : (
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Descrição</th>
                          <th>Categoria</th>
                          <th>Data</th>
                          <th>Valor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentExpenses.map((e) => (
                          <tr key={e.id}>
                            <td>{e.description || "—"}</td>
                            <td>
                              <span className="category-badge">
                                {e.category || "outro"}
                              </span>
                            </td>
                            <td>{formatDate(e.date)}</td>
                            <td className="amount-red">
                              {formatEur(e.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Receitas recentes */}
                <div className="table-panel">
                  <div className="table-panel-header">
                    <span className="table-panel-title">Últimas Receitas</span>
                    <Link to="/incomes" className="table-panel-btn">
                      Ver todas →
                    </Link>
                  </div>
                  {recentIncomes.length === 0 ? (
                    <div className="table-empty">Sem receitas registadas</div>
                  ) : (
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Descrição</th>
                          <th>Tipo</th>
                          <th>Data</th>
                          <th>Valor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentIncomes.map((i) => (
                          <tr key={i.id}>
                            <td>{i.description || i.source || "—"}</td>
                            <td>
                              <span className="category-badge">
                                {i.type || "outro"}
                              </span>
                            </td>
                            <td>{formatDate(i.date)}</td>
                            <td className="amount-green">
                              {formatEur(i.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
