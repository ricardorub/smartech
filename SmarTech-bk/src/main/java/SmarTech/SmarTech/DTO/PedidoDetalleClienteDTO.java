/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package SmarTech.SmarTech.DTO;

/**
 *
 * @author kevin
 */


import java.util.Date;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class PedidoDetalleClienteDTO {

    private Long idPedido;
    private Date fechaPedido;
    private String estado;
    private String metodoEntrega;
    private String direccionEntrega;
    private Double total;

    private List<DetallePedidoClienteDTO> detalles;
    private ComprobanteClienteDTO comprobante; 

}

