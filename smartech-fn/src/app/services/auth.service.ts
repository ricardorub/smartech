import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
export type UserType = 'CLIENTE' | 'ADMIN' | 'EMPLEADO';


export interface RegisterClienteDTO {
  nombres_cliente: string;
  apellidos_cliente: string;
  tipoDocumento_cliente: string;
  numeroDocumento_cliente: string;
  correo_cliente: string;
  telefono_cliente: string;
  direccion_cliente: string;
}


export interface LoginClienteDTO {
  email: string;
  password: string;
}


export interface LoginAdminDTO {
  usuario: string;
  password: string;
}


export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface RegisterResponse {
  tempPassword: string;
  requirePasswordChange: boolean;
}

export interface LoginResponse {
  idCliente?: number;
  direccionCliente?: string;
  idEmpleado?: number;
  tienda?: {
    idTienda: number;
    nombre: string;
  };
  token?: string;
  requirePasswordChange?: boolean;
  nombreCompleto?: string;
  tipo?: 'CLIENTE' | 'INVITADO' | 'ADMIN' | 'EMPLEADO';
}


export interface TempPasswordResponse {
  tempPassword: string;
  requirePasswordChange: boolean;
}

export interface ChangePasswordDTO {
  email: string;
  tempPassword: string;
  newPassword: string;
}

export interface ValidarCorreoResponse {
  success: boolean;
  message?: string;
  data?: {
    tipo: 'cliente' | 'invitado' | 'nuevo';
    cliente?: any;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = '/api/auth';

  constructor(private http: HttpClient) {}

  registrarCliente(dto: RegisterClienteDTO) {
    return this.http.post<ApiResponse<RegisterResponse>>(
      `${this.base}/clientes/register`,
      dto
    );
  }

  generarPasswordParaInvitado(correo: string) {
    return this.http.post<ApiResponse<TempPasswordResponse>>(
      `${this.base}/clientes/guest-to-user`,
      { correo }
    );
  }

  loginCliente(dto: LoginClienteDTO) {
    return this.http.post<ApiResponse<LoginResponse>>(
      `${this.base}/clientes/login`,
      dto
    );
  }

  loginAdmin(dto: LoginAdminDTO) {
    return this.http.post<ApiResponse<LoginResponse>>(
      `${this.base}/admin/login`,
      dto
    );
  }

  cambiarPassword(dto: ChangePasswordDTO) {
    return this.http.post<ApiResponse>(
      `${this.base}/clientes/change-password`,
      dto
    );
  }

  validarCorreoCheckout(correo: string) {
    return this.http.post<ValidarCorreoResponse>(
      `${this.base}/validar-correo`,
      { correo }
    );
  }
}
