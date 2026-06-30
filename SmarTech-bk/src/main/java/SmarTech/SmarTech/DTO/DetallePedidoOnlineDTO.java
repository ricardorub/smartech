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
import java.util.Date;
import java.util.List;

@Data
public class DetallePedidoOnlineDTO {

    private Long idPedido;
    private Date fechaPedido;
    private String estado;

    private String metodoEntrega;
    private String direccionEntrega;
    private Date fechaEntregaProgramada;
    private Date fechaEntregaReal;

    private BigDecimal total;
    private String observacion;

    private String clienteNombre;
    private String clienteCorreo;
    private String clienteTelefono;

    private String estadoPago;
    private String tipoPago;
    private String referenciaPago;

    private String urlpdf;

    private String tienda;

    private Long asignadoA;
    private String empleadoNombre;

    private List<DetalleProductoDTO> detalles;
}

