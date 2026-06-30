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
import SmarTech.SmarTech.repository.ReportesRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@Service
@RequiredArgsConstructor
public class ReportesService {

    private final ReportesRepository reportesRepository;

    public List<?> generarReporte(String tipo, LocalDate inicio, LocalDate fin, Long tiendaId) {

        String tipoLower = tipo == null ? "" : tipo.toLowerCase();

        return switch (tipoLower) {
            case "ventas" ->
                generarReporteVentas(inicio, fin, tiendaId);
            case "productos" ->
                generarReporteProductos(inicio, fin, tiendaId);
            case "clientes" ->
                generarReporteClientes(inicio, fin, tiendaId);
            case "pagos" ->
                generarReportePagos(inicio, fin, tiendaId);
            case "inventario" ->
                generarReporteInventario(tiendaId);
            default ->
                throw new ResponseStatusException(BAD_REQUEST, "Tipo de reporte no válido: " + tipo);
        };
    }

    private List<ReporteVentasDTO> generarReporteVentas(LocalDate inicio, LocalDate fin, Long tiendaId) {
        return reportesRepository.reporteVentas(inicio, fin, tiendaId)
                .stream()
                .map(r -> new ReporteVentasDTO(
                getLong(r[0]),
                toStringSafe(r[1]),
                toStringSafe(r[2]),
                toStringSafe(r[3]),
                toStringSafe(r[4]),
                toStringSafe(r[5]),
                toStringSafe(r[6]),
                toStringSafe(r[7]),
                toStringSafe(r[8]),
                toStringSafe(r[9]),
                getDouble(r[10])
        ))
                .toList();
    }

    private List<ReporteProductosDTO> generarReporteProductos(LocalDate inicio, LocalDate fin, Long tiendaId) {
        return reportesRepository.reporteProductos(inicio, fin, tiendaId)
                .stream()
                .map(r -> new ReporteProductosDTO(
                getLong(r[0]),
                toStringSafe(r[1]),
                toStringSafe(r[2]),
                toStringSafe(r[3]),
                getLong(r[4]),
                getDouble(r[5])
        ))
                .toList();
    }

    private List<ReporteClientesDTO> generarReporteClientes(LocalDate inicio, LocalDate fin, Long tiendaId) {
        return reportesRepository.reporteClientes(inicio, fin, tiendaId)
                .stream()
                .map(r -> new ReporteClientesDTO(
                getLong(r[0]),
                toStringSafe(r[1]),
                toStringSafe(r[2]),
                toStringSafe(r[3]),
                getLong(r[4]),
                getDouble(r[5]),
                toStringSafe(r[6]),
                toStringSafe(r[7])
        ))
                .toList();
    }

    private List<ReportePagosDTO> generarReportePagos(LocalDate inicio, LocalDate fin, Long tiendaId) {
        return reportesRepository.reportePagos(inicio, fin, tiendaId)
                .stream()
                .map(r -> new ReportePagosDTO(
                getLong(r[0]),
                getLong(r[1]),
                toStringSafe(r[2]),
                toStringSafe(r[3]),
                toStringSafe(r[4]),
                toStringSafe(r[5]),
                getDouble(r[6]),
                toStringSafe(r[7])
        ))
                .toList();
    }

    private List<ReporteInventarioDTO> generarReporteInventario(Long tiendaId) {
        return reportesRepository.reporteInventario(tiendaId)
                .stream()
                .map(r -> new ReporteInventarioDTO(
                getLong(r[0]),
                toStringSafe(r[1]),
                toStringSafe(r[2]),
                toStringSafe(r[3]),
                getInt(r[4]),
                getInt(r[5])
        ))
                .toList();
    }

    private String toStringSafe(Object o) {
        return Objects.toString(o, "");
    }

    private Long getLong(Object o) {
        return o == null ? null : ((Number) o).longValue();
    }

    private Double getDouble(Object o) {
        return o == null ? 0.0 : ((Number) o).doubleValue();
    }

    private Integer getInt(Object o) {
        return o == null ? null : ((Number) o).intValue();
    }
}
