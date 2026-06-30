/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package SmarTech.SmarTech.service;

/**
 *
 * @author kevin
 */
import SmarTech.SmarTech.DTO.CategoriaDTO;
import SmarTech.SmarTech.model.Categoria;
import SmarTech.SmarTech.repository.CategoriaRepository;
import SmarTech.SmarTech.repository.ProductoRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoriaService {

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private ProductoRepository productoRepository;

    public List<CategoriaDTO> listarCategorias() {
        List<Categoria> categorias = categoriaRepository.findAll();
        return categorias.stream().map(cat -> {
            CategoriaDTO dto = new CategoriaDTO();
            dto.setIdCategoria(cat.getIdCategoria());
            dto.setNombreCategoria(cat.getNombreCategoria());
            dto.setDescripcionCategoria(cat.getDescripcionCategoria());
            boolean tieneProductos = productoRepository
                    .countByCategoria_IdCategoria(cat.getIdCategoria()) > 0;
            dto.setTieneProductos(tieneProductos);
            return dto;
        }).collect(Collectors.toList());
    }


    public CategoriaDTO guardar(CategoriaDTO dto) {

        Categoria categoria = new Categoria();
        categoria.setNombreCategoria(dto.getNombreCategoria());
        categoria.setDescripcionCategoria(dto.getDescripcionCategoria());

        Categoria guardada = categoriaRepository.save(categoria);

        dto.setIdCategoria(guardada.getIdCategoria());
        dto.setTieneProductos(false);
        return dto;
    }


    public CategoriaDTO actualizar(Long id, CategoriaDTO dto) {

        Categoria existente = categoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        existente.setNombreCategoria(dto.getNombreCategoria());
        existente.setDescripcionCategoria(dto.getDescripcionCategoria());

        categoriaRepository.save(existente);

        dto.setIdCategoria(existente.getIdCategoria());

        boolean tieneProductos = productoRepository
                .countByCategoria_IdCategoria(id) > 0;

        dto.setTieneProductos(tieneProductos);

        return dto;
    }

    @Transactional
    public void eliminarCategoria(Long id) {

        long totalProductos = productoRepository.countByCategoria_IdCategoria(id);

        if (totalProductos > 0) {
            throw new RuntimeException("No se puede eliminar la categoría porque tiene productos asociados.");
        }

        categoriaRepository.deleteById(id);
    }

}
