export interface Property {
  id?: string;
  titulo: string;
  descripcion: string;
  ubicacion: string;
  precioPorNoche: number;
  moneda: string;
  imagenes: string[];
  caracteristicas: string[];
  estado: string;
  ownerId: string;
}