// src/app/pagina/checkout-pago/checkout-pago.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SessionService, UsuarioSesion } from '../../services/session.service';
import { CheckoutService } from '../../services/checkout.service';
import { CheckoutRequest } from '../../models/checkout.model';
import Swal from 'sweetalert2';

type MetodoPago =
  | 'Efectivo'
  | 'Tarjeta_credito'
  | 'Tarjeta_debito'
  | 'Transferencia'
  | 'Yape'
  | 'Plin';

type TipoComprobante = 'Boleta' | 'Factura';

@Component({
  selector: 'app-checkout-pago',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout-pago.html',
  styleUrls: ['./checkout-pago.css'],
})
export class CheckoutPagoComponent implements OnInit {
  formPago!: FormGroup;
  formComprobante!: FormGroup;

  pedidoTemporal: any = null;
  total = 0;

  metodos: MetodoPago[] = [
    'Efectivo',
    'Tarjeta_credito',
    'Tarjeta_debito',
    'Transferencia',
    'Yape',
    'Plin',
  ];

  metodoSeleccionado: MetodoPago | null = null;
  tipoComprobante: TipoComprobante = 'Boleta';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private session: SessionService,
    private checkoutService: CheckoutService
  ) {}

  ngOnInit(): void {
    const data = localStorage.getItem('pedidoTemporal');
    if (!data) {
      this.router.navigate(['/carrito']);
      return;
    }

    this.pedidoTemporal = JSON.parse(data);
    this.total = this.pedidoTemporal.pedido.total;

    this.formPago = this.fb.group({
      metodo_pago: ['', Validators.required],
      moneda: ['PEN', Validators.required],
      monto: [this.total, Validators.required],
      referencia_transaccion: [''],
      observaciones: [''],

      numero_tarjeta: [''],
      nombre_tarjeta: [''],
      vencimiento: [''],
      cvv: [''],
    });

    this.formComprobante = this.fb.group({
      tipo: ['Boleta', Validators.required],
      numero_documento: [''],
      razon_social: [''],
      direccion_fiscal: [''],
    });
  }

  seleccionarMetodo(metodo: MetodoPago) {
    this.metodoSeleccionado = metodo;
    this.formPago.patchValue({ metodo_pago: metodo });
    this.limpiarValidadoresTarjeta();
    if (metodo === 'Tarjeta_credito' || metodo === 'Tarjeta_debito') {
      this.activarValidadoresTarjeta();
    }
  }

  seleccionarComprobante(tipo: TipoComprobante) {
    this.tipoComprobante = tipo;
    this.formComprobante.patchValue({ tipo });

    if (tipo === 'Factura') {
      this.formComprobante.get('numero_documento')?.setValidators([Validators.required]);
      this.formComprobante.get('razon_social')?.setValidators([Validators.required]);
    } else {
      this.formComprobante.get('numero_documento')?.clearValidators();
      this.formComprobante.get('razon_social')?.clearValidators();
    }

    this.formComprobante.get('numero_documento')?.updateValueAndValidity();
    this.formComprobante.get('razon_social')?.updateValueAndValidity();
  }

  private activarValidadoresTarjeta() {
    this.formPago.get('numero_tarjeta')?.setValidators([Validators.required]);
    this.formPago.get('nombre_tarjeta')?.setValidators([Validators.required]);
    this.formPago.get('vencimiento')?.setValidators([Validators.required]);
    this.formPago.get('cvv')?.setValidators([Validators.required]);

    this.formPago.get('numero_tarjeta')?.updateValueAndValidity();
    this.formPago.get('nombre_tarjeta')?.updateValueAndValidity();
    this.formPago.get('vencimiento')?.updateValueAndValidity();
    this.formPago.get('cvv')?.updateValueAndValidity();
  }

  private limpiarValidadoresTarjeta() {
    this.formPago.get('numero_tarjeta')?.clearValidators();
    this.formPago.get('nombre_tarjeta')?.clearValidators();
    this.formPago.get('vencimiento')?.clearValidators();
    this.formPago.get('cvv')?.clearValidators();

    this.formPago.get('numero_tarjeta')?.updateValueAndValidity();
    this.formPago.get('nombre_tarjeta')?.updateValueAndValidity();
    this.formPago.get('vencimiento')?.updateValueAndValidity();
    this.formPago.get('cvv')?.updateValueAndValidity();
  }

  finalizarCompra() {
    if (this.formPago.invalid || this.formComprobante.invalid) {
      this.formPago.markAllAsTouched();
      this.formComprobante.markAllAsTouched();
      return;
    }

    // ⭐ Usa UsuarioSesion SOLO para CLIENTE o INVITADO
    const usuario = this.session.usuarioActual as UsuarioSesion | null;

    const pedido = this.pedidoTemporal?.pedido;
    const detalle = this.pedidoTemporal?.detalle;

    if (!usuario?.idCliente) return;
    if (!pedido) return;
    if (!detalle || !detalle.length) return;

    const request: CheckoutRequest = {
      clienteId: Number(usuario.idCliente),
      empleadoId: null,
      pedido: {
        idTienda: Number(pedido.idTienda),
        estado: pedido.estado ?? 'PENDIENTE',
        tipoVenta: pedido.tipoVenta ?? 'ONLINE',
        metodoEntrega: pedido.metodoEntrega,
        direccionEntrega: pedido.direccionEntrega ?? null,
        fechaEntregaProgramada: pedido.fechaEntregaProgramada ?? null,

        costoEnvio: Number(pedido.costoEnvio ?? 0),
        totalBruto: Number(pedido.totalBruto ?? 0),
        descuentoTotal: Number(pedido.descuentoTotal ?? 0),
        subtotal: Number(pedido.subtotal ?? 0),
        igvTotal: Number(pedido.igvTotal ?? 0),
        total: Number(pedido.total ?? 0),
        observaciones: pedido.observaciones ?? null,
        nombreReceptor: pedido.nombreReceptor ?? null,
      },

      detalle: detalle.map((d: any) => ({
        productoId: Number(d.productoId ?? d.producto_id),
        cantidad: Number(d.cantidad ?? 0),
        precioUnitario: Number(d.precioUnitario ?? d.precio_unitario ?? 0),
        descuento: Number(d.descuento ?? 0),
        subtotal: Number(d.subtotal ?? 0),
      })),

      pago: {
        metodo_pago: this.formPago.value.metodo_pago,
        moneda: this.formPago.value.moneda,
        monto: Number(this.formPago.value.monto),
        observaciones: this.formPago.value.observaciones ?? null,
        referencia_transaccion:
          this.formPago.value.numero_tarjeta + ' - ' + this.formPago.value.nombre_tarjeta,
      },

      comprobante: {
        tipo: this.formComprobante.value.tipo,
        numero_documento: this.formComprobante.value.numero_documento ?? null,
        razon_social: this.formComprobante.value.razon_social ?? null,
        direccion_fiscal: this.formComprobante.value.direccion_fiscal ?? null,
      },

      direccionEnvio:
        pedido.metodoEntrega === 'DOMICILIO'
          ? {
              direccionTexto: pedido.direccionEntrega,
              nombreReceptor: pedido.nombreReceptor,
              departamento: pedido.direccionEnvioCompleta?.departamento,
              provincia: pedido.direccionEnvioCompleta?.provincia,
              distrito: pedido.direccionEnvioCompleta?.distrito,
              via: pedido.direccionEnvioCompleta?.via,
              numero: pedido.direccionEnvioCompleta?.numero,
              sinNumero: pedido.direccionEnvioCompleta?.sinNumero,
              pisoDepartamento: pedido.direccionEnvioCompleta?.pisoDepartamento,
              referencia: pedido.direccionEnvioCompleta?.referencia,
            }
          : null,
    };

    this.checkoutService.finalizarCompra(request).subscribe({
      next: (resp) => {
        const dataExitosa = {
          pedidoId: resp?.pedidoId ?? null,
          total: request.pedido.total,
          metodoPago: request.pago.metodo_pago,
          metodoEntrega: request.pedido.metodoEntrega,
          nombreCliente: request.pedido.nombreReceptor ?? 'Cliente',
          direccion: request.pedido.direccionEntrega ?? '',
          fecha: new Date().toISOString(),
        };

        localStorage.setItem('checkoutResumen', JSON.stringify(dataExitosa));

        Swal.fire({
          title: '¡Pedido Registrado!',
          text: 'Tu pedido fue procesado correctamente.',
          icon: 'success',
          confirmButtonText: 'Ver Detalles del Pedido',
        }).then(() => {
          this.router.navigate(['/checkout/exito'], { state: dataExitosa });
        });
      },
      error: () => {
        Swal.fire({
          title: 'Error',
          text: 'Ocurrió un problema al procesar tu pedido',
          icon: 'error',
        });
      },
    });
  }
}
