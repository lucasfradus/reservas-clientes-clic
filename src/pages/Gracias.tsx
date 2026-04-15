import { Link } from 'react-router-dom';
import { Iso } from '../components/brand/Iso';
import './Gracias.css';

export default function Gracias() {
  return (
    <div className="container gracias">
      <div className="gracias__card">
        <Iso variant="taupe" size={56} className="gracias__iso" />
        <p className="t-tag" style={{ color: 'var(--taupe)' }}>
          Reserva confirmada
        </p>
        <h1 className="gracias__title t-serif">
          Welcome to
          <br />
          your pilates era.
        </h1>
        <p className="gracias__sub">
          Si tu pago fue aprobado, tu lugar ya está reservado. Te enviamos los
          detalles al email que dejaste. ¡Nos vemos en tu primera clase!
        </p>

        <div className="gracias__steps">
          <p className="gracias__steps-label">Qué sigue</p>
          <ul>
            <li>Revisá tu casilla (incluido spam) para ver la confirmación.</li>
            <li>Llegá 10 minutos antes para conocer el estudio.</li>
            <li>Usá ropa cómoda y medias antideslizantes si tenés.</li>
          </ul>
        </div>

        <Link to="/" className="gracias__btn">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
