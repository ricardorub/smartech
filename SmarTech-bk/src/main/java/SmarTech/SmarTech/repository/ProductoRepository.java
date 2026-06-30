/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package SmarTech.SmarTech.repository;

/**
 *
 * @author kevin
 */
import SmarTech.SmarTech.DTO.ProductoStockDto;
import SmarTech.SmarTech.model.Productos;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductoRepository extends JpaRepository<Productos, Long>, JpaSpecificationExecutor<Productos> {

    @Query("""
           SELECT p FROM Productos p
           WHERE p.estadoProducto = 1
           AND (:nombre IS NULL OR LOWER(p.nombreProducto) LIKE LOWER(CONCAT('%', :nombre, '%')))
           AND (:categoriaId IS NULL OR p.categoria.idCategoria = :categoriaId)
           ORDER BY p.idProducto DESC
           """)
    Page<Productos> buscarProductos(
            @Param("nombre") String nombre,
            @Param("categoriaId") Long categoriaId,
            Pageable pageable
    );

    long countByCategoria_IdCategoria(Long idCategoria);

    @Query("""
            SELECT p FROM Productos p
            WHERE NOT EXISTS (
                SELECT i FROM Inventario i
                WHERE i.producto = p
                AND i.tienda.idTienda = :idTienda
            )
             """)
    List<Productos> findProductosSinInventarioPorTienda(@Param("idTienda") Long idTienda);

    @Query("""
    SELECT new SmarTech.SmarTech.DTO.ProductoStockDto(
        p.idProducto,
        p.nombreProducto,
        p.precioProducto,
        p.descuentoProducto,
        i.cantidadDisponibleInventario
    )
    FROM Productos p
    JOIN Inventario i ON i.producto.idProducto = p.idProducto
    WHERE i.tienda.idTienda = :tiendaId
      AND i.cantidadDisponibleInventario > 0
      AND LOWER(p.nombreProducto) LIKE LOWER(CONCAT('%', :texto, '%'))
""")
    List<ProductoStockDto> buscarProductosPorTienda(
            @Param("texto") String texto,
            @Param("tiendaId") Long tiendaId
    );

}
