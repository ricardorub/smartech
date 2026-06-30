export interface Producto {
  idProducto: number;
  nombreProducto: string;
  descripcionProducto: string;
  precioProducto: number;
  imagenUrlProducto: string;
}

export interface DetallePedido {
  idDetallePedido: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  descuento: number;
  producto: Producto;
}

export interface Comprobante {
  idComprobantes: number;
  pdfUrl: string | null;
}

export interface PedidoDetalle {
  idPedido: number;
  fechaPedido: string;
  estado: string;
  metodoEntrega: string;
  direccionEntrega: string;
  total: number;
  detalles: DetallePedido[];
  comprobante: Comprobante | null;
}
