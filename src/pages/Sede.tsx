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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" />
                  </svg>
                  Cómo llegar
                </a>
              )}
            </div>
          </div>
          <p className="sede__hero-note">
            En caso de avanzar, este valor se descuenta de tu plan
          </p>
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
