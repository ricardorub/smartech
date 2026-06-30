import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../../../services/usuario.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-estadistica-modal-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './estadistica-modal-admin.html',
  styleUrls: ['./estadistica-modal-admin.css'],
})
export class EstadisticaModalAdminComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @Input() usuario: any;
  @Input() cerrar!: () => void;

  @ViewChild('ventasChart') ventasChart!: ElementRef<HTMLCanvasElement>;

  datos: any[] = [];
  chart: any;
  cargando = true;

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    if (this.chart) this.chart.destroy();
  }

  cargarDatos() {
    this.usuarioService.obtenerVentasUsuario(this.usuario.idUsuarioInterno).subscribe({
      next: (r) => {
        this.datos = r;
        this.cargando = false;

        // Esperar un ciclo para que angular renderice el modal
        setTimeout(() => this.generarGrafico(), 150);
      },
      error: () => {
        this.cargando = false;
        this.datos = [];
      },
    });
  }

  generarGrafico() {
    if (!this.datos.length) return;

    const ctx = this.ventasChart?.nativeElement;

    if (!ctx) {
      console.error('Canvas no encontrado');
      return;
    }

    if (this.chart) this.chart.destroy();

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.datos.map((x) => x.mes),
        datasets: [
          {
            label: 'Total vendido (S/)',
            data: this.datos.map((x) => x.total),
            backgroundColor: 'rgba(56, 114, 255, 0.6)',
            borderColor: '#386FFF',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true },
        },
      },
    });
  }
}
