import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../../../../services/inventario.service';
import { TiendaService, Tienda } from '../../../../services/tienda.service';
import Swal from 'sweetalert2';

declare var bootstrap: any;

@Component({
  selector: 'app-inventario-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario-modal.html',
  styleUrls: ['./inventario-modal.css'],
})
export class InventarioModalComponent implements OnInit {
  @Output() onInventarioGuardado = new EventEmitter<void>();

  tiendas: Tienda[] = [];
  tiendaSeleccionada: number = 0;

  productos: any[] = [];
  productosFiltrados: any[] = [];

  productoSeleccionado: any = null;

  filtro: string = '';

  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 0;
  productosPaginados: any[] = [];

  cantidad: number = 0;
  stockMinimo: number = 0;

  modalRef: any;

  constructor(private tiendaService: TiendaService, private inventarioService: InventarioService) {}

  ngOnInit() {
    this.cargarTiendas();
  }

  abrirModal() {
    this.limpiarFormulario();
    this.productos = [];
    this.productosFiltrados = [];
    this.currentPage = 1;
    this.actualizarPaginacion();
    this.modalRef = new bootstrap.Modal(document.getElementById('modalInventario'));
    this.modalRef.show();
  }

  cargarTiendas() {
    this.tiendaService.listarTiendas().subscribe({
      next: (res: any) => {
        if (Array.isArray(res)) {
          this.tiendas = res;
        } else if (res?.data && Array.isArray(res.data)) {
          this.tiendas = res.data;
        } else {
          this.tiendas = [];
        }
      },
      error: () => {
        this.tiendas = [];
      },
    });
  }

  cambiarTienda() {
    this.limpiarFormulario();

    const id = Number(this.tiendaSeleccionada);

    if (id === 0 || !id) {
      this.productos = [];
      this.productosFiltrados = [];
      this.currentPage = 1;
      this.actualizarPaginacion();
      return;
    }

    this.inventarioService.productosSinInventario(id).subscribe({
      next: (res: any) => {
        this.productos = res?.data ?? [];
        this.productosFiltrados = [...this.productos];
        this.currentPage = 1;
        this.actualizarPaginacion();
      },
      error: () => {
        this.productos = [];
        this.productosFiltrados = [];
        this.actualizarPaginacion();
      },
    });
  }

  filtrar() {
    const txt = this.filtro.toLowerCase().trim();

    if (!txt) {
      this.productosFiltrados = [...this.productos];
    } else {
      this.productosFiltrados = this.productos.filter((p: any) =>
        p.nombreProducto?.toLowerCase().includes(txt)
      );
    }

    this.currentPage = 1;
    this.actualizarPaginacion();
  }

  actualizarPaginacion() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;

    this.totalPages = Math.ceil(this.productosFiltrados.length / this.pageSize);
    this.productosPaginados = this.productosFiltrados.slice(start, end);
  }

  cambiarPagina(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
    this.actualizarPaginacion();
  }

  seleccionarProducto(p: any, event: any) {
    if (event.target.checked) {
      this.productoSeleccionado = p;
    } else {
      this.limpiarFormulario();
    }
  }

  limpiarFormulario() {
    this.productoSeleccionado = null;
    this.cantidad = 0;
    this.stockMinimo = 0;
  }

  guardar() {
    if (!this.productoSeleccionado || !this.tiendaSeleccionada) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Selecciona una tienda y un producto',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    const payload = {
      idProducto: Number(this.productoSeleccionado.idProducto),
      idTienda: Number(this.tiendaSeleccionada),
      cantidad: Number(this.cantidad),
      stockMinimo: Number(this.stockMinimo),
    };

    this.inventarioService.registrarInventario(payload).subscribe({
      next: (res: any) => {
        if (!res.success || !res.data?.idInventario) return;

        const inventarioId = Number(res.data.idInventario);
        const mov: {
          idInventario: number;
          tipoMovimiento: 'ENTRADA';
          cantidad: number;
          motivo: string;
        } = {
          idInventario: inventarioId,
          tipoMovimiento: 'ENTRADA',
          cantidad: Number(this.cantidad),
          motivo: 'INVENTARIO INICIAL',
        };

        this.inventarioService.registrarMovimiento(mov).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Registro exitoso',
              text: 'Inventario y movimiento registrados correctamente',
              confirmButtonColor: '#3085d6',
            });
            this.onInventarioGuardado.emit();

            this.modalRef?.hide();
            this.limpiarFormulario();
          },
          error: () =>
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Error al registrar el movimiento',
              confirmButtonColor: '#d33',
            }),
        });
      },
      error: () =>
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al registrar inventario',
          confirmButtonColor: '#d33',
        }),
    });
  }

  isDisabled(p: any) {
    if (!this.productoSeleccionado) return false;
    return this.productoSeleccionado.idProducto !== p.idProducto;
  }
}
