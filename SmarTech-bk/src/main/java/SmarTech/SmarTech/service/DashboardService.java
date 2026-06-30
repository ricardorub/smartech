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
import SmarTech.SmarTech.repository.DashboardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final DashboardRepository dashboardRepository;


    public KpiResponse obtenerKpis() {
        return new KpiResponse(
            dashboardRepository.ventasHoy(),
            dashboardRepository.pedidosHoy(),
            dashboardRepository.clientesNuevosMes(),
            dashboardRepository.productosSinStock()
        );
    }

    public List<VentaDiaDTO> ventasUltimos7Dias() {
        return dashboardRepository.ventasUltimos7Dias()
                .stream()
                .map(r -> new VentaDiaDTO(
                        r[0].toString(),
                        Double.parseDouble(r[1].toString())
                ))
                .toList();
    }


    public List<EstadoPedidoDTO> pedidosPorEstado() {
        return dashboardRepository.pedidosPorEstado()
                .stream()
                .map(r -> new EstadoPedidoDTO(
                        r[0].toString(),
                        Long.parseLong(r[1].toString())
                ))
                .toList();
    }


    public List<TopProductoDTO> topProductos() {
        return dashboardRepository.topProductos()
                .stream()
                .map(r -> new TopProductoDTO(
                        r[0].toString(),
                        Long.parseLong(r[1].toString()),
                        Double.parseDouble(r[2].toString())
                ))
                .toList();
    }

    public List<TopClienteDTO> topClientes() {
        return dashboardRepository.topClientes()
                .stream()
                .map(r -> new TopClienteDTO(
                        r[0].toString(),
                        Long.parseLong(r[1].toString()),
                        Double.parseDouble(r[2].toString())
                ))
                .toList();
    }
}
