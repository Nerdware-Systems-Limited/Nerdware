import { Inbox } from 'lucide-react';

const EmptyState = ({ icon: Icon = Inbox, title = 'Nothing here yet', message, action }) => (
  <div className="nw-empty">
    <div style={{
      width: 56, height: 56, borderRadius: 16,
      display: 'grid', placeItems: 'center', margin: '0 auto 14px',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid var(--nw-border)',
    }}>
      <Icon size={24} color="rgba(255,255,255,0.5)" />
    </div>
    <h4>{title}</h4>
    {message && <p style={{ margin: '4px 0 16px' }}>{message}</p>}
    {action}
  </div>
);

export default EmptyState;
