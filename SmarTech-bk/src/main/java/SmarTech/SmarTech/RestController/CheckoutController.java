/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package SmarTech.SmarTech.RestController;

import SmarTech.SmarTech.DTO.CheckoutRequest;
import SmarTech.SmarTech.service.CheckoutService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/checkout")
@CrossOrigin(origins = "*")
public class CheckoutController {

    private final CheckoutService checkoutService;

    public CheckoutController(CheckoutService checkoutService) {
        this.checkoutService = checkoutService;
    }

    /**
     * Endpoint principal para finalizar una compra
     */
    @PostMapping("/finalizar")
    public ResponseEntity<?> finalizarCheckout(@RequestBody CheckoutRequest request) {

        try {
            Long pedidoId = checkoutService.finalizarPedido(request);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Pedido registrado correctamente");
            response.put("pedidoId", pedidoId);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();

            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error al procesar el checkout");
            error.put("error", e.getMessage());

            return ResponseEntity.badRequest().body(error);
        }
    }
}
