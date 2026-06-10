import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useFinance } from '../context/FinanceContext';
import { fmt, fmtDate } from '../utils/helpers';

export default function Transactions() {
  const { openTxModal } = useOutletContext();
  const { transactions, loadingData } = useFinance();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  let displayed = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
  if (filter !== 'all') displayed = displayed.filter(t => t.type === filter);
  if (search.trim()) {
    const q = search.toLowerCase();
    displayed = displayed.filter(t =>
      t.description?.toLowerCase().includes(q) ||
      t.category?.toLowerCase().includes(q) ||
      t.account?.name?.toLowerCase().includes(q)
    );
  }

  return (
    <div className="content">
      <div className="page-header">
        <div className="page-title">All Transactions</div>
        <div className="page-sub">{displayed.length} transaction{displayed.length !== 1 ? 's' : ''}</div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="filter-tabs" style={{ marginBottom: 0 }}>
          {['all', 'income', 'expense', 'transfer'].map(f => (
            <button key={f} className={`ftab${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            background: 'var(--surface2)', border: '1px solid var(--border2)', color: 'var(--text)',
            borderRadius: 20, padding: '6px 14px', fontSize: 13, outline: 'none', flex: '1', minWidth: 120,
          }}
        />
      </div>

      <div className="card">
        {loadingData
          ? <div className="empty">Loading…</div>
          : displayed.length === 0
            ? <div className="empty">No transactions{filter !== 'all' ? ' for this filter' : ' yet'}</div>
            : displayed.map(tx => <TxRow key={tx._id} tx={tx} onEdit={openTxModal} />)
        }
      </div>
    </div>
  );
}

function TxRow({ tx, onEdit }) {
  const isCr = tx.type === 'income';
  const isTr = tx.type === 'transfer';
  const sign = isCr ? '+' : isTr ? '⇄ ' : '-';
  const cls = isCr ? 'cr' : isTr ? '' : 'db';
  const icon = tx.category?.split(' ')[0] || '💰';
  const catName = tx.category?.split(' ').slice(1).join(' ') || '';

  return (
    <div className="tx-item">
      <div className="tx-left">
        <div className="tx-icon">{icon}</div>
        <div style={{ minWidth: 0 }}>
          <div className="tx-name">{tx.description}</div>
          <div className="tx-meta">{catName}{tx.account?.name ? ' · ' + tx.account.name : ''}</div>
        </div>
      </div>
      <div className="tx-right">
        <div className="tx-info">
          <div className={`tx-amount ${cls}`}>{sign}{fmt(tx.amount)}</div>
          <div className="tx-date">{fmtDate(tx.date)}</div>
        </div>
        <button className="icon-btn" onClick={() => onEdit(tx)} title="Edit">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
