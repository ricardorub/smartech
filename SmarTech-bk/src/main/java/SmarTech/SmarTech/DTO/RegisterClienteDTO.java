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
public class RegisterClienteDTO {

    private String nombres_cliente;
    private String apellidos_cliente;
    private String tipoDocumento_cliente;
    private String numeroDocumento_cliente;
    private String correo_cliente;
    private String telefono_cliente;
    private String direccion_cliente;
}
