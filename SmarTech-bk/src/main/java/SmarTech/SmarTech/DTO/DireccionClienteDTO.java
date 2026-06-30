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
public class DireccionClienteDTO {
    private Long id;
    private String departamento;
    private String provincia;
    private String distrito;
    private String via;
    private String numero;
    private Boolean sinNumero;
    private String piso;
    private String referencia;
    private String receptor;
    private boolean activo;
}

