import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface UsuarioSesion {
  idCliente?: number;
  nombreCompleto: string;
  tipo: 'CLIENTE' | 'INVITADO';
  token?: string;
  direccionCliente?: string;
}

export interface UsuarioAdminEmpleado {
  idEmpleado: number;
  nombreCompleto: string;
  tipo: 'ADMIN' | 'EMPLEADO';
  token: string;
  tienda?: {
    idTienda: number;
    nombre: string;
  };
}

@Injectable({ providedIn: 'root' })
export class SessionService {
  private _usuarioActual = new BehaviorSubject<UsuarioSesion | UsuarioAdminEmpleado | null>(null);
  usuarioActual$ = this._usuarioActual.asObservable();

  constructor() {
    try {
      const guardado = localStorage.getItem('usuarioActual');
      if (guardado) {
        this._usuarioActual.next(JSON.parse(guardado));
      }
    } catch (error) {
      console.warn('Error al leer sesión desde localStorage:', error);
    }
  }

  iniciarSesion(usuario: UsuarioSesion | UsuarioAdminEmpleado) {
    this._usuarioActual.next(usuario);
    localStorage.setItem('usuarioActual', JSON.stringify(usuario));
  }

  cerrarSesion() {
    this._usuarioActual.next(null);
    localStorage.removeItem('usuarioActual');
  }

  get usuarioActual(): UsuarioSesion | UsuarioAdminEmpleado | null {
    return this._usuarioActual.value;
  }

  get esAdmin(): boolean {
    return this._usuarioActual.value?.tipo === 'ADMIN';
  }

  get esEmpleado(): boolean {
    return this._usuarioActual.value?.tipo === 'EMPLEADO';
  }

  get esCliente(): boolean {
    return this._usuarioActual.value?.tipo === 'CLIENTE';
  }

  get esInvitado(): boolean {
    return this._usuarioActual.value?.tipo === 'INVITADO';
  }

  get estaAutenticado(): boolean {
    return !!this._usuarioActual.value;
  }
  get idCliente(): number | undefined {
    if (
      this._usuarioActual.value &&
      (this._usuarioActual.value.tipo === 'CLIENTE' ||
        this._usuarioActual.value.tipo === 'INVITADO')
    ) {
      return (this._usuarioActual.value as UsuarioSesion).idCliente;
    }
    return undefined;
  }

  get idEmpleado(): number | undefined {
    if (
      this._usuarioActual.value &&
      (this._usuarioActual.value.tipo === 'ADMIN' || this._usuarioActual.value.tipo === 'EMPLEADO')
    ) {
      return (this._usuarioActual.value as UsuarioAdminEmpleado).idEmpleado;
    }
    return undefined;
  }

  get tiendaEmpleado() {
    if (this.esAdmin || this.esEmpleado) {
      return (this._usuarioActual.value as UsuarioAdminEmpleado)?.tienda;
    }
    return null;
  }
}
