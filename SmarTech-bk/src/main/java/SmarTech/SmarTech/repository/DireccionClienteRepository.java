/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package SmarTech.SmarTech.repository;

/**
 *
 * @author kevin
 */

import SmarTech.SmarTech.model.DireccionCliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DireccionClienteRepository extends JpaRepository<DireccionCliente, Long> {

    List<DireccionCliente> findByCliente_IdClienteAndActivoTrue(Long idCliente);
    
     List<DireccionCliente> findByCliente_IdCliente(Long idCliente);
    
}

