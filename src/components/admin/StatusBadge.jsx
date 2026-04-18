const MAP = {
  PUBLISHED:   'success',
  DRAFT:       'warn',
  ARCHIVED:    'muted',
  PENDING:     'warn',
  REVIEWING:   'info',
  SHORTLISTED: 'success',
  INTERVIEWED: 'brand',
  OFFERED:     'success',
  REJECTED:    'danger',
  WITHDRAWN:   'muted',
  UNREAD:      'danger',
  READ:        'muted',
  REPLIED:     'success',
  ACTIVE:      'success',
  INACTIVE:    'muted',
  ADMIN:       'brand',
  EDITOR:      'info',
  USER:        'muted',
};

const StatusBadge = ({ status }) => {
  if (!status) return null;
  const variant = MAP[status] || 'muted';
  return <span className={`nw-badge nw-badge--${variant}`}>{status}</span>;
};

export default StatusBadge;
