/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package SmarTech.SmarTech.RestController;

/**
 *
 * @author kevin
 */
import SmarTech.SmarTech.DTO.LoginResponse;
import SmarTech.SmarTech.DTO.RegisterResponse;
import SmarTech.SmarTech.DTO.TempPasswordResponse;
import SmarTech.SmarTech.DTO.ApiResponse;
import SmarTech.SmarTech.DTO.ValidarCorreoDTO;
import SmarTech.SmarTech.DTO.ChangePasswordDTO;
import SmarTech.SmarTech.DTO.RegisterClienteDTO;
import SmarTech.SmarTech.DTO.LoginAdminDTO;
import SmarTech.SmarTech.DTO.LoginEmpleadoDTO;
import SmarTech.SmarTech.DTO.LoginClienteDTO;
import SmarTech.SmarTech.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/clientes/register")
    public ApiResponse<RegisterResponse> registrarCliente(@RequestBody RegisterClienteDTO dto) {
        return authService.registrarCliente(dto);
    }

    @PostMapping("/clientes/login")
    public ApiResponse<LoginResponse> loginCliente(@RequestBody LoginClienteDTO dto) {
        return authService.loginCliente(dto);
    }

    @PostMapping("/clientes/change-password")
    public ApiResponse<String> cambiarPassword(@RequestBody ChangePasswordDTO dto) {
        return authService.cambiarPassword(dto);
    }

    @PostMapping("/clientes/guest-to-user")
    public ApiResponse<TempPasswordResponse> generarPasswordParaInvitado(@RequestBody TempPasswordResponse req) {
        return authService.generarPasswordParaInvitado(req.getCorreo());
    }

    @PostMapping("/admin/login")
    public ApiResponse<LoginResponse> loginAdmin(@RequestBody LoginAdminDTO dto) {
        return authService.loginAdmin(dto);
    }

    @PostMapping(value = "/validar-correo")
    public ResponseEntity<?> validarCorreoCheckout(@RequestBody ValidarCorreoDTO dto) {
        return authService.validarCorreoCheckout(dto.getCorreo());
    }

}
