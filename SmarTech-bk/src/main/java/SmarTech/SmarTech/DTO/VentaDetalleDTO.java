/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package SmarTech.SmarTech.DTO;

import SmarTech.SmarTech.model.DetallePedido;
import SmarTech.SmarTech.model.Pagos;
import SmarTech.SmarTech.model.Pedido;
import java.util.List;
import lombok.Data;

/**
 *
 * @author kevin
 */
@Data
public class VentaDetalleDTO {
    private Pedido pedido;
    private Pagos pago;
    private List<DetallePedido> detalles;

    public static VentaDetalleDTO fromEntity(Pedido p) {
        VentaDetalleDTO dto = new VentaDetalleDTO();
        dto.setPedido(p);
        dto.setPago(p.getPago());
        dto.setDetalles(p.getDetalles());
        return dto;
    }
}

