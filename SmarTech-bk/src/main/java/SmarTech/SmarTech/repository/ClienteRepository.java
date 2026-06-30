/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package SmarTech.SmarTech.repository;

/**
 *
 * @author kevin
 */
import SmarTech.SmarTech.model.Cliente;
import SmarTech.SmarTech.model.TipoVentaEnum;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    Optional<Cliente> findByCorreoCliente(String correoCliente);

    boolean existsByCorreoCliente(String correoCliente);

    @Query("""
    SELECT c, COALESCE(SUM(p.total), 0) AS totalComprado
    FROM Cliente c
    LEFT JOIN Pedido p ON p.cliente.idCliente = c.idCliente
         AND p.tipoVenta = :tipoVenta
    WHERE
        (:filtro IS NULL OR
         LOWER(c.nombreCliente) LIKE LOWER(CONCAT('%', :filtro, '%')) OR
         LOWER(c.apellidoCliente) LIKE LOWER(CONCAT('%', :filtro, '%')) OR
         LOWER(c.correoCliente) LIKE LOWER(CONCAT('%', :filtro, '%'))
        )
    GROUP BY c
    ORDER BY totalComprado DESC
""")
    List<Object[]> listarClientesDesc(
            @Param("filtro") String filtro,
            @Param("tipoVenta") TipoVentaEnum tipoVenta);

    @Query("""
    SELECT c, COALESCE(SUM(p.total), 0) AS totalComprado
    FROM Cliente c
    LEFT JOIN Pedido p ON p.cliente.idCliente = c.idCliente
         AND p.tipoVenta = :tipoVenta
    WHERE
        (:filtro IS NULL OR
         LOWER(c.nombreCliente) LIKE LOWER(CONCAT('%', :filtro, '%')) OR
         LOWER(c.apellidoCliente) LIKE LOWER(CONCAT('%', :filtro, '%')) OR
         LOWER(c.correoCliente) LIKE LOWER(CONCAT('%', :filtro, '%'))
        )
    GROUP BY c
    ORDER BY totalComprado ASC
""")
    List<Object[]> listarClientesAsc(
            @Param("filtro") String filtro,
            @Param("tipoVenta") TipoVentaEnum tipoVenta);

}
