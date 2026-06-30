import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientesAdminService {

  private baseUrl = 'http://localhost:8080/api/private/clientes-admin';

  constructor(private http: HttpClient) {}

  /** ===========================
   *  LISTAR CLIENTES (ASC / DESC)
   *  =========================== */
  listarClientes(params?: any): Observable<any> {

    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }

    return this.http.get<any>(`${this.baseUrl}`, { params: httpParams });
  }

  /** ===========================
   *  ESTADÍSTICAS DEL CLIENTE
   *  =========================== */
  obtenerEstadisticas(idCliente: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${idCliente}/estadisticas`);
  }

  /** ===========================
   *  DIRECCIONES DEL CLIENTE
   *  =========================== */
  obtenerDirecciones(idCliente: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${idCliente}/direcciones`);
  }

  /** ====================================
   *  HISTORIAL DE COMPRAS ONLINE DEL CLIENTE
   *  ==================================== */
  obtenerComprasOnline(idCliente: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${idCliente}/compras-online`);
  }
}
