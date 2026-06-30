/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package SmarTech.SmarTech.repository;

/**
 *
 * @author kevin
 */
import SmarTech.SmarTech.model.Comprobantes;
import SmarTech.SmarTech.model.EstadoPedidoEnum;
import SmarTech.SmarTech.model.MetodoEntregaEnum;
import SmarTech.SmarTech.model.Pedido;
import SmarTech.SmarTech.model.TipoVentaEnum;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    List<Pedido> findByCliente_IdClienteAndTipoVenta(Long idCliente, TipoVentaEnum tipoVenta);

    @Modifying
    @Query("UPDATE Comprobantes c SET c.pdfUrl = :url WHERE c.pedido.id = :pedidoId")
    void actualizarUrlComprobante(@Param("pedidoId") Long pedidoId,
            @Param("url") String url);

    @Query("SELECT c FROM Comprobantes c WHERE c.pedido.id = :pedidoId")
    Comprobantes obtenerComprobantePorPedido(@Param("pedidoId") Long pedidoId);

    @Query("""
        SELECT p FROM Pedido p
        LEFT JOIN FETCH p.detalles d
        LEFT JOIN FETCH d.producto
        LEFT JOIN FETCH p.comprobante
        WHERE p.idPedido = :idPedido
        """)
    Optional<Pedido> findDetalleCompleto(@Param("idPedido") Long idPedido);

    @Query(value = """
        SELECT DATE_FORMAT(p.fecha_pedido, '%Y-%m') AS mes,
               SUM(p.total) AS total
        FROM pedido p
        WHERE p.empleado_id = :idUsuario
          AND p.tipo_venta = 'TIENDA'
        GROUP BY DATE_FORMAT(p.fecha_pedido, '%Y-%m')
        ORDER BY mes ASC
        """,
            nativeQuery = true)
    List<Object[]> ventasMensualesPorEmpleado(@Param("idUsuario") Long idUsuario);

    @Query("""
        SELECT 
            FUNCTION('DATE_FORMAT', p.fechaPedido, '%Y-%m') AS mes,
            COALESCE(SUM(p.total), 0) AS total
        FROM Pedido p
        WHERE p.cliente.idCliente = :idCliente
          AND p.tipoVenta = :tipoVenta
        GROUP BY FUNCTION('DATE_FORMAT', p.fechaPedido, '%Y-%m')
        ORDER BY mes ASC
        """)
    List<Object[]> comprasMensuales(
            @Param("idCliente") Long idCliente,
            @Param("tipoVenta") TipoVentaEnum tipoVenta
    );

    @Query("""
        SELECT p
        FROM Pedido p
        WHERE p.tipoVenta = :tipoVenta
          AND (:idTienda IS NULL OR p.tienda.idTienda = :idTienda)
          AND (:idEmpleado IS NULL OR p.empleado.idUsuarioInterno = :idEmpleado)
          AND (
               :buscar IS NULL OR
               LOWER(p.cliente.nombreCliente) LIKE LOWER(CONCAT('%', :buscar, '%')) OR
               LOWER(p.cliente.apellidoCliente) LIKE LOWER(CONCAT('%', :buscar, '%')) OR
               CAST(p.idPedido AS string) LIKE CONCAT('%', :buscar, '%')
          )
        ORDER BY p.idPedido DESC
    """)
    Page<Pedido> listarVentasTienda(
            @Param("buscar") String buscar,
            @Param("idTienda") Long idTienda,
            @Param("idEmpleado") Long idEmpleado,
            @Param("tipoVenta") TipoVentaEnum tipoVenta,
            Pageable pageable
    );

    @Procedure(procedureName = "sp_registrar_venta_tienda")
    List<Object[]> registrarVentaTienda(
            @Param("p_empleado_id") Long empleadoId,
            @Param("p_tienda_id") Long tiendaId,
            @Param("p_observaciones") String observaciones
    );

    @Procedure(procedureName = "sp_insertar_pago")
    void insertarPago(
            @Param("p_estado_pago") String estadoPago,
            @Param("p_metodo_pago") String metodo,
            @Param("p_moneda") String moneda,
            @Param("p_monto") Double monto,
            @Param("p_observaciones") String obs,
            @Param("p_referencia_transaccion") String ref,
            @Param("p_pedido_id") Long pedidoId
    );

    @Procedure(procedureName = "sp_insertar_comprobante")
    void insertarComprobante(
            @Param("p_pedido_id") Long pedidoId,
            @Param("p_tipo") String tipo,
            @Param("p_estado") String estado,
            @Param("p_hash_cpe") String hash,
            @Param("p_razon_social") String razonSocial,
            @Param("p_numero_documento") String numeroDocumento,
            @Param("p_total_bruto") Double totalBruto,
            @Param("p_total_descuento") Double totalDescuento,
            @Param("p_sub_total") Double subTotal, // ← corregido
            @Param("p_igv_total") Double igv,
            @Param("p_total_final") Double totalFinal,
            @Param("p_costo_envio") Double costoEnvio
    );

    @Query("""
        SELECT p
        FROM Pedido p
            JOIN p.cliente c
            LEFT JOIN p.tienda t
        WHERE p.tipoVenta = SmarTech.SmarTech.model.TipoVentaEnum.ONLINE
          AND (:idPedido IS NULL OR p.idPedido = :idPedido)
          AND (:cliente IS NULL OR
               LOWER(CONCAT(c.nombreCliente, ' ', c.apellidoCliente))
                 LIKE LOWER(CONCAT('%', :cliente, '%')))
          AND (:estado IS NULL OR p.estado = :estado)
          AND (:metodo IS NULL OR p.metodoEntrega = :metodo)
          AND (:tiendaId IS NULL OR t.idTienda = :tiendaId)
          AND (:fechaInicio IS NULL OR p.fechaPedido >= :fechaInicio)
          AND (:fechaFin IS NULL OR p.fechaPedido <= :fechaFin)
        """)
    Page<Pedido> buscarPedidosOnline(
            @Param("idPedido") Long idPedido,
            @Param("cliente") String cliente,
            @Param("estado") EstadoPedidoEnum estado,
            @Param("metodo") MetodoEntregaEnum metodo,
            @Param("fechaInicio") Date fechaInicio,
            @Param("fechaFin") Date fechaFin,
            @Param("tiendaId") Long tiendaId,
            Pageable pageable
    );
}
