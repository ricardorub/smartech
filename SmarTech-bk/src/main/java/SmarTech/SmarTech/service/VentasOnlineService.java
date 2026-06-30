/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package SmarTech.SmarTech.service;

/**
 *
 * @author kevin
 */

import SmarTech.SmarTech.DTO.DetallePedidoOnlineDTO;
import SmarTech.SmarTech.DTO.DetalleProductoDTO;
import SmarTech.SmarTech.DTO.VentaOnlineListadoDTO;

import SmarTech.SmarTech.model.EstadoPagoEnum;
import SmarTech.SmarTech.model.Pedido;
import SmarTech.SmarTech.model.EstadoPedidoEnum;
import SmarTech.SmarTech.model.MetodoEntregaEnum;
import SmarTech.SmarTech.model.Pagos;
import SmarTech.SmarTech.model.UsuariosInternos;
import SmarTech.SmarTech.repository.DetallePedidoRepository;
import SmarTech.SmarTech.repository.PagosRepository;
import SmarTech.SmarTech.repository.PedidoRepository;
import SmarTech.SmarTech.repository.UsuariosInternosRepository;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;



@Service
@RequiredArgsConstructor
public class VentasOnlineService {

    private final PedidoRepository pedidoRepo;
    private final DetallePedidoRepository detalleRepo;
    private final ComprobantePdfGenerator pdfGenerator;
    private final CloudinaryService cloudinaryService;
    private final PagosRepository pagosRepo;
    private final UsuariosInternosRepository usuarioRepo;

    public Page<VentaOnlineListadoDTO> listarPedidosOnline(
            Long idPedido,
            String cliente,
            String estado,
            String metodo,
            LocalDate fechaInicio,
            LocalDate fechaFin,
            Long tiendaId,
            int page,
            int size
    ) {

        EstadoPedidoEnum estadoEnum = null;
        if (estado != null && !estado.isBlank()) {
            estadoEnum = EstadoPedidoEnum.valueOf(estado);
        }

        MetodoEntregaEnum metodoEnum = null;
        if (metodo != null && !metodo.isBlank()) {
            metodoEnum = MetodoEntregaEnum.valueOf(metodo);
        }

        Date fi = fechaInicio != null
                ? Date.from(fechaInicio.atStartOfDay(ZoneId.systemDefault()).toInstant())
                : null;

        Date ff = fechaFin != null
                ? Date.from(fechaFin.atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant())
                : null;

        Pageable pageable = PageRequest.of(page, size);

        Page<Pedido> pedidosPage = pedidoRepo.buscarPedidosOnline(
                idPedido,
                (cliente != null && !cliente.isBlank()) ? cliente : null,
                estadoEnum,
                metodoEnum,
                fi,
                ff,
                tiendaId,
                pageable
        );

        Page<VentaOnlineListadoDTO> dtoPage = pedidosPage.map(p -> {
            String clienteNombre = p.getCliente() != null
                    ? p.getCliente().getNombreCliente() + " " + p.getCliente().getApellidoCliente()
                    : "-";

            String estadoPago = p.getEstado() != null
                    ? p.getPago().getEstadoPago().name()
                    : "Pendiente";

            String urlPdf = (p.getComprobante() != null)
                    ? p.getComprobante().getPdfUrl()
                    : null;

            return new VentaOnlineListadoDTO(
                    p.getIdPedido(),
                    p.getFechaPedido(),
                    p.getEstado(),
                    p.getMetodoEntrega(),
                    p.getDireccionEntrega(),
                    p.getFechaEntregaProgramada(),
                    p.getTotal(),
                    clienteNombre,
                    estadoPago,
                    urlPdf,
                    p.getTienda().getNombre()
            );
        });

        return dtoPage;
    }

    public Pedido actualizarEstadoPedido(Long idPedido, EstadoPedidoEnum estado) {

        Pedido pedido = pedidoRepo.findById(idPedido)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
        pedido.setEstado(estado);
        if (estado == EstadoPedidoEnum.ENTREGADO) {
            if (pedido.getFechaEntregaReal() == null) {
                pedido.setFechaEntregaReal(new Date());
                pedido.setObservaciones("Pedido entregado con exito");
            }
        }
         if (estado == EstadoPedidoEnum.LISTO_PARA_RECOJO) {
            if (pedido.getFechaEntregaProgramada()== null) {
                pedido.setFechaEntregaProgramada(new Date());
            }
        }

        return pedidoRepo.save(pedido);
    }

    public Pedido actualizarEstadoPago(Long idPedido, EstadoPagoEnum estadoPago) {

        Pedido pedido = pedidoRepo.findById(idPedido)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        Pagos pago = pedido.getPago();
        if (pago == null) {
            throw new RuntimeException("El pedido no tiene registro de pago");
        }

        pago.setEstadoPago(estadoPago);
        pagosRepo.save(pago);

        return pedido;
    }

    public Pedido guardarObservacion(Long idPedido, String observacion) {

        Pedido pedido = pedidoRepo.findById(idPedido)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        pedido.setObservaciones(observacion);
        return pedidoRepo.save(pedido);
    }

    public Pedido asignarEmpleado(Long idPedido, Long idEmpleado) {

        Pedido pedido = pedidoRepo.findById(idPedido)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        UsuariosInternos empleado = usuarioRepo.findById(idEmpleado)
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));

        pedido.setEmpleado(empleado);

        return pedidoRepo.save(pedido);
    }

    public DetallePedidoOnlineDTO obtenerDetallePedido(Long idPedido) {

        Pedido pedido = pedidoRepo.findById(idPedido)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        DetallePedidoOnlineDTO dto = new DetallePedidoOnlineDTO();

        dto.setIdPedido(pedido.getIdPedido());
        dto.setFechaPedido(pedido.getFechaPedido());
        dto.setEstado(pedido.getEstado().name());
        dto.setMetodoEntrega(pedido.getMetodoEntrega().name());
        dto.setDireccionEntrega(pedido.getDireccionEntrega());
        dto.setFechaEntregaProgramada(pedido.getFechaEntregaProgramada());
        dto.setFechaEntregaReal(pedido.getFechaEntregaReal());
        dto.setTotal(pedido.getTotal());
        dto.setObservacion(pedido.getObservaciones());

        if (pedido.getCliente() != null) {
            dto.setClienteNombre(pedido.getCliente().getNombreCliente() + " "
                    + pedido.getCliente().getApellidoCliente());
            dto.setClienteCorreo(pedido.getCliente().getCorreoCliente());
            dto.setClienteTelefono(pedido.getCliente().getTelefonoCliente());
        }

        if (pedido.getTienda() != null) {
            dto.setTienda(pedido.getTienda().getNombre());
        }

        if (pedido.getEmpleado() != null) {
            dto.setAsignadoA(pedido.getEmpleado().getIdUsuarioInterno());
            dto.setEmpleadoNombre(pedido.getEmpleado().getPersona().getNombres() + " " + pedido.getEmpleado().getPersona().getApellidos());
        }

        if (pedido.getPago() != null) {
            dto.setEstadoPago(pedido.getPago().getEstadoPago().name());
            dto.setTipoPago(pedido.getPago().getMetodoPago().toString());
            dto.setReferenciaPago(pedido.getPago().getReferenciaTransaccion());
        }

        if (pedido.getComprobante() != null) {
            dto.setUrlpdf(pedido.getComprobante().getPdfUrl());
        }

        if (pedido.getDetalles() != null) {
            dto.setDetalles(
                    pedido.getDetalles().stream().map(det -> {
                        DetalleProductoDTO d = new DetalleProductoDTO();
                        d.setProducto(det.getProducto().getNombreProducto());
                        d.setCantidad(det.getCantidad());
                        d.setPrecio(det.getPrecioUnitario());
                        d.setSubtotal(det.getSubtotal());
                        return d;
                    }).toList()
            );
        }

        return dto;
    }

}
