import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Categoria, Producto } from '../../../../models/productos.models';

@Component({
  selector: 'app-producto-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './producto-modal.html',
  styleUrls: ['./producto-modal.css'],
})
export class ProductoModalComponent implements OnChanges {

  @Input() producto: Producto | null = null;
  @Input() categorias: Categoria[] = [];

  @Output() cerrar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<{formData: FormData, esEdicion: boolean, id: number | null}>();

  titulo = 'Nuevo Producto';

  archivoSeleccionado: File | null = null;
  previewImagen: string | null = null;

  form: any = {
    idProducto: null,
    nombreProducto: '',
    descripcionProducto: '',
    precioProducto: 0,
    descuentoProducto: 0,
    garantiaProducto: 0,
    imeiSerieProducto: '',
    categoriaId: null
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['producto']) {
      if (this.producto) {
        this.titulo = 'Editar Producto';
        this.form = {
          idProducto: this.producto.idProducto,
          nombreProducto: this.producto.nombreProducto,
          descripcionProducto: this.producto.descripcionProducto,
          precioProducto: this.producto.precioProducto,
          descuentoProducto: this.producto.descuentoProducto,
          garantiaProducto: this.producto.garantiaProducto,
          imeiSerieProducto: this.producto.imeiSerieProducto ?? '',
          categoriaId: this.producto.categoria?.idCategoria ?? null
        };

        this.previewImagen = this.producto.imagenUrlProducto ?? null;
      } else {
        this.resetForm();
      }
    }
  }

  resetForm() {
    this.titulo = 'Nuevo Producto';
    this.form = {
      idProducto: null,
      nombreProducto: '',
      descripcionProducto: '',
      precioProducto: 0,
      descuentoProducto: 0,
      garantiaProducto: 0,
      imeiSerieProducto: '',
      categoriaId: null
    };
    this.previewImagen = null;
    this.archivoSeleccionado = null;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.archivoSeleccionado = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.previewImagen = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onSubmit() {
    if (!this.form.nombreProducto || !this.form.categoriaId) return;

    const formData = new FormData();

    formData.append('nombreProducto', this.form.nombreProducto);
    formData.append('descripcionProducto', this.form.descripcionProducto);
    formData.append('precioProducto', String(this.form.precioProducto));
    formData.append('descuentoProducto', String(this.form.descuentoProducto));
    formData.append('garantiaProducto', String(this.form.garantiaProducto));
    formData.append('imeiSerieProducto', this.form.imeiSerieProducto);
    formData.append('categoriaId', String(this.form.categoriaId));

    if (this.archivoSeleccionado) {
      formData.append('imagen', this.archivoSeleccionado);
    }

    const esEdicion = !!this.form.idProducto;
console.log(formData);
    this.guardar.emit({
      formData,
      esEdicion,
      id: this.form.idProducto
    });
  }

  cerrarModal() {
    this.cerrar.emit();
  }
}
