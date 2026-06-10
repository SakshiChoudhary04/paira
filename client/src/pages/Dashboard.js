import { useOutletContext } from 'react-router-dom';
import { useFinance } from '../context/FinanceContext';
import { fmt, fmtDate, MONTHS, ACC_ICONS } from '../utils/helpers';

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  );
}

export default function Dashboard() {
  const { openTxModal, openAccModal } = useOutletContext();
  const { accounts, transactions, summary, month, year, loadingData } = useFinance();

  const totalBal = accounts.reduce((s, a) => s + a.balance, 0);
  const totalSalary = accounts.reduce((s, a) => s + (a.salary || 0), 0);
  const spent = summary.expense || 0;
  const income = summary.income || 0;
  const net = income - spent;

  const budgetPct = totalSalary > 0 ? Math.min(100, Math.round(spent / totalSalary * 100)) : 0;
  const barClass = `bar-fill${budgetPct >= 100 ? ' over' : budgetPct >= 80 ? ' warn' : ''}`;

  const sortedCats = Object.entries(summary.categories || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxCat = sortedCats[0]?.[1] || 1;

  const recent = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  if (loadingData) return <div className="content"><div style={{ color: 'var(--muted)', marginTop: 40, textAlign: 'center' }}>Loading…</div></div>;

  return (
    <div className="content">
      {/* Summary */}
      <div className="summary-grid">
        <div className="summary-card">
          <div className="s-label"><span className="dot" style={{ background: '#888' }} /> Net Balance</div>
          <div className="s-amount" style={{ color: net < 0 ? 'var(--red)' : net > 0 ? 'var(--green)' : 'var(--text)' }}>
            {net < 0 ? '-' : ''}{fmt(net)}
          </div>
          <div className="s-sub">{MONTHS[month]} {year}</div>
        </div>
        <div className="summary-card">
          <div className="s-label"><span className="dot" style={{ background: 'var(--green)' }} /> Income</div>
          <div className="s-amount" style={{ color: 'var(--green)' }}>{fmt(income)}</div>
          <div className="s-sub">this month</div>
        </div>
        <div className="summary-card">
          <div className="s-label"><span className="dot" style={{ background: 'var(--red)' }} /> Spent</div>
          <div className="s-amount" style={{ color: 'var(--red)' }}>{fmt(spent)}</div>
          <div className="s-sub">this month</div>
        </div>
        <div className="summary-card">
          <div className="s-label"><span className="dot" style={{ background: 'var(--blue)' }} /> Total Balance</div>
          <div className="s-amount" style={{ color: 'var(--blue)' }}>{totalBal < 0 ? '-' : ''}{fmt(totalBal)}</div>
          <div className="s-sub">across all accounts</div>
        </div>
      </div>

      {/* Budget bar */}
      <div className="budget-card">
        <div className="budget-header">
          <span className="budget-title">Monthly Budget</span>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{MONTHS[month]}</span>
        </div>
        <div className="bar-track">
          <div className={barClass} style={{ width: budgetPct + '%' }} />
        </div>
        <div className="budget-meta">
          <span>{totalSalary > 0 ? budgetPct + '% used' : 'No budget set'}</span>
          <span>{fmt(spent)} spent</span>
          <span>{totalSalary > 0 ? 'of ' + fmt(totalSalary) + ' budget' : 'Add salary to track'}</span>
        </div>
      </div>

      {/* Two-col */}
      <div className="two-col">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Accounts</span>
            <button className="link-btn" onClick={() => openAccModal()}>+ Add</button>
          </div>
          {accounts.length === 0
            ? <div className="empty">No accounts — <button className="link-btn" onClick={() => openAccModal()}>add one</button></div>
            : accounts.slice(0, 4).map(a => (
              <div className="account-item" key={a._id}>
                <div className="acc-left" onClick={() => openAccModal(a)}>
                  <div className="acc-icon">{ACC_ICONS[a.type] || '🏦'}</div>
                  <div style={{ minWidth: 0 }}>
                    <div className="acc-name">{a.name}</div>
                    <div className="acc-type">{a.type.charAt(0).toUpperCase() + a.type.slice(1)}{a.salary ? ' · ₹' + Math.round(a.salary).toLocaleString('en-IN') + '/mo' : ''}</div>
                  </div>
                </div>
                <div className="acc-right">
                  <div className="acc-bal" style={{ color: a.balance < 0 ? 'var(--red)' : a.balance === 0 ? 'var(--muted)' : 'var(--text)' }}>
                    {a.balance < 0 ? '-' : ''}{fmt(a.balance)}
                  </div>
                  <button className="icon-btn" onClick={() => openAccModal(a)} title="Edit"><EditIcon /></button>
                </div>
              </div>
            ))
          }
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Top Spending</span>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{MONTHS[month]}</span>
          </div>
          {sortedCats.length === 0
            ? <div className="empty">No expenses yet</div>
            : <div className="cat-list">
              {sortedCats.map(([cat, amt]) => (
                <div className="cat-row" key={cat}>
                  <span className="cat-label">{cat.split(' ').slice(1).join(' ')}</span>
                  <div className="cat-track"><div className="cat-bar" style={{ width: Math.round(amt / maxCat * 100) + '%' }} /></div>
                  <span className="cat-val">{fmt(amt)}</span>
                </div>
              ))}
            </div>
          }
        </div>
      </div>

      {/* Recent transactions */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Recent Transactions</span>
          <button className="link-btn" onClick={() => openTxModal()}>+ Add</button>
        </div>
        {recent.length === 0
          ? <div className="empty">No transactions this month</div>
          : recent.map(tx => <TxRow key={tx._id} tx={tx} onEdit={openTxModal} />)
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
