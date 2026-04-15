import { Link } from 'react-router-dom';
import type { Sede } from '../../types';
import { formatPrice } from '../../lib/format';
import { Iso } from '../brand/Iso';
import './SedeCard.css';

export function SedeCard({ sede }: { sede: Sede }) {
  return (
    <Link to={`/sede/${sede.slug}`} className="sede-card">
      <div className="sede-card__media">
        {sede.imagenUrl ? (
          <img src={sede.imagenUrl} alt={sede.nombre} />
        ) : (
          <div className="sede-card__fallback">
            <Iso variant="taupe" size={56} />
          </div>
        )}
      </div>
      <div className="sede-card__body">
        <p className="t-tag">{sede.ciudad}</p>
        <h3 className="sede-card__name t-serif">{sede.nombre}</h3>
        <p className="sede-card__addr">{sede.direccion}</p>
        <div className="sede-card__foot">
          <div>
            <p className="sede-card__price-label">Clase de prueba</p>
            <p className="sede-card__price">{formatPrice(sede.precioPrueba)}</p>
          </div>
          <span className="sede-card__cta">
            Ver clases <span aria-hidden="true">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
