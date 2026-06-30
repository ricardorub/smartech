import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface ClientePerfil {
  idCliente: number;
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string;
  direccion: string;
}

export interface InvitadoDTO {
  correoCliente: string;
  nombreCliente: string;
  apellidoCliente: string;
  telefonoCliente?: string;
  direccionCliente?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ClienteService {
  private base = 'http://localhost:8080/api/private/cliente';

  constructor(private http: HttpClient) {}

  obtenerPerfil(idCliente: number) {
    return this.http.get<ApiResponse<ClientePerfil>>(`${this.base}/${idCliente}/perfil`);
  }

  actualizarPerfil(dto: any) {
    return this.http.put<ApiResponse>(`${this.base}/perfil`, dto);
  }

  cambiarPassword(dto: any) {
    return this.http.put<ApiResponse>(`${this.base}/cambiar-password`, dto);
  }

  obtenerPedidosCliente(idCliente: number) {
    return this.http.get<ApiResponse>(`${this.base}/${idCliente}/pedidos`);
  }

  upsertInvitado(dto: InvitadoDTO): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.base}/invitado`, dto);
  }

  obtenerDetallePedido(idPedido: number) {
    return this.http.get<ApiResponse>(`${this.base}/${idPedido}/detalle`);
  }

}
