export interface HostPublicProfile {
  userId: string;
  fullName: string;
  bio: string;
  phone: string;
  city: string;
  avatarUrl: string;
  email: string;
}

export interface HostPropertyCreatePayload {
  titulo: string;
  descripcion: string;
  ubicacion: string;
  precioPorNoche: number;
  moneda: string;
  imagenes: string[];
  caracteristicas: string[];
}
