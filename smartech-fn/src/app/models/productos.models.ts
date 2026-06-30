export interface Categoria {
  idCategoria: number;
  nombreCategoria: string;
  descripcionCategoria: string;
  tieneProductos?: boolean;
}

export interface Producto {
  idProducto: number;
  nombreProducto: string;
  descripcionProducto: string;
  precioProducto: number;
  descuentoProducto: number;
  garantiaProducto: number;
  estadoProducto: number;
  imagenUrlProducto: string;
  imeiSerieProducto?: string;
  categoria: Categoria;
}