package SmarTech.SmarTech.service;

import SmarTech.SmarTech.DTO.ProductoStockDto;
import SmarTech.SmarTech.model.Categoria;
import SmarTech.SmarTech.model.Productos;
import SmarTech.SmarTech.repository.ProductoRepository;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.jpa.domain.Specification;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

@Service
public class ProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    public Page<Productos> listarProductos(String nombre, Long categoriaId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return productoRepository.buscarProductos(nombre, categoriaId, pageable);
    }

    public List<ProductoStockDto> buscarPorTienda(String buscar, Long tiendaId) {
    return productoRepository.buscarProductosPorTienda("%" + buscar.toLowerCase() + "%", tiendaId);
}


    public Page<Productos> listarProductosAdmin(String nombre, Long categoriaId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Specification<Productos> spec = (root, query, cb) -> {
            var p = cb.conjunction();
            if (nombre != null && !nombre.isEmpty()) {
                p = cb.and(p, cb.like(
                        cb.lower(root.get("nombreProducto")),
                        "%" + nombre.toLowerCase() + "%"
                ));
            }
            if (categoriaId != null) {
                p = cb.and(p,
                        cb.equal(root.get("categoria").get("idCategoria"), categoriaId)
                );
            }
            return p;
        };
        return productoRepository.findAll(spec, pageable);
    }

    public Productos crearProducto(
            String nombreProducto,
            String descripcionProducto,
            Double precioProducto,
            Integer descuentoProducto,
            Integer garantiaProducto,
            String imeiSerieProducto,
            Long categoriaId,
            MultipartFile imagen
    ) throws Exception {

        Productos p = new Productos();

        p.setNombreProducto(nombreProducto);
        p.setDescripcionProducto(descripcionProducto);
        p.setPrecioProducto(precioProducto);
        p.setDescuentoProducto(descuentoProducto != null ? descuentoProducto : 0);
        p.setGarantiaProducto(garantiaProducto != null ? garantiaProducto : 0);
        p.setImeiSerieProducto(imeiSerieProducto);
        p.setEstadoProducto(1);

        var categoria = new SmarTech.SmarTech.model.Categoria();
        categoria.setIdCategoria(categoriaId);
        p.setCategoria(categoria);

        if (imagen != null && !imagen.isEmpty()) {
            Map result = cloudinaryService.uploadImage(imagen);
            p.setImagenUrlProducto(result.get("secure_url").toString());
            p.setImagenPublicId(result.get("public_id").toString());
        }

        return productoRepository.save(p);
    }

    public Productos actualizarProducto(Long id, Productos data) {

        Productos p = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        p.setNombreProducto(data.getNombreProducto());
        p.setDescripcionProducto(data.getDescripcionProducto());
        p.setPrecioProducto(data.getPrecioProducto());
        p.setDescuentoProducto(data.getDescuentoProducto());
        p.setGarantiaProducto(data.getGarantiaProducto());
        p.setImeiSerieProducto(data.getImeiSerieProducto());

        if (data.getCategoria() != null && data.getCategoria().getIdCategoria() != null) {
            Categoria c = new Categoria();
            c.setIdCategoria(data.getCategoria().getIdCategoria());
            p.setCategoria(c);
        }

        return productoRepository.save(p);
    }

    public Productos actualizarImagen(Long id, MultipartFile imagen) throws Exception {
        Productos p = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        if (p.getImagenPublicId() != null) {
            cloudinaryService.deleteImage(p.getImagenPublicId());
        }

        Map result = cloudinaryService.uploadImage(imagen);
        p.setImagenUrlProducto(result.get("secure_url").toString());
        p.setImagenPublicId(result.get("public_id").toString());

        return productoRepository.save(p);
    }

    public Productos eliminarImagen(Long id) throws Exception {
        Productos p = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        if (p.getImagenPublicId() != null) {
            cloudinaryService.deleteImage(p.getImagenPublicId());
        }

        p.setImagenUrlProducto(null);
        p.setImagenPublicId(null);

        return productoRepository.save(p);
    }

    public Productos actualizarEstado(Long id, Integer estado) {

        Productos p = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        if (estado == null || (estado != 0 && estado != 1)) {
            throw new RuntimeException("Estado inválido (solo 0 o 1)");
        }

        p.setEstadoProducto(estado);

        return productoRepository.save(p);
    }

}
