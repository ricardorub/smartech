package SmarTech.SmarTech.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Entity
@Table(name = "inventario",
        uniqueConstraints = {
            @UniqueConstraint(columnNames = {"producto_id", "tienda_id"})
        }
)
public class Inventario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idInventario;

    @ManyToOne
    @JsonIgnore
    @JoinColumn(name = "producto_id", referencedColumnName = "idProducto", nullable = false)
    private Productos producto;

    @ManyToOne
    @JsonIgnore
    @JoinColumn(name = "tienda_id", referencedColumnName = "idTienda", nullable = false)
    private Tienda tienda;

    @Column(nullable = false)
    private int cantidadDisponibleInventario;

    @Column(nullable = false)
    private int stockMinimoInventario;
}
