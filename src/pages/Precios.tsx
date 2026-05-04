import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiError, getCatalogo } from '../api/client';
import type { CatalogoTipo } from '../types';
import { formatPrice } from '../lib/format';
import { Loading } from '../components/ui/Loading';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import './Precios.css';

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ok'; data: CatalogoTipo[] };

const FRECUENCIA_LABELS: Record<string, string> = {
  MENSUAL: 'Mensual',
  TRIMESTRAL: 'Trimestral',
};

const PAGO_LABELS: Record<string, string> = {
  DEBITO_AUTOMATICO: 'Débito',
  EFECTIVO_TRANSFERENCIA: 'Efectivo',
  TARJETA: 'Crédito',
};

export default function Precios() {
  const { slug } = useParams<{ slug: string }>();
  const [state, setState] = useState<State>({ status: 'loading' });
  const [frecuencia, setFrecuencia] = useState<'MENSUAL' | 'TRIMESTRAL'>('MENSUAL');
  const [tipoPago, setTipoPago] = useState<CatalogoTipo['tipoPago'] | ''>('');

  const load = () => {
    setState({ status: 'loading' });
    getCatalogo()
      .then((data) => setState({ status: 'ok', data }))
      .catch((err) =>
        setState({
          status: 'error',
          message:
            err instanceof ApiError
              ? err.message
              : 'No pudimos cargar los precios.',
        }),
      );
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, []);

  const itemsForSede = useMemo(() => {
    if (state.status !== 'ok') return [];
    return state.data.filter((t) => t.planes.some((p) => p.sedeSlug === slug));
  }, [state, slug]);

  const sedeNombre = useMemo(() => {
    const plan = itemsForSede
      .flatMap((t) => t.planes)
      .find((p) => p.sedeSlug === slug);
    return plan?.sedeNombre ?? 'Sede';
  }, [itemsForSede, slug]);

  const itemsByFrecuencia = useMemo(
    () => itemsForSede.filter((t) => t.frecuencia === frecuencia),
    [itemsForSede, frecuencia],
  );

  const availableTipoPagos = useMemo(
    () => [...new Set(itemsByFrecuencia.map((t) => t.tipoPago))],
    [itemsByFrecuencia],
  );

  // Auto-switch tipoPago when frecuencia changes or availability changes
  useEffect(() => {
    if (availableTipoPagos.length === 0) {
      setTipoPago('');
      return;
    }
    if (tipoPago && !availableTipoPagos.includes(tipoPago)) {
      setTipoPago(availableTipoPagos[0]);
    }
  }, [availableTipoPagos, tipoPago]);

  const itemsToShow = useMemo(
    () => itemsByFrecuencia.filter((t) => t.tipoPago === tipoPago),
    [itemsByFrecuencia, tipoPago],
  );

  if (state.status === 'loading') {
    return (
      <div className="precios">
        <div className="precios__inner">
          <Loading label="Cargando precios" />
        </div>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="precios">
        <div className="precios__inner">
          <ErrorBanner message={state.message} onRetry={load} />
        </div>
      </div>
    );
  }

  const frecuenciasDisponibles = [
    ...new Set(itemsForSede.map((t) => t.frecuencia)),
  ];

  return (
    <div className="precios">
      <div className="precios__inner">
        <div className="precios__back">
          <Link to={`/sede/${slug}`} className="precios__back-link">
            ← Volver a la sede
          </Link>
        </div>

        <div className="precios__eyebrow">
          ◆ {sedeNombre}
        </div>

        {/* Frecuencia tabs */}
        <div className="precios__toggle-wrap">
          {(['MENSUAL', 'TRIMESTRAL'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFrecuencia(f)}
              disabled={!frecuenciasDisponibles.includes(f)}
              className={`precios__toggle${frecuencia === f ? ' precios__toggle--active' : ''}${!frecuenciasDisponibles.includes(f) ? ' precios__toggle--disabled' : ''}`}
            >
              {FRECUENCIA_LABELS[f]}
              {f === 'TRIMESTRAL' && (
                <span className="precios__save-pill">+ ahorro</span>
              )}
            </button>
          ))}
        </div>

        {/* tipoPago tabs */}
        <div className="precios__pay-bar">
          <span className="precios__pay-q">Pagando con</span>
          <div className="precios__pay-select">
            {availableTipoPagos.map((tp) => (
              <button
                key={tp}
                type="button"
                onClick={() => setTipoPago(tp)}
                className={`precios__pay-opt${tipoPago === tp ? ' precios__pay-opt--active' : ''}`}
              >
                {PAGO_LABELS[tp]}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        {itemsToShow.length === 0 ? (
          <div className="precios__empty">
            <p>No hay planes disponibles para esta opción.</p>
          </div>
        ) : (
          <div className="precios__cards">
            {itemsToShow.map((item) => {
              const plan = item.planes.find((p) => p.sedeSlug === slug);
              const precio = plan?.precio ?? 0;

              return (
                <div
                  key={item.id}
                  className={`precios__card${item.destacado ? ' precios__card--destacado' : ''}`}
                >
                  {item.destacado && (
                    <div className="precios__ribbon">El más elegido</div>
                  )}

                  <div className="precios__plan-title">{item.etiqueta}</div>
                  <div className="precios__plan-sub">{item.subtitulo}</div>

                  <div className="precios__price-block">
                    <div className="precios__price-big">
                      {formatPrice(precio)}
                    </div>
                  </div>

                  <Link
                    to={`/sede/${slug}`}
                    className={`precios__cta${item.destacado ? ' precios__cta--primary' : ''}`}
                  >
                    Reservar clase de prueba
                  </Link>

                  <div className="precios__divider" />

                  <ul className="precios__list">
                    {item.caracteristicas.map((it, i) => (
                      <li key={i} className="precios__li">
                        <span className="precios__check">✓</span>
                        {it}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}

        <div className="precios__note">
          "Push your habits, push your body, push your level" · Probá una clase
          primero, sin compromiso.
        </div>
      </div>
    </div>
  );
}
