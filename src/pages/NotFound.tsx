import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container" style={{ textAlign: 'center', paddingTop: 80 }}>
      <p className="t-tag">404</p>
      <h1 className="t-serif" style={{ fontSize: 56, marginTop: 8 }}>
        Página no encontrada
      </h1>
      <p className="t-muted" style={{ marginTop: 16 }}>
        Esta URL no existe o ya no está disponible.
      </p>
      <Link
        to="/"
        style={{
          display: 'inline-block',
          marginTop: 32,
          padding: '14px 32px',
          background: 'var(--ink)',
          color: 'var(--surface)',
          borderRadius: 'var(--radius-pill)',
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
        }}
      >
        Volver al inicio
      </Link>
    </div>
  );
}
