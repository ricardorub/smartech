import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../../../services/usuario.service';
import { UsuarioInterno } from '../../../../models/usuario.model';
import { TiendaService } from '../../../../services/tienda.service';

import Swal from 'sweetalert2';   

@Component({
  selector: 'app-usuario-modal-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuario-modal-admin.html',
  styleUrls: ['./usuario-modal-admin.css']
})
export class UsuarioModalAdminComponent implements OnInit {

  @Input() usuarioEditar: UsuarioInterno | null = null;
  @Output() guardado = new EventEmitter<void>();

  titulo = "Registrar Usuario";

  tiendas: any[] = [];
  roles: string[] = ["ADMIN", "EMPLEADO", "ALMACENERO"];

  formulario: any = {
    usuario: "",
    contrasenaUsuario: "",
    rolUsuario: "",

    nombres: "",
    apellidos: "",
    dni: "",
    correo: "",
    telefono: "",
    direccion: "",

    idTienda: null
  };

  constructor(
    private usuarioService: UsuarioService,
    private tiendaService: TiendaService
  ) {}

  ngOnInit(): void {
    this.cargarTiendas();

    if (this.usuarioEditar) {
      this.titulo = "Editar Usuario";
      this.cargarDatosEditar();
    }
  }

  cargarTiendas() {
    this.tiendaService.listarTiendas().subscribe(resp => {
      this.tiendas = resp;
    });
  }

  cargarDatosEditar() {
    const u = this.usuarioEditar!;
    this.formulario = {
      usuario: u.usuario,
      contrasenaUsuario: "",
      rolUsuario: u.rolUsuario,

      nombres: u.persona.nombres,
      apellidos: u.persona.apellidos,
      dni: u.persona.dni,
      correo: u.persona.correo,
      telefono: u.persona.telefono,
      direccion: u.persona.direccion,

      idTienda: u.tienda.idTienda
    };
  }

  guardar() {
    this.formulario.idTienda = Number(this.formulario.idTienda);
    if (this.usuarioEditar) {
      this.usuarioService.actualizarUsuario(this.usuarioEditar.idUsuarioInterno, this.formulario)
        .subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Usuario actualizado',
              text: 'Los datos del usuario fueron actualizados correctamente.',
              confirmButtonColor: '#0d6efd'
            });
            this.guardado.emit();
          },
          error: () => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo actualizar el usuario.',
              confirmButtonColor: '#dc3545'
            });
          }
        });
    } else {
      this.usuarioService.crearUsuario(this.formulario)
        .subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Usuario registrado',
              text: 'El usuario fue registrado correctamente.',
              confirmButtonColor: '#0d6efd'
            });
            this.guardado.emit();
          },
          error: () => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo registrar el usuario.',
              confirmButtonColor: '#dc3545'
            });
          }
        });
    }
  }

}
