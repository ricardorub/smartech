import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import Chart from 'chart.js/auto';
import { DashboardService } from '../../../services/dashboard.service';

export interface KpiResponse {
  ventasHoy: number;
  pedidosHoy: number;
  clientesNuevos: number;
  productosSinStock: number;
}

export interface VentaDiaDTO {
  fecha: string;   
  total: number;  
}

export interface EstadoPedidoDTO {
  estado: string;   
  cantidad: number;
}

export interface TopProductoDTO {
  nombre: string;
  cantidad: number;  
  total: number;     
}

export interface TopClienteDTO {
  nombre: string;
  pedidos: number;
  total: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule              
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {

  ventasHoy: number = 0;
  pedidosHoy: number = 0;
  clientesNuevos: number = 0;
  productosSinStock: number = 0;


  ventasUltimos7Dias: VentaDiaDTO[] = [];
  pedidosPorEstado: EstadoPedidoDTO[] = [];

  topProductos: TopProductoDTO[] = [];
  topClientes: TopClienteDTO[] = [];

  private chartVentas?: Chart;
  private chartEstados?: Chart;

  constructor(
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.cargarKpis();
    this.cargarVentasUltimos7Dias();
    this.cargarPedidosPorEstado();
    this.cargarTopProductos();
    this.cargarTopClientes();
  }

  ngAfterViewInit(): void {
    this.inicializarChartVentas();
    this.inicializarChartEstados();
  }


  private cargarKpis(): void {
    this.dashboardService.obtenerKpis().subscribe({
      next: (res: KpiResponse) => {
        this.ventasHoy = res.ventasHoy;
        this.pedidosHoy = res.pedidosHoy;
        this.clientesNuevos = res.clientesNuevos;
        this.productosSinStock = res.productosSinStock;
      },
      error: (err) => {
        console.error('Error cargando KPIs', err);
      },
    });
  }

  private cargarVentasUltimos7Dias(): void {
    this.dashboardService.obtenerVentasUltimos7Dias().subscribe({
      next: (data: VentaDiaDTO[]) => {
        this.ventasUltimos7Dias = data;
        this.actualizarChartVentas();
      },
      error: (err) => {
        console.error('Error cargando ventas últimos 7 días', err);
      },
    });
  }

  private cargarPedidosPorEstado(): void {
    this.dashboardService.obtenerPedidosPorEstado().subscribe({
      next: (data: EstadoPedidoDTO[]) => {
        this.pedidosPorEstado = data;
        this.actualizarChartEstados();
      },
      error: (err) => {
        console.error('Error cargando pedidos por estado', err);
      },
    });
  }

  private cargarTopProductos(): void {
    this.dashboardService.obtenerTopProductos().subscribe({
      next: (data: TopProductoDTO[]) => {
        this.topProductos = data;
      },
      error: (err) => {
        console.error('Error cargando top productos', err);
      },
    });
  }

  private cargarTopClientes(): void {
    this.dashboardService.obtenerTopClientes().subscribe({
      next: (data: TopClienteDTO[]) => {
        this.topClientes = data;
      },
      error: (err) => {
        console.error('Error cargando top clientes', err);
      },
    });
  }

  private inicializarChartVentas(): void {
    const canvas = document.getElementById('chartVentas') as HTMLCanvasElement | null;
    if (!canvas) { return; }

    const ctx = canvas.getContext('2d');
    if (!ctx) { return; }

    this.chartVentas = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],   
        datasets: [
          {
            label: 'Ventas (S/)',
            data: [],
            tension: 0.3,
            fill: true,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        scales: {
          x: { title: { display: true, text: 'Fecha' } },
          y: { title: { display: true, text: 'Monto (S/)' } },
        },
      },
    });
  }

  private inicializarChartEstados(): void {
    const canvas = document.getElementById('chartEstados') as HTMLCanvasElement | null;
    if (!canvas) { return; }

    const ctx = canvas.getContext('2d');
    if (!ctx) { return; }

    this.chartEstados = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: [],
        datasets: [
          {
            data: [],
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
          },
        },
      },
    });
  }

  private actualizarChartVentas(): void {
    if (!this.chartVentas) { return; }

    const labels = this.ventasUltimos7Dias.map(v => this.formatearFechaLabel(v.fecha));
    const data = this.ventasUltimos7Dias.map(v => v.total);

    this.chartVentas.data.labels = labels;
    this.chartVentas.data.datasets[0].data = data;
    this.chartVentas.update();
  }

  private actualizarChartEstados(): void {
    if (!this.chartEstados) { return; }

    const labels = this.pedidosPorEstado.map(e => e.estado);
    const data = this.pedidosPorEstado.map(e => e.cantidad);

    this.chartEstados.data.labels = labels;
    this.chartEstados.data.datasets[0].data = data;
    this.chartEstados.update();
  }

  private formatearFechaLabel(fecha: string): string {
    const d = new Date(fecha);
    if (isNaN(d.getTime())) {
      return fecha;
    }

    const dia = d.getDate().toString().padStart(2, '0');
    const mes = (d.getMonth() + 1).toString().padStart(2, '0');
    return `${dia}/${mes}`;
  }

}
