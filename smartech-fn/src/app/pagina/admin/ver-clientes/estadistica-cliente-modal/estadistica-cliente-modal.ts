import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  ChangeDetectorRef,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { ClientesAdminService } from '../../../../services/clientes-admin.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-estadistica-cliente-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './estadistica-cliente-modal.html',
  styleUrls: ['./estadistica-cliente-modal.css'],
})
export class EstadisticaClienteModalComponent implements OnInit, AfterViewChecked, OnDestroy {
  @Input() cliente: any = null;
  @Input() cerrar!: () => void;

  @ViewChild('chartComprasCanvas') chartComprasCanvas!: ElementRef<HTMLCanvasElement>;

  cargando = true;
  datos: any = null;

  chartCompras: Chart | null = null;
  private pendingChart = false;

  constructor(private clientesAdminService: ClientesAdminService, private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (this.cliente) {
      this.cargarEstadisticas();
    }
  }

  ngAfterViewChecked(): void {
    if (this.pendingChart && this.chartComprasCanvas) {
      this.pendingChart = false;
      this.generarGraficoCompras();
    }
  }

  ngOnDestroy(): void {
    if (this.chartCompras) {
      this.chartCompras.destroy();
    }
  }
  cargarEstadisticas() {
    this.cargando = true;

    this.clientesAdminService.obtenerEstadisticas(this.cliente.idCliente).subscribe({
      next: (data) => {
        if (Array.isArray(data)) {
          this.datos = {
            comprasPorMes: data,
            totalComprado: data.reduce((a, b) => a + b.total, 0),
            cantidadCompras: data.length,
            ultimaCompra: data.length > 0 ? data[data.length - 1].mes : null,
          };
        } else {
          this.datos = data;
        }
        this.cargando = false;
        this.pendingChart = true;
        this.cd.detectChanges();
      },

      error: (err) => {
        console.error(
          '%c[ERROR] No se pudieron cargar estadísticas',
          'color: red; font-weight: bold;',
          err
        );
        this.datos = null;
        this.cargando = false;
      },
    });
  }
  generarGraficoCompras() {
    const canvas = this.chartComprasCanvas?.nativeElement;

    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    if (this.chartCompras) {
      this.chartCompras.destroy();
    }

    const lista = this.datos?.comprasPorMes || [];
    const labels = lista.map((d: any) => d.mes);
    const valores = lista.map((d: any) => d.total);

    this.chartCompras = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Total comprado (S/)',
            data: valores,
            backgroundColor: '#3b82f6',
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
      },
    });
  }
}
