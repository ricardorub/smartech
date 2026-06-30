package SmarTech.SmarTech.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.Date;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Entity
@Table(
        name = "comprobantes",
        uniqueConstraints = {
            @UniqueConstraint(columnNames = {"numero_serie", "numero_documento"})
        }
)
public class Comprobantes {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idComprobantes;

    @OneToOne
    @JsonIgnore
    @JoinColumn(name = "pedido_id", referencedColumnName = "idPedido", nullable = true, unique = true)
    private Pedido pedido;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoComprobanteEnum tipo;

    @Column(length = 20, nullable = false)
    private String numeroSerie;

    @Column(length = 20, nullable = false)
    private String numeroComprobante;

    @Column(length = 200, nullable = false)
    private String razonSocial;

    @Column(length = 20, nullable = false)
    private String numeroDocumento;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(nullable = false)
    private Date fechaEmision;

    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal totalBruto;

    @Column(precision = 10, scale = 2)
    private BigDecimal totalDescuento;

    @Column(precision = 10, scale = 2)
    private BigDecimal subTotal;

    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal igvTotal;

    @Column(precision = 10, scale = 2)
    private BigDecimal costoEnvio;

    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal totalFinal;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoComprobanteEnum estado;

    @Column(length = 100)
    private String hashCpe;

    @Lob
    private String pdfUrl;

    @PrePersist
    protected void onCreate() {
        this.fechaEmision = new Date();
    }
}
