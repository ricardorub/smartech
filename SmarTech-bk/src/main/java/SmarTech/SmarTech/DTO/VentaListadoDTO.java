/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package SmarTech.SmarTech.DTO;

import SmarTech.SmarTech.model.Pedido;
import java.math.BigDecimal;
import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 *
 * @author kevin
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class VentaListadoDTO {

    private Long idPedido;
    private Date fechaPedido;
    private String clienteNombre;
    private BigDecimal total;
    private String estado;
    private String nombreTienda;
    private String nombreEmpleado;
    private String urlpdf;

    public static VentaListadoDTO fromEntity(Pedido p) {
        return new VentaListadoDTO(
                p.getIdPedido(),
                p.getFechaPedido(),
                p.getCliente() != null
                ? p.getCliente().getNombreCliente() + " " + p.getCliente().getApellidoCliente()
                : "Sin cliente",
                p.getTotal(),
                p.getEstado().name(),
                p.getTienda().getNombre(),
                p.getEmpleado().getPersona().getNombres() + " " + p.getEmpleado().getPersona().getApellidos(),
                p.getComprobante().getPdfUrl()
        );
    }
}
