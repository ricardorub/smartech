/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package SmarTech.SmarTech.repository;

/**
 *
 * @author kevin
 */
import SmarTech.SmarTech.model.UsuariosInternos;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UsuariosInternosRepository extends JpaRepository<UsuariosInternos, Long> {

    Optional<UsuariosInternos> findByUsuario(String usuario);

    @Query("""
           SELECT u FROM UsuariosInternos u
           WHERE
             (:nombre IS NULL OR
                LOWER(CONCAT(u.persona.nombres, ' ', u.persona.apellidos)) LIKE LOWER(CONCAT('%', :nombre, '%'))
                OR LOWER(u.persona.dni) LIKE LOWER(CONCAT('%', :nombre, '%'))
             )
           AND (:rol IS NULL OR u.rolUsuario = :rol)
           AND (:idTienda IS NULL OR u.tienda.idTienda = :idTienda)
           """)
    Page<UsuariosInternos> buscarUsuarios(
            @Param("nombre") String nombre,
            @Param("rol") String rol,
            @Param("idTienda") Long idTienda,
            Pageable pageable
    );
}
