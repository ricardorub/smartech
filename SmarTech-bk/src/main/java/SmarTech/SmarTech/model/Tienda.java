package SmarTech.SmarTech.model;

import jakarta.persistence.*;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "tienda")
public class Tienda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idTienda;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(nullable = false, length = 200)
    private String direccion;

    @Column(length = 100)
    private String distrito;

    @Column(length = 20)
    private String telefono;

    @Column(nullable = false)
    private Boolean activa = true;

    @Column(nullable = false)
    private Boolean esPrincipal = false;
}

