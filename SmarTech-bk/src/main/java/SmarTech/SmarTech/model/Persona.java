/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package SmarTech.SmarTech.model;

import jakarta.persistence.*;
import lombok.*;

/**
 *
 * @author kevin
 */
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Entity
@Table(name = "persona")
public class Persona {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPersona;

    @Column(nullable = false, length = 100)
    private String nombres;

    @Column(nullable = false, length = 100)
    private String apellidos;

    @Column(length = 15, unique = true)
    private String dni;

    @Column(length = 100)
    private String correo;

    @Column(length = 15)
    private String telefono;

    @Column(length = 200)
    private String direccion;

    @OneToOne(mappedBy = "persona", cascade = CascadeType.ALL)
    private UsuariosInternos usuarioInterno;
}
