export interface Sede {
  id: number;
  slug: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  email: string | null;
  descripcion: string | null;
  imagenUrl: string | null;
  fotos: string[];
  whatsappUrl: string | null;
  googleMapsUrl: string | null;
  precioPrueba: number | null;
  /**
   * Pixel de Meta propio de la sede (franquicias con su propia cuenta
   * publicitaria). null = usa el pixel general de la marca.
   */
  metaPixelId: string | null;
}

export interface Actividad {
  id: number;
  nombre: string;
  color: string;
  descripcion: string | null;
}

export interface Salon {
  id: number;
  nombre: string;
}

export interface Clase {
  id: number;
  inicio: string;
  actividad: Actividad;
  salon: Salon | null;
  instructor: string | null;
  cuposDisponibles: number;
}

export interface CheckoutPayload {
  claseId: number;
  sedeId: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  dni: string;
}

export interface CheckoutResponse {
  initPoint: string;
}

export interface CatalogoPrecios {
  efectivo: number | null;
  debito: number | null;
  tarjeta: number | null;
}

export interface CatalogoTipoPlan {
  id: number;
  nombre: string;
  descripcion: string | null;
  frecuencia: 'MENSUAL' | 'TRIMESTRAL';
  etiqueta: string;
  subtitulo: string;
  destacado: boolean;
  caracteristicas: string[];
  orden: number;
  precios: CatalogoPrecios;
}

export interface CatalogoSede {
  sedeId: number;
  sedeNombre: string;
  sedeSlug: string;
  tipos: CatalogoTipoPlan[];
}
