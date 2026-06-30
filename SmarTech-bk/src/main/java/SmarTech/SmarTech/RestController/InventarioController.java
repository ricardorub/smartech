package SmarTech.SmarTech.RestController;

import SmarTech.SmarTech.DTO.*;
import SmarTech.SmarTech.service.InventarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/private/inventario")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InventarioController {

    private final InventarioService inventarioService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> listarTodos() {
        return ResponseEntity.ok(inventarioService.listarTodos());
    }

    @GetMapping("/tienda/{id}")
    public ResponseEntity<ApiResponse<?>> listarPorTienda(@PathVariable Long id) {
        return ResponseEntity.ok(inventarioService.listarPorTienda(id));
    }

    @GetMapping("/sin-inventario/{id}")
    public ResponseEntity<ApiResponse<?>> productosSinInventario(@PathVariable Long id) {
        return ResponseEntity.ok(inventarioService.productosSinInventario(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<?>> crear(@RequestBody RegistrarInventarioDTO dto) {
        return ResponseEntity.ok(inventarioService.registrarInventario(dto));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/movimiento")
    public ResponseEntity<ApiResponse<?>> movimiento(@RequestBody MovimientoInventarioDTO dto) {
        return ResponseEntity.ok(inventarioService.registrarMovimiento(dto));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/movimientos/{id}")
    public ResponseEntity<ApiResponse<?>> movimientos(@PathVariable Long id) {
        return ResponseEntity.ok(inventarioService.movimientosPorInventario(id));
    }
}
