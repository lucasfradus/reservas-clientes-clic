import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiError, getClases, getSedes } from '../api/client';
import type { Clase, Sede as SedeT } from '../types';
import { Iso } from '../components/brand/Iso';
import { Loading } from '../components/ui/Loading';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { ClaseRow } from '../components/ui/ClaseRow';
import { dayKey, formatDayLong, formatPrice } from '../lib/format';
import './Sede.css';

type State =
  | { status: 'loading' }
  | { status: 'notfound' }
  | { status: 'error'; message: string }
  | { status: 'ok'; sede: SedeT; clases: Clase[] };

export default function Sede() {
  const { slug } = useParams();
  const [state, setState] = useState<State>({ status: 'loading' });

  const load = () => {
    if (!slug) return;
    setState({ status: 'loading' });
    getSedes()
      .then(async (sedes) => {
        const sede = sedes.find((s) => s.slug === slug);
        if (!sede) {
          setState({ status: 'notfound' });
          return;
        }
        const clases = await getClases(sede.id);
        setState({ status: 'ok', sede, clases });
      })
      .catch((err) =>
        setState({
          status: 'error',
          message:
            err instanceof ApiError
              ? err.message
              : 'No pudimos cargar las clases.',
        }),
      );
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, [slug]);

  const grouped = useMemo(() => {
    if (state.status !== 'ok') return [];
    const groups = new Map<string, Clase[]>();
    for (const clase of state.clases) {
      const key = dayKey(clase.inicio);
      const arr = groups.get(key) ?? [];
      arr.push(clase);
      groups.set(key, arr);
    }
    return Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, clases]) => ({
        key,
        label: formatDayLong(clases[0].inicio),
        clases: clases.sort((a, b) => a.inicio.localeCompare(b.inicio)),
      }));
  }, [state]);

  if (state.status === 'loading') {
    return (
      <div className="container">
        <Loading label="Cargando sede" />
      </div>
    );
  }

  if (state.status === 'notfound') {
    return (
      <div className="container sede-empty">
        <p className="t-tag">Sede no encontrada</p>
        <h1 className="t-serif" style={{ fontSize: 44, marginTop: 8 }}>
          Esa sede no existe
        </h1>
        <p className="t-muted" style={{ marginTop: 14 }}>
          La sede que buscás no está disponible o fue movida.
        </p>
        <Link to="/" className="sede-empty__link">
          Ver todas las sedes →
        </Link>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="container">
        <ErrorBanner message={state.message} onRetry={load} />
      </div>
    );
  }

  const { sede, clases } = state;

  return (
    <div className="container sede">
      <div className="sede__back">
        <Link to="/" className="sede__back-link">
          ← Ver todas las sedes
        </Link>
      </div>

      <section className="sede__hero">
        <div className="sede__hero-media">
          {sede.imagenUrl ? (
            <img src={sede.imagenUrl} alt={sede.nombre} />
          ) : (
            <div className="sede__hero-fallback">
              <Iso variant="white" size={88} />
            </div>
          )}
        </div>
        <div className="sede__hero-body">
          <p className="t-tag" style={{ color: 'var(--taupe)' }}>
            {sede.ciudad}
          </p>
          <h1 className="sede__hero-title t-serif">{sede.nombre}</h1>
          <p className="sede__hero-addr">{sede.direccion}</p>

          {sede.descripcion && (
            <p className="sede__hero-desc">{sede.descripcion}</p>
          )}

          <div className="sede__hero-meta">
            <div>
              <p className="sede__hero-meta-label">Clase de prueba</p>
              <p className="sede__hero-meta-value">
                {formatPrice(sede.precioPrueba)}
              </p>
            </div>
            <div className="sede__hero-links">
              {sede.whatsappUrl && (
                <a
                  href={sede.whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="sede__hero-link"
                >
                  WhatsApp
                </a>
              )}
              {sede.googleMapsUrl && (
                <a
                  href={sede.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="sede__hero-link"
                >
                  Cómo llegar
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="sede__clases">
        <div className="sede__clases-head">
          <p className="t-tag">It's pilates time</p>
          <h2 className="t-serif sede__clases-title">Próximas clases</h2>
          <p className="sede__clases-sub">
            Tocá un horario para reservar tu clase de prueba.
          </p>
        </div>

        {clases.length === 0 ? (
          <div className="sede__empty">
            <p className="t-serif" style={{ fontSize: 24 }}>
              No hay clases disponibles
            </p>
            <p className="t-muted" style={{ marginTop: 8 }}>
              Los cupos de los próximos 14 días ya están tomados. Probá más tarde
              o escribinos por WhatsApp.
            </p>
          </div>
        ) : (
          <div className="sede__days">
            {grouped.map((group) => (
              <div key={group.key} className="sede__day">
                <p className="sede__day-label">{group.label}</p>
                <div className="sede__day-list">
                  {group.clases.map((clase) => (
                    <ClaseRow key={clase.id} clase={clase} sede={sede} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
