/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package SmarTech.SmarTech.service;

/**
 *
 * @author kevin
 */
import SmarTech.SmarTech.DTO.LoginResponse;
import SmarTech.SmarTech.DTO.RegisterResponse;
import SmarTech.SmarTech.DTO.TempPasswordResponse;
import SmarTech.SmarTech.DTO.ApiResponse;
import SmarTech.SmarTech.DTO.ChangePasswordDTO;
import SmarTech.SmarTech.DTO.RegisterClienteDTO;
import SmarTech.SmarTech.DTO.LoginAdminDTO;
import SmarTech.SmarTech.DTO.LoginEmpleadoDTO;
import SmarTech.SmarTech.DTO.LoginClienteDTO;
import SmarTech.SmarTech.DTO.TiendaSimpleDTO;
import SmarTech.SmarTech.model.Cliente;
import SmarTech.SmarTech.model.UsuariosInternos;
import SmarTech.SmarTech.repository.ClienteRepository;
import SmarTech.SmarTech.repository.UsuariosInternosRepository;
import SmarTech.SmarTech.security.JwtUtil;
import java.util.Date;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private ClienteRepository clienteRepo;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UsuariosInternosRepository adminRepo;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public ApiResponse<RegisterResponse> registrarCliente(RegisterClienteDTO dto) {

        if (clienteRepo.existsByCorreoCliente(dto.getCorreo_cliente())) {
            return new ApiResponse<>(false, "El correo ya está registrado.", null);
        }

        String tempPass = UUID.randomUUID().toString().substring(0, 8);

        Cliente cliente = new Cliente();
        cliente.setNombreCliente(dto.getNombres_cliente());
        cliente.setApellidoCliente(dto.getApellidos_cliente());
        cliente.setTipoDocumento(dto.getTipoDocumento_cliente());
        cliente.setNumeroDocumento(dto.getNumeroDocumento_cliente());

        cliente.setCorreoCliente(dto.getCorreo_cliente());
        cliente.setTelefonoCliente(dto.getTelefono_cliente());
        cliente.setDireccionCliente(dto.getDireccion_cliente());

        cliente.setContrasenaCliente(encoder.encode(tempPass));
        cliente.setFechaRegistroCliente(new Date());
        cliente.setEsInvitado(0);
        cliente.setActualizaContrasenaCliente(1);

        clienteRepo.save(cliente);

        return new ApiResponse<>(
                true,
                "Cliente registrado correctamente.",
                new RegisterResponse(dto.getCorreo_cliente(), tempPass)
        );
    }

    public ApiResponse<LoginResponse> loginCliente(LoginClienteDTO dto) {

        Optional<Cliente> op = clienteRepo.findByCorreoCliente(dto.getEmail());
        if (op.isEmpty()) {
            return new ApiResponse<>(false, "Correo no registrado.", null);
        }

        Cliente cliente = op.get();

        if (!encoder.matches(dto.getPassword(), cliente.getContrasenaCliente())) {
            return new ApiResponse<>(false, "Contraseña incorrecta.", null);
        }

        String token = jwtUtil.generarToken(
                cliente.getCorreoCliente(),
                cliente.getIdCliente(),
                "CLIENTE"
        );

        LoginResponse response = new LoginResponse(
                cliente.getIdCliente(),
                null,
                cliente.getNombreCliente() + " " + cliente.getApellidoCliente(),
                null,
                cliente.getDireccionCliente(),
                "CLIENTE",
                token,
                cliente.getActualizaContrasenaCliente() == 1
        );

        return new ApiResponse<>(true, "Login exitoso.", response);
    }

    public ApiResponse<LoginResponse> loginAdmin(LoginAdminDTO dto) {

        Optional<UsuariosInternos> op = adminRepo.findByUsuario(dto.getUsuario());
        if (op.isEmpty()) {
            return new ApiResponse<>(false, "Empleado no encontrado.", null);
        }

        UsuariosInternos empleado = op.get();

        if (!encoder.matches(dto.getPassword(), empleado.getContrasenaUsuario())) {
            return new ApiResponse<>(false, "Contraseña incorrecta.", null);
        }

        String token = jwtUtil.generarToken(
                empleado.getUsuario(),
                empleado.getIdUsuarioInterno(),
                empleado.getRolUsuario()
        );

        TiendaSimpleDTO tiendaDTO = null;
        if (empleado.getTienda() != null) {
            tiendaDTO = new TiendaSimpleDTO(
                    empleado.getTienda().getIdTienda(),
                    empleado.getTienda().getNombre()
            );
        }

        LoginResponse response = new LoginResponse(
                null,
                empleado.getIdUsuarioInterno(),
                empleado.getPersona().getNombres() + " "
                + empleado.getPersona().getApellidos(),
                tiendaDTO,
                empleado.getPersona().getDireccion(),
                empleado.getRolUsuario(),
                token,
                false
        );

        return new ApiResponse<>(true, "Bienvenido empleado.", response);
    }

    public ApiResponse<String> cambiarPassword(ChangePasswordDTO dto) {

        Optional<Cliente> op = clienteRepo.findByCorreoCliente(dto.getEmail());
        if (op.isEmpty()) {
            return new ApiResponse<>(false, "Correo no encontrado.", null);
        }

        Cliente cliente = op.get();

        if (!encoder.matches(dto.getTempPassword(), cliente.getContrasenaCliente())) {
            return new ApiResponse<>(false, "Contraseña temporal inválida.", null);
        }

        cliente.setContrasenaCliente(encoder.encode(dto.getNewPassword()));
        cliente.setActualizaContrasenaCliente(0);
        clienteRepo.save(cliente);

        return new ApiResponse<>(true, "Contraseña actualizada correctamente.", null);
    }

    public ApiResponse<TempPasswordResponse> generarPasswordParaInvitado(String correo) {

        return clienteRepo.findByCorreoCliente(correo)
                .map(cliente -> {

                    String tempPass = UUID.randomUUID().toString().substring(0, 8);

                    cliente.setContrasenaCliente(encoder.encode(tempPass));
                    cliente.setActualizaContrasenaCliente(1);
                    cliente.setEsInvitado(0);
                    clienteRepo.save(cliente);

                    return new ApiResponse<>(
                            true,
                            "Contraseña temporal generada.",
                            new TempPasswordResponse(correo, tempPass)
                    );
                })
                .orElseGet(() -> new ApiResponse<>(false, "Correo no registrado.", null));

    }

    public ResponseEntity<?> validarCorreoCheckout(String correo) {

        Optional<Cliente> opt = clienteRepo.findByCorreoCliente(correo);

        if (opt.isEmpty()) {
            return ResponseEntity.ok(
                    new ApiResponse(true, "Correo no encontrado",
                            Map.of("tipo", "nuevo"))
            );
        }

        Cliente c = opt.get();

        if (c.getEsInvitado() == 1) {
            return ResponseEntity.ok(
                    new ApiResponse(true, "Es invitado",
                            Map.of("tipo", "invitado", "cliente", c))
            );
        }

        return ResponseEntity.ok(
                new ApiResponse(true, "Es cliente registrado",
                        Map.of("tipo", "cliente", "cliente", c))
        );
    }

}
