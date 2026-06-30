/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package SmarTech.SmarTech.DTO;

/**
 *
 * @author kevin
 */

import SmarTech.SmarTech.model.EstadoPedidoEnum;
import SmarTech.SmarTech.model.MetodoEntregaEnum;
import java.math.BigDecimal;
import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class VentaOnlineListadoDTO {

    private Long idPedido;
    private Date fechaPedido;
    private EstadoPedidoEnum estado;
    private MetodoEntregaEnum metodoEntrega;
    private String direccionEntrega;
    private Date fechaEntregaProgramada;
    private BigDecimal total;

    private String clienteNombre;
    private String estadoPago;   
    private String urlpdf;
    private String tienda;
}
