/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package SmarTech.SmarTech.service;

import SmarTech.SmarTech.DTO.ApiResponse;
import SmarTech.SmarTech.DTO.ComprobanteDto;
import SmarTech.SmarTech.DTO.PagoDto;
import SmarTech.SmarTech.DTO.VentaDetalleDTO;
import SmarTech.SmarTech.DTO.VentaListadoDTO;
import SmarTech.SmarTech.DTO.VentaTiendaRequestDTO;
import SmarTech.SmarTech.model.Cliente;
import SmarTech.SmarTech.model.DetallePedido;
import SmarTech.SmarTech.model.EstadoPedidoEnum;
import SmarTech.SmarTech.model.Pedido;
import SmarTech.SmarTech.model.Productos;
import SmarTech.SmarTech.model.Tienda;
import SmarTech.SmarTech.model.TipoVentaEnum;
import SmarTech.SmarTech.model.UsuariosInternos;
import SmarTech.SmarTech.repository.ClienteRepository;
import SmarTech.SmarTech.repository.DetallePedidoRepository;
import SmarTech.SmarTech.repository.PedidoRepository;
import SmarTech.SmarTech.repository.ProductoRepository;
import SmarTech.SmarTech.repository.TiendaRepository;
import SmarTech.SmarTech.repository.UsuariosInternosRepository;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/**
 *
 * @author kevin
 */
@Service
@RequiredArgsConstructor
public class VentasTiendaService {

    private final PedidoRepository pedidoRepo;
    private final ProductoRepository productoRepo;
    private final UsuariosInternosRepository usuarioRepo;
    private final TiendaRepository tiendaRepo;
    private final ClienteRepository clienteRepo;
    private final DetallePedidoRepository detalleRepo;
    private final CloudinaryService cloudinaryService;
    private final ComprobantePdfGenerator pdfGenerator;

    public Page<VentaListadoDTO> listarVentas(
            String buscar,
            Long idTienda,
            Long idEmpleado,
            TipoVentaEnum tipoVenta,
            int page,
            int size
    ) {
        Pageable pageable = PageRequest.of(page, size);

        return pedidoRepo.listarVentasTienda(buscar, idTienda, idEmpleado, tipoVenta, pageable)
                .map(VentaListadoDTO::fromEntity);
    }

    public VentaDetalleDTO obtenerDetalle(Long idPedido) {
        Pedido pedido = pedidoRepo.findById(idPedido)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        return VentaDetalleDTO.fromEntity(pedido);
    }

    @Transactional
    public Pedido crearVentaCompleta(
            VentaTiendaRequestDTO venta,
            PagoDto pago,
            ComprobanteDto comp
    ) {

        UsuariosInternos empleado = usuarioRepo.findById(venta.getEmpleadoId())
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));

        tiendaRepo.findById(venta.getTiendaId())
                .orElseThrow(() -> new RuntimeException("Tienda no encontrada"));

        List<Object[]> result = pedidoRepo.registrarVentaTienda(
                venta.getEmpleadoId(),
                venta.getTiendaId(),
                venta.getObservaciones()
        );
        Long pedidoId = Long.valueOf(result.get(0)[0].toString());

        if (pedidoId == null) {
            throw new RuntimeException("Error al crear pedido");
        }

        for (VentaTiendaRequestDTO.ProductoVentaDTO p : venta.getProductos()) {

            productoRepo.findById(p.getProductoId())
                    .orElseThrow(() -> new RuntimeException("Producto no existe: " + p.getProductoId()));

            detalleRepo.registrarDetalleTienda(
                    pedidoId,
                    p.getProductoId(),
                    p.getCantidad(),
                    p.getPrecioUnitario(),
                    p.getDescuento() != null ? p.getDescuento() : 0.0
            );
        }

        Pedido pedido = pedidoRepo.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado luego del SP"));

        pedidoRepo.insertarPago(
                "Completado",
                pago.getMetodo_pago(),
                pago.getMoneda(),
                pago.getMonto(),
                pago.getObservaciones(),
                pago.getReferencia_transaccion(),
                pedidoId
        );

        pedidoRepo.insertarComprobante(
                pedidoId,
                comp.getTipo(),
                "Pendiente",
                UUID.randomUUID().toString(),
                comp.getRazon_social(),
                comp.getNumero_documento(),
                pedido.getTotalBruto().doubleValue(),
                pedido.getDescuentoTotal().doubleValue(),
                pedido.getSubtotal().doubleValue(),
                pedido.getIgvTotal().doubleValue(),
                pedido.getTotal().doubleValue(),
                pedido.getCostoEnvio() != null ? pedido.getCostoEnvio().doubleValue() : 0.0
        );

        return pedido;
    }

    @Transactional
    public void anularVenta(Long idPedido) {
        Pedido pedido = pedidoRepo.findById(idPedido)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        pedido.setEstado(EstadoPedidoEnum.CANCELADO);
        pedidoRepo.save(pedido);
    }

    @Transactional
    public ResponseEntity<?> generarComprobante(Long idPedido) {
        try {
            Pedido pedido = pedidoRepo.findById(idPedido)
                    .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

            var comprobante = pedidoRepo.obtenerComprobantePorPedido(idPedido);
            if (comprobante == null) {
                throw new RuntimeException("No existe comprobante para este pedido");
            }
            List<DetallePedido> detalles = detalleRepo.findByPedido_IdPedido(idPedido);

            byte[] pdfBytes = ComprobantePdfGenerator.generar(pedido, detalles);

            MultipartFile pdfFile = new MultipartFile() {
                @Override
                public String getName() {
                    return "comprobante";
                }

                @Override
                public String getOriginalFilename() {
                    return "comprobante_" + idPedido + ".pdf";
                }

                @Override
                public String getContentType() {
                    return "application/pdf";
                }

                @Override
                public boolean isEmpty() {
                    return pdfBytes.length == 0;
                }

                @Override
                public long getSize() {
                    return pdfBytes.length;
                }

                @Override
                public byte[] getBytes() {
                    return pdfBytes;
                }

                @Override
                public InputStream getInputStream() {
                    return new ByteArrayInputStream(pdfBytes);
                }

                @Override
                public void transferTo(File dest) throws IOException {
                    Files.write(dest.toPath(), pdfBytes);
                }
            };

            String pdfUrl = cloudinaryService.uploadPdf(pdfFile);

            pedidoRepo.actualizarUrlComprobante(idPedido, pdfUrl);

            return ResponseEntity.ok(
                    new ApiResponse<>(true, "Comprobante generado correctamente.", pdfUrl)
            );

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse<>(false, "Error al generar comprobante: " + e.getMessage(), null)
            );
        }
    }

}
