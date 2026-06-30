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
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class DireccionEnvioDto {

    private String direccionTexto;   // "Av. X 123 ..."
    private String nombreReceptor;

    // si luego guardas campos finos:
    private String departamento;
    private String provincia;
    private String distrito;
    private String via;
    private String numero;
    private Boolean sinNumero;
    private String pisoDepartamento;
    private String referencia;

    // getters y setters
}
