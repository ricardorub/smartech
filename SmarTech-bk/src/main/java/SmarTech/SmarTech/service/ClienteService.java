package SmarTech.SmarTech.service;

import SmarTech.SmarTech.DTO.ApiResponse;
import SmarTech.SmarTech.DTO.ActualizarClienteDTO;
import SmarTech.SmarTech.DTO.ClientePerfilDTO;
import SmarTech.SmarTech.DTO.InvitadoDTO;
import SmarTech.SmarTech.DTO.CambiarPasswordDTO;
import SmarTech.SmarTech.DTO.ClienteListadoDTO;
import SmarTech.SmarTech.DTO.ComprobanteClienteDTO;
import SmarTech.SmarTech.DTO.DetallePedidoClienteDTO;
import SmarTech.SmarTech.DTO.DireccionClienteDTO;
import SmarTech.SmarTech.DTO.PedidoDetalleClienteDTO;
import SmarTech.SmarTech.DTO.ProductoResumenDTO;
import SmarTech.SmarTech.DTO.VentasClienteMensualesDTO;
import SmarTech.SmarTech.model.*;
import SmarTech.SmarTech.repository.ClienteRepository;
import SmarTech.SmarTech.repository.DireccionClienteRepository;
import SmarTech.SmarTech.repository.PedidoRepository;
import org.springframework.transaction.annotation.Transactional;
import java.util.Date;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.security.core.context.SecurityContextHolder;

@Service
@RequiredArgsConstructor
public class ClienteService {

    private final PasswordEncoder passwordEncoder;
    private final ClienteRepository clienteRepo;
    private final DireccionClienteRepository direccionClienteRepository;
    private final PedidoRepository pedidoRepo;

    public ClientePerfilDTO obtenerPerfil(Long idCliente) {

        Object principal = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        Long idToken;

        switch (principal) {
            case Long aLong ->
                idToken = aLong;
            case Integer integer ->
                idToken = integer.longValue();
            case String string ->
                idToken = Long.valueOf(string);
            default ->
                throw new RuntimeException("Token inválido");
        }

        if (!idCliente.equals(idToken)) {
            throw new RuntimeException("No puedes acceder al perfil de otro usuario");
        }

        Cliente cliente = clienteRepo.findById(idCliente)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        return new ClientePerfilDTO(
                cliente.getIdCliente(),
                cliente.getNombreCliente(),
                cliente.getApellidoCliente(),
                cliente.getCorreoCliente(),
                cliente.getTelefonoCliente(),
                cliente.getDireccionCliente()
        );
    }

    @Transactional
    public ApiResponse actualizarPerfil(ActualizarClienteDTO dto) {

        Object principal = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        Long idToken;

        switch (principal) {
            case Long aLong ->
                idToken = aLong;
            case Integer integer ->
                idToken = integer.longValue();
            case String string ->
                idToken = Long.valueOf(string);
            default ->
                throw new RuntimeException("Token inválido");
        }

        if (!dto.getIdCliente().equals(idToken)) {
            throw new RuntimeException("No puedes actualizar el perfil de otro usuario.");
        }

        Cliente cliente = clienteRepo.findById(dto.getIdCliente())
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        cliente.setNombreCliente(dto.getNombres());
        cliente.setApellidoCliente(dto.getApellidos());
        cliente.setCorreoCliente(dto.getCorreo());
        cliente.setTelefonoCliente(dto.getTelefono());
        cliente.setDireccionCliente(dto.getDireccion());

        clienteRepo.save(cliente);

        return new ApiResponse(true, "Perfil actualizado correctamente", null);
    }

    @Transactional
    public ApiResponse cambiarPassword(CambiarPasswordDTO dto) {

        Object principal = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        Long idToken;

        switch (principal) {
            case Long aLong ->
                idToken = aLong;
            case Integer integer ->
                idToken = integer.longValue();
            case String string ->
                idToken = Long.valueOf(string);
            default ->
                throw new RuntimeException("Token inválido");
        }

        if (!dto.getIdCliente().equals(idToken)) {
            throw new RuntimeException("No puedes cambiar la contraseña de otro usuario.");
        }

        Cliente cliente = clienteRepo.findById(dto.getIdCliente())
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        if (!passwordEncoder.matches(dto.getPasswordActual(), cliente.getContrasenaCliente())) {
            return new ApiResponse(false, "La contraseña actual es incorrecta", null);
        }

        cliente.setContrasenaCliente(passwordEncoder.encode(dto.getNewPassword()));
        clienteRepo.save(cliente);

        return new ApiResponse(true, "Contraseña actualizada correctamente", null);
    }

    public List<Pedido> obtenerPedidosOnline(Long idCliente) {

        Object principal = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        Long idToken;

        switch (principal) {
            case Long aLong ->
                idToken = aLong;
            case Integer integer ->
                idToken = integer.longValue();
            case String string ->
                idToken = Long.valueOf(string);
            default ->
                throw new RuntimeException("Token inválido");
        }

        if (!idCliente.equals(idToken)) {
            throw new RuntimeException("No puedes ver pedidos de otro usuario.");
        }

        return pedidoRepo.findByCliente_IdClienteAndTipoVenta(idCliente, TipoVentaEnum.ONLINE);
    }

    public ApiResponse upsertInvitado(InvitadoDTO dto) {

        Optional<Cliente> optional = clienteRepo.findByCorreoCliente(dto.getCorreoCliente());
        Cliente invitado;

        if (optional.isPresent()) {
            invitado = optional.get();
            invitado.setNombreCliente(dto.getNombreCliente());
            invitado.setApellidoCliente(dto.getApellidoCliente());
            invitado.setTelefonoCliente(dto.getTelefonoCliente());
            invitado.setDireccionCliente(dto.getDireccionCliente());
            invitado.setEsInvitado(1);

        } else {
            invitado = new Cliente();
            invitado.setCorreoCliente(dto.getCorreoCliente());
            invitado.setNombreCliente(dto.getNombreCliente());
            invitado.setApellidoCliente(dto.getApellidoCliente());
            invitado.setTelefonoCliente(dto.getTelefonoCliente());
            invitado.setDireccionCliente(dto.getDireccionCliente());
            invitado.setEsInvitado(1);
            invitado.setContrasenaCliente("******");
            invitado.setActualizaContrasenaCliente(0);
            invitado.setFechaRegistroCliente(new Date());
        }

        clienteRepo.save(invitado);

        return new ApiResponse(true, "Invitado actualizado correctamente", invitado);
    }

    @Transactional(readOnly = true)
    public PedidoDetalleClienteDTO obtenerDetallePedidoSeguro(Long idPedido, Long idClienteToken) {

        Pedido pedido = pedidoRepo.findDetalleCompleto(idPedido)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        if (!pedido.getCliente().getIdCliente().equals(idClienteToken)) {
            throw new RuntimeException("No puedes ver datos de otro usuario");
        }

        PedidoDetalleClienteDTO dto = new PedidoDetalleClienteDTO();
        dto.setIdPedido(pedido.getIdPedido());
        dto.setFechaPedido(pedido.getFechaPedido());
        dto.setEstado(pedido.getEstado() != null ? pedido.getEstado().name() : null);
        dto.setMetodoEntrega(
                pedido.getMetodoEntrega() != null ? pedido.getMetodoEntrega().name() : null
        );
        dto.setDireccionEntrega(pedido.getDireccionEntrega());
        dto.setTotal(pedido.getTotal() != null ? pedido.getTotal().doubleValue() : 0.0);

        List<DetallePedidoClienteDTO> detalles = pedido.getDetalles()
                .stream()
                .map(d -> {
                    DetallePedidoClienteDTO det = new DetallePedidoClienteDTO();
                    det.setIdDetallePedido(d.getIdDetallePedido());
                    det.setCantidad(d.getCantidad());
                    det.setPrecioUnitario(d.getPrecioUnitario().doubleValue());
                    det.setDescuento(d.getDescuento().doubleValue());
                    det.setSubtotal(d.getSubtotal().doubleValue());

                    ProductoResumenDTO p = new ProductoResumenDTO();
                    p.setIdProducto(d.getProducto().getIdProducto());
                    p.setNombreProducto(d.getProducto().getNombreProducto());
                    p.setDescripcionProducto(d.getProducto().getDescripcionProducto());
                    p.setImagenUrlProducto(d.getProducto().getImagenUrlProducto());
                    p.setPrecioProducto(d.getProducto().getPrecioProducto());

                    det.setProducto(p);
                    return det;
                })
                .toList();

        dto.setDetalles(detalles);

        if (pedido.getComprobante() != null) {
            ComprobanteClienteDTO c = new ComprobanteClienteDTO();
            c.setIdComprobantes(pedido.getComprobante().getIdComprobantes());
            c.setPdfUrl(pedido.getComprobante().getPdfUrl());
            dto.setComprobante(c);
        }

        return dto;
    }

    public List<ClienteListadoDTO> listarClientes(String filtro, String orden) {

        String orderBy = orden.equalsIgnoreCase("ASC") ? "ASC" : "DESC";

        List<Object[]> result;

        if (orderBy.equals("ASC")) {
            result = clienteRepo.listarClientesAsc(filtro, TipoVentaEnum.ONLINE);
        } else {
            result = clienteRepo.listarClientesDesc(filtro, TipoVentaEnum.ONLINE);
        }

        return result.stream().map(obj -> {
            Cliente c = (Cliente) obj[0];
            Double total = obj[1] != null ? ((Number) obj[1]).doubleValue() : 0.0;

            return new ClienteListadoDTO(
                    c.getIdCliente(),
                    c.getNombreCliente(),
                    c.getApellidoCliente(),
                    c.getCorreoCliente(),
                    c.getTelefonoCliente(),
                    total
            );
        }).collect(Collectors.toList());
    }

    public List<DireccionClienteDTO> listarDirecciones(Long idCliente) {
        return direccionClienteRepository.findByCliente_IdCliente(idCliente)
                .stream()
                .map(d -> new DireccionClienteDTO(
                d.getIdDireccion(),
                d.getDepartamento(),
                d.getProvincia(),
                d.getDistrito(),
                d.getVia(),
                d.getNumero(),
                d.getSinNumero(),
                d.getPisoDepartamento(),
                d.getReferencia(),
                d.getNombreReceptor(),
                d.getActivo()
        ))
                .collect(Collectors.toList());
    }

    public List<VentasClienteMensualesDTO> estadisticasCliente(Long idCliente) {
        return pedidoRepo.comprasMensuales(idCliente, TipoVentaEnum.ONLINE)
                .stream()
                .map(r -> new VentasClienteMensualesDTO(
                (String) r[0],
                ((Number) r[1]).doubleValue()
        ))
                .collect(Collectors.toList());
    }

}
