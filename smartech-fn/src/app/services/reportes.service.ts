import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {

  private apiUrl = '/api/reportes';

  constructor(private http: HttpClient) {}

  obtenerReporte(
    tipoReporte: string,
    fechaInicio: string,
    fechaFin: string,
    tienda: string | null
  ): Observable<any[]> {

    let params = new HttpParams()
      .set('tipo', tipoReporte)
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);

    if (tienda && tienda !== '') {
      params = params.set('tienda', tienda);
    }

    return this.http.get<any[]>(`${this.apiUrl}/generar`, { params });
  }
}
