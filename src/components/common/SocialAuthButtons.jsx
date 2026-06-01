import { useState } from 'react';

const BACKEND = import.meta.env.VITE_API_URL;

const providers = [
  {
    id: 'google',
    label: 'Google',
    href: `${BACKEND}/api/auth/google`,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
    ),
  },
  {
    id: 'facebook',
    label: 'Facebook',
    href: `${BACKEND}/api/auth/facebook`,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#1877F2"
          d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
        />
      </svg>
    ),
  },
  {
    id: 'twitter',
    label: 'X',
    href: `${BACKEND}/api/auth/twitter`,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

/**
 * SocialAuthButtons
 *
 * Drop this anywhere inside your Login or Register card,
 * between </form> and the footer <p>.
 *
 * Props:
 *   label  – divider text  (default: "or continue with")
 *   layout – "row" | "col" (default: "row")
 */
export default function SocialAuthButtons({ label = 'or continue with', layout = 'row' }) {
  const [hovered, setHovered] = useState(null);
  const [active,  setActive]  = useState(null);

  return (
    <>
      {/* ── Styles ────────────────────────────────────────────────────────── */}
      <style>{`
        .sab-divider {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin: 1.25rem 0 1rem;
          user-select: none;
        }
        .sab-divider-line {
          flex: 1;
          height: 1px;
          background: var(--border, rgba(255,255,255,0.1));
        }
        .sab-divider-text {
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--text-muted, rgba(255,255,255,0.35));
          white-space: nowrap;
        }

        /* ── Button grid ── */
        .sab-grid {
          display: flex;
          gap: 0.625rem;
          margin-bottom: 1.25rem;
        }
        .sab-grid--row { flex-direction: row; }
        .sab-grid--col { flex-direction: column; }

        /* ── Individual button ── */
        .sab-btn {
          position: relative;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.6rem 0.75rem;
          border-radius: 0.5rem;
          font-size: 0.825rem;
          font-weight: 600;
          text-decoration: none;
          color: var(--text, #f0f0f0);
          background: var(--surface, rgba(255,255,255,0.05));
          border: 1px solid var(--border, rgba(255,255,255,0.1));
          overflow: hidden;
          transition:
            border-color 0.2s ease,
            transform    0.15s ease,
            box-shadow   0.2s ease;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
        }

        /* Shine sweep on hover */
        .sab-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            105deg,
            transparent 40%,
            rgba(255,255,255,0.07) 50%,
            transparent 60%
          );
          transform: translateX(-100%);
          transition: transform 0.45s ease;
        }
        .sab-btn:hover::before  { transform: translateX(100%); }

        /* Hover lift */
        .sab-btn:hover {
          border-color: var(--border-hover, rgba(255,255,255,0.25));
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.25);
        }

        /* Press */
        .sab-btn:active {
          transform: translateY(0) scale(0.98);
          box-shadow: none;
        }

        /* Provider accent on hover */
        .sab-btn--google:hover   { border-color: rgba(66,133,244,0.5);  box-shadow: 0 4px 16px rgba(66,133,244,0.15); }
        .sab-btn--facebook:hover { border-color: rgba(24,119,242,0.5);  box-shadow: 0 4px 16px rgba(24,119,242,0.15); }
        .sab-btn--twitter:hover  { border-color: rgba(255,255,255,0.35); box-shadow: 0 4px 16px rgba(0,0,0,0.3); }

        /* Icon container — keeps icon from shrinking */
        .sab-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 18px;
          height: 18px;
          transition: transform 0.2s ease;
        }
        .sab-btn:hover .sab-icon { transform: scale(1.1); }

        /* Label hidden on row layout at narrow screens */
        @media (max-width: 380px) {
          .sab-grid--row .sab-label { display: none; }
        }
      `}</style>

      {/* ── Divider ─────────────────────────────────────────────────────── */}
      <div className="sab-divider" aria-hidden="true">
        <div className="sab-divider-line" />
        <span className="sab-divider-text">{label}</span>
        <div className="sab-divider-line" />
      </div>

      {/* ── Buttons ─────────────────────────────────────────────────────── */}
      <div className={`sab-grid sab-grid--${layout}`} role="group" aria-label="Social sign-in options">
        {providers.map(({ id, label: providerLabel, href, icon }) => (
          <a
            key={id}
            href={href}
            className={`sab-btn sab-btn--${id}`}
            aria-label={`Continue with ${providerLabel}`}
            onMouseEnter={() => setHovered(id)}
            onMouseLeave={() => setHovered(null)}
            onMouseDown={() => setActive(id)}
            onMouseUp={() => setActive(null)}
          >
            <span className="sab-icon">{icon}</span>
            <span className="sab-label">{providerLabel}</span>
          </a>
        ))}
      </div>
    </>
  );
}