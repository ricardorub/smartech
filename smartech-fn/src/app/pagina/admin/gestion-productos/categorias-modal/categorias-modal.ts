import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Categoria } from '../../../../models/productos.models';
import { ProductoService } from '../../../../services/producto-admin.service';

declare const Swal: any;

@Component({
  selector: 'app-categorias-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categorias-modal.html',
  styleUrls: ['./categorias-modal.css'],
})
export class CategoriasModalComponent implements OnInit {
  @Output() cerrar = new EventEmitter<void>();
  @Output() actualizar = new EventEmitter<void>();

  categorias: Categoria[] = [];
  paginaActual = 1;
  tamanioPagina = 5;

  editando: Categoria | null = null;

  form: any = {
    idCategoria: null,
    nombreCategoria: '',
    descripcionCategoria: '',
  };

  constructor(private productoService: ProductoService) {}

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias() {
    this.productoService.listarCategorias().subscribe({
      next: (data) => {
        this.categorias = data;
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar las categorías',
        });
      },
    });
  }

  get categoriasPagina(): Categoria[] {
    const inicio = (this.paginaActual - 1) * this.tamanioPagina;
    return this.categorias.slice(inicio, inicio + this.tamanioPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.categorias.length / this.tamanioPagina);
  }

  cambiarPagina(p: number) {
    if (p < 1 || p > this.totalPaginas) return;
    this.paginaActual = p;
  }

  editar(cat: Categoria) {
    this.editando = cat;
    this.form = { ...cat };
  }

  nuevaCategoria() {
    this.editando = null;
    this.form = {
      idCategoria: null,
      nombreCategoria: '',
      descripcionCategoria: '',
    };
  }

  guardarCategoria() {
    if (!this.form.nombreCategoria.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'Debes ingresar el nombre de la categoría',
      });
      return;
    }

    if (this.editando) {
      this.productoService.actualizarCategoria(this.form.idCategoria, this.form).subscribe({
        next: () => {
          this.cargarCategorias();
          this.actualizar.emit();
          this.nuevaCategoria();

          Swal.fire({
            icon: 'success',
            title: 'Actualizado',
            text: 'Categoría actualizada correctamente',
            timer: 1500,
            showConfirmButton: false,
          });
        },
        error: () => {
          Swal.fire('Error', 'No se pudo actualizar la categoría', 'error');
        },
      });
    } else {
      this.productoService.guardarCategoria(this.form).subscribe({
        next: () => {
          this.cargarCategorias();
          this.actualizar.emit();
          this.nuevaCategoria();

          Swal.fire({
            icon: 'success',
            title: 'Registrado',
            text: 'Categoría registrada correctamente',
            timer: 1500,
            showConfirmButton: false,
          });
        },
        error: () => {
          Swal.fire('Error', 'No se pudo registrar la categoría', 'error');
        },
      });
    }
  }

  eliminar(cat: Categoria) {
    if ((cat as any).tieneProductos) {
      Swal.fire({
        icon: 'warning',
        title: 'No permitido',
        text: 'No puedes eliminar una categoría que tiene productos asociados',
      });
      return;
    }

    Swal.fire({
      title: '¿Eliminar categoría?',
      text: `Se eliminará "${cat.nombreCategoria}"`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.productoService.eliminarCategoria(cat.idCategoria).subscribe({
          next: () => {
            this.cargarCategorias();
            this.actualizar.emit();

            Swal.fire({
              icon: 'success',
              title: 'Eliminado',
              text: 'Categoría eliminada correctamente',
              timer: 1500,
              showConfirmButton: false,
            });
          },
          error: (err) => {
            Swal.fire('Error', err?.error?.message || 'No se pudo eliminar', 'error');
          },
        });
      }
    });
  }

  cerrarModal() {
    this.cerrar.emit();
  }
}
