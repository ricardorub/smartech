/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package SmarTech.SmarTech.service;

/**
 *
 * @author kevin
 */
import SmarTech.SmarTech.DTO.*;
import SmarTech.SmarTech.model.Persona;
import SmarTech.SmarTech.model.Tienda;
import SmarTech.SmarTech.model.UsuariosInternos;
import SmarTech.SmarTech.repository.PedidoRepository;
import SmarTech.SmarTech.repository.TiendaRepository;
import SmarTech.SmarTech.repository.UsuariosInternosRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.List;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Service
@RequiredArgsConstructor
public class UsuarioInternoService {

    private final PedidoRepository pedidoRepository;
    private final UsuariosInternosRepository usuariosInternosRepository;
    private final TiendaRepository tiendaRepository;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public Page<UsuarioInternoDTO> listarUsuarios(String nombre, String rol, Long idTienda,
            int page, int size) {

        if (nombre != null && nombre.trim().isEmpty()) {
            nombre = null;
        }
        if (rol != null && rol.trim().isEmpty()) {
            rol = null;
        }
        if (idTienda != null && idTienda == 0) {
            idTienda = null;
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("idUsuarioInterno").ascending());
        Page<UsuariosInternos> result = usuariosInternosRepository.buscarUsuarios(nombre, rol, idTienda, pageable);

        return result.map(this::toDTO);
    }

    public UsuarioInternoDTO crearUsuario(UsuarioInternoRequestDTO dto) {
        Persona persona = new Persona();
        persona.setNombres(dto.getNombres());
        persona.setApellidos(dto.getApellidos());
        persona.setDni(dto.getDni());
        persona.setCorreo(dto.getCorreo());
        persona.setTelefono(dto.getTelefono());
        persona.setDireccion(dto.getDireccion());

        UsuariosInternos entidad = new UsuariosInternos();
        entidad.setPersona(persona);
        entidad.setUsuario(dto.getUsuario());

        entidad.setContrasenaUsuario(encoder.encode(dto.getContrasenaUsuario()));

        entidad.setRolUsuario(dto.getRolUsuario());
        entidad.setEstadoUsuario(1);

        Tienda tienda = tiendaRepository.findById(dto.getIdTienda())
                .orElseThrow(() -> new RuntimeException("Tienda no encontrada"));
        entidad.setTienda(tienda);

        UsuariosInternos guardado = usuariosInternosRepository.save(entidad);

        return toDTO(guardado);
    }

    public UsuarioInternoDTO actualizarUsuario(Long id, UsuarioInternoRequestDTO dto) {

        UsuariosInternos entidad = usuariosInternosRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Persona p = entidad.getPersona();
        p.setNombres(dto.getNombres());
        p.setApellidos(dto.getApellidos());
        p.setDni(dto.getDni());
        p.setCorreo(dto.getCorreo());
        p.setTelefono(dto.getTelefono());
        p.setDireccion(dto.getDireccion());

        entidad.setUsuario(dto.getUsuario());
        entidad.setRolUsuario(dto.getRolUsuario());

        Tienda tienda = tiendaRepository.findById(dto.getIdTienda())
                .orElseThrow(() -> new RuntimeException("Tienda no encontrada"));
        entidad.setTienda(tienda);

        UsuariosInternos actualizado = usuariosInternosRepository.save(entidad);

        return toDTO(actualizado);
    }

    public void cambiarEstado(Long id) {
        UsuariosInternos entidad = usuariosInternosRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        entidad.setEstadoUsuario(entidad.getEstadoUsuario() == 1 ? 0 : 1);

        usuariosInternosRepository.save(entidad);
    }

    public List<VentasMensualesDTO> obtenerVentasMensuales(Long idUsuario) {

        List<Object[]> resultados = pedidoRepository.ventasMensualesPorEmpleado(idUsuario);

        return resultados.stream()
                .map(r -> new VentasMensualesDTO(
                r[0].toString(), // mes (YYYY-MM)
                Double.parseDouble(r[1].toString()) // total
        ))
                .toList();
    }

    private UsuarioInternoDTO toDTO(UsuariosInternos u) {
        UsuarioInternoDTO dto = new UsuarioInternoDTO();
        dto.setIdUsuarioInterno(u.getIdUsuarioInterno());
        dto.setUsuario(u.getUsuario());
        dto.setRolUsuario(u.getRolUsuario());
        dto.setActivo(u.getEstadoUsuario());

        PersonaDTO p = new PersonaDTO();
        p.setIdPersona(u.getPersona().getIdPersona());
        p.setNombres(u.getPersona().getNombres());
        p.setApellidos(u.getPersona().getApellidos());
        p.setDni(u.getPersona().getDni());
        p.setCorreo(u.getPersona().getCorreo());
        p.setTelefono(u.getPersona().getTelefono());
        p.setDireccion(u.getPersona().getDireccion());
        dto.setPersona(p);

        TiendaSimpleDTO t = new TiendaSimpleDTO();
        t.setIdTienda(u.getTienda().getIdTienda());
        t.setNombre(u.getTienda().getNombre());
        dto.setTienda(t);

        return dto;
    }
}
