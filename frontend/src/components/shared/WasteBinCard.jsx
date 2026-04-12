import './WasteBinCard.css';

const binColors = {
  wet: { bg: 'rgba(76, 175, 80, 0.12)', color: '#4caf50', icon: '🟢', label: 'Wet Waste' },
  dry: { bg: 'rgba(255, 193, 7, 0.12)', color: '#ffc107', icon: '🟡', label: 'Dry Waste' },
  recyclable: { bg: 'rgba(33, 150, 243, 0.12)', color: '#2196f3', icon: '🔵', label: 'Recyclable' },
};

export default function WasteBinCard({ type = 'wet', bins = 1, size = '120L' }) {
  const config = binColors[type] || binColors.wet;

  return (
    <div className="bin-card" style={{ '--bin-color': config.color, '--bin-bg': config.bg }}>
      <div className="bin-card__header">
        <span className="bin-card__icon">{config.icon}</span>
        <span className="bin-card__type">{config.label}</span>
      </div>
      <div className="bin-card__count">
        <span className="bin-card__number">{bins}</span>
        <span className="bin-card__unit">× {size} bins</span>
      </div>
    </div>
  );
}
