export interface Opcion {
  id: number;
  nombre: string;
  ruta?: string;
  icono?: string;
  hijos?: Opcion[];
}
