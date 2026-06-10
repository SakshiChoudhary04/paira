import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { showToast } from '../components/Toast';
import Toast from '../components/Toast';

export default function Settings() {
  const { user, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [saving, setSaving] = useState(false);

  const saveProfile = async () => {
    if (!name.trim()) { showToast('Name cannot be empty'); return; }
    setSaving(true);
    try {
      await api.put('/auth/profile', { name });
      // Update localStorage
      const stored = JSON.parse(localStorage.getItem('paira_user') || '{}');
      localStorage.setItem('paira_user', JSON.stringify({ ...stored, name }));
      showToast('Profile updated ✓');
    } catch (err) {
      showToast(err.response?.data?.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async () => {
    if (!currentPw || !newPw) { showToast('Fill both password fields'); return; }
    if (newPw.length < 6) { showToast('New password must be at least 6 characters'); return; }
    setSaving(true);
    try {
      await api.put('/auth/password', { currentPassword: currentPw, newPassword: newPw });
      showToast('Password changed ✓');
      setCurrentPw(''); setNewPw('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Error changing password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="content" style={{ maxWidth: 520 }}>
      <div className="page-header">
        <div className="page-title">Settings</div>
        <div className="page-sub">Manage your account and preferences</div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title" style={{ marginBottom: 16 }}>Profile</div>
        <div className="field">
          <label>Full Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="field">
          <label>Email</label>
          <input type="text" value={user?.email || ''} disabled style={{ opacity: 0.5 }} />
        </div>
        <button className="save-btn" onClick={saveProfile} disabled={saving}>Save Profile</button>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title" style={{ marginBottom: 16 }}>Change Password</div>
        <div className="field">
          <label>Current Password</label>
          <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} placeholder="••••••••" />
        </div>
        <div className="field">
          <label>New Password</label>
          <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Min. 6 characters" />
        </div>
        <button className="save-btn" onClick={savePassword} disabled={saving}>Update Password</button>
      </div>

      <div className="card">
        <div className="card-title" style={{ marginBottom: 16 }}>Account</div>
        <button className="delete-btn" onClick={logout}>Sign Out</button>
      </div>

      <Toast />
    </div>
  );
}
