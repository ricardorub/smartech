import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AuthService, UserType } from '../../services/auth.service';
import {
  SessionService,
  UsuarioSesion,
  UsuarioAdminEmpleado,
} from '../../services/session.service';
import { Router } from '@angular/router';

declare const Swal: any;

@Component({
  selector: 'app-usuario-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuario-modal.html',
  styleUrls: ['./usuario-modal.css'],
})
export class UsuarioModalComponent implements OnChanges {
  @Input() isVisible = false;
  @Output() cerrar = new EventEmitter<void>();

  @Input() mode: 'login' | 'register' | 'force-change' = 'login';
  @Input() presetEmail: string | null = null;
  @Input() lockEmail = false;
  @Input() fromCheckoutEmail = false;

  userType: UserType = 'CLIENTE';

  loading = false;
  errorMessage = '';
  successMessage = '';
  tempPasswordMessage = '';

  showPassword = false;

  loginForm: FormGroup;
  registerForm: FormGroup;
  changePassForm: FormGroup;

  private lastLoginEmail = '';
  private lastTempPassword = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private session: SessionService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(4)]],
    });

    this.registerForm = this.fb.group({
      nombres_cliente: ['', Validators.required],
      apellidos_cliente: ['', Validators.required],
      correo_cliente: ['', [Validators.required, Validators.email]],
      telefono_cliente: ['', Validators.pattern(/^\d{9}$/)],
      direccion_cliente: ['', Validators.required],

      tipoDocumento_cliente: ['', Validators.required],
      numeroDocumento_cliente: [
        '',
        [Validators.required, Validators.minLength(8), Validators.maxLength(12)],
      ],
    });

    this.changePassForm = this.fb.group(
      {
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordsMatch }
    );
  }

  public iniciarEnLogin() {
    this.mode = 'login';
    this.userType = 'CLIENTE';
    this.loginForm.reset();
    this.registerForm.reset({
      nombres_cliente: '',
      apellidos_cliente: '',
      correo_cliente: '',
      telefono_cliente: '',
      direccion_cliente: '',
      tipoDocumento_cliente: '',
      numeroDocumento_cliente: '',
    });

    this.changePassForm.reset();
    this.resetMessages();
  }

  closeModal() {
    this.isVisible = false;
    this.mode = 'login';
    this.userType = 'CLIENTE';
    this.loginForm.reset();
    this.registerForm.reset({
      nombres_cliente: '',
      apellidos_cliente: '',
      correo_cliente: '',
      telefono_cliente: '',
      direccion_cliente: '',
      tipoDocumento_cliente: '',
      numeroDocumento_cliente: '',
    });

    this.changePassForm.reset();
    this.resetMessages();
    this.cerrar.emit();
  }

  switchUserType(type: UserType) {
    this.userType = type;
    this.resetMessages();
    this.loginForm.reset();
  }

  switchMode(m: 'login' | 'register') {
    this.mode = m;
    this.resetMessages();
  }

  private resetMessages() {
    this.errorMessage = '';
    this.successMessage = '';
    this.tempPasswordMessage = '';
  }

  private passwordsMatch(group: FormGroup) {
    const p1 = group.get('newPassword')?.value;
    const p2 = group.get('confirmPassword')?.value;
    return p1 && p2 && p1 === p2 ? null : { notMatch: true };
  }

  onLogin() {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.resetMessages();

    if (this.userType === 'CLIENTE') {
      const email = this.loginForm.value.email;
      const password = this.loginForm.value.password;

      this.auth.loginCliente({ email, password }).subscribe({
        next: (res) => {
          this.loading = false;

          if (!res.success) {
            this.errorMessage = res.message || 'Error de autenticación';
            return;
          }

          const data = res.data!;

          if (data.requirePasswordChange) {
            this.lastLoginEmail = email;
            this.lastTempPassword = password;
            this.mode = 'force-change';
            this.tempPasswordMessage = 'Debes actualizar tu contraseña para continuar.';
            this.mostrarToast('Contraseña temporal detectada', 'warning');
            return;
          }

          const sesion: UsuarioSesion = {
            idCliente: data.idCliente,
            nombreCompleto: data.nombreCompleto!,
            tipo: data.tipo === 'CLIENTE' ? 'CLIENTE' : 'INVITADO',
            token: data.token,
            direccionCliente: data.direccionCliente || '',
          };

          this.session.iniciarSesion(sesion);

          this.mostrarToast('Sesión iniciada correctamente', 'success');

          if (this.fromCheckoutEmail) {
            this.closeModal();
            this.router.navigate(['/checkout/entrega']);
          } else {
            this.closeModal();
          }
        },

        error: (err) => {
          this.loading = false;
          this.errorMessage = err?.error?.message || 'No se pudo iniciar sesión';
        },
      });
    } else {
      const usuario = this.loginForm.value.email;
      const password = this.loginForm.value.password;

      this.auth.loginAdmin({ usuario, password }).subscribe({
        next: (res) => {
          this.loading = false;

          if (!res.success) {
            this.errorMessage = res.message || 'Usuario/contraseña inválidos';
            return;
          }

          const data = res.data!;

          const sesion: UsuarioAdminEmpleado = {
            idEmpleado: data.idEmpleado!,
            nombreCompleto: data.nombreCompleto!,
            tipo: data.tipo as 'ADMIN' | 'EMPLEADO',
            token: data.token!,
            tienda: data.tienda
              ? {
                  idTienda: data.tienda.idTienda,
                  nombre: data.tienda.nombre,
                }
              : undefined,
          };

          this.session.iniciarSesion(sesion);

          this.mostrarToast(
            data.tipo === 'ADMIN' ? 'Bienvenido, administrador' : 'Bienvenido, empleado',
            'success'
          );

          this.closeModal();
          this.router.navigate(['/admin/dashboard']);
        },

        error: () => {
          this.loading = false;
          this.errorMessage = 'No se pudo iniciar sesión';
        },
      });
    }
  }

  onRegister() {
    if (this.registerForm.invalid) return;

    this.loading = true;
    this.resetMessages();

    const dto = this.registerForm.getRawValue();

    this.auth.registrarCliente(dto).subscribe({
      next: (res) => {
        this.loading = false;

        if (!res.success) {
          this.errorMessage = res.message || 'No se pudo registrar';
          return;
        }

        const { tempPassword } = res.data!;

        this.successMessage = 'Registro exitoso. Hemos generado una contraseña temporal.';
        this.tempPasswordMessage = `Tu contraseña temporal es: ${tempPassword}`;

        this.registerForm.reset({
          nombres_cliente: '',
          apellidos_cliente: '',
          correo_cliente: '',
          telefono_cliente: '',
          direccion_cliente: '',
          tipoDocumento_cliente: '',
          numeroDocumento_cliente: '',
        });

        this.mode = 'login';
        this.userType = 'CLIENTE';
        this.loginForm.patchValue({ email: dto.correo_cliente, password: tempPassword });

        this.alertPassword(
          `Tu contraseña temporal es: <b>${tempPassword}</b><br>Por seguridad, cámbiala al iniciar sesión.`
        );
      },

      error: (err) => {
        this.loading = false;

        const code = err?.error?.code;
        const correo = this.registerForm.value.correo_cliente;

        if (code === 'GUEST_FOUND') {
          this.generarParaInvitado(correo);
          return;
        }

        this.errorMessage = err?.error?.message || 'No se pudo registrar';
      },
    });
  }

  private generarParaInvitado(correo: string) {
    this.auth.generarPasswordParaInvitado(correo).subscribe({
      next: (res) => {
        if (!res.success) {
          this.errorMessage = res.message || 'No se pudo activar cuenta de invitado';
          return;
        }

        const { tempPassword } = res.data!;

        this.successMessage = 'Tu cuenta ha sido activada. Se generó una contraseña temporal.';
        this.tempPasswordMessage = `Contraseña temporal: ${tempPassword}`;

        this.mode = 'login';
        this.userType = 'CLIENTE';
        this.loginForm.patchValue({ email: correo, password: tempPassword });

        this.alertPassword(
          `Tu contraseña temporal es: <b>${tempPassword}</b><br>Inicia sesión y cámbiala.`
        );
      },

      error: () => {
        this.errorMessage = 'No se pudo activar cuenta de invitado';
      },
    });
  }

  onChangePassword() {
    if (this.changePassForm.invalid) return;

    const newPassword = this.changePassForm.value.newPassword;

    this.auth
      .cambiarPassword({
        email: this.lastLoginEmail,
        tempPassword: this.lastTempPassword,
        newPassword,
      })
      .subscribe({
        next: (res) => {
          if (!res.success) {
            this.errorMessage = res.message || 'No se pudo cambiar la contraseña';
            return;
          }

          this.mostrarToast('Contraseña actualizada correctamente', 'success');

          this.mode = 'login';
          this.loginForm.patchValue({ email: this.lastLoginEmail, password: '' });
          this.changePassForm.reset();
          this.tempPasswordMessage = '';
        },

        error: () => {
          this.errorMessage = 'No se pudo cambiar la contraseña';
        },
      });
  }

  mostrarToast(mensaje: string, tipo: 'success' | 'info' | 'warning' | 'error' = 'success') {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: tipo,
      title: mensaje,
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
    });
  }

  private alertPassword(htmlMsg: string) {
    Swal.fire({
      icon: 'success',
      title: '¡Contraseña temporal generada!',
      html: htmlMsg,
      confirmButtonColor: '#0a64a0',
    });
  }

  ngOnChanges() {
    if (this.mode === 'register' && this.presetEmail) {
      this.registerForm.patchValue({ correo_cliente: this.presetEmail });

      if (this.lockEmail) {
        this.registerForm.get('correo_cliente')?.disable();
      }
    }
  }
}
