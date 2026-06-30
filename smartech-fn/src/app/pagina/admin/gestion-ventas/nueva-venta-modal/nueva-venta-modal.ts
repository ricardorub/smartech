import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { VentasTiendaService } from '../../../../services/ventas-tienda.service';
import { ProductoService } from '../../../../services/producto-admin.service';
import { SessionService } from '../../../../services/session.service';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-nueva-venta-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nueva-venta-modal.html',
  styleUrls: ['./nueva-venta-modal.css'],
})
export class NuevaVentaModalComponent implements OnInit {

  @Input() esAdmin: boolean = false;
  @Input() tiendas: any[] = [];
  @Input() tiendaEmpleado: any = null;

  @Output() cerrar = new EventEmitter<void>();
  empleadoId: number | null = null;

  tiendaId: number | null = null;
  clienteId: number | null = null;
  observaciones: string = '';

  totalBruto = 0;
  totalDescuento = 0;
  subtotal = 0;
  igv = 0;
  totalFinal = 0;


  busqueda = '';
  resultados: any[] = [];

  productosSeleccionados: {
    id: number;
    nombre: string;
    precio: number;
    cantidad: number;
    descuento: number;
    stockDisponible: number;
  }[] = [];

  pago = {
    metodo_pago: 'Efectivo',
    moneda: 'PEN',
    monto: 0,
    observaciones: '',
    referencia_transaccion: '',
    vencimiento: '',
    cvv: '',
    numero_tarjeta: '',
  };

  comprobante = {
    tipo: 'Boleta',
    numero_documento: '',
    razon_social: '',
  };

  constructor(
    private ventasService: VentasTiendaService,
    private productoService: ProductoService,
    private sessionService: SessionService
  ) {}

  ngOnInit() {
    const usuario = this.sessionService.usuarioActual as any;

    if (usuario?.idEmpleado) {
      this.empleadoId = usuario.idEmpleado;
    }
    if (!this.esAdmin && this.tiendaEmpleado) {
      this.tiendaId = this.tiendaEmpleado.idTienda;
    }
  }

  buscarProducto() {
    const texto = this.busqueda.trim();

    if (texto.length < 2) {
      this.resultados = [];
      return;
    }
    const tiendaSeleccionada = this.esAdmin ? this.tiendaId : this.tiendaEmpleado?.idTienda;

    if (!tiendaSeleccionada) {
      this.resultados = [];
      return;
    }

    this.productoService.buscarProductosPorTienda(texto, tiendaSeleccionada).subscribe({
      next: (data) => (this.resultados = data),
      error: () => (this.resultados = []),
    });
  }
  agregarProducto(prod: any) {
    if (prod.stockDisponible <= 0) {
      Swal.fire('Stock insuficiente', 'No hay stock disponible', 'error');
      return;
    }

    const exist = this.productosSeleccionados.find((p) => p.id === prod.idProducto);

    if (exist) {
      if (exist.cantidad + 1 > prod.stockDisponible) {
        Swal.fire('Stock insuficiente', 'No puedes agregar más que el stock disponible', 'error');
        return;
      }
      exist.cantidad++;
    } else {
      this.productosSeleccionados.push({
        id: prod.idProducto,
        nombre: prod.nombreProducto,
        precio: prod.precioProducto,
        cantidad: 1,
        descuento: prod.descuentoProducto || 0,
        stockDisponible: prod.stockDisponible,
      });
    }

    this.actualizarTotales();
    this.refrescarPaginacion();
  }

  actualizarTotales() {
    let bruto = 0;
    let descuentoTotal = 0;

    this.productosSeleccionados.forEach((p) => {
      const lineaBruto = p.precio * p.cantidad;
      const lineaDesc = lineaBruto * (p.descuento / 100);

      bruto += lineaBruto;
      descuentoTotal += lineaDesc;
    });

    this.totalBruto = bruto;
    this.totalDescuento = descuentoTotal;
    this.subtotal = bruto - descuentoTotal;
    this.igv = this.subtotal * 0.18;
    this.totalFinal = this.subtotal + this.igv;
  }

  quitarProducto(index: number) {
    this.productosSeleccionados.splice(index, 1);
    this.actualizarTotales();
    this.refrescarPaginacion();
  }

  eliminarSiCero(index: number) {
    if (this.productosSeleccionados[index]?.cantidad <= 0) {
      this.quitarProducto(index);
    }
  }
  private mapearMetodoPagoDto(valor: string): string {
    switch (valor) {
      case 'EFECTIVO':
        return 'Efectivo';
      case 'YAPE':
        return 'Yape';
      case 'PLIN':
        return 'Plin';
      case 'DEBITO':
        return 'Tarjeta_debito';
      case 'CREDITO':
        return 'Tarjeta_credito';
      case 'TRANSFERENCIA':
        return 'Transferencia';
      default:
        return valor; 
    }
  }

  private generarReferenciaTransaccion(): string {
    const parte1 = Math.floor(100000 + Math.random() * 900000); 
    const parte2 = Math.floor(1000 + Math.random() * 9000);     
    return `TRX-${parte1}-${parte2}`;
  }

  registrarVenta() {
    if (!this.tiendaId) {
      Swal.fire('Error', 'Seleccione una tienda', 'error');
      return;
    }

    if (!this.empleadoId) {
      Swal.fire('Error', 'No se pudo obtener el ID de empleado en sesión', 'error');
      return;
    }

    if (this.productosSeleccionados.length === 0) {
      Swal.fire('Error', 'Debe agregar al menos un producto', 'error');
      return;
    }

    const venta = {
      tiendaId: this.tiendaId,
      empleadoId: this.empleadoId,
      clienteId: 0, 
      observaciones: 'Venta concretada correctamente',
      productos: this.productosSeleccionados.map((p) => ({
        productoId: p.id,
        cantidad: p.cantidad,
        precioUnitario: p.precio,
        descuento: p.precio * p.cantidad * (p.descuento / 100),
      })),
    };

    const metodoDto = this.mapearMetodoPagoDto(this.pago.metodo_pago);
    const referencia = this.pago.referencia_transaccion || this.generarReferenciaTransaccion();

    const pago = {
      metodo_pago: metodoDto,
      moneda: this.pago.moneda,
      monto: this.totalFinal,
      observaciones: `Se generó el pago mediante el método: ${metodoDto}`,
      referencia_transaccion: referencia,
      vencimiento:
        this.pago.metodo_pago === 'DEBITO' || this.pago.metodo_pago === 'CREDITO'
          ? this.pago.vencimiento
          : undefined,
      cvv:
        this.pago.metodo_pago === 'DEBITO' || this.pago.metodo_pago === 'CREDITO'
          ? this.pago.cvv
          : undefined,
      numero_tarjeta:
        this.pago.metodo_pago === 'DEBITO' || this.pago.metodo_pago === 'CREDITO'
          ? this.pago.numero_tarjeta
          : undefined,
    };
    const comprobante = {
      tipo: this.comprobante.tipo,
      numero_documento: this.comprobante.numero_documento,
      razon_social: this.comprobante.razon_social,
    };

    const payload = {
      venta,
      pago,
      comprobante,
    };

    this.ventasService.registrarVentaCompleta(payload).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Venta registrada correctamente', 'success');
        this.cerrar.emit();
      },
      error: (err) => {
        Swal.fire('Error', err.error?.mensaje || 'No se pudo registrar la venta', 'error');
      },
    });
  }

  paginaActual = 1;
  itemsPorPagina = 3;

  get totalPaginas() {
    return Math.ceil(this.productosSeleccionados.length / this.itemsPorPagina) || 1;
  }

  get paginaOffset() {
    return (this.paginaActual - 1) * this.itemsPorPagina;
  }

  get productosPaginados() {
    const inicio = this.paginaOffset;
    const fin = inicio + this.itemsPorPagina;
    return this.productosSeleccionados.slice(inicio, fin);
  }

  paginaSiguiente() {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
    }
  }

  paginaAnterior() {
    if (this.paginaActual > 1) {
      this.paginaActual--;
    }
  }

  refrescarPaginacion() {
    if (this.paginaActual > this.totalPaginas) {
      this.paginaActual = this.totalPaginas || 1;
    }
  }
  mostrarModalPago = false;

  abrirModalPago() {
    if (this.productosSeleccionados.length === 0) {
      Swal.fire('Error', 'Debe agregar productos antes de continuar', 'error');
      return;
    }

    this.mostrarModalPago = true;
  }

  cerrarModalPago() {
    this.mostrarModalPago = false;
  }

  confirmarPagoFinal() {
    this.mostrarModalPago = false;
    this.registrarVenta(); 
  }

  simularPagoTarjeta() {
    if (!this.pago.numero_tarjeta || this.pago.numero_tarjeta.length < 16) {
      Swal.fire('Error', 'Número de tarjeta no válido.', 'error');
      return;
    }

    if (!this.pago.vencimiento || this.pago.vencimiento.length < 4) {
      Swal.fire('Error', 'Fecha de vencimiento no válida.', 'error');
      return;
    }

    if (!this.pago.cvv || this.pago.cvv.length < 3) {
      Swal.fire('Error', 'CVV no válido.', 'error');
      return;
    }

    Swal.fire({
      title: 'Procesando pago...',
      html: 'Por favor, espera.',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    setTimeout(() => {
      Swal.fire({
        icon: 'success',
        title: 'Pago aprobado',
        text: 'La transacción fue procesada correctamente.',
        timer: 2000,
        showConfirmButton: false,
      });

      this.pago.referencia_transaccion = 'OP-' + Math.floor(Math.random() * 999999);
    }, 2000);
  }

  get formularioInvalido(): boolean {
    if (!this.tiendaId) return true;
    if (this.productosSeleccionados.length === 0) return true;
    if (
      !this.comprobante.tipo ||
      !this.comprobante.numero_documento ||
      !this.comprobante.razon_social
    ) {
      return true;
    }
    switch (this.pago.metodo_pago) {
      case 'TRANSFERENCIA':
        if (!this.pago.referencia_transaccion) return true;
        break;

      case 'DEBITO':
      case 'CREDITO':
        if (!this.pago.numero_tarjeta || this.pago.numero_tarjeta.length !== 16) return true;
        if (!this.pago.vencimiento || this.pago.vencimiento.length < 4) return true;
        if (!this.pago.cvv || this.pago.cvv.length !== 3) return true;
        break;

      default:
        break;
    }

    return false; 
  }
}
