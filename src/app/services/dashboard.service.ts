import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getEstadisticas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/estadisticas`);
  }

  getOrdenesActivas(clienteId?: number): Observable<any[]> {
    const url = clienteId ? `${this.apiUrl}/ordenes-activas?clienteId=${clienteId}` : `${this.apiUrl}/ordenes-activas`;
    return this.http.get<any[]>(url);
  }
}
