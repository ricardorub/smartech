import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Tienda {
  idTienda: number;
  nombre: string;
  direccion: string;
  distrito: string;
}

@Injectable({
  providedIn: 'root'
})
export class TiendaService {

  private apiUrl = '/api/tiendas';

  constructor(private http: HttpClient) {}

  listarTiendas(): Observable<Tienda[]> {
    return this.http.get<Tienda[]>(this.apiUrl);
  }
}
