import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../../services/usuario.service';
import { UsuarioInterno } from '../../../models/usuario.model';
import { TiendaService } from '../../../services/tienda.service';
import { UsuarioModalAdminComponent } from './usuario-modal-admin/usuario-modal-admin';
import { EstadisticaModalAdminComponent } from './estadistica-modal-admin/estadistica-modal-admin';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  templateUrl: './gestion-usuarios.html',
  styleUrls: ['./gestion-usuarios.css'],
  imports: [CommonModule, FormsModule, UsuarioModalAdminComponent,EstadisticaModalAdminComponent],
})
export class GestionUsuariosComponent implements OnInit {
  usuarios: UsuarioInterno[] = [];
  tiendas: { idTienda: number; nombre: string }[] = [];

  roles: string[] = ['ADMIN', 'EMPLEADO', 'ALMACENERO'];

  filtroNombre = '';
  filtroRol = '';
  filtroTienda: number | null = null;

  pagina = 1;
  pageSize = 10;
  totalPaginas = 1;
  totalPaginasArray: number[] = [];

  modalCrear = false;
  modalEditar = false;
  usuarioSeleccionado: UsuarioInterno | null = null;

  modalEstadisticasVisible = false;

  constructor(private usuarioService: UsuarioService, private tiendaService: TiendaService) {}

  ngOnInit(): void {
    this.cargarTiendas();
    this.buscarUsuarios();
  }

  cargarTiendas() {
    this.tiendaService.listarTiendas().subscribe((r) => {
      this.tiendas = r;
    });
  }

  buscarUsuarios() {
    const params: any = {
      page: this.pagina - 1,
      size: this.pageSize,
    };

    if (this.filtroNombre && this.filtroNombre.trim() !== '') {
      params.nombre = this.filtroNombre;
    }

    if (this.filtroRol && this.filtroRol.trim() !== '') {
      params.rol = this.filtroRol;
    }

    if (this.filtroTienda !== null) {
      params.tienda = this.filtroTienda;
    }

    this.usuarioService.listarUsuarios(params).subscribe((data) => {
      this.usuarios = data.content;
      this.totalPaginas = data.totalPages;
      this.totalPaginasArray = Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
    });
  }

  abrirModalCrear() {
    this.usuarioSeleccionado = null;
    this.modalCrear = true;
  }

  abrirModalEditar(usuario: UsuarioInterno) {
    this.usuarioSeleccionado = usuario;
    this.modalEditar = true;
  }

  cerrarModales() {
    this.modalCrear = false;
    this.modalEditar = false;
    this.buscarUsuarios(); 
  }

  cambiarEstado(id: number) {
    Swal.fire({
      title: '¿Cambiar estado del usuario?',
      text: 'Este cambio afectará su acceso al sistema.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.usuarioService.cambiarEstado(id).subscribe({
          next: () => {
            Swal.fire({
              title: 'Estado actualizado',
              text: 'El estado del usuario se cambió correctamente.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false,
            });

            this.buscarUsuarios();
          },
          error: () => {
            Swal.fire({
              title: 'Error',
              text: 'No se pudo cambiar el estado. Intenta nuevamente.',
              icon: 'error',
            });
          },
        });
      }
    });
  }
  verEstadisticas(usuario: UsuarioInterno) {
    this.usuarioSeleccionado = usuario;
    this.modalEstadisticasVisible = true;
  }
  cerrarModalEstadisticas() {
    this.modalEstadisticasVisible = false;
  }
}
