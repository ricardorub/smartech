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
public class ReporteClientesDTO {

    private Long idCliente;
    private String cliente;
    private String correo;
    private String telefono;
    private Long cantidadPedidos;
    private Double totalComprado;
    private String primeraCompra;
    private String ultimaCompra;
}
