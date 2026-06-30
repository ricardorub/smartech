import { Component, Input } from '@angular/core';
import { PedidoDetalle } from '../../models/detallePedido.model';
import { CommonModule } from '@angular/common';

declare var bootstrap: any;

@Component({
  selector: 'app-detalle-pedido-cliente-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalle-pedido-cliente-modal.html',
  styleUrls: ['./detalle-pedido-cliente-modal.css']
})
export class DetallePedidoClienteModalComponent {

  @Input() pedido!: PedidoDetalle;

  cerrar() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('detallePedidoModal'));
    modal.hide();
  }

  verComprobante() {
    if (this.pedido.comprobante?.pdfUrl) {
      window.open(this.pedido.comprobante.pdfUrl, '_blank');
    }
  }
}

