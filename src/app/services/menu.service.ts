import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Opcion } from '../models/opcion.model';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private apiUrl = `${environment.apiUrl}/menu`;

  constructor(private http: HttpClient) {}

  getMenu(): Observable<Opcion[]> {
    return this.http.get<Opcion[]>(this.apiUrl);
  }
}
