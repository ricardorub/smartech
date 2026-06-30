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
// DetallePedidoDto.java
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class DetallePedidoDto {
    private Long productoId;
    private Integer cantidad;
    private Double precioUnitario;
    private Double descuento;
    private Double subtotal;
}
