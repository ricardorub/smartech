import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientesAdminService } from '../../../../services/clientes-admin.service';

@Component({
  selector: 'app-direcciones-cliente-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './direcciones-cliente-modal.html',
  styleUrls: ['./direcciones-cliente-modal.css']
})
export class DireccionesClienteModalComponent implements OnInit {

  @Input() cliente: any = null;
  @Input() cerrar!: () => void;

  direcciones: any[] = [];
  cargando = true;

  constructor(private clientesAdminService: ClientesAdminService) {}

  ngOnInit(): void {
    if (this.cliente) {
      this.cargarDirecciones();
    }
  }

  cargarDirecciones() {
    this.cargando = true;

    this.clientesAdminService.obtenerDirecciones(this.cliente.idCliente).subscribe({
      next: (data) => {
        this.direcciones = data;
        this.cargando = false;
      },
      error: () => {
        this.direcciones = [];
        this.cargando = false;
      }
    });
  }
}
