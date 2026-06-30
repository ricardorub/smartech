/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package SmarTech.SmarTech.repository;

/**
 *
 * @author kevin
 */
import SmarTech.SmarTech.model.DetallePedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import org.springframework.data.jpa.repository.query.Procedure;

public interface DetallePedidoRepository extends JpaRepository<DetallePedido, Long> {

    List<DetallePedido> findByPedido_IdPedido(Long idPedido);

    @Query("""
        SELECT d
        FROM DetallePedido d
        JOIN FETCH d.producto p
        WHERE d.pedido.idPedido = :idPedido
    """)
    List<DetallePedido> obtenerDetallesConProducto(@Param("idPedido") Long idPedido);

    @Procedure(procedureName = "sp_registrar_detalle_venta_tienda")
    void registrarDetalleTienda(
            @Param("p_pedido_id") Long pedidoId,
            @Param("p_producto_id") Long productoId,
            @Param("p_cantidad") Integer cantidad,
            @Param("p_precio_unitario") Double precio,
            @Param("p_descuento") Double descuento
    );

}
