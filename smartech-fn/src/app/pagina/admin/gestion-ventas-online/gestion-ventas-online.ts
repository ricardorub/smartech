import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VentasOnlineService } from '../../../services/ventas-online.service';
import { SessionService, UsuarioAdminEmpleado } from '../../../services/session.service';
import Swal from 'sweetalert2';
import { DetallePedidoOnlineModalComponent } from './detalle-pedido-online-modal/detalle-pedido-online-modal';

@Component({
  selector: 'app-gestion-ventas-online',
  standalone: true,
  templateUrl: './gestion-ventas-online.html',
  styleUrls: ['./gestion-ventas-online.css'],
  imports: [CommonModule, FormsModule, DetallePedidoOnlineModalComponent],
})
export class GestionVentasOnlineComponent implements OnInit {

  pedidos: any[] = [];

  filtroId: string = '';
  filtroCliente: string = '';
  filtroEstado: string = '';
  filtroMetodo: string = '';
  filtroFechaInicio: string = '';
  filtroFechaFin: string = '';
  filtroTienda: number | null = null;

  usuarioActual: UsuarioAdminEmpleado | null = null;
  idEmpleado: number | null = null;
  esAdmin = false;
  esEmpleado = false;

  modalVisible = false;
  pedidoSeleccionado: any = null;

  pagina = 1;
  pageSize = 10;
  totalPaginas = 1;
  paginasArray: number[] = [];

  tiendas: any[] = [];

  constructor(
    private ventasOnlineService: VentasOnlineService,
    private session: SessionService
  ) {}

  ngOnInit(): void {
    this.usuarioActual = this.session.usuarioActual as UsuarioAdminEmpleado;
    if (!this.usuarioActual) return;

    this.esAdmin = this.usuarioActual.tipo === 'ADMIN';
    this.esEmpleado = this.usuarioActual.tipo === 'EMPLEADO';

    this.idEmpleado = this.usuarioActual.idEmpleado ?? null;
    if (this.esAdmin) {
      this.cargarTiendas();
      this.filtroTienda = null;
    }

    if (this.esEmpleado) {
      this.filtroTienda = this.usuarioActual.tienda?.idTienda ?? null;
    }

    this.cargarPedidos();
  }

  cargarTiendas() {
    this.ventasOnlineService.listarTiendas().subscribe({
      next: data => this.tiendas = data,
    });
  }

  cargarPedidos() {
    const params: any = {
      page: this.pagina - 1,
      size: this.pageSize,
      idPedido: this.filtroId || null,
      cliente: this.filtroCliente || null,
      estado: this.filtroEstado || null,
      metodo: this.filtroMetodo || null,
      fechaInicio: this.filtroFechaInicio || null,
      fechaFin: this.filtroFechaFin || null,
    };
    if (this.esAdmin) {
      params.tienda = this.filtroTienda || null;
    }

    if (this.esEmpleado) {
      params.tienda = this.usuarioActual?.tienda?.idTienda;
    }

    this.ventasOnlineService.listarPedidosOnline(params).subscribe({
      next: (res) => {
        this.pedidos = res.content;
        this.totalPaginas = res.totalPages;
        this.paginasArray = Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
      },
      error: () => Swal.fire('Error', 'No se pudieron cargar los pedidos', 'error')
    });
  }

  cambiarPagina(n: number) {
    if (n < 1 || n > this.totalPaginas) return;
    this.pagina = n;
    this.cargarPedidos();
  }

  verDetalle(p: any) {

    if (this.esEmpleado) {

      if (p.asignadoA && p.asignadoA !== this.idEmpleado) {
        Swal.fire('Acceso denegado', 'Este pedido ya fue tomado por otro empleado', 'error');
        return;
      }
      if (!p.asignadoA && this.idEmpleado) {
        this.ventasOnlineService.asignarPedidoEmpleado(p.idPedido, this.idEmpleado)
          .subscribe(() => {});
      }
    }

    this.ventasOnlineService.obtenerDetallePedido(p.idPedido).subscribe({
      next: (detalle) => {
        this.pedidoSeleccionado = detalle;
        this.modalVisible = true;
      },
      error: () => Swal.fire('Error', 'No se pudo cargar el detalle del pedido.', 'error')
    });
  }

  cerrarModal() {
    this.modalVisible = false;
    this.pedidoSeleccionado = null;
  }

  procesarAccion(evt: any) {
    const accion = evt.accion;
    const id = evt.pedido;

    switch (accion) {
      case 'aprobarPago':
        this.aprobarPago(id);
        break;
      case 'cambiarEstado':
        this.actualizarEstado(id, evt.estado);
        break;
      case 'cambiarEstadoPago':
        this.actualizarEstadoPago(id, evt.estadoPago);
        break;
      case 'generarComprobante':
        this.generarComprobanteModal(id);
        break;
      case 'guardarObservacion':
        this.guardarObservacion(id, evt.observacion);
        break;
    }
  }

  aprobarPago(idPedido: number) {
    this.ventasOnlineService.aprobarPago(idPedido).subscribe({
      next: () => {
        Swal.fire('Pago aprobado', 'El pago ha sido actualizado.', 'success');
        this.cargarPedidos();
        this.cerrarModal();
      },
      error: () => Swal.fire('Error', 'No se pudo aprobar el pago', 'error')
    });
  }

  actualizarEstado(idPedido: number, estado: string) {
    this.ventasOnlineService.actualizarEstado(idPedido, estado).subscribe({
      next: () => {
        Swal.fire('Estado actualizado', 'El estado del pedido cambió correctamente.', 'success');
        this.cargarPedidos();
        this.cerrarModal();
      },
      error: () => Swal.fire('Error', 'No se pudo actualizar el estado', 'error')
    });
  }

  actualizarEstadoPago(idPedido: number, estadoPago: string) {
    this.ventasOnlineService.actualizarEstadoPago(idPedido, estadoPago).subscribe({
      next: () => {
        Swal.fire('Actualizado', 'Estado de pago actualizado correctamente.', 'success');
        this.cargarPedidos();
        this.cerrarModal();
      },
      error: () => Swal.fire('Error', 'No se pudo actualizar el estado de pago.', 'error')
    });
  }

  generarComprobanteModal(idPedido: number) {
    this.ventasOnlineService.generarComprobante(idPedido).subscribe({
      next: () => {
        Swal.fire('Comprobante generado', 'El comprobante fue creado exitosamente', 'success');
        this.cargarPedidos();
        this.cerrarModal();
      },
      error: () => Swal.fire('Error', 'No se pudo generar el comprobante', 'error')
    });
  }

  guardarObservacion(idPedido: number, obs: string) {
    this.ventasOnlineService.guardarObservacion(idPedido, obs).subscribe({
      next: () => {
        Swal.fire('Observación guardada', 'Se registró la observación en el pedido.', 'success');
        this.cargarPedidos();
      },
      error: () => Swal.fire('Error', 'No se pudo guardar la observación', 'error')
    });
  }

  anularPedido(p: any) {
    Swal.fire({
      title: '¿Anular pedido?',
      text: 'Esta acción no se puede revertir',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, anular',
    }).then((r) => {
      if (!r.isConfirmed) return;

      this.ventasOnlineService.anularVenta(p.idPedido).subscribe({
        next: () => {
          Swal.fire('Anulado', 'El pedido fue anulado', 'success');
          this.cargarPedidos();
        },
        error: () => Swal.fire('Error', 'No se pudo anular', 'error'),
      });
    });
  }

  verComprobante(url: string) {
    window.open(url, '_blank');
  }

}
