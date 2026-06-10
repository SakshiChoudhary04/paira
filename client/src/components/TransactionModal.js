import { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { CATEGORIES, ACC_ICONS } from '../utils/helpers';
import { showToast } from './Toast';

export default function TransactionModal({ open, onClose, editTx }) {
  const { accounts, addTransaction, updateTransaction, deleteTransaction } = useFinance();
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('💰 Other');
  const [accountId, setAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (editTx) {
        setType(editTx.type);
        setAmount(editTx.amount);
        setDesc(editTx.description);
        setCategory(editTx.category);
        setAccountId(editTx.account?._id || editTx.account || '');
        setDate(editTx.date ? new Date(editTx.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10));
      } else {
        setType('expense');
        setAmount('');
        setDesc('');
        setCategory('💰 Other');
        setAccountId(accounts[0]?._id || '');
        setDate(new Date().toISOString().slice(0, 10));
      }
    }
  }, [open, editTx, accounts]);

  const handleSave = async () => {
    if (!amount || !accountId) { showToast('Please fill all fields.'); return; }
    setSaving(true);
    try {
      const payload = { accountId, type, amount: parseFloat(amount), description: desc || 'Transaction', category, date };
      if (type === 'transfer' && toAccountId) payload.toAccountId = toAccountId;
      if (editTx) {
        await updateTransaction(editTx._id, payload);
        showToast('Transaction updated ✓');
      } else {
        await addTransaction(payload);
        showToast('Transaction saved ✓');
      }
      onClose();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error saving transaction');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editTx || !window.confirm('Delete this transaction?')) return;
    setSaving(true);
    try {
      await deleteTransaction(editTx._id);
      showToast('Transaction deleted');
      onClose();
    } catch {
      showToast('Error deleting transaction');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className={`overlay${open ? ' open' : ''}`} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{editTx ? 'Edit Transaction' : 'New Transaction'}</div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="type-pills">
          {['expense', 'income', 'transfer'].map(t => (
            <button key={t} className={`pill${type === t ? ` active-${t}` : ''}`} onClick={() => setType(t)}>
              <span>{t === 'expense' ? '↓' : t === 'income' ? '↑' : '⇄'}</span>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="field">
          <label>Amount</label>
          <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} min="0" step="0.01" />
        </div>
        <div className="field">
          <label>Description</label>
          <input type="text" placeholder="What was this for?" value={desc} onChange={e => setDesc(e.target.value)} />
        </div>
        <div className="field">
          <label>Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="field">
          <label>{type === 'transfer' ? 'From Account' : 'Account'}</label>
          <select value={accountId} onChange={e => setAccountId(e.target.value)}>
            <option value="">Select account</option>
            {accounts.map(a => (
              <option key={a._id} value={a._id}>{ACC_ICONS[a.type] || '🏦'} {a.name}</option>
            ))}
          </select>
        </div>
        {type === 'transfer' && (
          <div className="field">
            <label>To Account</label>
            <select value={toAccountId} onChange={e => setToAccountId(e.target.value)}>
              <option value="">Select account</option>
              {accounts.filter(a => a._id !== accountId).map(a => (
                <option key={a._id} value={a._id}>{ACC_ICONS[a.type] || '🏦'} {a.name}</option>
              ))}
            </select>
          </div>
        )}
        <div className="field">
          <label>Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>

        <button className="save-btn" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : editTx ? 'Update Transaction' : 'Save Transaction'}
        </button>
        {editTx && (
          <button className="delete-btn" onClick={handleDelete} disabled={saving}>Delete Transaction</button>
        )}
      </div>
    </div>
  );
}
