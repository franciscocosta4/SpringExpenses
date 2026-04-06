import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "./Sidebar";
import "../DashboardPage.css";
import "../ExpensesPage.css";

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

// ── Modal de edição ──────────────────────────────────────────────────────────
// Estado completamente isolado — sem interferências entre linhas
function EditModal({ expense, categories, onSave, onClose }) {
  const [desc, setDesc] = useState(expense.description || "");
  const [amount, setAmount] = useState(expense.amount);
  const [date, setDate] = useState(expense.date ? expense.date.split("T")[0] : "");
  const [categoryId, setCategoryId] = useState(expense.category?.id ?? expense.categoryId ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(expense.id, {
      description: desc,
      amount: parseFloat(amount),
      date,
      categoryId: categoryId || null,
    });
    setSaving(false);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">EDITAR DESPESA</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-field">
            <label className="form-field-label">Descrição</label>
            <input
              className="form-field-input"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              autoFocus
            />
          </div>
          <div className="form-field" style={{ marginTop: 14 }}>
            <label className="form-field-label">Valor (€)</label>
            <input
              className="form-field-input"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
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
          <div className="form-field" style={{ marginTop: 14 }}>
            <label className="form-field-label">Categoria</label>
            <select
              className="form-field-select"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">— Sem categoria —</option>
             {categories.map((c) => (
  <option key={c.id} value={c.id}>
    {c.name ?? "sem nome"}
  </option>
))}
            </select>
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

// ── Página principal ─────────────────────────────────────────────────────────
export default function ExpensesPage({ setAuth }) {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(true);
  const [toast, setToast] = useState(null);
  const [editTarget, setEditTarget] = useState(null);

  // Form novo registo
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [categoryId, setCategoryId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Filtros
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [sortField, setSortField] = useState("date");
  const [sortDir, setSortDir] = useState("desc");

  const showToast = (msg, type = "ok") => setToast({ msg, type });

  // Busca categorias da DB uma única vez
  const fetchCategories = useCallback(() => {
    fetch(`${API}/categories`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  const fetchExpenses = useCallback(() => {
    setLoading(true);
    fetch(`${API}/expenses`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setExpenses(Array.isArray(data) ? data : []))
      .catch(() => setExpenses([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchExpenses();
  }, [fetchCategories, fetchExpenses]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/expenses`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: desc,
          amount: parseFloat(amount),
          date,
          categoryId: categoryId || null,
        }),
      });
      if (res.ok) {
        setDesc(""); setAmount(""); setDate(new Date().toISOString().split("T")[0]); setCategoryId("");
        fetchExpenses();
        showToast("Despesa adicionada");
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
    if (!window.confirm("Eliminar esta despesa?")) return;
    try {
      const res = await fetch(`${API}/expenses/${id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) { fetchExpenses(); showToast("Despesa eliminada"); }
      else showToast("Erro ao eliminar", "error");
    } catch {
      showToast("Erro de conexão", "error");
    }
  };

  const handleSaveEdit = async (id, data) => {
    try {
      const res = await fetch(`${API}/expenses/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) { fetchExpenses(); setEditTarget(null); showToast("Despesa atualizada"); }
      else showToast("Erro ao atualizar", "error");
    } catch {
      showToast("Erro de conexão", "error");
    }
  };

  const toggleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("desc"); }
  };

  // Resolve nome da categoria a partir do objeto expense
  const getCategoryName = (exp) =>
    exp.category?.name ?? categories.find((c) => c.id === exp.categoryId)?.name ?? "—";

  const filtered = expenses
    .filter((e) => {
      const matchSearch = !search || (e.description || "").toLowerCase().includes(search.toLowerCase());
      const matchCat = !filterCat || (e.category?.id ?? e.categoryId) === Number(filterCat);
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      let va = a[sortField], vb = b[sortField];
      if (sortField === "amount") { va = parseFloat(va); vb = parseFloat(vb); }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const totalFiltered = filtered.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);

  const now = new Date();
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
            <div className="topbar-date">{formatTime(now)} · {formatFullDate(now)}</div>
          </div>
        </div>

        <div className="expenses-content">
          <div className="page-header">
            <div className="page-header-left">
              <div className="page-header-eyebrow">Gestão Financeira</div>
              <div className="page-header-title">
                Registo de <span>Despesas</span>
              </div>
            </div>
          </div>

          {/* Formulário novo registo */}
          <div className="form-panel" data-label="ADD_EXPENSE">
            <div className="form-panel-header" onClick={() => setFormOpen((o) => !o)}>
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
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    <option value="">— Sem categoria —</option>
                    {categories.length === 0 ? (
                      <option disabled>A carregar...</option>
                    ) : (
                      categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))
                    )}
                  </select>
                </div>
                <button className="form-submit-btn" type="submit" disabled={submitting}>
                  {submitting ? "..." : "+ ADD"}
                </button>
              </form>
            )}
          </div>

          {/* Filtros */}
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
              <option value="">Todas as categorias</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <span className="filter-count">
              {filtered.length} registo{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Tabela */}
          <div className="expenses-table-panel">
            <div className="expenses-table-header">
              <span className="expenses-table-title">Histórico de Despesas</span>
              <span style={{ fontFamily: "Share Tech Mono", fontSize: 11, color: "var(--red)" }}>
                Total: {formatEur(totalFiltered)}
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
                    <th>Categoria</th>
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
                  {filtered.map((exp) => (
                    <tr key={exp.id}>
                      <td>{exp.description || "—"}</td>
                      <td>
                        <span className="expense-category">{getCategoryName(exp)}</span>
                      </td>
                      <td className="expense-date">{formatDate(exp.date)}</td>
                      <td className="expense-amount">{formatEur(exp.amount)}</td>
                      <td>
                        <div className="expense-actions">
                          <button className="expense-action-btn edit" onClick={() => setEditTarget(exp)}>✎ Editar</button>
                          <button className="expense-action-btn delete" onClick={() => handleDelete(exp.id)}>✕</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  <tr className="table-total-row">
                    <td colSpan={3} style={{ fontFamily: "Share Tech Mono", fontSize: 10, letterSpacing: 2, color: "var(--text-muted)", textTransform: "uppercase" }}>
                      Total filtrado
                    </td>
                    <td className="expense-amount">{formatEur(totalFiltered)}</td>
                    <td />
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* Modal de edição */}
      {editTarget && (
        <EditModal
          expense={editTarget}
          categories={categories}
          onSave={handleSaveEdit}
          onClose={() => setEditTarget(null)}
        />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}
