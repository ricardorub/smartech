import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { InventarioService } from '../../../../services/inventario.service';

declare var bootstrap: any;

@Component({
  selector: 'app-movimientos-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './movimientos-modal.html',
  styleUrls: ['./movimientos-modal.css'],
})
export class MovimientosModalComponent {
  @Input() inventarioSeleccionado: any = null;
  @Output() movimientoGuardado = new EventEmitter<void>();

  cantidad: number = 0;
  tipoMovimiento: '' | 'ENTRADA' | 'SALIDA' | 'AJUSTE' = '';
  motivo: string = '';

  modalRef: any;

  constructor(private inventarioService: InventarioService) {}

  abrirModal() {
    this.limpiarFormulario();
    this.modalRef = new bootstrap.Modal(document.getElementById('modalMovimiento'));
    this.modalRef.show();
  }

  guardarMovimiento(): void {
    if (!this.cantidad || this.cantidad <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Cantidad inválida',
        text: 'Ingresa una cantidad mayor a 0.',
      });
      return;
    }

    if (!this.tipoMovimiento) {
      Swal.fire({
        icon: 'warning',
        title: 'Tipo de movimiento requerido',
        text: 'Selecciona el tipo de movimiento.',
      });
      return;
    }

    if (!this.motivo.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Motivo requerido',
        text: 'Debes ingresar un motivo para el movimiento.',
      });
      return;
    }
    const mov = {
      idInventario: this.inventarioSeleccionado.idInventario,
      tipoMovimiento: this.tipoMovimiento as 'ENTRADA' | 'SALIDA' | 'AJUSTE',
      cantidad: this.cantidad,
      motivo: this.motivo.trim(),
    };

    this.inventarioService.registrarMovimiento(mov).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Movimiento registrado',
          text: 'El movimiento fue guardado correctamente.',
        });

        this.movimientoGuardado.emit();
        this.modalRef?.hide();
        this.limpiarFormulario();
      },
      error: () =>
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo registrar el movimiento.',
        }),
    });
  }

  limpiarFormulario() {
    this.cantidad = 0;
    this.tipoMovimiento = '';
    this.motivo = '';
  }
}
