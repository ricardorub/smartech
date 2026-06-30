import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoModalComponent } from './producto-modal/producto-modal';
import { CategoriasModalComponent } from './categorias-modal/categorias-modal';
import { ProductoService } from '../../../services/producto-admin.service';
import { Producto, Categoria } from '../../../models/productos.models';
import Swal from 'sweetalert2';



@Component({
  selector: 'app-gestion-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductoModalComponent, CategoriasModalComponent],
  templateUrl: './gestion-productos.html',
  styleUrls: ['./gestion-productos.css'],
})
export class GestionProductosComponent implements OnInit {
  terminoBusqueda = '';
  categoriaFiltro: number | '' = '';

  categorias: Categoria[] = [];
  productos: Producto[] = [];

  paginaActual = 1;
  tamanioPagina = 10;
  totalRegistros = 0;

  mostrarModalProducto = false;
  productoSeleccionado: Producto | null = null;
  mostrarModalCategorias = false;

  loading = false;

  constructor(private productoService: ProductoService) {}

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarProductos();
  }

  cargarCategorias(): void {
    this.productoService.listarCategorias().subscribe({
      next: (data: Categoria[]) => (this.categorias = data),
      error: (err) => console.error('Error al cargar categorías:', err),
    });
  }

  cargarProductos() {
    this.loading = true;

    const categoria = this.categoriaFiltro !== '' ? Number(this.categoriaFiltro) : undefined;

    this.productoService
      .listarProductos(this.paginaActual - 1, this.tamanioPagina, this.terminoBusqueda, categoria)
      .subscribe({
        next: (res) => {
          this.productos = res.content;
          this.totalRegistros = res.totalElements;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          console.error('Error al cargar productos');
        },
      });
  }

  buscar() {
    this.paginaActual = 1;
    this.cargarProductos();
  }

  limpiarFiltros() {
    this.terminoBusqueda = '';
    this.categoriaFiltro = '';
    this.paginaActual = 1;
    this.cargarProductos();
  }

  cambiarPagina(p: number) {
    if (p < 1 || p > this.totalPaginas) return;
    this.paginaActual = p;
    this.cargarProductos();
  }

  abrirNuevoProducto() {
    this.productoSeleccionado = null;
    this.mostrarModalProducto = true;
  }

  editarProducto(prod: Producto) {
    this.productoSeleccionado = { ...prod };
    this.mostrarModalProducto = true;
  }

  guardarProducto(event: { formData: FormData; esEdicion: boolean; id: number | null }) {
    const { formData, esEdicion, id } = event;

    const accion = esEdicion ? 'actualizar' : 'registrar';

    Swal.fire({
      title: `¿Deseas ${accion} este producto?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (!result.isConfirmed) return;
      Swal.fire({
        title: 'Guardando...',
        text: 'Por favor espere',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      if (!esEdicion) {
        this.productoService.guardarProducto(formData).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Registrado',
              text: 'Producto guardado correctamente',
              timer: 1500,
              showConfirmButton: false,
            });

            this.mostrarModalProducto = false;
            this.cargarProductos();
          },
          error: () => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo guardar el producto',
            });
          },
        });
      } else {
        this.productoService.actualizarProducto(id!, this.formDataToJson(formData)).subscribe({
          next: () => {
            const img = formData.get('imagen') as File;

            if (img) {
              Swal.fire({
                title: 'Subiendo imagen...',
                allowOutsideClick: false,
                didOpen: () => {
                  Swal.showLoading();
                },
              });

              this.productoService.actualizarImagen(id!, img).subscribe({
                next: () => {
                  Swal.fire({
                    icon: 'success',
                    title: 'Actualizado',
                    text: 'Producto e imagen actualizados',
                    timer: 1500,
                    showConfirmButton: false,
                  });

                  this.mostrarModalProducto = false;
                  this.cargarProductos();
                },
                error: () => {
                  Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo subir la imagen',
                  });
                },
              });
            } else {
              Swal.fire({
                icon: 'success',
                title: 'Actualizado',
                text: 'Producto actualizado correctamente',
                timer: 1500,
                showConfirmButton: false,
              });

              this.mostrarModalProducto = false;
              this.cargarProductos();
            }
          },
          error: () => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo actualizar el producto',
            });
          },
        });
      }
    });
  }
 formDataToJson(formData: FormData) {
  const obj: any = {};

  formData.forEach((value, key) => {
    if (key === 'categoriaId') {
      obj['categoria'] = { idCategoria: Number(value) };
    } else {
      obj[key] = value;
    }
  });

  return obj;
}


  toggleActivo(prod: Producto) {
    const nuevoEstado = prod.estadoProducto === 1 ? 0 : 1;
    const texto = nuevoEstado === 1 ? 'activar' : 'desactivar';

    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas ${texto} este producto?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#198754',
      cancelButtonColor: '#dc3545',
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.productoService.cambiarEstadoProducto(prod.idProducto, nuevoEstado).subscribe({
          next: () => {
            prod.estadoProducto = nuevoEstado;

            Swal.fire({
              icon: 'success',
              title: 'Actualizado',
              text: `El producto fue ${
                nuevoEstado === 1 ? 'activado' : 'desactivado'
              } correctamente`,
              timer: 2000,
              showConfirmButton: false,
            });
            this.cargarProductos();
          },
          error: () => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo cambiar el estado del producto',
            });
          },
        });
      }
    });
  }

  abrirModalCategorias() {
    this.mostrarModalCategorias = true;
  }

  categoriasActualizadas() {
    this.cargarCategorias();
    this.cargarProductos();
  }

  get totalPaginas(): number {
    return Math.ceil(this.totalRegistros / this.tamanioPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }
}
