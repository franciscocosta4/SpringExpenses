import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "./Sidebar";
import "../DashboardPage.css";
import "../ExpensesPage.css";

const API = "http://localhost:8080";
const CATEGORIES = ["alimentação", "transporte", "saúde", "lazer", "habitação", "educação", "roupa", "outro"];

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

export default function ExpensesPage({ setAuth }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(true);
  const [toast, setToast] = useState(null);

  // Form state
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [category, setCategory] = useState("outro");
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("todos");
  const [sortField, setSortField] = useState("date");
  const [sortDir, setSortDir] = useState("desc");

  // Edit state
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  const showToast = (msg, type = "ok") => setToast({ msg, type });

  const fetchExpenses = useCallback(() => {
    setLoading(true);
    fetch(`${API}/expenses`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setExpenses(Array.isArray(data) ? data : []))
      .catch(() => setExpenses([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/expenses`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: desc, amount: parseFloat(amount), date, category }),
      });
      if (res.ok) {
        setDesc(""); setAmount(""); setDate(new Date().toISOString().split("T")[0]); setCategory("outro");
        fetchExpenses();
        showToast("Despesa adicionada com sucesso");
      } else {
        showToast(await res.text() || "Erro ao adicionar", "error");
      }
    } catch { showToast("Erro de conexão", "error"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Eliminar esta despesa?")) return;
    try {
      const res = await fetch(`${API}/expenses/${id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) { fetchExpenses(); showToast("Despesa eliminada"); }
      else showToast("Erro ao eliminar", "error");
    } catch { showToast("Erro de conexão", "error"); }
  };

  const startEdit = (exp) => {
    setEditId(exp.id);
    setEditData({
      description: exp.description || "",
      amount: exp.amount,
      date: exp.date ? exp.date.split("T")[0] : "",
      category: exp.category || "outro",
    });
  };

  const handleSaveEdit = async (id) => {
    try {
      const res = await fetch(`${API}/expenses/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editData, amount: parseFloat(editData.amount) }),
      });
      if (res.ok) { fetchExpenses(); setEditId(null); showToast("Despesa actualizada"); }
      else showToast("Erro ao actualizar", "error");
    } catch { showToast("Erro de conexão", "error"); }
  };

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  };

  const filtered = expenses
    .filter((e) => {
      const matchSearch = !search || (e.description || "").toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCat === "todos" || (e.category || "outro") === filterCat;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      let va = a[sortField], vb = b[sortField];
      if (sortField === "amount") { va = parseFloat(va); vb = parseFloat(vb); }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const total = filtered.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);

  const time = new Date();
  const formatTime = (d) => d.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const formatFullDate = (d) => d.toLocaleDateString("pt-PT", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="dashboard-layout">
      <Sidebar setAuth={setAuth} />

      <main className="dashboard-main">
        <div className="topbar">
          <div className="topbar-breadcrumb">
            SPRINGEXPENSES / <span>DESPESAS</span>
          </div>
          <div className="topbar-right">
            <div className="topbar-live-badge">
              <span className="topbar-live-dot" />
              LIVE
            </div>
            <div className="topbar-date">{formatTime(time)} · {formatFullDate(time)}</div>
          </div>
        </div>

        <div className="expenses-content">
          {/* Header */}
          <div className="page-header">
            <div className="page-header-left">
              <div className="page-header-eyebrow">Gestão Financeira</div>
              <div className="page-header-title">
                Registo de <span>Despesas</span>
              </div>
            </div>
          </div>

          {/* Add Form */}
          <div className="form-panel" data-label="ADD_EXPENSE">
            <div className="form-panel-header" onClick={() => setFormOpen(o => !o)}>
              <span className="form-panel-header-title">Nova Despesa</span>
              <span className={`form-panel-toggle ${formOpen ? "open" : ""}`}>▼</span>
            </div>
            {formOpen && (
              <form className="form-panel-body" onSubmit={handleAdd}>
                <div className="form-field">
                  <label className="form-field-label">Descrição</label>
                  <input
                    className="form-field-input"
                    placeholder="Ex: Supermercado"
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
                  <label className="form-field-label">Categoria</label>
                  <select
                    className="form-field-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <button className="form-submit-btn" type="submit" disabled={submitting}>
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
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
            >
              <option value="todos">Todas categorias</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <span className="filter-count">
              {filtered.length} registo{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Table */}
          <div className="expenses-table-panel">
            <div className="expenses-table-header">
              <span className="expenses-table-title">Histórico de Despesas</span>
              <span style={{ fontFamily: "Share Tech Mono", fontSize: 11, color: "var(--red)" }}>
                Total: {formatEur(total)}
              </span>
            </div>

            {loading ? (
              <div className="table-empty">A carregar...</div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">↓</div>
                <div className="empty-state-text">Sem despesas. Adiciona a primeira acima.</div>
              </div>
            ) : (
              <table className="expenses-table">
                <thead>
                  <tr>
                    <th onClick={() => toggleSort("description")} className={sortField === "description" ? "sorted" : ""}>
                      Descrição {sortField === "description" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                    </th>
                    <th onClick={() => toggleSort("category")} className={sortField === "category" ? "sorted" : ""}>
                      Categoria {sortField === "category" ? (sortDir === "asc" ? "↑" : "↓") : ""}
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
                  {filtered.map((exp) =>
                    editId === exp.id ? (
                      <tr key={exp.id} className="editing">
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
                            value={editData.category}
                            onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                          >
                            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
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
                          <div className="expense-actions">
                            <button className="expense-action-btn edit" onClick={() => handleSaveEdit(exp.id)}>✓ Guardar</button>
                            <button className="expense-action-btn" onClick={() => setEditId(null)}>✕</button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr key={exp.id}>
                        <td>{exp.description || "—"}</td>
                        <td>
                          <span className="expense-category">{exp.category || "outro"}</span>
                        </td>
                        <td className="expense-date">{formatDate(exp.date)}</td>
                        <td className="expense-amount">{formatEur(exp.amount)}</td>
                        <td>
                          <div className="expense-actions">
                            <button className="expense-action-btn edit" onClick={() => startEdit(exp)}>✎ Editar</button>
                            <button className="expense-action-btn delete" onClick={() => handleDelete(exp.id)}>✕</button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                  {/* Total row */}
                  <tr className="table-total-row">
                    <td colSpan={3} style={{ fontFamily: "Share Tech Mono", fontSize: 10, letterSpacing: 2, color: "var(--text-muted)", textTransform: "uppercase" }}>
                      Total filtrado
                    </td>
                    <td className="expense-amount">{formatEur(total)}</td>
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