import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "./Sidebar";
import "../DashboardPage.css";
import "../IncomesPage.css";

const API = "http://localhost:8080";

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
  return <div className={`toast ${type === "error" ? "toast--error" : ""}`}>{msg}</div>;
}

// Cada modal tem o seu próprio estado local — sem conflitos
function EditModal({ income, onSave, onClose }) {
  const [amount, setAmount] = useState(income.amount);
  const [date, setDate] = useState(income.date ? income.date.split("T")[0] : "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(income.id, { amount: parseFloat(amount), date });
    setSaving(false);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">EDITAR RECEITA</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-field">
            <label className="form-field-label">Valor (€)</label>
            <input
              className="form-field-input"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
            />
          </div>
          <div className="form-field" style={{ marginTop: 14 }}>
            <label className="form-field-label">Data</label>
            <input
              className="form-field-input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="modal-btn modal-btn--cancel" onClick={onClose}>Cancelar</button>
          <button className="modal-btn modal-btn--save" onClick={handleSave} disabled={saving}>
            {saving ? "A guardar..." : "✓ Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function IncomesPage({ setAuth }) {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(true);
  const [toast, setToast] = useState(null);
  const [editTarget, setEditTarget] = useState(null);

  // Form novo registo
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [submitting, setSubmitting] = useState(false);

  // Filtros
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("date");
  const [sortDir, setSortDir] = useState("desc");

  const showToast = (msg, type = "ok") => setToast({ msg, type });

  const fetchIncomes = useCallback(() => {
    setLoading(true);
    fetch(`${API}/incomes`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
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
        body: JSON.stringify({ amount: parseFloat(amount), date }),
      });
      if (res.ok) {
        setAmount("");
        setDate(new Date().toISOString().split("T")[0]);
        fetchIncomes();
        showToast("Receita adicionada");
      } else {
        showToast((await res.text()) || "Erro ao adicionar", "error");
      }
    } catch {
      showToast("Erro de conexão", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Eliminar esta receita?")) return;
    try {
      const res = await fetch(`${API}/incomes/${id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) { fetchIncomes(); showToast("Receita eliminada"); }
      else showToast("Erro ao eliminar", "error");
    } catch {
      showToast("Erro de conexão", "error");
    }
  };

  const handleSaveEdit = async (id, data) => {
    console.log(id);
    try {
      const res = await fetch(`${API}/incomes/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) { fetchIncomes(); setEditTarget(null); showToast("Receita atualizada"); }
      else showToast("Erro ao atualizar", "error");
    } catch {
      showToast("Erro de conexão", "error");
    }
  };

  const toggleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("desc"); }
  };

  const filtered = incomes
    .filter((i) => {
      if (!search) return true;
      const label = i.description || i.source || formatDate(i.date);
      return label.toLowerCase().includes(search.toLowerCase());
    })
    .sort((a, b) => {
      let va = a[sortField], vb = b[sortField];
      if (sortField === "amount") { va = parseFloat(va); vb = parseFloat(vb); }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const total30 = incomes
    .filter((i) => i.date && (new Date() - new Date(i.date)) / 86400000 <= 30)
    .reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);

  const totalAll = incomes.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
  const totalFiltered = filtered.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);

  const now = new Date();
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
            <div className="topbar-date">{formatTime(now)} · {formatFullDate(now)}</div>
          </div>
        </div>

        <div className="incomes-content">
          <div className="page-header">
            <div className="page-header-left">
              <div className="page-header-eyebrow">Gestão Financeira</div>
              <div className="page-header-title">
                Registo de <span className="income-accent">Receitas</span>
              </div>
            </div>
          </div>

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
              <div className="income-stat-label">Filtro atual</div>
              <div className="income-stat-value">{formatEur(totalFiltered)}</div>
              <div className="income-stat-sub">{filtered.length} registos</div>
            </div>
          </div>

          <div className="form-panel form-panel--income" data-label="ADD_INCOME">
            <div className="form-panel-header" onClick={() => setFormOpen((o) => !o)}>
              <span className="form-panel-header-title">Nova Receita</span>
              <span className={`form-panel-toggle ${formOpen ? "open" : ""}`}>▼</span>
            </div>
            {formOpen && (
              <form className="form-panel-body" onSubmit={handleAdd}>
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
                <button className="form-submit-btn form-submit-btn--income" type="submit" disabled={submitting}>
                  {submitting ? "..." : "+ ADD"}
                </button>
              </form>
            )}
          </div>

          <div className="filters-row">
            <input
              className="filter-search"
              placeholder="🔍 Pesquisar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="filter-count">
              {filtered.length} registo{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="incomes-table-panel">
            <div className="incomes-table-header">
              <span className="incomes-table-title">Histórico de Receitas</span>
              <span style={{ fontFamily: "Share Tech Mono", fontSize: 11, color: "var(--green)" }}>
                Total: {formatEur(totalFiltered)}
              </span>
            </div>

            {loading ? (
              <div className="table-empty">A carregar...</div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">↑</div>
                <div className="empty-state-text">Sem receitas. Adiciona a primeira acima.</div>
              </div>
            ) : (
              <table className="incomes-table">
                <thead>
                  <tr>
                    <th onClick={() => toggleSort("date")} className={sortField === "date" ? "sorted" : ""}>
                      Data {sortField === "date" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                    </th>
                    {/* <th onClick={() => toggleSort("amount")} className={sortField === "amount" ? "sorted" : ""}>
                      id {sortField === "amount" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                    </th> */}
                    <th onClick={() => toggleSort("amount")} className={sortField === "amount" ? "sorted" : ""}>
                      Valor {sortField === "amount" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                    </th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((inc) => (
                    <tr key={inc.id}>
                      <td className="income-date">{formatDate(inc.date)}</td>
                      {/* SERVE APENAS PARA DAR DEBUG */}
                      {/* <td className="income-date">{inc.id}</td> */}
                      <td className="income-amount">{formatEur(inc.amount)}</td>
                      <td>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button className="income-action-btn edit" onClick={() => setEditTarget(inc)}>✎ Editar</button>
                          <button className="income-action-btn delete" onClick={() => handleDelete(inc.id)}>✕</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  <tr className="incomes-total-row">
                    <td style={{ fontFamily: "Share Tech Mono", fontSize: 10, letterSpacing: 2, color: "var(--text-muted)", textTransform: "uppercase" }}>
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

      {editTarget && (
        <EditModal
          income={editTarget}
          onSave={handleSaveEdit}
          onClose={() => setEditTarget(null)}
        />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}