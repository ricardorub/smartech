import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../../../services/inventario.service';
import { TiendaService, Tienda } from '../../../services/tienda.service';
import { InventarioModalComponent } from './inventario-modal/inventario-modal';
import { MovimientosModalComponent } from './movimientos-modal/movimientos-modal';
import { MovimientosInventarioModalComponent } from './movimientos-inventario-modal/movimientos-inventario-modal';
import { ViewChild } from '@angular/core';
import { SessionService } from '../../../services/session.service';

@Component({
  selector: 'app-gestion-inventarios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InventarioModalComponent,
    MovimientosModalComponent,
    MovimientosInventarioModalComponent,
  ],
  templateUrl: './gestion-inventarios.html',
  styleUrls: ['./gestion-inventarios.css'],
})
export class GestionInventariosComponent implements OnInit {

  @ViewChild(InventarioModalComponent) inventarioModal!: InventarioModalComponent;
  @ViewChild(MovimientosModalComponent) movinventarioModal!: MovimientosModalComponent;
  @ViewChild(MovimientosInventarioModalComponent)
  detmovinventarioModal!: MovimientosInventarioModalComponent;

  tiendas: Tienda[] = [];
  tiendaSeleccionada: number = 0;

  productosSinInventario: any[] = [];

  inventarioCompleto: any[] = [];
  inventarioFiltrado: any[] = [];
  inventarioPaginado: any[] = [];

  filtroNombre: string = '';

  resumen = {
    totalProductos: 0,
    stockBajo: 0,
    stockTotal: 0,
  };

  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;

  inventarioSeleccionado: any = null;

  modalInventario: any;
  modalMovimiento: any;

  esAdmin: boolean = false;
  tiendaEmpleadoActual: any = null;

  constructor(
    private inventarioService: InventarioService,
    private tiendaService: TiendaService,
    private sessionService: SessionService
  ) {}

  ngOnInit(): void {
    this.esAdmin = this.sessionService.esAdmin;
    this.tiendaEmpleadoActual = this.sessionService.tiendaEmpleado;

    this.cargarTiendas();
  }

  cargarTiendas() {
    this.tiendaService.listarTiendas().subscribe({
      next: (data) => {

        if (this.esAdmin) {
          // ADMIN = todas las tiendas
          this.tiendas = [
            { idTienda: 0, nombre: 'Todas las tiendas', direccion: '', distrito: '' },
            ...data,
          ];
          this.tiendaSeleccionada = 0;
        } else {

          // *** EMPLEADO = SOLO SU TIENDA ***
          const tiendaAdaptada: Tienda = {
            idTienda: this.tiendaEmpleadoActual.idTienda,
            nombre: this.tiendaEmpleadoActual.nombre,
            direccion: '', // Se completa vacío porque backend no lo envía
            distrito: '',  // Se completa vacío porque backend no lo envía
          };

          this.tiendas = [tiendaAdaptada];
          this.tiendaSeleccionada = tiendaAdaptada.idTienda;
        }

        this.cargarInventario();
      },

      error: () => {
        // Fallback seguro
        this.tiendas = [
          { idTienda: 0, nombre: 'Todas las tiendas', direccion: '', distrito: '' }
        ];
        this.cargarInventario();
      },
    });
  }

  cargarInventario() {
    const id = Number(this.tiendaSeleccionada);

    if (id === 0) {
      this.cargarInventarioGeneral();
    } else {
      this.cargarInventarioPorTienda(id);
    }
  }

  cargarInventarioGeneral() {
    this.inventarioService.listarTodos().subscribe({
      next: (res: any) => {
        let data: any[] = [];

        if (Array.isArray(res)) data = res;
        else if (res?.data && Array.isArray(res.data)) data = res.data;

        if (data.length === 0) {
          this.usarDatosSimulados();
          return;
        }

        this.setInventario(data);
      },
      error: () => this.usarDatosSimulados(),
    });
  }

  cargarInventarioPorTienda(idTienda: number) {
    this.inventarioService.listarPorTienda(idTienda).subscribe({
      next: (res: any) => {
        if (res?.data && Array.isArray(res.data)) {
          this.setInventario(res.data);
        } else {
          this.setInventario([]);
        }
      },
      error: () => this.usarDatosSimulados(),
    });
  }

  setInventario(data: any[]) {
    this.inventarioCompleto = [...data];
    this.inventarioFiltrado = [...data];

    this.currentPage = 1;
    this.actualizarPaginacion();
    this.calcularResumen();
    this.cargarProductosSinInventario();
  }

  usarDatosSimulados() {
    const data = [
      {
        idInventario: 1,
        cantidad: 10,
        stockMinimo: 5,
        activo: true,
        producto: {
          idProducto: 1,
          nombreProducto: 'Laptop HP',
          descripcionProducto: 'Core i5',
          precioProducto: 2500,
          imagenUrlProducto:
            'https://www.efe.com.pe/media/catalog/product/a/5/a56-256-12gligr_1.jpg',
        },
      },
    ];
    this.setInventario(data);
  }

  cargarProductosSinInventario() {
    const id = Number(this.tiendaSeleccionada);

    if (id === 0) {
      this.productosSinInventario = [];
      return;
    }

    this.inventarioService.productosSinInventario(id).subscribe({
      next: (res: any) => {
        if (res?.success) this.productosSinInventario = res.data || [];
      },
    });
  }

  calcularResumen() {
    this.resumen.totalProductos = this.inventarioFiltrado.length;
    this.resumen.stockBajo = this.inventarioFiltrado.filter(
      (i) => i.cantidad <= i.stockMinimo
    ).length;
    this.resumen.stockTotal = this.inventarioFiltrado.reduce((s, i) => s + i.cantidad, 0);
  }

  filtrarInventario() {
    const txt = (this.filtroNombre || '').toLowerCase().trim();

    if (!txt) {
      this.inventarioFiltrado = [...this.inventarioCompleto];
    } else {
      this.inventarioFiltrado = this.inventarioCompleto.filter((item) =>
        item.producto?.nombreProducto?.toLowerCase().includes(txt)
      );
    }

    this.currentPage = 1;
    this.actualizarPaginacion();
    this.calcularResumen();
  }

  actualizarPaginacion() {
    const inicio = (this.currentPage - 1) * this.pageSize;
    const fin = inicio + this.pageSize;

    this.totalPages = Math.ceil(this.inventarioFiltrado.length / this.pageSize);
    this.inventarioPaginado = this.inventarioFiltrado.slice(inicio, fin);
  }

  cambiarPagina(pagina: number) {
    if (pagina < 1 || pagina > this.totalPages) return;
    this.currentPage = pagina;
    this.actualizarPaginacion();
  }

  abrirModalInventario() {
    if (this.inventarioModal) {
      this.inventarioModal.abrirModal();
    }
  }

  ajustarStock(item: any) {
    this.inventarioSeleccionado = item;

    if (this.movinventarioModal) {
      this.movinventarioModal.inventarioSeleccionado = item;
      this.movinventarioModal.abrirModal();
    }
  }

  verMovimientos(item: any) {
    this.inventarioSeleccionado = item;

    if (this.detmovinventarioModal) {
      this.detmovinventarioModal.inventario = item;
      this.detmovinventarioModal.abrirModal();
    }
  }
}
