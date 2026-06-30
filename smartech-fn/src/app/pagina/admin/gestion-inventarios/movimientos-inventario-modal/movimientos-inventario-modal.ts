import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../../../../services/inventario.service';

declare var bootstrap: any;

interface MovimientoInv {
  idMovInventario: number;
  tipoMovimiento: string;
  cantidad: number;
  motivo: string;
  fechaMovimiento: string;
}

@Component({
  selector: 'app-movimientos-inventario-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './movimientos-inventario-modal.html',
  styleUrls: ['./movimientos-inventario-modal.css'],
})
export class MovimientosInventarioModalComponent implements OnChanges {
  @Input() inventario: any = null;

  modalRef: any;
  movimientos: MovimientoInv[] = [];
  movimientosFiltrados: MovimientoInv[] = [];
  movimientosPaginados: MovimientoInv[] = [];

  pageSize: number = 5;
  currentPage: number = 1;
  totalPages: number = 0;

  filtroTipo: string = 'TODOS';

  resumen: {
    totalEntradas: number;
    totalSalidas: number;
    totalAjustes: number;
    cantidadMovida: number;
    ultimoMovimiento: MovimientoInv | null;
  } = {
    totalEntradas: 0,
    totalSalidas: 0,
    totalAjustes: 0,
    cantidadMovida: 0,
    ultimoMovimiento: null,
  };

  constructor(private inventarioService: InventarioService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['inventario'] && this.inventario) {
      this.cargarMovimientos();
    }
  }

  abrirModal() {
    this.modalRef = new bootstrap.Modal(document.getElementById('modalMovimientosInv'));
    this.modalRef.show();
  }

  cargarMovimientos() {
    if (!this.inventario?.idInventario) return;

    this.inventarioService.listarMovimientos(this.inventario.idInventario).subscribe({
      next: (res: any) => {
        this.movimientos = res.data || [];
        this.movimientos.sort((a, b) => b.idMovInventario - a.idMovInventario);

        this.aplicarFiltros();
        this.calcularResumen();
      },
    });
  }

  aplicarFiltros() {
    if (this.filtroTipo === 'TODOS') {
      this.movimientosFiltrados = [...this.movimientos];
    } else {
      this.movimientosFiltrados = this.movimientos.filter(
        (m) => m.tipoMovimiento === this.filtroTipo
      );
    }

    this.currentPage = 1;
    this.actualizarPaginacion();
  }

  actualizarPaginacion() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;

    this.totalPages = Math.ceil(this.movimientosFiltrados.length / this.pageSize);
    this.movimientosPaginados = this.movimientosFiltrados.slice(start, end);
  }

  cambiarPagina(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.actualizarPaginacion();
  }
  calcularResumen() {
    this.resumen.totalEntradas = this.movimientos.filter(
      (m) => m.tipoMovimiento === 'ENTRADA'
    ).length;

    this.resumen.totalSalidas = this.movimientos.filter(
      (m) => m.tipoMovimiento === 'SALIDA'
    ).length;

    this.resumen.totalAjustes = this.movimientos.filter(
      (m) => m.tipoMovimiento === 'AJUSTE'
    ).length;

    this.resumen.cantidadMovida = this.movimientos.reduce((acc, m) => acc + m.cantidad, 0);

    this.resumen.ultimoMovimiento = this.movimientos[0] || null;
  }
}
