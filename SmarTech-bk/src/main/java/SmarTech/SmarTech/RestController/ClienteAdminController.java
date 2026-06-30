/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package SmarTech.SmarTech.RestController;

/**
 *
 * @author kevin
 */

import SmarTech.SmarTech.DTO.ClienteListadoDTO;
import SmarTech.SmarTech.DTO.DireccionClienteDTO;
import SmarTech.SmarTech.DTO.VentasClienteMensualesDTO;
import SmarTech.SmarTech.service.ClienteService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/private/clientes-admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class ClienteAdminController {

    private final ClienteService service;

    @GetMapping
    public List<ClienteListadoDTO> listarClientes(
            @RequestParam(required = false) String filtro,
            @RequestParam(defaultValue = "DESC") String orden
    ) {
        return service.listarClientes(filtro, orden);
    }

    @GetMapping("/{id}/direcciones")
    public List<DireccionClienteDTO> direcciones(@PathVariable Long id) {
        return service.listarDirecciones(id);
    }

    @GetMapping("/{id}/estadisticas")
    public List<VentasClienteMensualesDTO> estadisticas(@PathVariable Long id) {
        return service.estadisticasCliente(id);
    }
}
