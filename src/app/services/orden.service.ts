import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface OrdenServicio {
  id?: number;
  fechaIngreso: string;
  fechaEntrega?: string;
  estado: string;
  costoManoObra?: number;
  cliente?: any;
  tecnico?: any;
  equipo?: any;
}

@Injectable({
  providedIn: 'root'
})
export class OrdenService {
  private apiUrl = `${environment.apiUrl}/ordenes`;

  constructor(private http: HttpClient) {}

  getOrdenes(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getOrdenesByCliente(clienteId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cliente/${clienteId}`);
  }

  getOrdenesByTecnico(tecnicoId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tecnico/${tecnicoId}`);
  }

  getFacturaByOrden(ordenId: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/facturas/orden/${ordenId}`);
  }

  pagarFactura(facturaId: number): Observable<any> {
    return this.http.post(`${environment.apiUrl}/facturas/${facturaId}/pagar`, {});
  }

  getOrden(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  crear(orden: OrdenServicio): Observable<OrdenServicio> {
    return this.http.post<OrdenServicio>(this.apiUrl, orden);
  }

  actualizar(id: number, orden: OrdenServicio): Observable<OrdenServicio> {
    return this.http.put<OrdenServicio>(`${this.apiUrl}/${id}`, orden);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  actualizarEstado(id: number, estado: string, observacion: string = 'Cambio de estado desde panel', costoManoObra?: number): Observable<any> {
    const body: any = { observacion };
    if (costoManoObra !== undefined) {
      body.costoManoObra = costoManoObra;
    }
    return this.http.put(`${this.apiUrl}/${id}/estado?estado=${estado}`, body);
  }

}
