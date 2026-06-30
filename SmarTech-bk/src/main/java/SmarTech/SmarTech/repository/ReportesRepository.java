/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package SmarTech.SmarTech.repository;

/**
 *
 * @author kevin
 */
import SmarTech.SmarTech.model.Pedido;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ReportesRepository extends CrudRepository<Pedido, Long> {

    @Query(value = """
        SELECT 
            p.id_pedido                           AS idPedido,
            p.fecha_pedido                        AS fechaPedido,
            t.nombre                              AS tienda,
            CONCAT(c.nombre_cliente,' ',c.apellido_cliente) AS cliente,
            p.tipo_venta                          AS tipoVenta,
            p.metodo_entrega                      AS metodoEntrega,
            p.estado                              AS estadoPedido,
            pa.estado_pago                        AS estadoPago,
            pa.metodo_pago                        AS metodoPago,
            pa.moneda                             AS moneda,
            pa.monto                              AS monto
        FROM pedido p
        JOIN cliente c        ON c.id_cliente = p.cliente_id
        LEFT JOIN pagos pa    ON pa.pedido_id = p.id_pedido
        LEFT JOIN tienda t    ON t.id_tienda = p.id_tienda
        WHERE DATE(p.fecha_pedido) BETWEEN :inicio AND :fin
          AND (:tiendaId IS NULL OR p.id_tienda = :tiendaId)
        ORDER BY p.fecha_pedido DESC
        """, nativeQuery = true)
    List<Object[]> reporteVentas(@Param("inicio") LocalDate inicio,
            @Param("fin") LocalDate fin,
            @Param("tiendaId") Long tiendaId);

    @Query(value = """
        SELECT 
            pr.id_producto                        AS idProducto,
            pr.nombre_producto                    AS nombreProducto,
            cat.nombre_categoria                  AS categoria,
            t.nombre                              AS tienda,
            SUM(dp.cantidad)                      AS cantidadVendida,
            SUM(dp.subtotal)                      AS montoTotal
        FROM detalle_pedido dp
        JOIN pedido p     ON p.id_pedido = dp.pedido_id
        JOIN producto pr  ON pr.id_producto = dp.producto_id
        LEFT JOIN categoria cat ON cat.id_categoria = pr.categoria_id
        LEFT JOIN tienda t ON t.id_tienda = p.id_tienda
        LEFT JOIN pagos pa ON pa.pedido_id = p.id_pedido
        WHERE DATE(p.fecha_pedido) BETWEEN :inicio AND :fin
          AND pa.estado_pago = 'Completado'
          AND (:tiendaId IS NULL OR p.id_tienda = :tiendaId)
        GROUP BY pr.id_producto, pr.nombre_producto, cat.nombre_categoria, t.nombre
        ORDER BY cantidadVendida DESC
        """, nativeQuery = true)
    List<Object[]> reporteProductos(@Param("inicio") LocalDate inicio,
            @Param("fin") LocalDate fin,
            @Param("tiendaId") Long tiendaId);

    @Query(value = """
        SELECT 
            c.id_cliente                            AS idCliente,
            CONCAT(c.nombre_cliente,' ',c.apellido_cliente) AS cliente,
            c.correo_cliente                        AS correo,
            c.telefono_cliente                      AS telefono,
            COUNT(p.id_pedido)                      AS cantidadPedidos,
            COALESCE(SUM(p.total),0)                AS totalComprado,
            MIN(p.fecha_pedido)                     AS primeraCompra,
            MAX(p.fecha_pedido)                     AS ultimaCompra
        FROM cliente c
        JOIN pedido p ON p.cliente_id = c.id_cliente
        JOIN pagos pa ON pa.pedido_id = p.id_pedido
        WHERE DATE(p.fecha_pedido) BETWEEN :inicio AND :fin
          AND pa.estado_pago = 'Completado'
          AND (:tiendaId IS NULL OR p.id_tienda = :tiendaId)
        GROUP BY c.id_cliente, c.nombre_cliente, c.apellido_cliente, 
                 c.correo_cliente, c.telefono_cliente
        ORDER BY totalComprado DESC
        """, nativeQuery = true)
    List<Object[]> reporteClientes(@Param("inicio") LocalDate inicio,
            @Param("fin") LocalDate fin,
            @Param("tiendaId") Long tiendaId);

    @Query(value = """
        SELECT 
            pa.id_pagos             AS idPago,
            p.id_pedido             AS idPedido,
            pa.fecha_pago           AS fechaPago,
            pa.metodo_pago          AS metodoPago,
            pa.estado_pago          AS estadoPago,
            pa.moneda               AS moneda,
            pa.monto                AS monto,
            t.nombre                AS tienda
        FROM pagos pa
        JOIN pedido p  ON p.id_pedido = pa.pedido_id
        LEFT JOIN tienda t ON t.id_tienda = p.id_tienda
        WHERE DATE(pa.fecha_pago) BETWEEN :inicio AND :fin
          AND (:tiendaId IS NULL OR p.id_tienda = :tiendaId)
        ORDER BY pa.fecha_pago DESC
        """, nativeQuery = true)
    List<Object[]> reportePagos(@Param("inicio") LocalDate inicio,
            @Param("fin") LocalDate fin,
            @Param("tiendaId") Long tiendaId);

    @Query(value = """
        SELECT 
            pr.id_producto                         AS idProducto,
            pr.nombre_producto                     AS nombreProducto,
            cat.nombre_categoria                   AS categoria,
            t.nombre                               AS tienda,
            i.cantidad_disponible_inventario       AS stockDisponible,
            i.stock_minimo_inventario              AS stockMinimo
        FROM inventario i
        JOIN producto pr  ON pr.id_producto = i.producto_id
        LEFT JOIN categoria cat ON cat.id_categoria = pr.categoria_id
        LEFT JOIN tienda t      ON t.id_tienda = i.tienda_id
        WHERE (:tiendaId IS NULL OR i.tienda_id = :tiendaId)
        ORDER BY pr.nombre_producto ASC
        """, nativeQuery = true)
    List<Object[]> reporteInventario(@Param("tiendaId") Long tiendaId);
}
