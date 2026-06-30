package SmarTech.SmarTech.seeder;

import SmarTech.SmarTech.model.Persona;
import SmarTech.SmarTech.model.Tienda;
import SmarTech.SmarTech.model.UsuariosInternos;
import SmarTech.SmarTech.repository.TiendaRepository;
import SmarTech.SmarTech.repository.UsuariosInternosRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final UsuariosInternosRepository usuariosInternosRepository;
    private final TiendaRepository tiendaRepository;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @Override
    public void run(String... args) throws Exception {
        // 1. Verificar/Crear una Tienda por defecto
        Tienda tienda;
        List<Tienda> tiendas = tiendaRepository.findAll();
        if (tiendas.isEmpty()) {
            tienda = new Tienda();
            tienda.setNombre("Tienda Central");
            tienda.setDireccion("Av. Larco 456");
            tienda.setDistrito("Miraflores");
            tienda.setTelefono("01-444-5555");
            tienda.setActiva(true);
            tienda.setEsPrincipal(true);
            tienda = tiendaRepository.save(tienda);
            System.out.println("Tienda por defecto creada: Tienda Central");
        } else {
            tienda = tiendas.get(0);
        }

        // 2. Verificar/Crear el Usuario Administrador
        String username = "admin";
        if (usuariosInternosRepository.findByUsuario(username).isEmpty()) {
            Persona persona = new Persona();
            persona.setNombres("Administrador");
            persona.setApellidos("SmarTech");
            persona.setDni("99999999");
            persona.setCorreo("admin@smartech.com");
            persona.setTelefono("999999999");
            persona.setDireccion("Calle de Administración 123");

            UsuariosInternos admin = new UsuariosInternos();
            admin.setPersona(persona);
            admin.setUsuario(username);
            // Contraseña encriptada: "admin123"
            admin.setContrasenaUsuario(encoder.encode("admin123"));
            admin.setRolUsuario("ADMIN");
            admin.setEstadoUsuario(1); // 1 = Activo
            admin.setTienda(tienda);

            usuariosInternosRepository.save(admin);
            System.out.println("Usuario Administrador registrado con éxito: admin / admin123");
        }
    }
}
