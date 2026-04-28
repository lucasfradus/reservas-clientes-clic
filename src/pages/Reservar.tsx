import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ApiError, checkout, getClases, getSedes } from '../api/client';
import type { Clase, Sede } from '../types';
import { Iso } from '../components/brand/Iso';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Loading } from '../components/ui/Loading';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import {
  formatDayLong,
  formatPrice,
  formatTime,
} from '../lib/format';
import './Reservar.css';

interface LocationState {
  clase?: Clase;
  sede?: Sede;
}

type LoadState =
  | { status: 'loading' }
  | { status: 'notfound' }
  | { status: 'error'; message: string }
  | { status: 'ok'; clase: Clase; sede: Sede };

type FormErrors = Partial<Record<'nombre' | 'apellido' | 'email' | 'telefono', string>>;

function validate(form: {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
}): FormErrors {
  const errors: FormErrors = {};
  if (!form.nombre.trim()) errors.nombre = 'Ingresá tu nombre';
  if (!form.apellido.trim()) errors.apellido = 'Ingresá tu apellido';
  if (!form.email.trim()) {
    errors.email = 'Ingresá tu email';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Email inválido';
  }
  if (!form.telefono.trim()) {
    errors.telefono = 'Ingresá tu teléfono';
  } else if (form.telefono.replace(/\D/g, '').length < 8) {
    errors.telefono = 'Teléfono demasiado corto';
  }
  return errors;
}

export default function Reservar() {
  const { claseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const preloaded = (location.state ?? {}) as LocationState;

  const [load, setLoad] = useState<LoadState>(() => {
    if (preloaded.clase && preloaded.sede) {
      return { status: 'ok', clase: preloaded.clase, sede: preloaded.sede };
    }
    return { status: 'loading' };
  });

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // If no state was passed, refetch everything and resolve the clase by id.
  useEffect(() => {
    if (load.status !== 'loading') return;
    const idNum = Number(claseId);
    if (!Number.isFinite(idNum)) {
      setLoad({ status: 'notfound' });
      return;
    }

    (async () => {
      try {
        const sedes = await getSedes();
        // Try every sede in parallel — the public endpoint is per-sede.
        const results = await Promise.all(
          sedes.map(async (sede) => {
            try {
              const clases = await getClases(sede.id);
              const clase = clases.find((c) => c.id === idNum);
              return clase ? { sede, clase } : null;
            } catch {
              return null;
            }
          }),
        );
        const hit = results.find((r) => r !== null);
        if (!hit) {
          setLoad({ status: 'notfound' });
          return;
        }
        setLoad({ status: 'ok', sede: hit.sede, clase: hit.clase });
      } catch (err) {
        setLoad({
          status: 'error',
          message:
            err instanceof ApiError
              ? err.message
              : 'No pudimos cargar los datos de la reserva.',
        });
      }
    })();
  }, [claseId, load.status]);

  const handleChange = (field: keyof typeof form) => (e: FormEvent<HTMLInputElement>) => {
    const value = (e.target as HTMLInputElement).value;
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (load.status !== 'ok' || submitting) return;

    const validation = validate(form);
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await checkout({
        claseId: load.clase.id,
        sedeId: load.sede.id,
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        email: form.email.trim(),
        telefono: form.telefono.trim(),
      });
      window.location.href = res.initPoint;
    } catch (err) {
      setSubmitting(false);
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setSubmitError('Esta clase se llenó mientras completabas el formulario. Volvé a elegir un horario.');
        } else if (err.status === 404) {
          setSubmitError('La clase ya no está disponible. Elegí otro horario.');
        } else {
          setSubmitError(err.message);
        }
      } else {
        setSubmitError('No pudimos procesar el pago. Probá de nuevo en un momento.');
      }
    }
  };

  const resumen = useMemo(() => {
    if (load.status !== 'ok') return null;
    return {
      actividad: load.clase.actividad.nombre,
      fecha: `${formatDayLong(load.clase.inicio)} · ${formatTime(load.clase.inicio)}`,
      sede: load.sede.nombre,
      instructor: load.clase.instructor,
      precio: formatPrice(load.sede.precioPrueba),
    };
  }, [load]);

  if (load.status === 'loading') {
    return (
      <div className="container">
        <Loading label="Cargando reserva" />
      </div>
    );
  }

  if (load.status === 'notfound') {
    return (
      <div className="container reservar-empty">
        <p className="t-tag">Clase no disponible</p>
        <h1 className="t-display" style={{ fontSize: 44, marginTop: 8 }}>
          Esa clase ya no existe
        </h1>
        <p className="t-muted" style={{ marginTop: 14 }}>
          Puede que los cupos se hayan agotado. Elegí otro horario disponible.
        </p>
        <Link to="/" className="reservar-empty__link">
          Ver sedes →
        </Link>
      </div>
    );
  }

  if (load.status === 'error') {
    return (
      <div className="container">
        <ErrorBanner
          message={load.message}
          onRetry={() => setLoad({ status: 'loading' })}
        />
      </div>
    );
  }

  const { sede } = load;

  return (
    <div className="container reservar">
      <div className="reservar__back">
        <button
          type="button"
          onClick={() => navigate(`/sede/${sede.slug}`)}
          className="reservar__back-link"
        >
          ← Cambiar horario
        </button>
      </div>

      <div className="reservar__head">
        <p className="t-tag">One more step</p>
        <h1 className="reservar__title t-display">Completá tus datos</h1>
        <p className="reservar__sub">
          Con esta información te enviamos la confirmación y reservamos tu lugar.
        </p>
      </div>

      <div className="reservar__grid">
        <form className="reservar__form" onSubmit={handleSubmit} noValidate>
          <div className="reservar__form-head">
            <p className="reservar__form-title t-display">Tus datos</p>
            <p className="reservar__form-sub">
              No creamos cuenta. Solo los usamos para esta reserva.
            </p>
          </div>

          <div className="reservar__form-row">
            <Input
              label="Nombre"
              name="nombre"
              autoComplete="given-name"
              value={form.nombre}
              onChange={handleChange('nombre')}
              error={errors.nombre}
              disabled={submitting}
            />
            <Input
              label="Apellido"
              name="apellido"
              autoComplete="family-name"
              value={form.apellido}
              onChange={handleChange('apellido')}
              error={errors.apellido}
              disabled={submitting}
            />
          </div>

          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="tu@email.com"
            value={form.email}
            onChange={handleChange('email')}
            error={errors.email}
            disabled={submitting}
          />

          <Input
            label="Teléfono"
            name="telefono"
            type="tel"
            autoComplete="tel"
            placeholder="+54 9 11 ..."
            value={form.telefono}
            onChange={handleChange('telefono')}
            error={errors.telefono}
            disabled={submitting}
          />

          {submitError && (
            <ErrorBanner message={submitError} />
          )}

          <Button
            variant="taupe"
            type="submit"
            fullWidth
            disabled={submitting}
          >
            {submitting ? 'Redirigiendo a Mercado Pago...' : 'Pagar y reservar'}
          </Button>

          <p className="reservar__legal">
            Al continuar aceptás los términos y condiciones de CLIC. El pago se
            procesa de forma segura a través de Mercado Pago.
          </p>
        </form>

        {resumen && (
          <aside className="reservar__summary">
            <Iso
              variant="taupe"
              size={120}
              className="reservar__summary-watermark"
            />
            <p className="t-tag" style={{ color: 'var(--taupe)' }}>
              Your trial class
            </p>
            <h2 className="reservar__summary-title t-display">{resumen.actividad}</h2>
            <p className="reservar__summary-sede">{resumen.sede}</p>

            <div className="reservar__summary-list">
              <div className="reservar__summary-row">
                <span>Fecha</span>
                <span>{resumen.fecha}</span>
              </div>
              {resumen.instructor && (
                <div className="reservar__summary-row">
                  <span>Instructora</span>
                  <span>{resumen.instructor}</span>
                </div>
              )}
            </div>

            <div className="reservar__summary-total">
              <span>Total</span>
              <span className="reservar__summary-total-val t-display">
                {resumen.precio}
              </span>
            </div>

            <div className="reservar__summary-mp">
              <span className="reservar__summary-mp-logo">MP</span>
              <span>Pago seguro vía Mercado Pago</span>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
