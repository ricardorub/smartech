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
import java.math.BigDecimal;

@Data
public class DetalleProductoDTO {

    private String producto;
    private int cantidad;
    private BigDecimal precio;
    private BigDecimal subtotal;

}

