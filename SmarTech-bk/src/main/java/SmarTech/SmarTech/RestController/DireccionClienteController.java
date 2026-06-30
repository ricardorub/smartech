/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package SmarTech.SmarTech.RestController;

/**
 *
 * @author kevin
 */
import SmarTech.SmarTech.model.DireccionCliente;
import SmarTech.SmarTech.service.DireccionClienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/direcciones")
@CrossOrigin(origins = "*")
public class DireccionClienteController {

    @Autowired
    private DireccionClienteService service;

    @PostMapping
    public DireccionCliente guardar(@RequestBody DireccionCliente direccion) {
        return service.guardar(direccion);
    }

    @GetMapping
    public List<DireccionCliente> listarTodas() {
        return service.listarTodas();
    }

    @GetMapping("/cliente/{idCliente}")
    public List<DireccionCliente> listarPorCliente(@PathVariable Long idCliente) {
        return service.listarPorCliente(idCliente);
    }

    @GetMapping("/{id}")
    public Optional<DireccionCliente> buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }
}
