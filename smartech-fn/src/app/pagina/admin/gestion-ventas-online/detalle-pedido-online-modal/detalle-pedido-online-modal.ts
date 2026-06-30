import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-detalle-pedido-online-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './detalle-pedido-online-modal.html',
  styleUrls: ['./detalle-pedido-online-modal.css'],
})
export class DetallePedidoOnlineModalComponent {
  @Input() visible = false;
  @Input() pedido: any = null;
  @Input() esAdmin = false;
  @Input() idEmpleadoActual: number | null = null;

  @Output() cerrar = new EventEmitter<void>();
  @Output() actualizar = new EventEmitter<any>();

  observacion: string = '';

  estadosPedido = [
    'PENDIENTE',
    'PROCESADO',
    'ENVIADO',
    'LISTO_PARA_RECOJO',
    'ENTREGADO',
    'CANCELADO',
  ];

  estadosPago = ['Pendiente', 'Completado', 'Rechazado', 'Anulado'];

  ngOnChanges() {
    if (this.pedido) {
      this.observacion = this.pedido.observacion || '';
    }
  }

  validarAcceso(): boolean {
    if (this.esAdmin) return true;
    if (!this.pedido?.asignadoA) return true;
    return this.pedido.asignadoA === this.idEmpleadoActual;
  }

  denegarAcceso() {
    Swal.fire('Acceso denegado', 'Este pedido ya está asignado a otro empleado.', 'error');
  }

  aprobarPago() {
    if (!this.validarAcceso()) return this.denegarAcceso();

    Swal.fire({
      title: '¿Aprobar pago?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Aprobar',
    }).then((r) => {
      if (!r.isConfirmed) return;
      this.actualizar.emit({
        accion: 'aprobarPago',
        pedido: this.pedido.idPedido,
      });
    });
  }

  verComprobante() {
    if (!this.pedido?.urlpdf) return;
    window.open(this.pedido.urlpdf, '_blank');
  }

  onEstadoChange(event: any) {
    if (!this.validarAcceso()) return this.denegarAcceso();

    const nuevoEstado = event.target.value;

    this.actualizar.emit({
      accion: 'cambiarEstado',
      pedido: this.pedido.idPedido,
      estado: nuevoEstado,
    });
  }

  onEstadoPagoChange(event: any) {
    if (!this.validarAcceso()) return this.denegarAcceso();

    const nuevoEstadoPago = event.target.value;

    this.actualizar.emit({
      accion: 'cambiarEstadoPago',
      pedido: this.pedido.idPedido,
      estadoPago: nuevoEstadoPago,
    });
  }

  guardarObservacion() {
    if (!this.validarAcceso()) return this.denegarAcceso();

    this.actualizar.emit({
      accion: 'guardarObservacion',
      pedido: this.pedido.idPedido,
      observacion: this.observacion,
    });
  }

  cerrarModal() {
    this.cerrar.emit();
  }
}
