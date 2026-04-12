export default function Badge({ status, label }) {
  const colorMap = {
    pending: 'amber',
    active: 'green',
    completed: 'gray',
    confirmed: 'green',
    'non-compliant': 'red',
  };
  const color = colorMap[status?.toLowerCase()] || 'gray';

  return (
    <span className={`status-badge ${color}`}>
      {label || status}
    </span>
  );
}
