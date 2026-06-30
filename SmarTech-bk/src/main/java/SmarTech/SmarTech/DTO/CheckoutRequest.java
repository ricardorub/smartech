/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package SmarTech.SmarTech.DTO;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 *
 * @author kevin
 */
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class CheckoutRequest {

    private Long clienteId;
    private Long empleadoId; // puede ser null

    private PedidoDto pedido;
    private List<DetallePedidoDto> detalle;

    private PagoDto pago;
    private ComprobanteDto comprobante;

    private DireccionEnvioDto direccionEnvio; // solo si DOMICILIO

    // getters y setters
}

