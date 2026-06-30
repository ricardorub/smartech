
export interface DetallePedidoDto {
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  subtotal: number;
}


export interface PedidoDto {
  idTienda: number;
  estado: string; 
  tipoVenta: string; 
  metodoEntrega: string; 
  direccionEntrega?: string | null;
  fechaEntregaProgramada?: string;
  costoEnvio: number;
  totalBruto: number;
  descuentoTotal: number;
  subtotal: number;
  igvTotal: number;
  total: number;
  observaciones?: string;
  nombreReceptor?: string;
}


export interface PagoDto {
  metodo_pago: string;
  moneda: string;
  monto: number;
  observaciones?: string;
  referencia_transaccion?: string;

}

export interface ComprobanteDto {
  tipo: 'Boleta' | 'Factura';
  numero_documento?: string;
  razon_social?: string;
  direccion_fiscal?: string;
}

export interface DireccionEnvioDto {
  direccionTexto?: string;
  nombreReceptor?: string;

  departamento?: string;
  provincia?: string;
  distrito?: string;
  via?: string;
  numero?: string;
  sinNumero?: boolean;
  pisoDepartamento?: string;
  referencia?: string;
}


export interface CheckoutRequest {
  clienteId: number;
  empleadoId?: number | null;
  pedido: PedidoDto;
  detalle: DetallePedidoDto[];
  pago: PagoDto;
  comprobante: ComprobanteDto;
  direccionEnvio?: DireccionEnvioDto | null;
}
