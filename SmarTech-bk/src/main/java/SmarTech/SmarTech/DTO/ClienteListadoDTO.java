/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package SmarTech.SmarTech.DTO;

/**
 *
 * @author kevin
 */

import lombok.*;

@Getter @Setter
@AllArgsConstructor
@NoArgsConstructor
public class ClienteListadoDTO {

    private Long idCliente;
    private String nombre;
    private String apellido;
    private String correo;
    private String telefono;
    private Double totalComprado;
}

