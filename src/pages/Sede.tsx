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
  const [heroImgBroken, setHeroImgBroken] = useState(false);
  const [selectedActividadId, setSelectedActividadId] = useState<number | null>(
    null,
  );

  const load = () => {
    if (!slug) return;
    setState({ status: 'loading' });
    setHeroImgBroken(false);
    setSelectedActividadId(null);
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

  // Distinct activities present in the class list, with counts. Used to
  // render the filter pills. Sorted by count desc so the most frequent one
  // sits right after "Todas".
  const actividades = useMemo(() => {
    if (state.status !== 'ok') return [];
    const map = new Map<number, { id: number; nombre: string; color: string; count: number }>();
    for (const c of state.clases) {
      const existing = map.get(c.actividad.id);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(c.actividad.id, {
          id: c.actividad.id,
          nombre: c.actividad.nombre,
          color: c.actividad.color,
          count: 1,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [state]);

  const filteredClases = useMemo(() => {
    if (state.status !== 'ok') return [];
    if (selectedActividadId == null) return state.clases;
    return state.clases.filter((c) => c.actividad.id === selectedActividadId);
  }, [state, selectedActividadId]);

  const grouped = useMemo(() => {
    const groups = new Map<string, Clase[]>();
    for (const clase of filteredClases) {
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
  }, [filteredClases]);

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
        <h1 className="t-display" style={{ fontSize: 44, marginTop: 8 }}>
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
          {sede.imagenUrl && !heroImgBroken ? (
            <img
              src={sede.imagenUrl}
              alt={sede.nombre}
              onError={() => setHeroImgBroken(true)}
            />
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
          <h1 className="sede__hero-title t-display">{sede.nombre}</h1>
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
          <h2 className="t-display sede__clases-title">Próximas clases</h2>
          <p className="sede__clases-sub">
            Tocá un horario para reservar tu clase de prueba.
          </p>
        </div>

        {actividades.length > 1 && (
          <div
            className="sede__filters"
            role="tablist"
            aria-label="Filtrar por actividad"
          >
            <button
              type="button"
              role="tab"
              aria-selected={selectedActividadId === null}
              className={`sede__pill${selectedActividadId === null ? ' sede__pill--active' : ''}`}
              onClick={() => setSelectedActividadId(null)}
            >
              <span>Todas</span>
              <span className="sede__pill-count">{clases.length}</span>
            </button>
            {actividades.map((act) => {
              const active = selectedActividadId === act.id;
              return (
                <button
                  key={act.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={`sede__pill${active ? ' sede__pill--active' : ''}`}
                  onClick={() => setSelectedActividadId(act.id)}
                >
                  <span
                    className="sede__pill-dot"
                    style={{ background: act.color || 'var(--taupe)' }}
                    aria-hidden="true"
                  />
                  <span>{act.nombre}</span>
                  <span className="sede__pill-count">{act.count}</span>
                </button>
              );
            })}
          </div>
        )}

        {clases.length === 0 ? (
          <div className="sede__empty">
            <p className="t-display" style={{ fontSize: 24 }}>
              No hay clases disponibles
            </p>
            <p className="t-muted" style={{ marginTop: 8 }}>
              Los cupos de los próximos 14 días ya están tomados. Probá más tarde
              o escribinos por WhatsApp.
            </p>
          </div>
        ) : filteredClases.length === 0 ? (
          <div className="sede__empty">
            <p className="t-display" style={{ fontSize: 22 }}>
              No hay clases de esta actividad
            </p>
            <p className="t-muted" style={{ marginTop: 8 }}>
              Probá con otra actividad o mirá todas.
            </p>
            <button
              type="button"
              className="sede__empty-btn"
              onClick={() => setSelectedActividadId(null)}
            >
              Ver todas las clases
            </button>
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
