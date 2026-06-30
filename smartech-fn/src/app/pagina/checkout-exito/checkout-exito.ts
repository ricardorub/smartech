// src/app/pagina/checkout-exito/checkout-exito.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SessionService, UsuarioSesion, UsuarioAdminEmpleado } from '../../services/session.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-checkout-exito',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './checkout-exito.html',
  styleUrls: ['./checkout-exito.css'],
})
export class CheckoutExitoComponent implements OnInit {
  data: any = null;

  esYapeOPLIN = false;
  esEfectivo = false;
  esTarjeta = false;
  esTransferencia = false;

  constructor(
    private router: Router,
    private sessionService: SessionService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    const dataLS = localStorage.getItem('checkoutResumen');

    this.data = history.state?.pedidoId
      ? history.state
      : dataLS
      ? JSON.parse(dataLS)
      : null;

    const metodo = this.data?.metodoPago;

    this.esYapeOPLIN = metodo === 'Yape' || metodo === 'Plin';
    this.esEfectivo = metodo === 'Efectivo';
    this.esTarjeta =
      metodo === 'Tarjeta_credito' || metodo === 'Tarjeta_debito';
    this.esTransferencia = metodo === 'Transferencia';

    this.limpiarTodo();
  }

  private limpiarTodo() {
    this.cartService.limpiarCarrito();

    const usuario = this.sessionService.usuarioActual;

    if (!usuario) {
      localStorage.clear();
      return;
    }

    if (usuario.tipo === 'INVITADO') {
      localStorage.clear();
      return;
    }

    if (usuario.tipo === 'CLIENTE') {
      const clavesABorrar = ['carrito', 'pedidoTemporal', 'checkoutResumen'];
      clavesABorrar.forEach((key) => localStorage.removeItem(key));
      return;
    }

  }
}
