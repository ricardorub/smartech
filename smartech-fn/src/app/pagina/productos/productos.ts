import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../services/producto';
import { CartService } from '../../services/cart.service';

declare var bootstrap: any;
declare const Swal: any;

interface Categoria {
  idCategoria: number;
  nombreCategoria: string;
  descripcionCategoria?: string;
  tieneProductos?: boolean; 
}

interface Producto {
  idProducto: number;
  nombreProducto: string;
  descripcionProducto?: string;
  precioProducto: number;
  descuentoProducto?: number;
  garantiaProducto?: number;
  estadoProducto?: number;
  imagenUrlProducto?: string;
  categoria?: Categoria;
}

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos.html',
  styleUrls: ['./productos.css'],
})
export class ProductosComponent implements OnInit {
  productos: Producto[] = [];
  categorias: Categoria[] = [];
  productoSeleccionado: any = null;
  terminoBusqueda: string = '';
  page: number = 0;
  totalPages: number = 0;
  selectedCategoria: number | null = null;

  constructor(private productoService: ProductoService, private cartService: CartService) {}

  agregarAlCarrito(producto: any): void {
    this.cartService.agregarProducto({
      idProducto: producto.idProducto,
      nombreProducto: producto.nombreProducto,
      precioProducto: producto.precioProducto,
      imagenUrlProducto: producto.imagenUrlProducto,
      descuentoProducto: producto.descuentoProducto,
      cantidad: 1,
    });
    const modalElement = document.getElementById('detalleProductoModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      modal?.hide();
    }

    this.mostrarToast(` ${producto.nombreProducto} agregado al carrito`);
  }

  mostrarToast(mensaje: string, tipo: 'success' | 'info' | 'warning' | 'error' = 'success'): void {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: tipo,
      title: mensaje,
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
      background: '#fefefe',
      color: '#0a0a0a',
      customClass: {
        popup: 'swal2-toast-custom',
      },
      didOpen: (toast: HTMLElement) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      },
    });
  }

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarProductos();
  }
  abrirModal(producto: any): void {
    this.productoSeleccionado = producto;

    const modalElement = document.getElementById('detalleProductoModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  cargarCategorias(): void {
    this.productoService.getCategorias().subscribe({
      next: (data: Categoria[]) => (this.categorias = data),
      error: (err) => console.error('Error al cargar categorías:', err),
    });
  }

  cargarProductos(): void {
    this.productoService
      .getProductos(this.page, 8, this.terminoBusqueda, this.selectedCategoria ?? undefined)
      .subscribe({
        next: (data: any) => {
          if (Array.isArray(data.content)) {
            this.productos = data.content.map((p: Producto) => this.validarProducto(p));
            this.totalPages = data.totalPages || 1;
          } else if (Array.isArray(data)) {
            this.productos = data.map((p: Producto) => this.validarProducto(p));
            this.totalPages = 1;
          } else {
            console.warn(' Respuesta inesperada del backend:', data);
            this.productos = [];
            this.totalPages = 1;
          }
        },
        error: (err) => console.error('Error al cargar productos:', err),
      });
  }

  obtenerNombreCategoriaSeleccionada(): string {
    if (this.selectedCategoria === null) {
      return 'Todos los Productos';
    }

    const categoriaSeleccionada = this.categorias.find(
      (c) => c.idCategoria === this.selectedCategoria
    );

    return categoriaSeleccionada
      ? categoriaSeleccionada.nombreCategoria
      : 'Categoría no encontrada';
  }

  calcularPrecioDescuento(precio: number, descuento?: number): number {
    if (!descuento || descuento <= 0) return precio;
    return precio - (precio * descuento) / 100;
  }

  private validarProducto(p: Producto): Producto {
    if (!p.imagenUrlProducto || p.imagenUrlProducto.trim() === '') {
      p.imagenUrlProducto = 'assets/images/no-image.png';
    }
    return p;
  }

  buscar(): void {
    this.page = 0;
    this.cargarProductos();
  }

  filtrarPorCategoria(id: number): void {
    this.selectedCategoria = id;
    this.page = 0;
    this.cargarProductos();
  }

  cargarTodos(): void {
    this.selectedCategoria = null;
    this.terminoBusqueda = '';
    this.page = 0;
    this.cargarProductos();
  }

  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina >= 0 && nuevaPagina < this.totalPages) {
      this.page = nuevaPagina;
      this.cargarProductos();
    }
  }
}
