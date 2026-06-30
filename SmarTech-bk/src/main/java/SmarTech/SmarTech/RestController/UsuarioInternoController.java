/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package SmarTech.SmarTech.RestController;

/**
 *
 * @author kevin
 */
import SmarTech.SmarTech.DTO.UsuarioInternoDTO;
import SmarTech.SmarTech.DTO.UsuarioInternoRequestDTO;
import SmarTech.SmarTech.DTO.VentasMensualesDTO;
import SmarTech.SmarTech.service.UsuarioInternoService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/private/usuarios")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class UsuarioInternoController {

    private final UsuarioInternoService usuarioInternoService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<Page<UsuarioInternoDTO>> listarUsuarios(
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) String rol,
            @RequestParam(required = false, name = "tienda") Long idTienda,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<UsuarioInternoDTO> result
                = usuarioInternoService.listarUsuarios(nombre, rol, idTienda, page, size);
        return ResponseEntity.ok(result);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<UsuarioInternoDTO> crearUsuario(@RequestBody UsuarioInternoRequestDTO dto) {
        UsuarioInternoDTO creado = usuarioInternoService.crearUsuario(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<UsuarioInternoDTO> actualizarUsuario(
            @PathVariable Long id,
            @RequestBody UsuarioInternoRequestDTO dto
    ) {
        UsuarioInternoDTO actualizado = usuarioInternoService.actualizarUsuario(id, dto);
        return ResponseEntity.ok(actualizado);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/estado")
    public ResponseEntity<Void> cambiarEstado(@PathVariable Long id) {
        usuarioInternoService.cambiarEstado(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}/ventas-mensuales")
    public ResponseEntity<List<VentasMensualesDTO>> obtenerVentasMensuales(@PathVariable Long id) {
        List<VentasMensualesDTO> data = usuarioInternoService.obtenerVentasMensuales(id);
        return ResponseEntity.ok(data);
    }
}
