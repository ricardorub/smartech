/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package SmarTech.SmarTech.service;

/**
 *
 * @author kevin
 */

import SmarTech.SmarTech.model.DireccionCliente;
import SmarTech.SmarTech.repository.DireccionClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DireccionClienteService {

    @Autowired
    private DireccionClienteRepository repository;

    public DireccionCliente guardar(DireccionCliente direccion) {
        return repository.save(direccion);
    }

    public List<DireccionCliente> listarTodas() {
        return repository.findAll();
    }

    public List<DireccionCliente> listarPorCliente(Long idCliente) {
        return repository.findByCliente_IdClienteAndActivoTrue(idCliente);
    }

    public Optional<DireccionCliente> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public void eliminar(Long id) {
        repository.deleteById(id);
    }
}
