export interface PaymentMethod {
  id: string;
  label: string;
  short: string;
  adjust: number;
  badge: string | null;
}

export interface PricingPlan {
  id: string;
  nombre: string;
  accesos: string;
  recovery: string;
  vigencia: string;
  base: number;
  destacado?: boolean;
  etiqueta?: string;
  incluye: string[];
}

export interface PricingData {
  mensual: PricingPlan[];
  trimestral: PricingPlan[];
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'debito', label: 'Débito Automático', short: 'Débito', adjust: -0.15, badge: 'Mejor precio' },
  { id: 'efectivo', label: 'Efectivo / Transf.', short: 'Efectivo', adjust: 0, badge: null },
  { id: 'credito', label: 'Tarjeta de Crédito', short: 'Crédito', adjust: 0.22, badge: null },
];

export const PRICING: PricingData = {
  mensual: [
    {
      id: 'pack4',
      nombre: 'Pack 4 + 4',
      accesos: '4 clases',
      recovery: '4 créditos recovery',
      vigencia: '30 días',
      base: 103_950,
      incluye: [
        '4 accesos a Hot Pilates',
        '4 créditos para clases Recovery',
        'Reserva online 24/7',
        'Vence a los 30 días',
      ],
    },
    {
      id: 'pack8',
      nombre: 'Pack 8 + 4',
      accesos: '8 clases',
      recovery: '4 créditos recovery',
      vigencia: '30 días',
      base: 137_000,
      destacado: true,
      etiqueta: 'El más elegido',
      incluye: [
        '8 accesos a Hot Pilates',
        '4 créditos para clases Recovery',
        'Reserva online 24/7',
        'Reagendamiento flexible',
        'Vence a los 30 días',
      ],
    },
    {
      id: 'fullpass',
      nombre: 'Full Pass',
      accesos: 'Hot ilimitado',
      recovery: 'Pack 8 recovery',
      vigencia: '30 días',
      base: 184_000,
      incluye: [
        'Hot Pilates ilimitado',
        '8 créditos para Recovery',
        'Prioridad en reservas',
        'Reagendamiento flexible',
        'Vence a los 30 días',
      ],
    },
  ],
  trimestral: [
    {
      id: 'pack12',
      nombre: 'Pack 12 + 12',
      accesos: '12 clases',
      recovery: '12 créditos recovery',
      vigencia: '90 días',
      base: 265_072.5,
      incluye: [
        '12 accesos a Hot Pilates',
        '12 créditos para Recovery',
        'Reserva online 24/7',
        'Vence a los 90 días',
      ],
    },
    {
      id: 'pack24',
      nombre: 'Pack 24 + 12',
      accesos: '24 clases',
      recovery: '12 créditos recovery',
      vigencia: '90 días',
      base: 349_350,
      destacado: true,
      etiqueta: 'Mejor combo',
      incluye: [
        '24 accesos a Hot Pilates',
        '12 créditos para Recovery',
        'Reserva online 24/7',
        'Reagendamiento flexible',
        'Vence a los 90 días',
      ],
    },
    {
      id: 'fullpass90',
      nombre: 'Full Pass Trimestral',
      accesos: 'Hot ilimitado',
      recovery: 'Pack 8 recovery',
      vigencia: '90 días',
      base: 469_200,
      incluye: [
        'Hot Pilates ilimitado',
        '8 créditos para Recovery',
        'Prioridad en reservas',
        'Reagendamiento flexible',
        'Vence a los 90 días',
      ],
    },
  ],
};

export function formatARS(n: number): string {
  return '$' + Math.round(n).toLocaleString('es-AR');
}

export function priceFor(base: number, paymentId: string): number {
  const m = PAYMENT_METHODS.find((p) => p.id === paymentId);
  return base * (1 + (m ? m.adjust : 0));
}

export function ahorroVsCredito(base: number, paymentId: string): number {
  const credito = base * 1.22;
  const actual = priceFor(base, paymentId);
  return Math.round((1 - actual / credito) * 100);
}
