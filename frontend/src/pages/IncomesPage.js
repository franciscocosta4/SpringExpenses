import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "./Sidebar";
import "../DashboardPage.css";
import "../IncomesPage.css";

const API = "http://localhost:8080";
const INCOME_TYPES = ["salário", "freelance", "investimento", "aluguer", "presente", "outro"];

function formatEur(n) {
  if (n == null) return "—";
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(n);
}

function formatDate(str) {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" });
}

function Toast({ msg, type, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div
      style={{
        position: "fixed", bottom: 24, right: 24,
        background: "var(--bg-panel)", border: "1px solid var(--border)",
        borderLeft: `3px solid ${type === "error" ? "var(--red)" : "var(--green)"}`,
        padding: "12px 20px",
        fontFamily: "Share Tech Mono", fontSize: 12, color: "var(--text-primary)",
        letterSpacing: "0.5px", zIndex: 999,
        animation: "slideIn 0.3s ease both",
      }}
    >
      {msg}
    </div>
  );
}

export default function IncomesPage({ setAuth }) {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(true);
  const [toast, setToast] = useState(null);

  // Form
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [type, setType] = useState("salário");
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("todos");
  const [sortField, setSortField] = useState("date");
  const [sortDir, setSortDir] = useState("desc");

  // Edit
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  const showToast = (msg, type = "ok") => setToast({ msg, type });

  const fetchIncomes = useCallback(() => {
    setLoading(true);
    fetch(`${API}/incomes`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setIncomes(Array.isArray(data) ? data : []))
      .catch(() => setIncomes([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchIncomes(); }, [fetchIncomes]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/incomes`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: desc, amount: parseFloat(amount), date, type }),
      });
      if (res.ok) {
        setDesc(""); setAmount(""); setDate(new Date().toISOString().split("T")[0]); setType("salário");
        fetchIncomes();
        showToast("Receita adicionada com sucesso");
      } else {
        showToast(await res.text() || "Erro ao adicionar", "error");
      }
    } catch { showToast("Erro de conexão", "error"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Eliminar esta receita?")) return;
    try {
      const res = await fetch(`${API}/incomes/${id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) { fetchIncomes(); showToast("Receita eliminada"); }
      else showToast("Erro ao eliminar", "error");
    } catch { showToast("Erro de conexão", "error"); }
  };

  const startEdit = (inc) => {
    setEditId(inc.id);
    setEditData({
      description: inc.description || inc.source || "",
      amount: inc.amount,
      date: inc.date ? inc.date.split("T")[0] : "",
      type: inc.type || "outro",
    });
  };

  const handleSaveEdit = async (id) => {
    try {
      const res = await fetch(`${API}/incomes/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editData, amount: parseFloat(editData.amount) }),
      });
      if (res.ok) { fetchIncomes(); setEditId(null); showToast("Receita actualizada"); }
      else showToast("Erro ao actualizar", "error");
    } catch { showToast("Erro de conexão", "error"); }
  };

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  };

  const filtered = incomes
    .filter((i) => {
      const label = i.description || i.source || "";
      const matchSearch = !search || label.toLowerCase().includes(search.toLowerCase());
      const matchType = filterType === "todos" || (i.type || "outro") === filterType;
      return matchSearch && matchType;
    })
    .sort((a, b) => {
      let va = a[sortField], vb = b[sortField];
      if (sortField === "amount") { va = parseFloat(va); vb = parseFloat(vb); }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const total30 = incomes
    .filter((i) => {
      if (!i.date) return false;
      const d = new Date(i.date);
      const diff = (new Date() - d) / (1000 * 60 * 60 * 24);
      return diff <= 30;
    })
    .reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);

  const totalAll = incomes.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
  const totalFiltered = filtered.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);

  const time = new Date();
  const formatTime = (d) => d.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const formatFullDate = (d) => d.toLocaleDateString("pt-PT", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="dashboard-layout">
      <Sidebar setAuth={setAuth} />

      <main className="dashboard-main">
        <div className="topbar">
          <div className="topbar-breadcrumb">
            SPRINGEXPENSES / <span style={{ color: "var(--green)" }}>RECEITAS</span>
          </div>
          <div className="topbar-right">
            <div className="topbar-live-badge">
              <span className="topbar-live-dot" />
              LIVE
            </div>
            <div className="topbar-date">{formatTime(time)} · {formatFullDate(time)}</div>
          </div>
        </div>

        <div className="incomes-content">
          {/* Page header */}
          <div className="page-header">
            <div className="page-header-left">
              <div className="page-header-eyebrow">Gestão Financeira</div>
              <div className="page-header-title">
                Registo de <span className="income-accent">Receitas</span>
              </div>
            </div>
          </div>

          {/* Stats summary */}
          <div className="income-stats-row">
            <div className="income-stat-card">
              <div className="income-stat-label">Últimos 30 dias</div>
              <div className="income-stat-value">{formatEur(total30)}</div>
              <div className="income-stat-sub">receitas recentes</div>
            </div>
            <div className="income-stat-card">
              <div className="income-stat-label">Total registado</div>
              <div className="income-stat-value">{formatEur(totalAll)}</div>
              <div className="income-stat-sub">{incomes.length} entradas</div>
            </div>
            <div className="income-stat-card">
              <div className="income-stat-label">Filtro actual</div>
              <div className="income-stat-value">{formatEur(totalFiltered)}</div>
              <div className="income-stat-sub">{filtered.length} registos</div>
            </div>
          </div>

          {/* Add Form */}
          <div className="form-panel form-panel--income" data-label="ADD_INCOME">
            <div className="form-panel-header" onClick={() => setFormOpen(o => !o)}>
              <span className="form-panel-header-title">Nova Receita</span>
              <span className={`form-panel-toggle ${formOpen ? "open" : ""}`}>▼</span>
            </div>
            {formOpen && (
              <form className="form-panel-body" onSubmit={handleAdd}>
                <div className="form-field">
                  <label className="form-field-label">Descrição</label>
                  <input
                    className="form-field-input"
                    placeholder="Ex: Salário Março"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    required
                  />
                </div>
                <div className="form-field">
                  <label className="form-field-label">Valor (€)</label>
                  <input
                    className="form-field-input"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="form-field">
                  <label className="form-field-label">Data</label>
                  <input
                    className="form-field-input"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-field">
                  <label className="form-field-label">Tipo</label>
                  <select
                    className="form-field-select"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    {INCOME_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <button className="form-submit-btn form-submit-btn--income" type="submit" disabled={submitting}>
                  {submitting ? "..." : "+ ADD"}
                </button>
              </form>
            )}
          </div>

          {/* Filters */}
          <div className="filters-row">
            <input
              className="filter-search"
              placeholder="🔍 Pesquisar descrição..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="filter-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="todos">Todos os tipos</option>
              {INCOME_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <span className="filter-count">
              {filtered.length} registo{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Table */}
          <div className="incomes-table-panel">
            <div className="incomes-table-header">
              <span className="incomes-table-title">Histórico de Receitas</span>
              <span style={{ fontFamily: "Share Tech Mono", fontSize: 11, color: "var(--green)" }}>
                Total: {formatEur(totalFiltered)}
              </span>
            </div>

            {loading ? (
              <div style={{ padding: 32, textAlign: "center", fontFamily: "Share Tech Mono", fontSize: 12, color: "var(--text-muted)", letterSpacing: 1 }}>
                A carregar...
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">↑</div>
                <div className="empty-state-text">Sem receitas. Adiciona a primeira acima.</div>
              </div>
            ) : (
              <table className="incomes-table">
                <thead>
                  <tr>
                    <th onClick={() => toggleSort("description")} className={sortField === "description" ? "sorted" : ""}>
                      Descrição {sortField === "description" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                    </th>
                    <th onClick={() => toggleSort("type")} className={sortField === "type" ? "sorted" : ""}>
                      Tipo {sortField === "type" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                    </th>
                    <th onClick={() => toggleSort("date")} className={sortField === "date" ? "sorted" : ""}>
                      Data {sortField === "date" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                    </th>
                    <th onClick={() => toggleSort("amount")} className={sortField === "amount" ? "sorted" : ""}>
                      Valor {sortField === "amount" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                    </th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((inc) =>
                    editId === inc.id ? (
                      <tr key={inc.id}>
                        <td>
                          <input
                            className="inline-input"
                            value={editData.description}
                            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                          />
                        </td>
                        <td>
                          <select
                            className="inline-input"
                            value={editData.type}
                            onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                          >
                            {INCOME_TYPES.map((t) => <option key={t}>{t}</option>)}
                          </select>
                        </td>
                        <td>
                          <input
                            className="inline-input"
                            type="date"
                            value={editData.date}
                            onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                          />
                        </td>
                        <td>
                          <input
                            className="inline-input"
                            type="number"
                            step="0.01"
                            value={editData.amount}
                            onChange={(e) => setEditData({ ...editData, amount: e.target.value })}
                            style={{ maxWidth: 90 }}
                          />
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 4 }}>
                            <button className="income-action-btn edit" onClick={() => handleSaveEdit(inc.id)}>✓ Guardar</button>
                            <button className="income-action-btn" onClick={() => setEditId(null)}>✕</button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr key={inc.id}>
                        <td>{inc.description || inc.source || "—"}</td>
                        <td>
                          <span className={`income-type ${inc.type === "salário" ? "income-type--salary" : "income-type--other"}`}>
                            {inc.type || "outro"}
                          </span>
                        </td>
                        <td className="income-date">{formatDate(inc.date)}</td>
                        <td className="income-amount">{formatEur(inc.amount)}</td>
                        <td>
                          <div style={{ display: "flex", gap: 4 }}>
                            <button className="income-action-btn edit" onClick={() => startEdit(inc)}>✎ Editar</button>
                            <button className="income-action-btn delete" onClick={() => handleDelete(inc.id)}>✕</button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                  <tr className="incomes-total-row">
                    <td colSpan={3} style={{ fontFamily: "Share Tech Mono", fontSize: 10, letterSpacing: 2, color: "var(--text-muted)", textTransform: "uppercase" }}>
                      Total filtrado
                    </td>
                    <td className="income-amount">{formatEur(totalFiltered)}</td>
                    <td />
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}