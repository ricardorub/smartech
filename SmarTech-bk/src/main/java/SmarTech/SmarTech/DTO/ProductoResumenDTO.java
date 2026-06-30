/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package SmarTech.SmarTech.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 *
 * @author kevin
 */
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter

public class ProductoResumenDTO {

    private Long idProducto;
    private String nombreProducto;
    private String descripcionProducto;
    private String imagenUrlProducto;
    private Double precioProducto;
    private Integer DescuentoProducto;
}
