/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package SmarTech.SmarTech.RestController;

/**
 *
 * @author kevin
 */


import SmarTech.SmarTech.DTO.*;
import SmarTech.SmarTech.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") 
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/kpis")
    public KpiResponse kpis() {
        return dashboardService.obtenerKpis();
    }

    @GetMapping("/ventas-7-dias")
    public List<VentaDiaDTO> ventas7dias() {
        return dashboardService.ventasUltimos7Dias();
    }

    @GetMapping("/pedidos-estado")
    public List<EstadoPedidoDTO> pedidosEstado() {
        return dashboardService.pedidosPorEstado();
    }

    @GetMapping("/top-productos")
    public List<TopProductoDTO> topProductos() {
        return dashboardService.topProductos();
    }

    @GetMapping("/top-clientes")
    public List<TopClienteDTO> topClientes() {
        return dashboardService.topClientes();
    }

}

