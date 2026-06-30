// src/app/pagina/checkout-entrega/checkout-entrega.ts
import { Component, OnInit } from '@angular/core';
import { SessionService, UsuarioSesion } from '../../services/session.service';
import { TiendaService, Tienda } from '../../services/tienda.service';
import { DireccionModalComponent } from '../../componente/direccion-modal/direccion-modal';

import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface OpcionEntrega {
  tipo: 'TIENDA' | 'DOMICILIO';
  titulo: string;
  direccion?: string;
  precio: number;
  seleccionado: boolean;
  idTienda?: number;
}

@Component({
  selector: 'app-checkout-entrega',
  standalone: true,
  imports: [CommonModule, RouterModule, DireccionModalComponent],
  templateUrl: './checkout-entrega.html',
  styleUrls: ['./checkout-entrega.css'],
})
export class CheckoutEntregaComponent implements OnInit {
  // ✔ Tipado exacto con UsuarioSesion
  usuario: UsuarioSesion | null = null;

  opcionesTienda: OpcionEntrega[] = [];
  opcionesDomicilio: OpcionEntrega[] = [];

  minFechaProgramada: string = '';
  esLima: boolean = false;
  fechaSeleccionada: string = '';

  totalProductos = 0;
  costoEntrega = 0;
  pedidoTemporal: any = null;

  mostrarModalDireccion = false;
  forzarDepartamentoLima = false;

  constructor(
    private sessionService: SessionService,
    private router: Router,
    private tiendaService: TiendaService
  ) {}

  ngOnInit(): void {
    // ==============================
    //  ✔ CARGA EL USUARIO LOGUEADO
    // ==============================
    this.usuario = this.sessionService.usuarioActual as UsuarioSesion | null;

    if (!this.usuario) {
      this.router.navigate(['/checkout-email']);
      return;
    }

    // Detectar si su dirección incluye Lima
    const direccion = this.usuario?.direccionCliente || '';
    this.esLima = direccion.toLowerCase().includes('lima');
    this.forzarDepartamentoLima = this.esLima;

    // Fecha mínima programada → 2 días después
    const hoy = new Date();
    hoy.setDate(hoy.getDate() + 2);
    this.minFechaProgramada = hoy.toISOString().split('T')[0];

    // Obtener pedido temporal
    const data = localStorage.getItem('pedidoTemporal');
    if (!data) {
      this.router.navigate(['/carrito']);
      return;
    }

    this.pedidoTemporal = JSON.parse(data);
    this.totalProductos = Number(this.pedidoTemporal.pedido.total ?? 0);

    // ==============================
    //  ✔ CARGAR TIENDAS
    // ==============================
    this.tiendaService.listarTiendas().subscribe({
      next: (tiendas: Tienda[]) => {
        this.opcionesTienda = tiendas.map((t, index) => ({
          tipo: 'TIENDA',
          idTienda: t.idTienda,
          titulo: t.nombre,
          direccion: `${t.direccion} - ${t.distrito}`,
          precio: 0,
          seleccionado: index === 0,
        }));

        if (this.opcionesTienda.length > 0) {
          const tienda = this.opcionesTienda[0];
          this.pedidoTemporal.pedido.idTienda = tienda.idTienda;
          this.actualizarPedidoTemporal('TIENDA');
        }
      },
    });

    // ==============================
    //  ✔ ENTREGA A DOMICILIO
    // ==============================
    this.opcionesDomicilio = [];

    if (this.esLima) {
      const manana = new Date();
      manana.setDate(manana.getDate() + 1);

      this.opcionesDomicilio.push({
        tipo: 'DOMICILIO',
        titulo: 'Llega mañana',
        precio: 10,
        seleccionado: false,
      });
    }

    this.opcionesDomicilio.push({
      tipo: 'DOMICILIO',
      titulo: 'Entrega programada',
      precio: 9,
      seleccionado: false,
    });
  }

  // ========================================================
  // SELECCIONAR ENTREGA EN TIENDA
  // ========================================================
  seleccionarTienda(index: number) {
    this.opcionesTienda.forEach((op, i) => (op.seleccionado = i === index));
    this.opcionesDomicilio.forEach((op) => (op.seleccionado = false));

    const tienda = this.opcionesTienda[index];

    this.costoEntrega = 0;

    this.pedidoTemporal.pedido.idTienda = tienda.idTienda;
    this.pedidoTemporal.pedido.metodoEntrega = 'RETIRO_TIENDA';
    this.pedidoTemporal.pedido.metodo_entrega = 'RETIRO_TIENDA';

    localStorage.setItem('pedidoTemporal', JSON.stringify(this.pedidoTemporal));

    this.actualizarPedidoTemporal('TIENDA');
  }

  // ========================================================
  // SELECCIONAR ENTREGA A DOMICILIO
  // ========================================================
  seleccionarDomicilio(index: number) {
    const opcion = this.opcionesDomicilio[index];

    this.opcionesDomicilio.forEach((op, i) => (op.seleccionado = i === index));
    this.opcionesTienda.forEach((op) => (op.seleccionado = false));

    this.costoEntrega = Number(opcion.precio);

    this.pedidoTemporal.pedido.costoEnvio = this.costoEntrega;

    this.actualizarPedidoTemporal('DOMICILIO');

    if (opcion.titulo === 'Llega mañana') {
      const manana = new Date();
      manana.setDate(manana.getDate() + 1);

      const fechaManana = manana.toISOString().split('T')[0];
      this.pedidoTemporal.pedido.fechaEntregaProgramada = fechaManana;

      localStorage.setItem('pedidoTemporal', JSON.stringify(this.pedidoTemporal));

      this.abrirModalDireccion();
    }
  }

  actualizarFechaProgramada(event: any) {
    this.fechaSeleccionada = event.target.value;
    this.pedidoTemporal.pedido.fechaEntregaProgramada = this.fechaSeleccionada;
    localStorage.setItem('pedidoTemporal', JSON.stringify(this.pedidoTemporal));

    this.abrirModalDireccion();
  }

  abrirModalDireccion() {
    this.mostrarModalDireccion = true;
  }

  guardarDireccion(data: any) {
    const direccionTexto = `${data.via} ${data.numero || 'S/N'} - ${data.departamento}`;

    this.pedidoTemporal.pedido.direccionEntrega = direccionTexto;

    this.pedidoTemporal.pedido.nombreReceptor = data.nombreReceptorFinal;

    this.pedidoTemporal.pedido.direccionEnvioCompleta = {
      departamento: data.departamento,
      provincia: data.provincia,
      distrito: data.distrito,
      via: data.via,
      numero: data.numero ?? 'S/N',
      sinNumero: data.sinNumero ?? false,
      pisoDepartamento: data.piso ?? '',
      referencia: data.referencia ?? '',
    };

    localStorage.setItem('pedidoTemporal', JSON.stringify(this.pedidoTemporal));
    this.mostrarModalDireccion = false;
  }

  actualizarPedidoTemporal(tipo: 'TIENDA' | 'DOMICILIO') {
    const metodo = tipo === 'TIENDA' ? 'RETIRO_TIENDA' : 'DOMICILIO';

    if (!this.pedidoTemporal || !this.pedidoTemporal.pedido) {
      return;
    }

    this.pedidoTemporal.pedido.metodoEntrega = metodo;
    this.pedidoTemporal.pedido.metodo_entrega = metodo;

    this.pedidoTemporal.pedido.costoEnvio = Number(this.costoEntrega);
    this.pedidoTemporal.pedido.costo_envio = Number(this.costoEntrega);

    this.pedidoTemporal.pedido.total = Number(this.totalFinal);

    if (metodo === 'RETIRO_TIENDA') {
      const tiendaSeleccionada = this.opcionesTienda.find((t) => t.seleccionado);

      this.pedidoTemporal.pedido.direccionEntrega = tiendaSeleccionada?.direccion ?? null;
      this.pedidoTemporal.pedido.direccion_entrega = tiendaSeleccionada?.direccion ?? null;

      this.pedidoTemporal.pedido.nombreReceptor = this.usuario?.nombreCompleto ?? null;

      this.pedidoTemporal.pedido.nombre_receptor = this.pedidoTemporal.pedido.nombreReceptor;
    } else {
      this.pedidoTemporal.pedido.direccionEntrega ??= null;
      this.pedidoTemporal.pedido.nombreReceptor ??= null;
    }

    localStorage.setItem('pedidoTemporal', JSON.stringify(this.pedidoTemporal));
  }

  continuarPago() {
    this.router.navigate(['/checkout/pago']);
  }

  get totalFinal(): number {
    return this.totalProductos + this.costoEntrega;
  }
}
