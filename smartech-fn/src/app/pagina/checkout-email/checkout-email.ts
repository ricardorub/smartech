// src/app/pagina/checkout-email/checkout-email.ts
import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SessionService, UsuarioSesion } from '../../services/session.service';
import { UsuarioModalComponent } from '../../componente/usuario-modal/usuario-modal';
import { InvitadoModalComponent } from '../../componente/invitado-modal/invitado-modal';

declare const Swal: any;

@Component({
  selector: 'app-checkout-email',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UsuarioModalComponent, InvitadoModalComponent],
  templateUrl: './checkout-email.html',
  styleUrls: ['./checkout-email.css'],
})
export class CheckoutEmailComponent {
  form: FormGroup;

  showUserModal = false;
  showGuestModal = false;
  presetEmail = '';
  lockEmail = false;
  userModalMode: 'login' | 'register' = 'login';

  guestData: UsuarioSesion | null = null;

  loading = false;
  errorMessage = '';

  @ViewChild(UsuarioModalComponent) userModal?: UsuarioModalComponent;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private session: SessionService,
    private router: Router
  ) {
    this.form = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {
    if (this.session.estaAutenticado && this.session.esCliente) {
      this.router.navigate(['/checkout/entrega']);
    }
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    const correo = this.form.value.correo;

    this.auth.validarCorreoCheckout(correo).subscribe({
      next: (response) => {
        this.loading = false;

        const data = response.data;

        if (!response.success || !data) {
          this.showError(response.message || 'No se pudo validar el correo');
          return;
        }

        const tipo = data.tipo;
        const cliente = data.cliente ?? null;

        switch (tipo) {
          case 'cliente':
            if (!this.session.esCliente) {
              this.openUserModal('login', correo, true);
            } else {
              this.goEntrega();
            }
            break;

          case 'invitado':
            this.askGuestOrRegister(correo, cliente);
            break;

          case 'nuevo':
            this.askNewUserPath(correo);
            break;
        }
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
        this.showError('Error al validar el correo.');
      },
    });
  }

  openUserModal(mode: 'login' | 'register', email?: string, lock = false) {
    this.userModalMode = mode;
    this.presetEmail = email ?? '';
    this.lockEmail = lock;
    this.showUserModal = true;

    setTimeout(() => {
      if (!this.userModal) return;

      this.userModal.mode = mode;
      this.userModal.presetEmail = email ?? null;
      this.userModal.lockEmail = lock;

      if (mode === 'register') {
        this.userModal.switchMode('register');
        this.userModal.registerForm.patchValue({ correo_cliente: email });
        if (lock) this.userModal.registerForm.get('correo_cliente')?.disable();
      } else {
        this.userModal.iniciarEnLogin();
      }
    });
  }

  cerrarUserModal = () => {
    this.showUserModal = false;
  };

  private async askNewUserPath(correo: string) {
    const r = await Swal.fire({
      icon: 'question',
      title: '¿Cómo deseas continuar?',
      html: `El correo <b>${correo}</b> no tiene cuenta registrada.`,
      showCancelButton: true,
      confirmButtonText: 'Comprar como invitado',
      cancelButtonText: 'Registrarme',
    });

    if (r.isConfirmed) {
      this.guestData = {
        idCliente: undefined,
        nombreCompleto: '',
        tipo: 'INVITADO',
        token: '',
        direccionCliente: '',
      };
      this.showGuestModal = true;
    } else {
      this.openUserModal('register', correo, true);
    }
  }

  private async askGuestOrRegister(correo: string, cliente: any) {
    const r = await Swal.fire({
      icon: 'question',
      title: 'Compra como invitado detectada',
      html: `El correo <b>${correo}</b> ya existe como invitado.`,
      showCancelButton: true,
      confirmButtonText: 'Seguir como invitado',
      cancelButtonText: 'Crear cuenta',
    });

    if (r.isConfirmed) {
      // ✔ Tipado exacto como UsuarioSesion
      this.session.iniciarSesion({
        idCliente: cliente?.idCliente,
        nombreCompleto: `${cliente?.nombreCliente} ${cliente?.apellidoCliente}`,
        tipo: 'INVITADO',
        token: '',
        direccionCliente: cliente?.direccionCliente || '',
      } as UsuarioSesion);

      this.goEntrega();
      return;
    }

    this.auth.generarPasswordParaInvitado(correo).subscribe({
      next: (res) => {
        if (!res.success || !res.data) {
          Swal.fire('Error', res.message || 'No se pudo generar contraseña', 'error');
          return;
        }

        const tempPassword = res.data.tempPassword;

        Swal.fire({
          icon: 'success',
          title: 'Cuenta creada ',
          html: `
            Tu contraseña generada es:<br>
            <b style="font-size: 20px; color:#007bff">${tempPassword}</b>
            <br><br>
            Úsala para iniciar sesión y podrás cambiarla luego desde tu perfil.
          `,
          confirmButtonText: 'Iniciar sesión',
        }).then(() => {
          this.openUserModal('login', correo, true);
        });
      },
      error: () => {
        Swal.fire('Error', 'Ocurrió un error, intenta nuevamente.', 'error');
      },
    });
  }

  onUserModalCerrado() {
    this.showUserModal = false;
    if (this.session.esCliente) this.goEntrega();
  }

  onGuestSaved() {
    this.showGuestModal = false;
    this.goEntrega();
  }

  private goEntrega() {
    this.router.navigate(['/checkout/entrega']);
  }

  private showError(msg: string) {
    this.errorMessage = msg;
    setTimeout(() => (this.errorMessage = ''), 3000);
  }
}
