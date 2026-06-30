package SmarTech.SmarTech.RestController;

import SmarTech.SmarTech.DTO.ApiResponse;
import SmarTech.SmarTech.DTO.ActualizarClienteDTO;
import SmarTech.SmarTech.DTO.ClientePerfilDTO;
import SmarTech.SmarTech.DTO.InvitadoDTO;
import SmarTech.SmarTech.DTO.CambiarPasswordDTO;
import SmarTech.SmarTech.DTO.PedidoDetalleClienteDTO;
import SmarTech.SmarTech.service.ClienteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/private/cliente")
@RequiredArgsConstructor
@CrossOrigin("*")
public class ClienteController {

    private final ClienteService clienteService;

    @PreAuthorize("hasRole('CLIENTE')")
    @GetMapping("/{id}/perfil")
    public ResponseEntity<ApiResponse<ClientePerfilDTO>> obtenerPerfil(@PathVariable Long id) {
        ApiResponse<ClientePerfilDTO> response
                = new ApiResponse<>(true, "Perfil cargado correctamente", clienteService.obtenerPerfil(id));
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('CLIENTE')")
    @PutMapping("/perfil")
    public ResponseEntity<ApiResponse> actualizarPerfil(@RequestBody ActualizarClienteDTO dto) {
        return ResponseEntity.ok(clienteService.actualizarPerfil(dto));
    }

    @PreAuthorize("hasRole('CLIENTE')")
    @PutMapping("/cambiar-password")
    public ResponseEntity<ApiResponse> cambiarPassword(@RequestBody CambiarPasswordDTO dto) {
        clienteService.cambiarPassword(dto);
        return ResponseEntity.ok(new ApiResponse(true, "Contraseña actualizada correctamente", null));
    }

    @PreAuthorize("hasRole('CLIENTE')")
    @GetMapping("/{id}/pedidos")
    public ResponseEntity<ApiResponse> obtenerPedidos(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse(true, "Pedidos cargados", clienteService.obtenerPedidosOnline(id)));
    }

    @PreAuthorize("permitAll()")
    @PostMapping("/invitado")
    public ResponseEntity<ApiResponse> upsertInvitado(@RequestBody InvitadoDTO dto) {
        ApiResponse response = clienteService.upsertInvitado(dto);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('CLIENTE')")
    @GetMapping("/{idPedido}/detalle")
    public ResponseEntity<ApiResponse<PedidoDetalleClienteDTO>> obtenerDetallePedido(
            @PathVariable Long idPedido,
            @AuthenticationPrincipal Long idClienteToken
    ) {
        PedidoDetalleClienteDTO dto
                = clienteService.obtenerDetallePedidoSeguro(idPedido, idClienteToken);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Detalle del pedido obtenido correctamente",
                        dto
                )
        );
    }

}
