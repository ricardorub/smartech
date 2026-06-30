/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package SmarTech.SmarTech.model;

/**
 *
 * @author kevin
 */
import jakarta.persistence.*;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Entity
@Table(name = "producto")
public class Productos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idProducto;

    @ManyToOne
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    @Column(length = 100, nullable = false)
    private String nombreProducto;

    @Column(length = 255)
    private String descripcionProducto;

    @Column(nullable = false)
    private double precioProducto;

    @Column(nullable = false)
    private int descuentoProducto;

    @Column(length = 100)
    private String imeiSerieProducto;

    @Column(nullable = false)
    private int garantiaProducto;

    @Column(nullable = false)
    private int estadoProducto;

    @Column(length = 500)
    private String imagenUrlProducto;

    @Column(length = 300)
    private String imagenPublicId;
}

