import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ClienteService } from '../../services/cliente.service';
import { SessionService, UsuarioSesion } from '../../services/session.service';
import { DetallePedidoClienteModalComponent } from '../../componente/detalle-pedido-cliente-modal/detalle-pedido-cliente-modal';

declare var bootstrap: any;

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DetallePedidoClienteModalComponent],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css'],
})
export class PerfilComponent implements OnInit {
  perfilForm!: FormGroup;
  passwordForm!: FormGroup;

  @ViewChild(DetallePedidoClienteModalComponent)
  modal!: DetallePedidoClienteModalComponent;

  activeTab: 'perfil' | 'password' | 'pedidos' = 'perfil';

  currentUser: UsuarioSesion | null = null;

  pedidos: any[] = [];
  paginaActual = 1;
  itemsPorPagina = 5;
  totalPaginas = 0;
  paginasArray: number[] = [];
  pedidoSeleccionado: any = null;

  loading = false;
  successMessage = '';
  errorMessage = '';

  showCurrent = false;
  showNew = false;
  showConfirm = false;

  constructor(
    private fb: FormBuilder,
    private clienteService: ClienteService,
    private session: SessionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.session.usuarioActual;

    if (!user || user.tipo !== 'CLIENTE') {
      this.router.navigate(['/']);
      return;
    }

    this.currentUser = user as UsuarioSesion;

    this.perfilForm = this.fb.group({
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      correo: [{ value: '', disabled: true }],
      telefono: ['', Validators.pattern(/^\d{9}$/)],
      direccion: ['', Validators.required],
    });

    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: [this.match('newPassword', 'confirmPassword')] }
    );

    this.cargarPerfil();
  }

  private match(source: string, target: string) {
    return (group: FormGroup) => {
      const pass = group.get(source);
      const confirm = group.get(target);

      if (!pass || !confirm) return null;

      if (confirm.errors && !confirm.errors['mismatch']) return null;

      if (pass.value !== confirm.value) {
        confirm.setErrors({ mismatch: true });
      } else {
        confirm.setErrors(null);
      }
      return null;
    };
  }

  switchTab(tab: any) {
    this.activeTab = tab;
    if (tab === 'pedidos') this.obtenerPedidosCliente();
  }

  cargarPerfil() {
    if (!this.currentUser) return;

    this.clienteService.obtenerPerfil(this.currentUser.idCliente!).subscribe({
      next: (res) => {
        if (!res.success) return;

        const c = res.data!;
        this.perfilForm.patchValue({
          nombres: c.nombres,
          apellidos: c.apellidos,
          correo: c.correo,
          telefono: c.telefono,
          direccion: c.direccion,
        });
      },
      error: () => (this.errorMessage = 'No se pudieron cargar los datos'),
    });
  }

  onUpdatePerfil() {
    if (!this.currentUser || this.perfilForm.invalid) return;

    const formData = this.perfilForm.getRawValue();

    const updateData = {
      idCliente: this.currentUser.idCliente,
      nombres: formData.nombres,
      apellidos: formData.apellidos,
      correo: formData.correo,
      telefono: formData.telefono,
      direccion: formData.direccion,
    };

    this.clienteService.actualizarPerfil(updateData).subscribe({
      next: () => {
        this.successMessage = 'Datos actualizados correctamente';
        setTimeout(() => (this.successMessage = ''), 3000);

        const nuevoNombreCompleto = `${updateData.nombres} ${updateData.apellidos}`;

        this.session.iniciarSesion({
          ...this.currentUser!,
          nombreCompleto: nuevoNombreCompleto,
        });

        this.currentUser = this.session.usuarioActual as UsuarioSesion;
      },
      error: () => {
        this.errorMessage = 'No se pudo actualizar el perfil';
        setTimeout(() => (this.errorMessage = ''), 3000);
      },
    });
  }

  onChangePassword() {
    if (!this.currentUser) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const dto = {
      idCliente: this.currentUser.idCliente,
      passwordActual: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword,
    };

    this.clienteService.cambiarPassword(dto).subscribe({
      next: (res) => {
        this.loading = false;

        if (res.success) {
          this.successMessage = 'Contraseña actualizada correctamente';
          this.passwordForm.reset();
          this.passwordForm.markAsPristine();
          this.passwordForm.markAsUntouched();

          setTimeout(() => (this.successMessage = ''), 3000);
        } else {
          this.errorMessage = res.message || 'No se pudo cambiar la contraseña';
          setTimeout(() => (this.errorMessage = ''), 3000);
        }
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'No se pudo cambiar la contraseña';
        setTimeout(() => (this.errorMessage = ''), 3000);
      },
    });
  }
  obtenerPedidosCliente() {
    if (!this.currentUser) return;

    this.clienteService.obtenerPedidosCliente(this.currentUser.idCliente!).subscribe({
      next: (res) => {
        this.pedidos = res.data || [];
        this.configurarPaginacion();
      },
      error: () => (this.errorMessage = 'No se pudo cargar los pedidos'),
    });
  }

  get pedidosPaginados() {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.pedidos.slice(inicio, fin);
  }

  configurarPaginacion() {
    this.totalPaginas = Math.ceil(this.pedidos.length / this.itemsPorPagina);
    this.paginasArray = Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  logout() {
    this.session.cerrarSesion();
    this.router.navigate(['/']);
  }

  verDetallePedido(idPedido: number) {
    this.clienteService.obtenerDetallePedido(idPedido).subscribe({
      next: (res) => {
        this.pedidoSeleccionado = res.data;

        setTimeout(() => {
          const modalEl = document.getElementById('detallePedidoModal');

          if (modalEl) {
            const modal = new bootstrap.Modal(modalEl, {
              backdrop: true,
              keyboard: true,
            });
            modal.show();
          }
        });
      },
      error: () => console.error('Error cargando detalle del pedido'),
    });
  }
}
