import { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  PAYMENT_METHODS,
  PRICING,
  formatARS,
  priceFor,
  ahorroVsCredito,
} from '../lib/pricing';
import './Precios.css';

export default function Precios() {
  const { slug } = useParams<{ slug: string }>();
  const [pago, setPago] = useState('debito');
  const [duracion, setDuracion] = useState<'mensual' | 'trimestral'>('mensual');

  const planes = PRICING[duracion];

  const availableMethods = useMemo(() => {
    if (duracion === 'trimestral') {
      return PAYMENT_METHODS.filter((m) => m.id !== 'debito');
    }
    return PAYMENT_METHODS;
  }, [duracion]);

  const sedeNombre = useMemo(() => {
    const map: Record<string, string> = {
      'lomada-hot': 'Sede Lomada · Hot + Recovery',
    };
    return map[slug ?? ''] ?? 'Sede';
  }, [slug]);

  return (
    <div className="precios">
      <div className="precios__inner">
        <div className="precios__back">
          <Link to={`/sede/${slug}`} className="precios__back-link">
            ← Volver a la sede
          </Link>
        </div>

        <div className="precios__eyebrow">◆ {sedeNombre}</div>

        <div className="precios__toggle-wrap">
            <button
              type="button"
              onClick={() => setDuracion('mensual')}
              className={`precios__toggle${duracion === 'mensual' ? ' precios__toggle--active' : ''}`}
            >
              Mensual
            </button>
            <button
              type="button"
              onClick={() => {
                setDuracion('trimestral');
                if (pago === 'debito') setPago('efectivo');
              }}
              className={`precios__toggle${duracion === 'trimestral' ? ' precios__toggle--active' : ''}`}
            >
              Trimestral
              <span className="precios__save-pill">+ ahorro</span>
            </button>
          </div>

          <div className="precios__pay-bar">
          <span className="precios__pay-q">
            Estoy viendo precios pagando con
          </span>
          <div className="precios__pay-select">
            {availableMethods.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setPago(m.id)}
                className={`precios__pay-opt${pago === m.id ? ' precios__pay-opt--active' : ''}`}
              >
                {m.short}
                {m.id === 'debito' && (
                  <span className="precios__best-badge">recomendado</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div className="precios__cards">
          {planes.map((p) => {
            const precio = priceFor(p.base, pago);
            const ahorro = ahorroVsCredito(p.base, pago);
            const metodo = PAYMENT_METHODS.find((m) => m.id === pago);

            return (
              <div
                key={p.id}
                className={`precios__card${p.destacado ? ' precios__card--destacado' : ''}`}
              >
                {p.destacado && p.etiqueta && (
                  <div className="precios__ribbon">{p.etiqueta}</div>
                )}

                <div className="precios__plan-title">{p.nombre}</div>
                <div className="precios__plan-sub">
                  {p.accesos} · {p.recovery}
                </div>

                <div className="precios__price-block">
                  <div className="precios__price-big">{formatARS(precio)}</div>
                  <div className="precios__price-small">
                    por {p.vigencia} · {metodo?.short}
                  </div>
                  {ahorro > 0 && (
                    <div className="precios__savings">
                      <span className="precios__savings-dot" />
                      Ahorrás {ahorro}% vs crédito
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className={`precios__cta${p.destacado ? ' precios__cta--primary' : ''}`}
                >
                  Reservar clase de prueba
                </button>

                <div className="precios__divider" />

                <ul className="precios__list">
                  {p.incluye.map((it, i) => (
                    <li key={i} className="precios__li">
                      <span className="precios__check">✓</span>
                      {it}
                    </li>
                  ))}
                  {pago === 'debito' && (
                    <li className="precios__li">
                      <span className="precios__check">✓</span>
                      Permanencia mínima de tres meses
                    </li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="precios__note">
          "Push your habits, push your body, push your level" · Probá una clase
          primero, sin compromiso.
        </div>
      </div>
    </div>
  );
}
