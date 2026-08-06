import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Clase, Sede } from '../../types';
import { formatTime } from '../../lib/format';
import { trackVenta } from '../../lib/analytics';
import './ClaseRow.css';

export function ClaseRow({ clase, sede }: { clase: Clase; sede: Sede }) {
  const cupos = clase.cuposDisponibles;
  const desc = clase.actividad.descripcion;
  const [open, setOpen] = useState(false);

  return (
    <Link
      to={`/reservar/${clase.id}`}
      state={{ clase, sede }}
      className="clase-row"
      onClick={() =>
        // Arranca el checkout: es el momento más preciso del embudo, justo
        // antes de ir al formulario. El botón "RESERVAR CLASE DE PRUEBA" de
        // más arriba solo hace scroll y a propósito no dispara nada, así el
        // evento no se cuenta dos veces.
        trackVenta('begin_checkout', {
          nombre: clase.actividad.nombre,
          categoria: 'Trial',
          sede: sede.nombre,
          sedeSlug: sede.slug,
          precio: sede.precioPrueba,
        })
      }
    >
      <div className="clase-row__time">{formatTime(clase.inicio)}</div>
      <div className="clase-row__body">
        <p className="clase-row__name t-display">{clase.actividad.nombre}</p>
        {desc && (
          <button
            type="button"
            className={`clase-row__info-btn${open ? ' clase-row__info-btn--open' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(!open);
            }}
          >
            {open ? '− info' : '+ info'}
          </button>
        )}
        {desc && (
          <div className={`clase-row__desc-wrap${open ? ' clase-row__desc-wrap--open' : ''}`}>
            <div className="clase-row__desc-inner">
              <p className="clase-row__desc">{desc}</p>
            </div>
          </div>
        )}
        <p className="clase-row__meta">
          {clase.instructor ? `con ${clase.instructor}` : 'Instructora a confirmar'}
          {clase.salon ? ` · ${clase.salon.nombre}` : ''}
        </p>
      </div>
      <div className={`clase-row__cupos${cupos === 0 ? ' clase-row__cupos--agotado' : ''}`}>
        <span className="clase-row__cupos-lbl">
          {cupos > 0 ? 'Reserva ahora' : 'No disponible'}
        </span>
      </div>
      <span className="clase-row__arrow" aria-hidden="true">→</span>
    </Link>
  );
}
