import { useOutletContext } from 'react-router-dom';
import { useFinance } from '../context/FinanceContext';
import { fmt, fmtDate, ACC_ICONS } from '../utils/helpers';

export default function Accounts() {
  const { openAccModal, openTxModal } = useOutletContext();
  const { accounts, transactions, loadingData } = useFinance();

  const totalBal = accounts.reduce((s, a) => s + a.balance, 0);

  return (
    <div className="content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div className="page-title">Accounts</div>
          <div className="page-sub">Total: {totalBal < 0 ? '-' : ''}{fmt(totalBal)}</div>
        </div>
        <button className="add-tx-btn" onClick={() => openAccModal()}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Add Account
        </button>
      </div>

      {loadingData
        ? <div className="empty">Loading…</div>
        : accounts.length === 0
          ? <div className="card"><div className="empty">No accounts yet. <button className="link-btn" onClick={() => openAccModal()}>Add one →</button></div></div>
          : accounts.map(a => <AccountCard key={a._id} account={a} transactions={transactions} onEdit={() => openAccModal(a)} onAddTx={() => openTxModal({ account: a })} />)
      }
    </div>
  );
}

function AccountCard({ account: a, transactions, onEdit, onAddTx }) {
  const txs = transactions.filter(t => t.account?._id === a._id || t.account === a._id);
  const inc = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const exp = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const recent = [...txs].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);

  return (
    <div className="card" style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div className="acc-icon" style={{ width: 44, height: 44, fontSize: 20 }}>{ACC_ICONS[a.type] || '🏦'}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{a.name}</div>
            <div className="acc-type">{a.type.charAt(0).toUpperCase() + a.type.slice(1)}{a.salary ? ' · ₹' + Math.round(a.salary).toLocaleString('en-IN') + '/mo' : ''}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: a.balance < 0 ? 'var(--red)' : 'var(--text)' }}>
              {a.balance < 0 ? '-' : ''}{fmt(a.balance)}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>current balance</div>
          </div>
          <button className="icon-btn" onClick={onEdit} title="Edit account">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="acc-detail-stats">
        <div className="acc-stat-card">
          <div className="asc-label">Income</div>
          <div className="asc-val" style={{ color: 'var(--green)' }}>{fmt(inc)}</div>
        </div>
        <div className="acc-stat-card">
          <div className="asc-label">Expenses</div>
          <div className="asc-val" style={{ color: 'var(--red)' }}>{fmt(exp)}</div>
        </div>
        <div className="acc-stat-card">
          <div className="asc-label">Transactions</div>
          <div className="asc-val">{txs.length}</div>
        </div>
      </div>

      {recent.length > 0 && (
        <div>
          <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Recent</div>
          {recent.map(tx => {
            const isCr = tx.type === 'income';
            const isTr = tx.type === 'transfer';
            const sign = isCr ? '+' : isTr ? '⇄ ' : '-';
            const cls = isCr ? 'cr' : isTr ? '' : 'db';
            return (
              <div className="tx-item" key={tx._id}>
                <div className="tx-left">
                  <div className="tx-icon" style={{ width: 32, height: 32, fontSize: 14 }}>{tx.category?.split(' ')[0]}</div>
                  <div style={{ minWidth: 0 }}>
                    <div className="tx-name">{tx.description}</div>
                    <div className="tx-meta">{fmtDate(tx.date)}</div>
                  </div>
                </div>
                <div className={`tx-amount ${cls}`} style={{ fontSize: 13 }}>{sign}{fmt(tx.amount)}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
