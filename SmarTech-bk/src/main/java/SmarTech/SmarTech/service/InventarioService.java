package SmarTech.SmarTech.service;

import SmarTech.SmarTech.DTO.*;
import SmarTech.SmarTech.model.*;
import SmarTech.SmarTech.repository.*;
import static java.time.LocalDateTime.now;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventarioService {

    private final InventarioRepository inventarioRepository;
    private final ProductoRepository productoRepository;
    private final TiendaRepository tiendaRepository;
    private final MovimientoInventarioRepository movimientoRepository;

    public ApiResponse<List<InventarioDTO>> listarTodos() {
        List<Inventario> list = inventarioRepository.findAll();
        return new ApiResponse<>(true, "OK",
                list.stream().map(this::mapear).collect(Collectors.toList())
        );
    }

    public ApiResponse<List<InventarioDTO>> listarPorTienda(Long idTienda) {
        List<Inventario> list = inventarioRepository.findByTienda_IdTienda(idTienda);
        return new ApiResponse<>(true, "OK",
                list.stream().map(this::mapear).collect(Collectors.toList())
        );
    }

    public ApiResponse<List<ProductoResumenDTO>> productosSinInventario(Long idTienda) {

        List<Productos> productos
                = productoRepository.findProductosSinInventarioPorTienda(idTienda);

        List<ProductoResumenDTO> data = productos.stream()
                .map(this::mapearProducto)
                .collect(Collectors.toList());

        return new ApiResponse<>(true, "OK", data);
    }

    @Transactional
    public ApiResponse<InventarioDTO> registrarInventario(RegistrarInventarioDTO dto) {

        boolean yaExiste = inventarioRepository
                .existsByProducto_IdProductoAndTienda_IdTienda(
                        dto.getIdProducto(), dto.getIdTienda()
                );

        if (yaExiste) {
            return new ApiResponse<>(false, "Ya existe inventario para este producto en esta tienda", null);
        }

        Productos producto = productoRepository.findById(dto.getIdProducto())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        Tienda tienda = tiendaRepository.findById(dto.getIdTienda())
                .orElseThrow(() -> new RuntimeException("Tienda no encontrada"));

        Inventario inv = new Inventario();
        inv.setProducto(producto);
        inv.setTienda(tienda);
        inv.setCantidadDisponibleInventario(dto.getCantidad());
        inv.setStockMinimoInventario(dto.getStockMinimo());
        System.out.println(" datos de inventario: " + inv.getCantidadDisponibleInventario());
        inventarioRepository.save(inv);

        return new ApiResponse<>(true, "Inventario creado", mapear(inv));
    }

    @Transactional
    public ApiResponse<InventarioDTO> registrarMovimiento(MovimientoInventarioDTO dto) {

        Inventario inv = inventarioRepository.findById(dto.getIdInventario())
                .orElseThrow(() -> new RuntimeException("Inventario no encontrado"));

        int cantidad = dto.getCantidad();

        boolean esInventarioInicial
                = dto.getMotivo() != null
                && dto.getMotivo().trim().equalsIgnoreCase("INVENTARIO INICIAL");

        if (!esInventarioInicial) {
            switch (dto.getTipoMovimiento()) {
                case "ENTRADA" ->
                    inv.setCantidadDisponibleInventario(
                            inv.getCantidadDisponibleInventario() + cantidad
                    );
                case "SALIDA" ->
                    inv.setCantidadDisponibleInventario(
                            inv.getCantidadDisponibleInventario() - cantidad
                    );
                case "AJUSTE" ->
                    inv.setCantidadDisponibleInventario(cantidad);
            }

            inventarioRepository.save(inv);
        }

        MovimientoInventario mov = new MovimientoInventario();
        mov.setInventario(inv);
        mov.setCantidadMovimiento(cantidad);
        mov.setMotivoMovimiento(dto.getMotivo());
        mov.setTipoMovimiento(dto.getTipoMovimiento());
        mov.setFechaMovimiento(now());

        movimientoRepository.save(mov);

        return new ApiResponse<>(true, "Movimiento registrado correctamente", mapear(inv));
    }

    public ApiResponse<List<MovimientoInventarioDTO>> movimientosPorInventario(Long idInventario) {

        List<MovimientoInventario> list
                = movimientoRepository.findByInventario_IdInventario(idInventario);

        List<MovimientoInventarioDTO> data = list.stream().map(m -> {
            MovimientoInventarioDTO d = new MovimientoInventarioDTO();
            d.setIdInventario(m.getInventario().getIdInventario());
            d.setIdMovInventario(m.getIdMovInventario());
            d.setCantidad(m.getCantidadMovimiento());
            d.setMotivo(m.getMotivoMovimiento());
            d.setTipoMovimiento(m.getTipoMovimiento());
            d.setFechaMovimiento(m.getFechaMovimiento());
            return d;
        }).collect(Collectors.toList());

        return new ApiResponse<>(true, "OK", data);
    }

    private InventarioDTO mapear(Inventario i) {
        InventarioDTO dto = new InventarioDTO();
        dto.setIdInventario(i.getIdInventario());
        dto.setCantidad(i.getCantidadDisponibleInventario());
        dto.setStockMinimo(i.getStockMinimoInventario());
        dto.setActivo(i.getCantidadDisponibleInventario() > 0);

        dto.setIdTienda(i.getTienda().getIdTienda());
        dto.setNombreTienda(i.getTienda().getNombre());

        dto.setProducto(mapearProducto(i.getProducto()));
        return dto;
    }

    private ProductoResumenDTO mapearProducto(Productos p) {
        ProductoResumenDTO dto = new ProductoResumenDTO();
        dto.setIdProducto(p.getIdProducto());
        dto.setNombreProducto(p.getNombreProducto());
        dto.setDescripcionProducto(p.getDescripcionProducto());
        dto.setPrecioProducto(p.getPrecioProducto());
        dto.setImagenUrlProducto(p.getImagenUrlProducto());
        dto.setDescuentoProducto(p.getDescuentoProducto());
        return dto;
    }
}
