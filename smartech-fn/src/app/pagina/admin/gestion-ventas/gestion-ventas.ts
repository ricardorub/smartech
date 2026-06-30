import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  SessionService,
  UsuarioSesion,
  UsuarioAdminEmpleado,
} from '../../../services/session.service';
import { TiendaService } from '../../../services/tienda.service';
import { UsuarioService } from '../../../services/usuario.service';
import { VentasTiendaService } from '../../../services/ventas-tienda.service';
import { NuevaVentaModalComponent } from './nueva-venta-modal/nueva-venta-modal';
import { DetalleVentaModalComponent } from './detalle-venta-modal/detalle-venta-modal';

import Swal from 'sweetalert2';

export interface VentaTienda {
  idPedido: number;
  fechaPedido: string;
  nombreTienda: string;
  nombreEmpleado: string;
  clienteNombre: string;
  total: number;
  estado: string;
  tipoVenta: 'TIENDA' | 'ONLINE';
  urlpdf?: string;
}

@Component({
  selector: 'app-gestion-ventas',
  standalone: true,
  templateUrl: './gestion-ventas.html',
  styleUrls: ['./gestion-ventas.css'],
  imports: [CommonModule, FormsModule, NuevaVentaModalComponent, DetalleVentaModalComponent],
})
export class GestionVentasComponent implements OnInit {
  ventas: VentaTienda[] = [];

  filtroTexto = '';
  filtroTienda: number | null = null;
  filtroEmpleado: number | null = null;

  tiendas: any[] = [];
  empleados: any[] = [];

  pagina = 1;
  pageSize = 10;
  totalPaginas = 1;
  totalPaginasArray: number[] = [];

  usuarioActual: UsuarioSesion | UsuarioAdminEmpleado | null = null;

  esAdmin = false;
  esEmpleado = false;

  idEmpleadoActual?: number;
  tiendaEmpleadoActual: { idTienda: number; nombre: string } | null = null;

  modalNuevaVentaVisible = false;

  mostrarDetalle: boolean = false;
  idVentaSeleccionada: number | null = null;

  constructor(
    private sessionService: SessionService,
    private tiendaService: TiendaService,
    private usuarioService: UsuarioService,
    private ventasService: VentasTiendaService
  ) {}

  ngOnInit(): void {
    this.usuarioActual = this.sessionService.usuarioActual;
    this.detectarRol();
    this.cargarCombosIniciales();
    this.cargarVentas();
  }

  private detectarRol() {
    this.esAdmin = this.sessionService.esAdmin;
    this.esEmpleado = this.sessionService.esEmpleado;

    if (this.esEmpleado) {
      this.idEmpleadoActual = this.sessionService.idEmpleado ?? undefined;
      this.tiendaEmpleadoActual = this.sessionService.tiendaEmpleado ?? null;
      this.filtroTienda = this.tiendaEmpleadoActual?.idTienda ?? null;
    }
  }

  private cargarCombosIniciales() {
    if (!this.esAdmin) return;

    this.tiendaService.listarTiendas().subscribe({
      next: (data) => (this.tiendas = data),
    });

    this.usuarioService.listarUsuarios({ rol: 'EMPLEADO', page: 0, size: 200 }).subscribe({
      next: (data) => (this.empleados = data.content || []),
    });
  }

  cargarVentas() {
    const params: any = {
      page: this.pagina - 1,
      size: this.pageSize,
      tipoVenta: 'TIENDA',
    };

    if (this.filtroTexto.trim() !== '') {
      params.buscar = this.filtroTexto.trim();
    }

    if (this.esAdmin) {
      if (this.filtroTienda) params.idTienda = this.filtroTienda;
      if (this.filtroEmpleado) params.idEmpleado = this.filtroEmpleado;
    }

    if (this.esEmpleado) {
      params.idEmpleado = this.idEmpleadoActual;
      params.idTienda = this.tiendaEmpleadoActual?.idTienda;
    }

    this.ventasService.listarVentas(params).subscribe({
      next: (data) => {
        this.ventas = data.content || data;
        this.totalPaginas = data.totalPages ?? 1;
        this.totalPaginasArray = Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
      },
      error: (err) => {
        this.ventas = [];
        this.totalPaginas = 1;
        this.totalPaginasArray = [1];
      },
    });
  }

  cambiarPagina(p: number) {
    if (p < 1 || p > this.totalPaginas) return;
    this.pagina = p;
    this.cargarVentas();
  }

  aplicarFiltros() {
    this.pagina = 1;
    this.cargarVentas();
  }

  nuevaVenta() {
    this.modalNuevaVentaVisible = true;
  }

  cerrarModales() {
    this.modalNuevaVentaVisible = false;
    this.cargarVentas();
  }

  abrirModalDetalle(idPedido: number) {
    console.log('ABRIENDO MODAL DETALLE PARA PEDIDO:', idPedido);

    this.idVentaSeleccionada = idPedido;
    this.mostrarDetalle = true;
  }

  cerrarModalDetalle() {
    this.mostrarDetalle = false;
    this.idVentaSeleccionada = null;
  }

  anularVenta(venta: VentaTienda) {
    Swal.fire({
      title: '¿Anular esta venta?',
      text: `Pedido N.º ${venta.idPedido} - Total S/ ${venta.total.toFixed(2)}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, anular',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.ventasService.anularVenta(venta.idPedido).subscribe({
        next: () => {
          Swal.fire({
            title: 'Venta anulada',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
          });
          this.cargarVentas();
        },
        error: () => {
          Swal.fire({
            title: 'Error',
            text: 'No se pudo anular la venta.',
            icon: 'error',
          });
        },
      });
    });
  }

 generarComprobante(venta: VentaTienda) {
  if (!venta || !venta.idPedido) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo obtener el ID de la venta.',
    });
    return;
  }

  Swal.fire({
    title: 'Generando comprobante...',
    text: 'Por favor espere',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  this.ventasService.generarComprobante(venta.idPedido).subscribe({
    next: (resp) => {
      Swal.close();

      if (resp?.success) {
        Swal.fire({
          icon: 'success',
          title: 'Comprobante generado',
          text: 'El comprobante fue creado correctamente.',
          showConfirmButton: true,
          confirmButtonText: 'Abrir PDF',
        }).then(() => {
          this.cargarVentas();
          window.open(resp.data, '_blank');
        });
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Aviso',
          text: resp?.message || 'No se pudo generar el comprobante.',
        });
      }
    },

    error: (err) => {
      Swal.close();
      Swal.fire({
        icon: 'error',
        title: 'Error al generar comprobante',
        text: err?.error?.message || 'Ocurrió un problema en el servidor.',
      });
    },
  });
}

}
