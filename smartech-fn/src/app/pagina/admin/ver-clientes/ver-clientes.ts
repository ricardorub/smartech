import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientesAdminService } from '../../../services/clientes-admin.service';
import { EstadisticaClienteModalComponent } from './estadistica-cliente-modal/estadistica-cliente-modal';
import { DireccionesClienteModalComponent } from './direcciones-cliente-modal/direcciones-cliente-modal';

@Component({
  selector: 'app-ver-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, EstadisticaClienteModalComponent, DireccionesClienteModalComponent],
  templateUrl: './ver-clientes.html',
  styleUrls: ['./ver-clientes.css']
})
export class VerClientesComponent implements OnInit {

  clientes: any[] = [];
  filtro = '';
  orden = 'DESC';

  modalEstadisticas = false;
  modalDirecciones = false;
  clienteSeleccionado: any = null;

  constructor(private clientesAdminService: ClientesAdminService) {}

  ngOnInit(): void {
    this.cargarClientes();
  }

  cargarClientes() {
    const params = {
      filtro: this.filtro.trim() !== '' ? this.filtro.trim() : null,
      orden: this.orden
    };

    this.clientesAdminService.listarClientes(params).subscribe({
      next: (data) => {
        this.clientes = data;
      },
      error: () => {
        this.clientes = [];
      }
    });
  }

  cambiarOrden(value: string) {
    this.orden = value;
    this.cargarClientes();
  }

  verEstadisticas(cliente: any) {
    this.clienteSeleccionado = cliente;
    this.modalEstadisticas = true;
  }

  cerrarEstadisticas() {
    this.modalEstadisticas = false;
  }

  verDirecciones(cliente: any) {
    this.clienteSeleccionado = cliente;
    this.modalDirecciones = true;
  }

  cerrarDirecciones() {
    this.modalDirecciones = false;
  }
}
