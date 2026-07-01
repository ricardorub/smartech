import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PagoDto {
  metodo_pago: string;
  moneda: string;
  monto: number;
  observaciones?: string;
  referencia_transaccion?: string;
  vencimiento?: string;
  cvv?: string;
  numero_tarjeta?: string;
}

export interface ComprobanteDto {
  tipo: string;
  numero_documento: string;
  razon_social: string;
}

export interface VentaTiendaRequest {
  tiendaId: number;
  empleadoId: number;
  clienteId?: number;
  observaciones?: string;
  productos: {
    productoId: number;
    cantidad: number;
    precioUnitario: number;
    descuento?: number;
  }[];
}

export interface VentaCompletaRequest {
  venta: VentaTiendaRequest;
  pago: PagoDto;
  comprobante: ComprobanteDto;
}

@Injectable({
  providedIn: 'root',
})
export class VentasTiendaService {
  private baseUrl = '/api/ventas-tienda';

  constructor(private http: HttpClient) {}

  listarVentas(params: any): Observable<any> {
    let httpParams = new HttpParams();

    Object.keys(params).forEach((key) => {
      if (params[key] !== null && params[key] !== undefined) {
        httpParams = httpParams.set(key, params[key]);
      }
    });

    return this.http.get<any>(`${this.baseUrl}/listar`, { params: httpParams });
  }

  obtenerDetalleVenta(idPedido: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/detalle/${idPedido}`);
  }

  registrarVentaCompleta(data: VentaCompletaRequest): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/registrar-completa`, data);
  }

  anularVenta(idPedido: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/anular/${idPedido}`, {});
  }

  generarComprobante(idPedido: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/comprobante/${idPedido}`);
  }
}
