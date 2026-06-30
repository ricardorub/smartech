import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CarritoItem {
  idProducto: number;
  nombreProducto: string;
  precioProducto: number;
  cantidad: number;
  imagenUrlProducto?: string;
  descuentoProducto?: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private carrito: CarritoItem[] = [];
  private carritoSubject = new BehaviorSubject<CarritoItem[]>(this.carrito);
  carrito$ = this.carritoSubject.asObservable();

  constructor() {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
      this.carrito = JSON.parse(carritoGuardado);
      this.carritoSubject.next(this.carrito);
    }
  }

  agregarProducto(producto: CarritoItem): void {
    const existente = this.carrito.find((p) => p.idProducto === producto.idProducto);

    if (existente) {
      existente.cantidad += producto.cantidad || 1;
    } else {
      this.carrito.push({ ...producto, cantidad: producto.cantidad || 1 });
    }

    this.actualizarEstado();
  }

  eliminarProducto(idProducto: number): void {
    this.carrito = this.carrito.filter((p) => p.idProducto !== idProducto);
    this.actualizarEstado();
  }

  cambiarCantidad(idProducto: number, cantidad: number): void {
    const item = this.carrito.find((p) => p.idProducto === idProducto);
    if (item) {
      item.cantidad = Math.max(1, cantidad);
      this.actualizarEstado();
    }
  }

  limpiarCarrito(): void {
    this.carrito = [];
    this.actualizarEstado();
  }

  calcularSubtotal(item: CarritoItem): number {
    const descuento = item.descuentoProducto || 0;
    const precioFinal = item.precioProducto - (item.precioProducto * descuento) / 100;
    return precioFinal * item.cantidad;
  }
  calcularTotalSinDescuento(): number {
    return this.carrito.reduce((acc, item) => {
      return acc + item.precioProducto * item.cantidad;
    }, 0);
  }

  calcularDescuentoTotal(): number {
    return this.carrito.reduce((acc, item) => {
      const descuento = item.descuentoProducto || 0;
      const montoDescuento = (item.precioProducto * descuento) / 100;
      return acc + montoDescuento * item.cantidad;
    }, 0);
  }

  calcularSubTotalfinal(): number {
    return this.carrito.reduce((acc, p) => acc + this.calcularSubtotal(p), 0);
  }
  calcularIgvTotal(): number {
    const total = this.calcularSubTotalfinal();
    return Number((total * 0.18).toFixed(2));
  }

  calcularTotalFinal(): number {
    return Number((this.calcularSubTotalfinal() + this.calcularIgvTotal()).toFixed(2));
  }

  private actualizarEstado(): void {
    this.carritoSubject.next([...this.carrito]);
    localStorage.setItem('carrito', JSON.stringify(this.carrito));
  }

  contarTotalProductos(): number {
    return this.carrito.reduce((acc, item) => {
      return acc + item.cantidad;
    }, 0);
  }
}
