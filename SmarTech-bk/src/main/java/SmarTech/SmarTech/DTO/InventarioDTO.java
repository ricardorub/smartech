/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package SmarTech.SmarTech.DTO;

/**
 *
 * @author kevin
 */
import lombok.Data;

@Data
public class InventarioDTO {

    private Long idInventario;
    private Integer cantidad;
    private Integer stockMinimo;
    private boolean activo;
    private Long idTienda;
    private String nombreTienda;
    private ProductoResumenDTO producto;
}
