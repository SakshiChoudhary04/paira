import { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { showToast } from './Toast';

const ACC_TYPES = ['bank', 'cash', 'credit', 'savings', 'investment', 'wallet'];

export default function AccountModal({ open, onClose, editAcc }) {
  const { addAccount, updateAccount, deleteAccount } = useFinance();
  const [name, setName] = useState('');
  const [type, setType] = useState('bank');
  const [balance, setBalance] = useState('');
  const [salary, setSalary] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (editAcc) {
        setName(editAcc.name);
        setType(editAcc.type);
        setBalance(editAcc.balance);
        setSalary(editAcc.salary || '');
      } else {
        setName(''); setType('bank'); setBalance(''); setSalary('');
      }
    }
  }, [open, editAcc]);

  const handleSave = async () => {
    if (!name.trim()) { showToast('Enter an account name.'); return; }
    setSaving(true);
    try {
      const payload = { name: name.trim(), type, balance: parseFloat(balance) || 0, salary: parseFloat(salary) || 0 };
      if (editAcc) {
        await updateAccount(editAcc._id, payload);
        showToast('Account updated ✓');
      } else {
        await addAccount(payload);
        showToast('Account added ✓');
      }
      onClose();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error saving account');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editAcc || !window.confirm('Delete this account and all its transactions?')) return;
    setSaving(true);
    try {
      await deleteAccount(editAcc._id);
      showToast('Account deleted');
      onClose();
    } catch {
      showToast('Error deleting account');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className={`overlay${open ? ' open' : ''}`} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{editAcc ? 'Edit Account' : 'Add Account'}</div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="field">
          <label>Account Name</label>
          <input type="text" placeholder="e.g. HDFC Savings" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="field">
          <label>Account Type</label>
          <select value={type} onChange={e => setType(e.target.value)}>
            {ACC_TYPES.map(t => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Opening Balance (₹)</label>
          <input type="number" placeholder="0" value={balance} onChange={e => setBalance(e.target.value)} />
        </div>
        <div className="field">
          <label>Monthly Salary / Income (₹) — optional</label>
          <input type="number" placeholder="0" value={salary} onChange={e => setSalary(e.target.value)} />
        </div>

        <button className="save-btn" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : editAcc ? 'Update Account' : 'Add Account'}
        </button>
        {editAcc && (
          <button className="delete-btn" onClick={handleDelete} disabled={saving}>Delete Account</button>
        )}
      </div>
    </div>
  );
}
