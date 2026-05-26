export enum Rol {
  ADMIN = 'ADMIN',
  TECNICO = 'TECNICO',
  CLIENTE = 'CLIENTE'
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  usuario: string;
  rol: Rol;
  id: number;
}
