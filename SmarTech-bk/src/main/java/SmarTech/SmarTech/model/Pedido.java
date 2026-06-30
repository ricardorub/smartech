package SmarTech.SmarTech.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.Date;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "pedido")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPedido;

    @ManyToOne
    @JsonIgnore
    @JoinColumn(name = "cliente_id", nullable = true)
    private Cliente cliente;

    @ManyToOne
    @JsonIgnore
    @JoinColumn(name = "empleado_id", nullable = true)
    private UsuariosInternos empleado;

    @ManyToOne
    @JsonIgnore
    @JoinColumn(name = "id_tienda")
    private Tienda tienda;

    @Temporal(TemporalType.TIMESTAMP)
    private Date fechaPedido;

    @Temporal(TemporalType.TIMESTAMP)
    private Date fechaEntregaReal;

    @Enumerated(EnumType.STRING)
    private EstadoPedidoEnum estado;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_venta", nullable = false)
    private TipoVentaEnum tipoVenta;

    @Enumerated(EnumType.STRING)
    @Column(name = "metodo_entrega")
    private MetodoEntregaEnum metodoEntrega;

    @Column(length = 200)
    private String direccionEntrega;

    @Temporal(TemporalType.TIMESTAMP)
    private Date fechaEntregaProgramada;

    @Column(precision = 10, scale = 2)
    private BigDecimal costoEnvio;

    @Column(precision = 10, scale = 2)
    private BigDecimal totalBruto;

    @Column(precision = 10, scale = 2)
    private BigDecimal descuentoTotal;

    @Column(precision = 10, scale = 2)
    private BigDecimal subtotal;

    @Column(precision = 10, scale = 2)
    private BigDecimal igvTotal;

    @Column(precision = 10, scale = 2)
    private BigDecimal total;

    @Column(length = 255)
    private String observaciones;

    @OneToMany(mappedBy = "pedido", fetch = FetchType.LAZY)
    @JsonIgnore
    private java.util.List<DetallePedido> detalles;

    @OneToOne(mappedBy = "pedido", fetch = FetchType.LAZY)
    @JsonIgnore
    private Comprobantes comprobante;

    @OneToOne(mappedBy = "pedido", cascade = CascadeType.ALL)
     @JsonIgnore
    private Pagos pago;

}
