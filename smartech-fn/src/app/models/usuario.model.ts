export interface Persona {
  idPersona: number;
  nombres: string;
  apellidos: string;
  dni: string;
  correo: string;
  telefono: string;
  direccion: string;
}

export interface Tienda {
  idTienda: number;
  nombre: string;
}

export interface UsuarioInterno {
  idUsuarioInterno: number;
  usuario: string;
  rolUsuario: string;
  activo: Number; 
  contrasenaUsuario?: string;
  persona: Persona;
  tienda: Tienda;
}
