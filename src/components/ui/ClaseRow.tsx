import { Link } from 'react-router-dom';
import type { Clase, Sede } from '../../types';
import { formatTime } from '../../lib/format';
import './ClaseRow.css';

export function ClaseRow({ clase, sede }: { clase: Clase; sede: Sede }) {
  const cupos = clase.cuposDisponibles;
  return (
    <Link
      to={`/reservar/${clase.id}`}
      state={{ clase, sede }}
      className="clase-row"
    >
      <div className="clase-row__time">{formatTime(clase.inicio)}</div>
      <div className="clase-row__body">
        <p className="clase-row__name t-display">{clase.actividad.nombre}</p>
        <p className="clase-row__meta">
          {clase.instructor ? `con ${clase.instructor}` : 'Instructora a confirmar'}
          {clase.salon ? ` · ${clase.salon.nombre}` : ''}
        </p>
      </div>
      <div className="clase-row__cupos">
        <span className="clase-row__cupos-num">{cupos}</span>
        <span className="clase-row__cupos-lbl">
          {cupos === 1 ? 'lugar' : 'lugares'}
        </span>
      </div>
      <span className="clase-row__arrow" aria-hidden="true">→</span>
    </Link>
  );
}
