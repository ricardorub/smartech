import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ReportesService } from '../../../services/reportes.service';
import { TiendaService } from '../../../services/tienda.service';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-reportes',
  standalone: true,
  templateUrl: './reportes.html',
  styleUrls: ['./reportes.css'],
  imports: [CommonModule, FormsModule]
})
export class ReportesComponent implements OnInit {

  filtroFechaInicio: any;
  filtroFechaFin: any;
  filtroTienda: any = '';
  tipoReporte: string = 'ventas';

  datos: any[] = [];
  columnas: string[] = [];

  tiendas: any[] = [];

  cargando = false;

  constructor(
    private reportesService: ReportesService,
    private tiendaService: TiendaService
  ) {}

  ngOnInit(): void {
    this.cargarTiendas();
  }

  cargarTiendas() {
    this.tiendaService.listarTiendas().subscribe({
      next: (resp) => {
        this.tiendas = resp;
      },
      error: () => {
        console.error("Error cargando tiendas");
      }
    });
  }

  generarReporte() {
    if (!this.filtroFechaInicio || !this.filtroFechaFin) {
      alert("Seleccione fecha inicio y fecha fin");
      return;
    }

    this.cargando = true;

    this.reportesService.obtenerReporte(
      this.tipoReporte,
      this.filtroFechaInicio,
      this.filtroFechaFin,
      this.filtroTienda
    ).subscribe({
      next: (resp) => {
        this.datos = resp;

        if (this.datos.length > 0) {
          this.columnas = Object.keys(this.datos[0]);
        } else {
          this.columnas = [];
        }

        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        alert("Error generando reporte");
      }
    });
  }

  exportarPDF() {
    if (!this.datos || this.datos.length === 0) return;

    const doc = new jsPDF('landscape', 'pt', 'a4');

    doc.setFontSize(16);
    doc.text(`Reporte - ${this.tipoReporte.toUpperCase()}`, 40, 40);

    const data = this.datos.map(row => this.columnas.map(c => row[c]));

    autoTable(doc, {
      startY: 60,
      head: [this.columnas],
      body: data,
      styles: {
        fontSize: 9,
        halign: 'left'
      }
    });

    doc.save(`reporte-${this.tipoReporte}.pdf`);
  }


  exportarExcel() {
    if (!this.datos || this.datos.length === 0) return;

    const ws = XLSX.utils.json_to_sheet(this.datos);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, 'Reporte');

    XLSX.writeFile(wb, `reporte-${this.tipoReporte}.xlsx`);
  }

}
