// src/app/componente/invitado-modal/invitado-modal.ts
import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClienteService } from '../../services/cliente.service';
import { SessionService } from '../../services/session.service';
import { Router } from '@angular/router';
declare const Swal: any;

@Component({
  selector: 'app-invitado-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './invitado-modal.html',
  styleUrls: ['./invitado-modal.css'],
})
export class InvitadoModalComponent implements OnChanges {
  @Input() visible = false;
  @Input() data: any = null;

  @Output() cerrar = new EventEmitter<void>();
  @Output() guardado = new EventEmitter<void>();

  form: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private clienteService: ClienteService,
    private router: Router,
    private session: SessionService
  ) {
    this.form = this.fb.group({
      correo: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
      direccion: ['', Validators.required],
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.form.patchValue({
        correo: this.data.correoCliente || '',
        nombres: this.data.nombreCliente || '',
        apellidos: this.data.apellidoCliente || '',
        telefono: this.data.telefonoCliente || '',
        direccion: this.data.direccionCliente || '',
      });
    }
  }

  guardar() {
    if (this.form.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    const dto = {
      correoCliente: this.form.getRawValue().correo,
      nombreCliente: this.form.value.nombres,
      apellidoCliente: this.form.value.apellidos,
      telefonoCliente: this.form.value.telefono,
      direccionCliente: this.form.value.direccion,
    };

    this.clienteService.upsertInvitado(dto).subscribe({
      next: (res) => {
        this.loading = false;

        if (!res.success) {
          this.errorMessage = res.message || 'No se pudo guardar';
          return;
        }
        Swal.fire({
          icon: 'success',
          title: '¡Registro exitoso!',
          text: 'Tus datos se guardaron correctamente.',
          confirmButtonColor: '#0a64a0',
        }).then(() => {
          this.session.iniciarSesion({
            idCliente: res.data?.idCliente,
            nombreCompleto: `${dto.nombreCliente} ${dto.apellidoCliente}`,
            tipo: 'INVITADO',
            direccionCliente: dto.direccionCliente,
          });
          this.guardado.emit();
          this.visible = false;
          this.router.navigate(['/checkout/entrega']);
        });
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Error al guardar';
      },
    });
  }
}
