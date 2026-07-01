import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface ApiResponse {
  success: boolean;
  message: string;
  data: any;
}

@Injectable({
  providedIn: 'root',
})
export class InventarioService {
  private baseUrl = '/api/private/inventario';

  constructor(private http: HttpClient) {}

  listarTodos(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.baseUrl}`);
  }

  listarPorTienda(idTienda: number): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.baseUrl}/tienda/${idTienda}`);
  }

  productosSinInventario(idTienda: number): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.baseUrl}/sin-inventario/${idTienda}`);
  }

  registrarInventario(payload: {
    idProducto: number;
    idTienda: number;
    cantidad: number;
    stockMinimo: number;
  }): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}`, payload);
  }

  registrarMovimiento(payload: {
    idInventario: number;
    tipoMovimiento: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
    cantidad: number;
    motivo: string;
  }): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/movimiento`, payload);
  }

  listarMovimientos(idInventario: number): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.baseUrl}/movimientos/${idInventario}`);
  }
}
