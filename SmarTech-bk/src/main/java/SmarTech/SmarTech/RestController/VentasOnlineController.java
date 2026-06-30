/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package SmarTech.SmarTech.RestController;

/**
 *
 * @author kevin
 */
import SmarTech.SmarTech.DTO.DetallePedidoOnlineDTO;
import SmarTech.SmarTech.DTO.VentaOnlineListadoDTO;
import SmarTech.SmarTech.model.EstadoPagoEnum;
import SmarTech.SmarTech.model.EstadoPedidoEnum;
import SmarTech.SmarTech.model.Pedido;
import SmarTech.SmarTech.service.VentasOnlineService;
import SmarTech.SmarTech.service.VentasTiendaService;
import java.time.LocalDate;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ventas-online")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class VentasOnlineController {

    private final VentasOnlineService service;
    private final VentasTiendaService ventasTiendaService;

    @GetMapping("/listar")
    public Page<VentaOnlineListadoDTO> listar(
            @RequestParam(required = false) Long idPedido,
            @RequestParam(required = false) String cliente,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String metodo,
            @RequestParam(required = false) String fechaInicio,
            @RequestParam(required = false) String fechaFin,
            @RequestParam(required = false) Long tienda,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        LocalDate fi = (fechaInicio != null && !fechaInicio.isBlank())
                ? LocalDate.parse(fechaInicio)
                : null;

        LocalDate ff = (fechaFin != null && !fechaFin.isBlank())
                ? LocalDate.parse(fechaFin)
                : null;

        return service.listarPedidosOnline(
                idPedido,
                cliente,
                estado,
                metodo,
                fi,
                ff,
                tienda,
                page,
                size
        );
    }

    @GetMapping("/detalle/{idPedido}")
    public ResponseEntity<?> obtenerDetallePedido(@PathVariable Long idPedido) {
        try {
            DetallePedidoOnlineDTO detalle = service.obtenerDetallePedido(idPedido);
            return ResponseEntity.ok(detalle);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(e.getMessage());
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

    @PutMapping("/actualizar-estado-pedido")
    public ResponseEntity<?> actualizarEstadoPedido(@RequestBody Map<String, Object> body) {

        Long idPedido = Long.valueOf(body.get("idPedido").toString());
        EstadoPedidoEnum estado = EstadoPedidoEnum.valueOf(body.get("estado").toString());

        Pedido p = service.actualizarEstadoPedido(idPedido, estado);

        return ResponseEntity.ok(p);
    }

    @PutMapping("/actualizar-estado-pago")
    public ResponseEntity<?> actualizarEstadoPago(@RequestBody Map<String, Object> body) {

        Long idPedido = Long.valueOf(body.get("idPedido").toString());
        EstadoPagoEnum estadoPago = EstadoPagoEnum.valueOf(body.get("estadoPago").toString());

        Pedido p = service.actualizarEstadoPago(idPedido, estadoPago);

        return ResponseEntity.ok(p);
    }

    @PutMapping("/observacion/{idPedido}")
    public ResponseEntity<?> guardarObs(
            @PathVariable Long idPedido,
            @RequestBody Map<String, Object> body) {
        String obs = body.get("observacion").toString();
        Pedido p = service.guardarObservacion(idPedido, obs);
        return ResponseEntity.ok(p);
    }

    @PutMapping("/asignar-empleado/{idPedido}")
    public ResponseEntity<?> asignarEmpleado(
            @PathVariable Long idPedido,
            @RequestBody Map<String, Object> body) {
        Long idEmpleado = Long.valueOf(body.get("idEmpleado").toString());
        Pedido p = service.asignarEmpleado(idPedido, idEmpleado);
        return ResponseEntity.ok(p);
    }
}
