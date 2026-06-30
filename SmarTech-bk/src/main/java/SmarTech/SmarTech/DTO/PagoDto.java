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
// PagoDto.java
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class PagoDto {
    private String metodo_pago;           
    private String moneda;                
    private Double monto;
    private String observaciones;
    private String referencia_transaccion;
}

