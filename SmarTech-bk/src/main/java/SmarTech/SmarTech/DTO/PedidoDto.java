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
// PedidoDto.java
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class PedidoDto {

    private Long idTienda;
    private String estado;             
    private String tipoVenta;         
    private String metodoEntrega;      
    private String direccionEntrega;    

    private String fechaEntregaProgramada; 

    private Double costoEnvio;
    private Double totalBruto;
    private Double descuentoTotal;
    private Double subtotal;
    private Double igvTotal;
    private Double total;
    private String observaciones;

    private String nombreReceptor; 

}
