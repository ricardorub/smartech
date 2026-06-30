/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package SmarTech.SmarTech.service;

/**
 *
 * @author kevin
 */

import SmarTech.SmarTech.model.Tienda;
import SmarTech.SmarTech.repository.TiendaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TiendaService {

    private final TiendaRepository repository;

    public TiendaService(TiendaRepository repository) {
        this.repository = repository;
    }

    public List<Tienda> listarTiendasActivas() {
        return repository.findByActivaTrue();
    }
}
