/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package SmarTech.SmarTech.DTO;

/**
 *
 * @author kevin
 */

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReporteVentasDTO {

    private Long idPedido;
    private String fechaPedido;
    private String tienda;
    private String cliente;
    private String tipoVenta;
    private String metodoEntrega;
    private String estadoPedido;
    private String estadoPago;
    private String metodoPago;
    private String moneda;
    private Double monto;
}
