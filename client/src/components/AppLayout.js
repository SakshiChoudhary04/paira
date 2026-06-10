import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useFinance } from '../context/FinanceContext';
import { MONTHS } from '../utils/helpers';
import TransactionModal from './TransactionModal';
import AccountModal from './AccountModal';
import Toast from './Toast';
import { useAuth } from '../context/AuthContext';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [accModalOpen, setAccModalOpen] = useState(false);
  const [editTx, setEditTx] = useState(null);
  const [editAcc, setEditAcc] = useState(null);
  const { month, year, changeMonth } = useFinance();
  const { user, logout } = useAuth();

  const openTxModal = (tx = null) => { setEditTx(tx); setTxModalOpen(true); };
  const openAccModal = (acc = null) => { setEditAcc(acc); setAccModalOpen(true); };

  // Expose globally so child pages can trigger modals
  window.__paira_openTxModal = openTxModal;
  window.__paira_openAccModal = openAccModal;

  return (
    <div className="app">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onAddAccount={() => { openAccModal(); setSidebarOpen(false); }}
      />

      <div className="main">
        <div className="topbar">
          <div className="topbar-left">
            <button className="menu-btn" onClick={() => setSidebarOpen(v => !v)} aria-label="Menu">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18M3 6h18M3 18h18"/>
              </svg>
            </button>
            <div className="month-nav">
              <button onClick={() => changeMonth(-1)} aria-label="Previous month">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <span className="month-label">{MONTHS[month]} {year}</span>
              <button onClick={() => changeMonth(1)} aria-label="Next month">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </div>
          </div>
          <div className="topbar-right">
            <button className="add-tx-btn" onClick={() => openTxModal()}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
              Add
            </button>
            <div className="user-btn" title={user?.email}>
              <div className="user-avatar">{user?.name?.charAt(0)?.toUpperCase()}</div>
              <span style={{ maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name?.split(' ')[0]}</span>
            </div>
          </div>
        </div>

        <Outlet context={{ openTxModal, openAccModal }} />
      </div>

      <TransactionModal open={txModalOpen} onClose={() => setTxModalOpen(false)} editTx={editTx} />
      <AccountModal open={accModalOpen} onClose={() => setAccModalOpen(false)} editAcc={editAcc} />
      <Toast />
    </div>
  );
}
