/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package SmarTech.SmarTech.service;

import SmarTech.SmarTech.DTO.DireccionEnvioDto;
import SmarTech.SmarTech.DTO.CheckoutRequest;
import SmarTech.SmarTech.DTO.ComprobanteDto;
import SmarTech.SmarTech.DTO.PagoDto;
import SmarTech.SmarTech.DTO.PedidoDto;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.ParameterMode;
import jakarta.persistence.StoredProcedureQuery;
import jakarta.transaction.Transactional;
import java.util.Map;
import org.springframework.stereotype.Service;

/**
 *
 * @author kevin
 */
@Service
@Transactional
public class CheckoutService {

    private final EntityManager em;

    public CheckoutService(EntityManager em) {
        this.em = em;
    }

    public Long finalizarPedido(CheckoutRequest req) {

        PedidoDto p = req.getPedido();

        try {
            ObjectMapper mapper = new ObjectMapper();
            String detallesJson = mapper.writeValueAsString(
                    req.getDetalle().stream().map(d -> Map.of(
                    "producto_id", d.getProductoId(),
                    "cantidad", d.getCantidad(),
                    "precio_unitario", d.getPrecioUnitario(),
                    "descuento", d.getDescuento(),
                    "subtotal", d.getSubtotal()
            )).toList()
            );

            StoredProcedureQuery spPedido = em
                    .createStoredProcedureQuery("sp_insertar_pedido_con_detalles")
                    .registerStoredProcedureParameter("p_cliente_id", Long.class, ParameterMode.IN)
                    .registerStoredProcedureParameter("p_empleado_id", Long.class, ParameterMode.IN)
                    .registerStoredProcedureParameter("p_id_tienda", Long.class, ParameterMode.IN)
                    .registerStoredProcedureParameter("p_estado", String.class, ParameterMode.IN)
                    .registerStoredProcedureParameter("p_tipo_venta", String.class, ParameterMode.IN)
                    .registerStoredProcedureParameter("p_metodo_entrega", String.class, ParameterMode.IN)
                    .registerStoredProcedureParameter("p_direccion_entrega", String.class, ParameterMode.IN)
                    .registerStoredProcedureParameter("p_fecha_entrega_programada", java.sql.Timestamp.class, ParameterMode.IN)
                    .registerStoredProcedureParameter("p_costo_envio", Double.class, ParameterMode.IN)
                    .registerStoredProcedureParameter("p_total_bruto", Double.class, ParameterMode.IN)
                    .registerStoredProcedureParameter("p_descuento_total", Double.class, ParameterMode.IN)
                    .registerStoredProcedureParameter("p_subtotal", Double.class, ParameterMode.IN)
                    .registerStoredProcedureParameter("p_igv_total", Double.class, ParameterMode.IN)
                    .registerStoredProcedureParameter("p_total", Double.class, ParameterMode.IN)
                    .registerStoredProcedureParameter("p_observaciones", String.class, ParameterMode.IN)
                    .registerStoredProcedureParameter("p_detalles", String.class, ParameterMode.IN)
                    .registerStoredProcedureParameter("p_id_pedido", Long.class, ParameterMode.OUT);

            spPedido.setParameter("p_cliente_id", req.getClienteId());
            spPedido.setParameter("p_empleado_id", req.getEmpleadoId());
            spPedido.setParameter("p_id_tienda", p.getIdTienda());
            spPedido.setParameter("p_estado", p.getEstado());
            spPedido.setParameter("p_tipo_venta", p.getTipoVenta());
            spPedido.setParameter("p_metodo_entrega", p.getMetodoEntrega());
            spPedido.setParameter("p_direccion_entrega", p.getDireccionEntrega());

            java.sql.Timestamp tsEntrega = null;
            if (p.getFechaEntregaProgramada() != null) {
                tsEntrega = java.sql.Timestamp.valueOf(p.getFechaEntregaProgramada() + " 00:00:00");
            }
            spPedido.setParameter("p_fecha_entrega_programada", tsEntrega);

            spPedido.setParameter("p_costo_envio", p.getCostoEnvio());
            spPedido.setParameter("p_total_bruto", p.getTotalBruto());
            spPedido.setParameter("p_descuento_total", p.getDescuentoTotal());
            spPedido.setParameter("p_subtotal", p.getSubtotal());
            spPedido.setParameter("p_igv_total", p.getIgvTotal());
            spPedido.setParameter("p_total", p.getTotal());
            spPedido.setParameter("p_observaciones", p.getObservaciones());
            spPedido.setParameter("p_detalles", detallesJson);

            spPedido.execute();

            Long pedidoId = (Long) spPedido.getOutputParameterValue("p_id_pedido");

            if ("DOMICILIO".equalsIgnoreCase(p.getMetodoEntrega())
                    && req.getDireccionEnvio() != null
                    && req.getDireccionEnvio().getDepartamento() != null) {

                DireccionEnvioDto dir = req.getDireccionEnvio();

                StoredProcedureQuery spDir = em
                        .createStoredProcedureQuery("sp_insertar_direccion_cliente")
                        .registerStoredProcedureParameter("p_cliente_id", Long.class, ParameterMode.IN)
                        .registerStoredProcedureParameter("p_pedido_id", Long.class, ParameterMode.IN)
                        .registerStoredProcedureParameter("p_departamento", String.class, ParameterMode.IN)
                        .registerStoredProcedureParameter("p_provincia", String.class, ParameterMode.IN)
                        .registerStoredProcedureParameter("p_distrito", String.class, ParameterMode.IN)
                        .registerStoredProcedureParameter("p_via", String.class, ParameterMode.IN)
                        .registerStoredProcedureParameter("p_numero", String.class, ParameterMode.IN)
                        .registerStoredProcedureParameter("p_sin_numero", Boolean.class, ParameterMode.IN)
                        .registerStoredProcedureParameter("p_piso_departamento", String.class, ParameterMode.IN)
                        .registerStoredProcedureParameter("p_referencia", String.class, ParameterMode.IN)
                        .registerStoredProcedureParameter("p_nombre_receptor", String.class, ParameterMode.IN)
                        .registerStoredProcedureParameter("p_activo", Boolean.class, ParameterMode.IN);

                spDir.setParameter("p_cliente_id", req.getClienteId());
                spDir.setParameter("p_pedido_id", pedidoId);
                spDir.setParameter("p_departamento", dir.getDepartamento());
                spDir.setParameter("p_provincia", dir.getProvincia());
                spDir.setParameter("p_distrito", dir.getDistrito());
                spDir.setParameter("p_via", dir.getVia());
                spDir.setParameter("p_numero", dir.getNumero());
                spDir.setParameter("p_sin_numero", Boolean.TRUE.equals(dir.getSinNumero()));
                spDir.setParameter("p_piso_departamento", dir.getPisoDepartamento());
                spDir.setParameter("p_referencia", dir.getReferencia());
                spDir.setParameter("p_nombre_receptor", dir.getNombreReceptor());
                spDir.setParameter("p_activo", true);

                spDir.execute();
            }

            PagoDto pagoDto = req.getPago();

            StoredProcedureQuery spPago = em
                    .createStoredProcedureQuery("sp_insertar_pago")
                    .registerStoredProcedureParameter("p_estado_pago", String.class, ParameterMode.IN)
                    .registerStoredProcedureParameter("p_metodo_pago", String.class, ParameterMode.IN)
                    .registerStoredProcedureParameter("p_moneda", String.class, ParameterMode.IN)
                    .registerStoredProcedureParameter("p_monto", Double.class, ParameterMode.IN)
                    .registerStoredProcedureParameter("p_observaciones", String.class, ParameterMode.IN)
                    .registerStoredProcedureParameter("p_referencia_transaccion", String.class, ParameterMode.IN)
                    .registerStoredProcedureParameter("p_pedido_id", Long.class, ParameterMode.IN);

            spPago.setParameter("p_estado_pago", "Pendiente");
            spPago.setParameter("p_metodo_pago", pagoDto.getMetodo_pago());
            spPago.setParameter("p_moneda", pagoDto.getMoneda());
            spPago.setParameter("p_monto", pagoDto.getMonto());
            spPago.setParameter("p_observaciones", pagoDto.getObservaciones());
            spPago.setParameter("p_referencia_transaccion", pagoDto.getReferencia_transaccion());
            spPago.setParameter("p_pedido_id", pedidoId);

            spPago.execute();

            ComprobanteDto c = req.getComprobante();

            StoredProcedureQuery spComp = em
                    .createStoredProcedureQuery("sp_insertar_comprobante")
                    .registerStoredProcedureParameter("p_pedido_id", Long.class, ParameterMode.IN)
                    .registerStoredProcedureParameter("p_tipo", String.class, ParameterMode.IN)
                    .registerStoredProcedureParameter("p_estado", String.class, ParameterMode.IN)
                    .registerStoredProcedureParameter("p_hash_cpe", String.class, ParameterMode.IN)
                    .registerStoredProcedureParameter("p_razon_social", String.class, ParameterMode.IN)
                    .registerStoredProcedureParameter("p_numero_documento", String.class, ParameterMode.IN)
                    .registerStoredProcedureParameter("p_total_bruto", Double.class, ParameterMode.IN)
                    .registerStoredProcedureParameter("p_total_descuento", Double.class, ParameterMode.IN)
                    .registerStoredProcedureParameter("p_sub_total", Double.class, ParameterMode.IN)
                    .registerStoredProcedureParameter("p_igv_total", Double.class, ParameterMode.IN)
                    .registerStoredProcedureParameter("p_total_final", Double.class, ParameterMode.IN)
                    .registerStoredProcedureParameter("p_costo_envio", Double.class, ParameterMode.IN);

            spComp.setParameter("p_pedido_id", pedidoId);
            spComp.setParameter("p_tipo", c.getTipo());
            spComp.setParameter("p_estado", "Pendiente");
            spComp.setParameter("p_hash_cpe", null);
            spComp.setParameter("p_razon_social",
                    c.getRazon_social() != null ? c.getRazon_social() : "CONSUMIDOR FINAL");
            spComp.setParameter("p_numero_documento", c.getNumero_documento());
            spComp.setParameter("p_total_bruto", p.getTotalBruto());
            spComp.setParameter("p_total_descuento", p.getDescuentoTotal());
            spComp.setParameter("p_sub_total", p.getSubtotal());
            spComp.setParameter("p_igv_total", p.getIgvTotal());
            spComp.setParameter("p_total_final", p.getTotal());
            spComp.setParameter("p_costo_envio",
                    p.getCostoEnvio() != null ? p.getCostoEnvio() : 0.0);

            spComp.execute();

            return pedidoId;

        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error al finalizar pedido", e);
        }
    }

}
