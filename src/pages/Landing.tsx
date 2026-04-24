import { useEffect, useState } from 'react';
import { ApiError, getSedes } from '../api/client';
import type { Sede } from '../types';
import { SedeCard } from '../components/ui/SedeCard';
import { Loading } from '../components/ui/Loading';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import './Landing.css';

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ok'; sedes: Sede[] };

export default function Landing() {
  const [state, setState] = useState<State>({ status: 'loading' });

  const load = () => {
    setState({ status: 'loading' });
    getSedes()
      .then((sedes) => setState({ status: 'ok', sedes }))
      .catch((err) =>
        setState({
          status: 'error',
          message:
            err instanceof ApiError
              ? err.message
              : 'No pudimos cargar las sedes.',
        }),
      );
  };

  useEffect(load, []);

  return (
    <div className="container landing">
      <section className="landing__hero">
        <p className="t-tag">Welcome to your pilates era</p>
        <h1 className="landing__title t-display">
          Reservá tu primera clase
        </h1>
        <p className="landing__subtitle">
          Elegí la sede más cercana y probá una clase de reformer con nosotras.
          Sin compromiso, solo para descubrir el método.
        </p>
      </section>

      <section className="landing__studios">
        <div className="landing__studios-head">
          <p className="t-tag">Our studios</p>
          <h2 className="t-display landing__studios-title">Elegí dónde empezar</h2>
        </div>

        {state.status === 'loading' && <Loading label="Cargando sedes" />}

        {state.status === 'error' && (
          <ErrorBanner message={state.message} onRetry={load} />
        )}

        {state.status === 'ok' && state.sedes.length === 0 && (
          <div className="landing__empty">
            <p className="t-display" style={{ fontSize: 28 }}>
              Por ahora no hay sedes disponibles
            </p>
            <p className="t-muted" style={{ marginTop: 10 }}>
              Estamos trabajando para habilitar la reserva online en breve.
            </p>
          </div>
        )}

        {state.status === 'ok' && state.sedes.length > 0 && (
          <div className="landing__grid">
            {state.sedes.map((sede) => (
              <SedeCard key={sede.id} sede={sede} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
