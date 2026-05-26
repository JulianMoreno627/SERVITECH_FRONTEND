import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginResponse, Rol } from '../models/auth.model';

type LoginCredentials = {
  usuario?: string;
  contrasena?: string;
  username?: string;
  password?: string;
  email?: string;
};

type RegisterPayload = {
  nombre?: string;
  email?: string;
  direccion?: string;
  telefono?: string;
  usuario?: string;
  contrasena?: string;
  rol?: string;
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    const payload = this.buildLoginPayload(credentials);

    return this.http.post<unknown>(`${this.apiUrl}/login`, payload).pipe(
      map((raw) => this.normalizeLoginResponse(raw)),
      tap((res) => this.persistLogin(res))
    );
  }

  register(userData: RegisterPayload): Observable<unknown> {
    const payload = this.buildRegisterPayload(userData);
    return this.http.post(`${this.apiUrl}/register`, payload);
  }

  logout(): void {
    localStorage.clear();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRol(): Rol | null {
    return localStorage.getItem('rol') as Rol;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private buildLoginPayload(credentials: LoginCredentials): Record<string, unknown> {
    const usuario = (credentials.usuario ?? credentials.username ?? credentials.email ?? '').trim();
    const contrasena = (credentials.contrasena ?? credentials.password ?? '').trim();

    return {
      usuario,
      contrasena,
      username: usuario,
      email: usuario,
      password: contrasena
    };
  }

  private buildRegisterPayload(userData: RegisterPayload): Record<string, unknown> {
    const nombre = (userData.nombre ?? '').trim();
    const email = (userData.email ?? '').trim();
    const direccion = (userData.direccion ?? '').trim();
    const telefono = (userData.telefono ?? '').trim();
    const usuario = (userData.usuario ?? '').trim();
    const contrasena = (userData.contrasena ?? '').trim();
    const rol = (userData.rol ?? 'CLIENTE').trim();

    return {
      nombre,
      email,
      direccion,
      telefono,
      usuario,
      contrasena,
      rol,
      fullName: nombre,
      nombreCompleto: nombre,
      username: usuario,
      password: contrasena,
      role: rol
    };
  }

  private normalizeLoginResponse(raw: unknown): LoginResponse {
    const obj = (raw ?? {}) as any;
    const token = String(obj.token ?? obj.accessToken ?? obj.jwt ?? obj.access_token ?? '');
    if (!token || token === 'undefined' || token === 'null') {
      throw new Error('Respuesta de login sin token');
    }

    const refreshToken = String(obj.refreshToken ?? obj.refresh_token ?? obj.refresh ?? '');
    const usuario = String(obj.usuario ?? obj.username ?? obj.user?.usuario ?? obj.user?.username ?? obj.email ?? obj.user?.email ?? '');
    const id = Number(obj.id ?? obj.userId ?? obj.user?.id ?? 0);
    const rol = this.normalizeRol(
      obj.rol ??
        obj.role ??
        obj.user?.rol ??
        obj.user?.role ??
        (Array.isArray(obj.roles) ? obj.roles[0] : undefined) ??
        (Array.isArray(obj.authorities) ? obj.authorities[0] : undefined)
    );

    return { token, refreshToken, usuario, rol, id };
  }

  private normalizeRol(value: unknown): Rol {
    const raw = String(value ?? '').toUpperCase();
    if (raw.includes('ADMIN')) return Rol.ADMIN;
    if (raw.includes('TECNICO')) return Rol.TECNICO;
    return Rol.CLIENTE;
  }

  private persistLogin(res: LoginResponse): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('usuario');
    localStorage.removeItem('rol');
    localStorage.removeItem('userId');

    localStorage.setItem('token', res.token);
    localStorage.setItem('refreshToken', res.refreshToken ?? '');
    localStorage.setItem('usuario', res.usuario ?? '');
    localStorage.setItem('rol', res.rol ?? Rol.CLIENTE);
    localStorage.setItem('userId', String(res.id ?? ''));
  }
}
