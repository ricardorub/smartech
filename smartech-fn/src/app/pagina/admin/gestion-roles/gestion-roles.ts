import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../../services/usuario.service';
import { UsuarioInterno } from '../../../models/usuario.model';
import { UsuarioModalAdminComponent } from '../gestion-usuarios/usuario-modal-admin/usuario-modal-admin';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gestion-roles',
  standalone: true,
  imports: [CommonModule, FormsModule, UsuarioModalAdminComponent],
  templateUrl: './gestion-roles.html',
  styleUrls: ['./gestion-roles.css']
})
export class GestionRolesComponent implements OnInit {
  usuarios: UsuarioInterno[] = [];
  usuariosFiltrados: UsuarioInterno[] = [];
  filtroNombre = '';
  modalCrearVisible = false;


  rolesDetails = [
    {
      name: 'ADMIN',
      title: 'Administrador',
      description: 'Control total del sistema: gestión de usuarios, productos, reportes y configuración.',
      colorClass: 'role-admin',
      icon: 'bi-shield-lock-fill',
      badgeClass: 'bg-secondary-subtle text-secondary'
    },
    {
      name: 'EMPLEADO',
      title: 'Empleado',
      description: 'Ventas en tienda física, emisión de boletas y consultas de inventario básico.',
      colorClass: 'role-empleado',
      icon: 'bi-person-badge-fill',
      badgeClass: 'bg-secondary-subtle text-secondary'
    },
    {
      name: 'ALMACENERO',
      title: 'Almacenero',
      description: 'Gestión y control de stock, ingresos, salidas y movimientos de productos.',
      colorClass: 'role-almacenero',
      icon: 'bi-box-seam-fill',
      badgeClass: 'bg-secondary-subtle text-secondary'
    }
  ];

  usersByRole: { [key: string]: UsuarioInterno[] } = {
    ADMIN: [],
    EMPLEADO: [],
    ALMACENERO: []
  };

  usuarioSeleccionado: UsuarioInterno | null = null;
  nuevoRolSeleccionado = '';
  modalAsignarVisible = false;

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.usuarioService.listarUsuarios({ size: 1000 }).subscribe({
      next: (data) => {
        this.usuarios = data.content;
        this.filtrarYAgrupar();
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los usuarios.'
        });
      }
    });
  }

  filtrarYAgrupar() {
    // Filtrar por nombre si se especifica
    if (this.filtroNombre && this.filtroNombre.trim() !== '') {
      const term = this.filtroNombre.toLowerCase();
      this.usuariosFiltrados = this.usuarios.filter(u => 
        u.usuario.toLowerCase().includes(term) ||
        `${u.persona.nombres} ${u.persona.apellidos}`.toLowerCase().includes(term)
      );
    } else {
      this.usuariosFiltrados = [...this.usuarios];
    }

    // Agrupar por rol
    this.usersByRole = {
      ADMIN: [],
      EMPLEADO: [],
      ALMACENERO: []
    };

    this.usuariosFiltrados.forEach(u => {
      const rol = u.rolUsuario;
      if (this.usersByRole[rol]) {
        this.usersByRole[rol].push(u);
      } else {
        // En caso de que haya algún rol no mapeado
        this.usersByRole[rol] = [u];
      }
    });
  }

  abrirModalAsignar(usuario: UsuarioInterno) {
    this.usuarioSeleccionado = usuario;
    this.nuevoRolSeleccionado = usuario.rolUsuario;
    this.modalAsignarVisible = true;
  }

  cerrarModalAsignar() {
    this.usuarioSeleccionado = null;
    this.nuevoRolSeleccionado = '';
    this.modalAsignarVisible = false;
  }

  guardarNuevoRol() {
    if (!this.usuarioSeleccionado || !this.nuevoRolSeleccionado) return;

    const u = this.usuarioSeleccionado;
    const payload = {
      usuario: u.usuario,
      contrasenaUsuario: '', // No se edita la contraseña
      rolUsuario: this.nuevoRolSeleccionado,
      nombres: u.persona.nombres,
      apellidos: u.persona.apellidos,
      dni: u.persona.dni,
      correo: u.persona.correo,
      telefono: u.persona.telefono || '',
      direccion: u.persona.direccion || '',
      idTienda: u.tienda.idTienda
    };

    this.usuarioService.actualizarUsuario(u.idUsuarioInterno, payload).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Rol Asignado',
          text: `Se cambió el rol de ${u.persona.nombres} a ${this.nuevoRolSeleccionado} exitosamente.`,
          confirmButtonColor: '#0d6efd'
        });
        this.cerrarModalAsignar();
        this.cargarUsuarios();
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo actualizar el rol del usuario.',
          confirmButtonColor: '#dc3545'
        });
      }
    });
  }

  abrirModalCrear() {
    this.modalCrearVisible = true;
  }

  cerrarModalCrear() {
    this.modalCrearVisible = false;
    this.cargarUsuarios();
  }
}
