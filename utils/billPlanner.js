function daysUntilDue(dueDay, now = new Date()) {
  const day = Number(dueDay) || 1;
  let due = new Date(now.getFullYear(), now.getMonth(), day);
  if (due <= now) due = new Date(now.getFullYear(), now.getMonth() + 1, day);
  return Math.ceil((due - now) / (1000 * 60 * 60 * 24));
}

function normalizeBill(bill, now = new Date()) {
  const amount = Number(bill.amount) || 0;
  const saved = Number(bill.saved) || 0;
  const remaining = Math.max(0, amount - saved);
  const days = daysUntilDue(bill.due, now);
  const coverage = amount > 0 ? Math.min(1, saved / amount) : 1;
  return {
    ...bill,
    amount,
    saved,
    remaining,
    days,
    coverage,
  };
}

function computeCertaintyScore(bills, now = new Date()) {
  const normalized = bills.map((b) => normalizeBill(b, now));
  if (normalized.length === 0) return 100;

  const weighted = normalized.map((bill) => {
    const urgencyFactor = bill.days <= 3 ? 0.35 : bill.days <= 7 ? 0.6 : bill.days <= 14 ? 0.8 : 1;
    const certainty = (bill.coverage * 0.75) + (urgencyFactor * 0.25);
    return {
      weight: bill.amount > 0 ? bill.amount : 1,
      certainty,
    };
  });

  const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0);
  const score = weighted.reduce((sum, item) => sum + (item.certainty * item.weight), 0) / (totalWeight || 1);
  return Math.max(0, Math.min(100, Math.round(score * 100)));
}

function buildRiskAlerts(bills, now = new Date()) {
  return bills
    .map((b) => normalizeBill(b, now))
    .filter((bill) => bill.remaining > 0 && bill.days <= 10)
    .sort((a, b) => a.days - b.days)
    .slice(0, 3)
    .map((bill) => ({
      ...bill,
      dailyMove: Math.max(1, Math.ceil(bill.remaining / Math.max(1, bill.days))),
    }));
}

module.exports = {
  daysUntilDue,
  normalizeBill,
  computeCertaintyScore,
  buildRiskAlerts,
};
