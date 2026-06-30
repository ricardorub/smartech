package SmarTech.SmarTech.RestController;

import SmarTech.SmarTech.model.Productos;
import SmarTech.SmarTech.service.ProductoService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/productos")
@RequiredArgsConstructor
@CrossOrigin("*")
public class AdminProductoController {

    private final ProductoService productoService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public Page<Productos> listarAdmin(
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) Long categoriaId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return productoService.listarProductosAdmin(nombre, categoriaId, page, size);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping(consumes = "multipart/form-data")
    public Productos crear(
            @RequestParam String nombreProducto,
            @RequestParam(required = false) String descripcionProducto,
            @RequestParam Double precioProducto,
            @RequestParam(required = false) Integer descuentoProducto,
            @RequestParam(required = false) Integer garantiaProducto,
            @RequestParam(required = false) String imeiSerieProducto,
            @RequestParam Long categoriaId,
            @RequestPart(value = "imagen", required = false) MultipartFile imagen
    ) throws Exception {

        return productoService.crearProducto(
                nombreProducto,
                descripcionProducto,
                precioProducto,
                descuentoProducto,
                garantiaProducto,
                imeiSerieProducto,
                categoriaId,
                imagen
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public Productos actualizar(
            @PathVariable Long id,
            @RequestBody Productos p
    ) {
        return productoService.actualizarProducto(id, p);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/estado")
    public Productos cambiarEstado(
            @PathVariable Long id,
            @RequestParam Integer estado
    ) {
        return productoService.actualizarEstado(id, estado);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping(value = "/{id}/imagen", consumes = "multipart/form-data")
    public Productos actualizarImagen(
            @PathVariable Long id,
            @RequestPart("imagen") MultipartFile imagen
    ) throws Exception {
        return productoService.actualizarImagen(id, imagen);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}/imagen")
    public Productos eliminarImagen(@PathVariable Long id) throws Exception {
        return productoService.eliminarImagen(id);
    }

    @GetMapping("/buscar-por-tienda")
    public ResponseEntity<?> buscarPorTienda(
            @RequestParam String buscar,
            @RequestParam Long tiendaId
    ) {
        return ResponseEntity.ok(productoService.buscarPorTienda(buscar, tiendaId));
    }

}
