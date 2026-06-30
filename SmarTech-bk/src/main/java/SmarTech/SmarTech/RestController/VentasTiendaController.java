/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package SmarTech.SmarTech.RestController;

import SmarTech.SmarTech.DTO.ApiResponse;
import SmarTech.SmarTech.DTO.VentaCompletaRequest;
import SmarTech.SmarTech.model.Pedido;
import SmarTech.SmarTech.model.TipoVentaEnum;
import SmarTech.SmarTech.service.VentasTiendaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 *
 * @author kevin
 */
@RestController
@RequestMapping("/api/ventas-tienda")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class VentasTiendaController {

    private final VentasTiendaService ventasTiendaService;

    @GetMapping("/listar")
    public ResponseEntity<?> listarVentas(
            @RequestParam(required = false) String buscar,
            @RequestParam(required = false) Long idTienda,
            @RequestParam(required = false) Long idEmpleado,
            @RequestParam(defaultValue = "TIENDA") TipoVentaEnum tipoVenta,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(
                ventasTiendaService.listarVentas(buscar, idTienda, idEmpleado, tipoVenta, page, size)
        );
    }

    @GetMapping("/detalle/{idPedido}")
    public ResponseEntity<?> obtenerDetalle(@PathVariable Long idPedido) {
        return ResponseEntity.ok(ventasTiendaService.obtenerDetalle(idPedido));
    }

    @PostMapping("/registrar-completa")
    public ResponseEntity<?> registrarVentaCompleta(
            @RequestBody VentaCompletaRequest request
    ) {
        try {

            Pedido pedidoGenerado = ventasTiendaService.crearVentaCompleta(
                    request.getVenta(),
                    request.getPago(),
                    request.getComprobante()
            );

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Venta registrada correctamente",
                            pedidoGenerado
                    )
            );

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse<>(false, "Error: " + e.getMessage(), null)
            );
        }
    }

    @PutMapping("/anular/{idPedido}")
    public ResponseEntity<?> anular(@PathVariable Long idPedido) {
        ventasTiendaService.anularVenta(idPedido);
        return ResponseEntity.ok("Venta anulada correctamente.");
    }

    @GetMapping("/comprobante/{idPedido}")
    public ResponseEntity<?> generarComprobante(@PathVariable Long idPedido) {
        return ventasTiendaService.generarComprobante(idPedido);
    }
}
