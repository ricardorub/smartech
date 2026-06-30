/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package SmarTech.SmarTech.repository;

/**
 *
 * @author kevin
 */

import SmarTech.SmarTech.DTO.*;
import SmarTech.SmarTech.model.Pedido;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface DashboardRepository extends CrudRepository<Pedido, Long> {

    @Query(value = """
        SELECT COALESCE(SUM(p.total), 0)
        FROM pedido p
        JOIN pagos pa ON pa.pedido_id = p.id_pedido
        WHERE DATE(p.fecha_pedido) = CURDATE()
        AND pa.estado_pago = 'Completado'
        """, nativeQuery = true)
    double ventasHoy();

    @Query(value = """
        SELECT COUNT(*)
        FROM pedido
        WHERE DATE(fecha_pedido) = CURDATE()
        """, nativeQuery = true)
    long pedidosHoy();

    @Query(value = """
        SELECT COUNT(*)
        FROM cliente
        WHERE MONTH(fecha_registro_cliente) = MONTH(CURDATE())
        AND YEAR(fecha_registro_cliente) = YEAR(CURDATE())
        """, nativeQuery = true)
    long clientesNuevosMes();

 
    @Query(value = """
        SELECT COUNT(*)
        FROM inventario
        WHERE cantidad_disponible_inventario = 0
        """, nativeQuery = true)
    long productosSinStock();


    @Query(value = """
        SELECT DATE(p.fecha_pedido) AS fecha, 
               COALESCE(SUM(p.total), 0) AS total
        FROM pedido p
        JOIN pagos pa ON pa.pedido_id = p.id_pedido
        WHERE pa.estado_pago = 'Completado'
        GROUP BY DATE(p.fecha_pedido)
        ORDER BY fecha DESC
        LIMIT 7
        """, nativeQuery = true)
    List<Object[]> ventasUltimos7Dias();


    @Query(value = """
        SELECT estado, COUNT(*)
        FROM pedido
        GROUP BY estado
        """, nativeQuery = true)
    List<Object[]> pedidosPorEstado();


    @Query(value = """
        SELECT pr.nombre_producto,
               SUM(dp.cantidad) AS unidades,
               SUM(dp.subtotal) AS ingresos
        FROM detalle_pedido dp
        JOIN pedido p ON dp.pedido_id = p.id_pedido
        JOIN pagos pa ON pa.pedido_id = p.id_pedido
        JOIN producto pr ON pr.id_producto = dp.producto_id
        WHERE pa.estado_pago = 'Completado'
        GROUP BY pr.nombre_producto
        ORDER BY unidades DESC
        LIMIT 5
        """, nativeQuery = true)
    List<Object[]> topProductos();


    @Query(value = """
        SELECT CONCAT(c.nombre_cliente, ' ', c.apellido_cliente),
               COUNT(p.id_pedido) AS pedidos,
               SUM(p.total) AS total
        FROM pedido p
        JOIN cliente c ON c.id_cliente = p.cliente_id
        JOIN pagos pa ON pa.pedido_id = p.id_pedido
        WHERE pa.estado_pago = 'Completado'
        GROUP BY c.id_cliente
        ORDER BY total DESC
        LIMIT 5
        """, nativeQuery = true)
    List<Object[]> topClientes();

}
