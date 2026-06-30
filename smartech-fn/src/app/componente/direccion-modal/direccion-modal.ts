import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SessionService, UsuarioSesion } from '../../services/session.service';

@Component({
  selector: 'app-direccion-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './direccion-modal.html',
  styleUrls: ['./direccion-modal.css'],
})
export class DireccionModalComponent implements OnInit {
  @Input() visible = false;
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<any>();

  form!: FormGroup;

  nombreCliente = '';
  cambiarReceptor = false;
  esLima = false;

  constructor(private fb: FormBuilder, private session: SessionService) {}

  ngOnInit(): void {
    const usuario = this.session.usuarioActual as UsuarioSesion | null;

    this.nombreCliente = usuario?.nombreCompleto || '';

    const direccion = usuario?.direccionCliente || '';
    this.esLima = direccion.toLowerCase().includes('lima');

    this.form = this.fb.group({
      departamento: ['', Validators.required],
      provincia: ['', Validators.required],
      distrito: ['', Validators.required],
      via: ['', Validators.required],
      numero: [''],
      sinNumero: [false],
      piso: [''],
      referencia: [''],
      nombreReceptor: [''],
    });

    if (this.esLima) {
      this.form.patchValue({ departamento: 'Lima' });
      this.form.get('departamento')?.disable();
    }
  }

  toggleReceptor() {
    this.cambiarReceptor = !this.cambiarReceptor;
  }

  cerrarModal() {
    this.cerrar.emit();
  }

  continuar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const data = {
      ...this.form.getRawValue(), 
      nombreReceptorFinal:
        this.cambiarReceptor && this.form.value.nombreReceptor
          ? this.form.value.nombreReceptor
          : this.nombreCliente,
    };

    this.guardar.emit(data);
  }
}
