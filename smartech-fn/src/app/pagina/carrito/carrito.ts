import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CartService, CarritoItem } from '../../services/cart.service';

declare const Swal: any;

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './carrito.html',
  styleUrls: ['./carrito.css'],
})
export class CarritoComponent implements OnInit {
  carrito: CarritoItem[] = [];

  constructor(private cartService: CartService, private router: Router) {}

  finalizarCompra() {
    const data = this.prepararDatosPedido();
    localStorage.setItem('pedidoTemporal', JSON.stringify(data));
    this.router.navigate(['/checkout/email']);
  }

  ngOnInit(): void {
    this.cartService.carrito$.subscribe((data) => (this.carrito = data));
  }

  cambiarCantidad(item: CarritoItem, cambio: number): void {
    const nuevaCantidad = item.cantidad + cambio;
    if (nuevaCantidad > 0) {
      this.cartService.cambiarCantidad(item.idProducto, nuevaCantidad);
    }
  }

  eliminarDelCarrito(item: CarritoItem): void {
    Swal.fire({
      title: '¿Eliminar producto?',
      text: `¿Deseas eliminar "${item.nombreProducto}" del carrito?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0a64a0',
      cancelButtonColor: '#c14418',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.cartService.eliminarProducto(item.idProducto);
        Swal.fire({
          title: 'Eliminado',
          text: 'El producto fue eliminado correctamente.',
          icon: 'success',
          confirmButtonColor: '#0a64a0',
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  }
  calcularPrecioDescuento(precio: number, descuento: number): number {
    if (descuento && descuento > 0) {
      return precio - (precio * descuento) / 100;
    }
    return precio;
  }

  calcularTotalBruto(): number {
    return this.cartService.calcularTotalSinDescuento();
  }

  calcularSubtotal(item: CarritoItem): number {
    return this.cartService.calcularSubtotal(item);
  }

  calcularSubTotalFinal(): number {
    return this.cartService.calcularSubTotalfinal();
  }

  calcularDescuentoTotal(): number {
    return this.cartService.calcularDescuentoTotal();
  }

  calcularIgv(): number {
    return this.cartService.calcularIgvTotal();
  }

  calcularTotalFinal(): number {
    return this.cartService.calcularTotalFinal();
  }

  calcularCantidadProductos(): number {
    return this.cartService.contarTotalProductos();
  }

  vaciarCarrito(): void {
    if (this.carrito.length === 0) {
      Swal.fire({
        title: 'Carrito vacío',
        text: 'No hay productos para eliminar.',
        icon: 'info',
        confirmButtonColor: '#0a64a0',
      });
      return;
    }

    Swal.fire({
      title: '¿Vaciar carrito?',
      text: 'Se eliminarán todos los productos agregados.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0a64a0',
      cancelButtonColor: '#c14418',
      confirmButtonText: 'Sí, vaciar',
      cancelButtonText: 'Cancelar',
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.cartService.limpiarCarrito();
        Swal.fire({
          title: 'Carrito vacío',
          text: 'Tu carrito se ha vaciado correctamente.',
          icon: 'success',
          confirmButtonColor: '#0a64a0',
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  }
  prepararDatosPedido() {
    const totalBruto = this.calcularTotalBruto();
    const subtotal = this.calcularSubTotalFinal();
    const descuento = this.calcularDescuentoTotal();
    const igv = this.calcularIgv();
    const total = this.calcularTotalFinal();
    const totalProductos = this.calcularCantidadProductos();

    const pedido = {
      totalProductos: totalProductos,
      totalBruto: totalBruto,
      descuentoTotal: descuento,
      subtotal: subtotal,
      igvTotal: igv,
      total: total,
      costoEnvio: 0,
      tipoVenta: 'ONLINE',
      estado: 'PENDIENTE',
    };

    const detalle = this.carrito.map((item) => ({
      productoId: item.idProducto,
      cantidad: item.cantidad,
      precioUnitario: item.precioProducto,
      descuento: item.descuentoProducto || 0,
      subtotal: this.calcularSubtotal(item),
    }));

    return { pedido, detalle };
  }
}
