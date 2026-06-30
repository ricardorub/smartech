/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package SmarTech.SmarTech.DTO;

/**
 *
 * @author kevin
 */

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VentaCompletaRequest {

    private VentaTiendaRequestDTO venta;
    private PagoDto pago;
    private ComprobanteDto comprobante;

}

