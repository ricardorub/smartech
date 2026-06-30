/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package SmarTech.SmarTech.DTO;

// package SmarTech.SmarTech.DTO;

import lombok.Data;
import java.util.List;

@Data
public class VentaTiendaRequestDTO {
    private Long tiendaId;
    private Long empleadoId;
    private Long clienteId;        
    private String observaciones;

    private List<ProductoVentaDTO> productos;

    @Data
    public static class ProductoVentaDTO {
        private Long productoId;
        private Integer cantidad;
        private Double precioUnitario;
        private Double descuento;  
    }
}


