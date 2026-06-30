/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package SmarTech.SmarTech.model;

/**
 *
 * @author kevin
 */

import com.fasterxml.jackson.annotation.JsonCreator;

public enum EstadoPedidoEnum {
    PENDIENTE,
    PROCESADO,
    ENVIADO,
    LISTO_PARA_RECOJO,
    ENTREGADO,
    CANCELADO;

    @JsonCreator
    public static EstadoPedidoEnum from(String value) {
        if (value == null) return null;
        return EstadoPedidoEnum.valueOf(value.toUpperCase());
    }
}
