package SmarTech.SmarTech.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.util.Date;
import java.util.List;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Entity
@Table(name = "cliente")
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idCliente;

    @Column(length = 100, nullable = false)
    private String nombreCliente;

    @Column(length = 100, nullable = false)
    private String apellidoCliente;
    
    @Column(length = 100, nullable = false)
    private String TipoDocumento;

    @Column(length = 20, nullable = false)
    private String NumeroDocumento;
     
    @Column(length = 120, unique = true, nullable = false)
    private String correoCliente;

    @Column(length = 20)
    private String telefonoCliente;

    @Column(length = 255)
    private String direccionCliente;

    @Column(length = 255, nullable = true)
    private String contrasenaCliente;

    private int esInvitado;

    private int actualizaContrasenaCliente;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(nullable = false)
    private Date fechaRegistroCliente;

    @JsonManagedReference
    @JsonIgnore
    @OneToMany(mappedBy = "cliente", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DireccionCliente> direcciones;
}
