/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package SmarTech.SmarTech.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
@Table(name = "usuarios_internos")
public class UsuariosInternos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idUsuarioInterno;

    @Column(length = 50, nullable = false, unique = true)
    private String usuario;

    @Column(length = 255, nullable = false)
    private String contrasenaUsuario;

    @Column(length = 30, nullable = false)
    private String rolUsuario;

    @Column(nullable = false)
    private int estadoUsuario;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "id_persona", nullable = false)
    private Persona persona;

    @ManyToOne
    @JsonIgnore
    @JoinColumn(name = "id_tienda", nullable = false)
    private Tienda tienda;
}
