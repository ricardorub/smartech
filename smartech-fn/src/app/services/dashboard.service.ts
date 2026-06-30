import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  KpiResponse,
  VentaDiaDTO,
  EstadoPedidoDTO,
  TopProductoDTO,
  TopClienteDTO,
} from '../pagina/admin/dashboard/dashboard';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private apiUrl = 'http://localhost:8080/api/dashboard';

  constructor(private http: HttpClient) {}

  obtenerKpis(): Observable<KpiResponse> {
    return this.http.get<KpiResponse>(`${this.apiUrl}/kpis`);
  }

  obtenerVentasUltimos7Dias(): Observable<VentaDiaDTO[]> {
    return this.http.get<VentaDiaDTO[]>(`${this.apiUrl}/ventas-7-dias`);
  }

  obtenerPedidosPorEstado(): Observable<EstadoPedidoDTO[]> {
    return this.http.get<EstadoPedidoDTO[]>(`${this.apiUrl}/pedidos-estado`);
  }

  obtenerTopProductos(): Observable<TopProductoDTO[]> {
    return this.http.get<TopProductoDTO[]>(`${this.apiUrl}/top-productos`);
  }

  obtenerTopClientes(): Observable<TopClienteDTO[]> {
    return this.http.get<TopClienteDTO[]>(`${this.apiUrl}/top-clientes`);
  }
}
