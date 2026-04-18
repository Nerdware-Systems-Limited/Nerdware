import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ label, value, delta, trend = 'up', icon: Icon }) => (
  <div className="nw-stat">
    <div className="nw-stat__top">
      <span>{label}</span>
      {Icon && (
        <span className="nw-stat__icon">
          <Icon size={18} />
        </span>
      )}
    </div>
    <div className="nw-stat__val">{value ?? '—'}</div>
    {delta != null && (
      <div className={`nw-stat__delta ${trend === 'down' ? 'is-down' : ''}`}>
        {trend === 'down' ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
        {' '}{delta}
      </div>
    )}
  </div>
);

export default StatCard;
