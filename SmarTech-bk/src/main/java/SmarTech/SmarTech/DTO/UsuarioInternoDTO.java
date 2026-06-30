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

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class UsuarioInternoDTO {

    private Long idUsuarioInterno;
    private String usuario;
    private String rolUsuario;
    private Integer activo; // 1 o 0, mapeado desde estadoUsuario

    private PersonaDTO persona;
    private TiendaSimpleDTO tienda;
}

