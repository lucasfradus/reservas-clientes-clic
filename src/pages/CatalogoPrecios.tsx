import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiError, getCatalogo } from '../api/client';
import type { CatalogoTipo } from '../types';
import { formatPrice } from '../lib/format';
import { Loading } from '../components/ui/Loading';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import './CatalogoPrecios.css';

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ok'; data: CatalogoTipo[] };

export default function CatalogoPrecios() {
  const [state, setState] = useState<State>({ status: 'loading' });

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

  const sedes = useMemo(() => {
    if (state.status !== 'ok') return [];
    const map = new Map<
      number,
      { id: number; nombre: string; slug: string }
    >();
    for (const tipo of state.data) {
      for (const sede of tipo.sedes) {
        if (!map.has(sede.sedeId)) {
          map.set(sede.sedeId, {
            id: sede.sedeId,
            nombre: sede.sedeNombre,
            slug: sede.sedeSlug,
          });
        }
      }
    }
    return Array.from(map.values());
  }, [state]);

  const priceBySede = useMemo(() => {
    if (state.status !== 'ok') return new Map<number, Map<number, number>>();
    const map = new Map<number, Map<number, number>>();
    for (const tipo of state.data) {
      const tipoMap = new Map<number, number>();
      for (const sede of tipo.sedes) {
        tipoMap.set(sede.sedeId, sede.precioEfectivo);
      }
      map.set(tipo.id, tipoMap);
    }
    return map;
  }, [state]);

  if (state.status === 'loading') {
    return (
      <div className="catalogo">
        <div className="catalogo__inner">
          <Loading label="Cargando precios" />
        </div>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="catalogo">
        <div className="catalogo__inner">
          <ErrorBanner message={state.message} onRetry={load} />
        </div>
      </div>
    );
  }

  const { data } = state;

  if (data.length === 0) {
    return (
      <div className="catalogo">
        <div className="catalogo__inner">
          <div className="catalogo__empty">
            <p>No hay planes disponibles en este momento.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="catalogo">
      <div className="catalogo__inner">
        <div className="catalogo__back">
          <Link to="/" className="catalogo__back-link">
            ← Ver todas las sedes
          </Link>
        </div>

        <div className="catalogo__header">
          <div className="catalogo__eyebrow">◆ CLIC Pilates</div>
          <h1 className="catalogo__title">Nuestros planes</h1>
          <p className="catalogo__lead">
            Compará precios entre sedes y elegí la que mejor te quede.
          </p>
        </div>

        {/* Desktop table */}
        <div className="catalogo__table-wrap">
          <table className="catalogo__table">
            <thead>
              <tr>
                <th>Plan</th>
                {sedes.map((s) => (
                  <th key={s.id}>{s.nombre}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((tipo) => (
                <tr key={tipo.id}>
                  <td>
                    <p className="catalogo__plan-name">{tipo.nombre}</p>
                    {tipo.descripcion && (
                      <p className="catalogo__plan-desc">
                        {tipo.descripcion}
                      </p>
                    )}
                  </td>
                  {sedes.map((s) => {
                    const precio = priceBySede.get(tipo.id)?.get(s.id);
                    return (
                      <td key={s.id}>
                        {precio != null ? (
                          <Link
                            to={`/sede/${s.slug}`}
                            className="catalogo__price-link"
                          >
                            {formatPrice(precio)}
                          </Link>
                        ) : (
                          <span className="catalogo__na">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="catalogo__cards">
          {data.map((tipo) => (
            <div key={tipo.id} className="catalogo__card">
              <p className="catalogo__card-name">{tipo.nombre}</p>
              {tipo.descripcion && (
                <p className="catalogo__card-desc">{tipo.descripcion}</p>
              )}
              <div className="catalogo__card-prices">
                {tipo.sedes.map((sede) => (
                  <div key={sede.sedeId} className="catalogo__card-row">
                    <span className="catalogo__card-sede">
                      {sede.sedeNombre}
                    </span>
                    <Link
                      to={`/sede/${sede.sedeSlug}`}
                      className="catalogo__card-link"
                    >
                      {formatPrice(sede.precioEfectivo)} →
                    </Link>
                  </div>
                ))}
                {tipo.sedes.length === 0 && (
                  <p className="catalogo__na">
                    No disponible por el momento
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="catalogo__note">
          Los precios pueden variar según la sede. Tocá un precio para ver
          disponibilidad y reservar tu clase de prueba.
        </div>
      </div>
    </div>
  );
}
