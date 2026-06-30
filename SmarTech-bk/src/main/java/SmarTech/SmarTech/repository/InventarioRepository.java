/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package SmarTech.SmarTech.repository;

/**
 *
 * @author kevin
 */


import SmarTech.SmarTech.model.Inventario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventarioRepository extends JpaRepository<Inventario, Long> {

    List<Inventario> findByTienda_IdTienda(Long idTienda);

    boolean existsByProducto_IdProductoAndTienda_IdTienda(Long idProducto, Long idTienda);
}


