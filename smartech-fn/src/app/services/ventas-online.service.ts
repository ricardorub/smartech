import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VentasOnlineService {
  private baseUrl = 'http://localhost:8080/api/ventas-online';

  constructor(private http: HttpClient) {}

  listarPedidosOnline(params: any): Observable<any> {
    let httpParams = new HttpParams();

    Object.keys(params).forEach((key) => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        httpParams = httpParams.set(key, params[key]);
      }
    });

    return this.http.get<any>(`${this.baseUrl}/listar`, { params: httpParams });
  }

  obtenerDetallePedido(idPedido: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/detalle/${idPedido}`);
  }

  anularVenta(idPedido: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/anular/${idPedido}`, {});
  }

  generarComprobante(idPedido: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/comprobante/${idPedido}`);
  }

  aprobarPago(idPedido: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/aprobar-pago/${idPedido}`, {});
  }

  listarTiendas(): Observable<any> {
    return this.http.get<any>('http://localhost:8080/api/tiendas');
  }

  actualizarEstadoPago(idPedido: number, estadoPago: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/actualizar-estado-pago`, {
      idPedido,
      estadoPago,
    });
  }

  actualizarEstado(idPedido: number, estado: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/actualizar-estado-pedido`, {
      idPedido,
      estado,
    });
  }

  guardarObservacion(idPedido: number, observacion: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/observacion/${idPedido}`, { observacion });
  }

  asignarPedidoEmpleado(idPedido: number, idEmpleado: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/asignar-empleado/${idPedido}`, {
      idEmpleado,
    });
  }
}
