import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VentasTiendaService } from '../../../../services/ventas-tienda.service';

@Component({
  selector: 'app-detalle-venta-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalle-venta-modal.html',
  styleUrls: ['./detalle-venta-modal.css'],
})
export class DetalleVentaModalComponent {
  @Input() idPedido!: number;
  @Output() cerrar = new EventEmitter<void>();

  loading = true;
  error = false;
  data: any = null;

  constructor(private ventasService: VentasTiendaService) {}

  ngOnInit() {
    this.cargarDetalle();
  }

  cargarDetalle() {
    this.loading = true;
    this.error = false;

    this.ventasService.obtenerDetalleVenta(this.idPedido).subscribe({
      next: (res) => {
        this.data = res;
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      },
    });
  }

  cerrarModal() {
    this.cerrar.emit();
  }
}