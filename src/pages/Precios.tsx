import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiError, getCatalogo } from '../api/client';
import type { CatalogoSede, CatalogoTipoPlan } from '../types';
import { formatPrice } from '../lib/format';
import { trackEvent } from '../lib/analytics';
import { Loading } from '../components/ui/Loading';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import './Precios.css';

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ok'; data: CatalogoSede[] };

type TipoPago = 'efectivo' | 'debito' | 'tarjeta';

const FRECUENCIA_LABELS: Record<string, string> = {
  MENSUAL: 'Mensual',
  TRIMESTRAL: 'Trimestral',
};

const PAGO_LABELS: Record<TipoPago, string> = {
  efectivo: 'Efectivo',
  debito: 'Débito',
  tarjeta: 'Crédito',
};

function precioFor(tipo: CatalogoTipoPlan | undefined, pago: TipoPago): number | null {
  if (!tipo) return null;
  return tipo.precios[pago];
}

function tieneAlgunPrecio(tipo: CatalogoTipoPlan): boolean {
  return tipo.precios.efectivo != null || tipo.precios.debito != null || tipo.precios.tarjeta != null;
}

export default function Precios() {
  const { slug } = useParams<{ slug: string }>();
  const [state, setState] = useState<State>({ status: 'loading' });
  const [frecuencia, setFrecuencia] = useState<'MENSUAL' | 'TRIMESTRAL'>('MENSUAL');
  const [tipoPago, setTipoPago] = useState<TipoPago>('efectivo');

  const load = () => {
    setState({ status: 'loading' });
    getCatalogo(slug)
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

  useEffect(load, [slug]);

  useEffect(() => {
    trackEvent('view_precios', { sede_slug: slug });
  }, [slug]);

  const sede = useMemo(() => {
    if (state.status !== 'ok') return undefined;
    return state.data.find((s) => s.sedeSlug === slug) ?? state.data[0];
  }, [state, slug]);

  const sedeNombre = sede?.sedeNombre ?? 'Sede';

  const itemsForSede = useMemo(() => {
    if (!sede) return [];
    return [...sede.tipos]
      .filter(tieneAlgunPrecio)
      .sort((a, b) => a.orden - b.orden);
  }, [sede]);

  const itemsByFrecuencia = useMemo(
    () => itemsForSede.filter((t) => t.frecuencia === frecuencia),
    [itemsForSede, frecuencia],
  );

  const availableTipoPagos = useMemo(() => {
    const pagos: TipoPago[] = [];
    const has = (p: TipoPago) =>
      itemsByFrecuencia.some((t) => precioFor(t, p) != null);
    if (has('efectivo')) pagos.push('efectivo');
    if (has('debito')) pagos.push('debito');
    if (has('tarjeta')) pagos.push('tarjeta');
    return pagos;
  }, [itemsByFrecuencia]);

  // Auto-switch tipoPago if current is unavailable
  useEffect(() => {
    if (availableTipoPagos.length === 0) return;
    if (!availableTipoPagos.includes(tipoPago)) {
      setTipoPago(availableTipoPagos[0]);
    }
  }, [availableTipoPagos, tipoPago]);

  const itemsToShow = useMemo(
    () => itemsByFrecuencia,
    [itemsByFrecuencia],
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

        <div className="precios__eyebrow">◆ {sedeNombre}</div>

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
            {(['efectivo', 'debito', 'tarjeta'] as TipoPago[]).map((tp) => (
              <button
                key={tp}
                type="button"
                onClick={() => setTipoPago(tp)}
                disabled={!availableTipoPagos.includes(tp)}
                className={`precios__pay-opt${tipoPago === tp ? ' precios__pay-opt--active' : ''}${!availableTipoPagos.includes(tp) ? ' precios__pay-opt--disabled' : ''}`}
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
              const precio = precioFor(item, tipoPago);

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
                    {precio != null ? (
                      <>
                        <div className="precios__price-big">
                          {formatPrice(precio)}
                        </div>
                        {tipoPago !== 'tarjeta' && item.precios.tarjeta != null && item.precios.tarjeta > 0 && precio < item.precios.tarjeta && (
                          <div className="precios__savings">
                            <span className="precios__savings-dot" />
                            Ahorrás {Math.round((1 - precio / item.precios.tarjeta) * 100)}% vs crédito
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="precios__price-big precios__price-big--na">
                        No disponible
                      </div>
                    )}
                  </div>

                  <Link
                    to={`/sede/${slug}`}
                    className={`precios__cta${item.destacado ? ' precios__cta--primary' : ''}`}
                  >
                    Reservar clase de prueba
                  </Link>

                  <div className="precios__divider" />

                  <ul className="precios__list">
                    {item.caracteristicas.length > 0 ? (
                      item.caracteristicas.map((it, i) => (
                        <li key={i} className="precios__li">
                          <span className="precios__check">✓</span>
                          {it}
                        </li>
                      ))
                    ) : (
                      <li className="precios__li precios__li--muted">
                        Plan mensual flexible
                      </li>
                    )}
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
