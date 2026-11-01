import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api/transactions';
const emptyForm = { description: '', amount: '', type: 'expense', category: 'Food', date: new Date().toISOString().slice(0, 10) };
const money = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value);

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTransactions = async () => {
    try {
      setError('');
      const response = await axios.get(API);
      setTransactions(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not connect to backend. Check that the server and MongoDB are running.');
    } finally { setLoading(false); }
  };

  useEffect(() => { loadTransactions(); }, []);

  const totals = useMemo(() => {
    const income = transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
    const expenses = transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
    return { income, expenses, balance: income - expenses };
  }, [transactions]);

  const visibleTransactions = transactions.filter((t) => filter === 'all' || t.type === filter);
  const changeField = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submitForm = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const payload = { ...form, amount: Number(form.amount) };
      if (editingId) await axios.put(`${API}/${editingId}`, payload);
      else await axios.post(API, payload);
      setForm({ ...emptyForm, date: new Date().toISOString().slice(0, 10) });
      setEditingId(null);
      await loadTransactions();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save transaction.');
    }
  };

  const beginEdit = (transaction) => {
    setEditingId(transaction._id);
    setForm({ description: transaction.description, amount: String(transaction.amount), type: transaction.type, category: transaction.category, date: new Date(transaction.date).toISOString().slice(0, 10) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteTransaction = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await axios.delete(`${API}/${id}`);
      setTransactions((prev) => prev.filter((item) => item._id !== id));
    } catch (err) { setError(err.response?.data?.message || 'Could not delete transaction.'); }
  };

  const cancelEdit = () => { setEditingId(null); setForm(emptyForm); };

  return (
    <main className="app-shell">
      <header className="topbar"><div className="brand-mark">₹</div><div><p className="eyebrow">PERSONAL FINANCE</p><h1>Expense Tracker</h1></div><span className="stack-tag">MERN STACK</span></header>
      <section className="intro"><div><p className="eyebrow">YOUR MONEY, IN FOCUS</p><h2>Know where your money goes.</h2><p className="muted">Track income and expenses in one simple dashboard.</p></div><div className="date-chip">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div></section>
      {error && <div className="error-banner" role="alert">{error}</div>}
      <section className="summary-grid">
        <article className="summary-card balance-card"><span className="card-label">Available balance</span><strong>{money(totals.balance)}</strong><span className="card-note">Income minus expenses</span></article>
        <article className="summary-card"><span className="card-label">Total income</span><strong className="income-text">{money(totals.income)}</strong><span className="card-note">Money received</span></article>
        <article className="summary-card"><span className="card-label">Total expenses</span><strong className="expense-text">{money(totals.expenses)}</strong><span className="card-note">Money spent</span></article>
      </section>
      <section className="content-grid">
        <article className="panel form-panel"><div className="panel-heading"><div><p className="eyebrow">TRANSACTION</p><h3>{editingId ? 'Edit transaction' : 'Add a transaction'}</h3></div><span className="plus-icon">{editingId ? '✎' : '+'}</span></div>
          <form onSubmit={submitForm} className="transaction-form">
            <label>Description<input name="description" value={form.description} onChange={changeField} placeholder="e.g. Monthly salary" required maxLength="100" /></label>
            <div className="two-columns"><label>Amount (₹)<input name="amount" type="number" min="0.01" step="0.01" value={form.amount} onChange={changeField} placeholder="0.00" required /></label><label>Type<select name="type" value={form.type} onChange={changeField}><option value="expense">Expense</option><option value="income">Income</option></select></label></div>
            <div className="two-columns"><label>Category<select name="category" value={form.category} onChange={changeField}>{['Food', 'Travel', 'Shopping', 'Bills', 'Salary', 'Health', 'Education', 'Entertainment', 'Other'].map((category) => <option key={category}>{category}</option>)}</select></label><label>Date<input name="date" type="date" value={form.date} onChange={changeField} required /></label></div>
            <button className="primary-button" type="submit">{editingId ? 'Save changes' : 'Add transaction'}</button>
            {editingId && <button className="secondary-button" type="button" onClick={cancelEdit}>Cancel edit</button>}
          </form>
        </article>
        <article className="panel history-panel"><div className="panel-heading history-heading"><div><p className="eyebrow">YOUR ACTIVITY</p><h3>Transaction history</h3></div><select aria-label="Filter transactions" className="filter-select" value={filter} onChange={(e) => setFilter(e.target.value)}><option value="all">All types</option><option value="income">Income</option><option value="expense">Expenses</option></select></div>
          {loading ? <p className="empty-state">Loading transactions...</p> : visibleTransactions.length === 0 ? <div className="empty-state"><span>◎</span><strong>No transactions yet</strong><p>Add your first transaction using the form.</p></div> : <div className="transaction-list">{visibleTransactions.map((transaction) => <div className="transaction-row" key={transaction._id}><div className={`transaction-icon ${transaction.type}`}>{transaction.type === 'income' ? '↙' : '↗'}</div><div className="transaction-main"><strong>{transaction.description}</strong><span>{transaction.category} · {new Date(transaction.date).toLocaleDateString('en-IN')}</span></div><div className="transaction-right"><strong className={transaction.type === 'income' ? 'income-text' : 'expense-text'}>{transaction.type === 'income' ? '+' : '−'}{money(transaction.amount)}</strong><div className="row-actions"><button type="button" onClick={() => beginEdit(transaction)}>Edit</button><button type="button" className="delete-action" onClick={() => deleteTransaction(transaction._id)}>Delete</button></div></div></div>)}</div>}
        </article>
      </section>
      <footer>Built for learning with React · Express · Node.js · MongoDB</footer>
    </main>
  );
}
