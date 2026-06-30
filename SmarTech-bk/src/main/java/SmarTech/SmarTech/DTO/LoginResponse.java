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
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

    private Long idCliente; 
    private Long idEmpleado;   
    private String nombreCompleto;
    private TiendaSimpleDTO tienda;
    private String direccionCliente;
    private String tipo; 
    private String token;
    private Boolean requirePasswordChange;
}


