export const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export const CATEGORIES = [
  '🍔 Food & Dining','🛒 Groceries','🚗 Transport','🏠 Housing',
  '⚡ Utilities','🏥 Health','💊 Medical','🎬 Entertainment',
  '👗 Shopping','📚 Education','✈️ Travel','💰 Salary',
  '📈 Investment','🎁 Gifts','💳 EMI / Loan','📞 Subscriptions',
  '🍺 Drinks','☕ Coffee','🏋️ Fitness','💰 Other',
];

export const ACC_ICONS = {
  bank: '🏦', cash: '💵', credit: '💳', savings: '🏧', investment: '📈', wallet: '👛',
};

export const fmt = (n) => {
  const abs = Math.abs(n || 0);
  if (abs >= 1e7) return '₹' + (abs / 1e7).toFixed(2) + 'Cr';
  if (abs >= 1e5) return '₹' + (abs / 1e5).toFixed(2) + 'L';
  return '₹' + abs.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};

export const fmtDate = (d) => {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};
