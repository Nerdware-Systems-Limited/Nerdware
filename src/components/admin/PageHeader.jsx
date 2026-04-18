const PageHeader = ({ title, subtitle, actions }) => (
  <div className="nw-page-head">
    <div>
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </div>
    {actions && <div style={{ display: 'flex', gap: 8 }}>{actions}</div>}
  </div>
);

export default PageHeader;
