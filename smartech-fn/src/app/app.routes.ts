import { Routes } from '@angular/router';

import { AuthGuard } from './guards/auth.guard';
import { CheckoutEmailGuard } from './guards/checkout-email.guard';
import { CheckoutEntregaGuard } from './guards/checkout-entrega.guard';

import { HomeComponent } from './pagina/home/home';
import { ProductosComponent } from './pagina/productos/productos';
import { CarritoComponent } from './pagina/carrito/carrito';
import { PerfilComponent } from './pagina/perfil/perfil';

import { CheckoutEmailComponent } from './pagina/checkout-email/checkout-email';
import { CheckoutEntregaComponent } from './pagina/checkout-entrega/checkout-entrega';
import { CheckoutPagoComponent } from './pagina/checkout-pago/checkout-pago';
import { CheckoutExitoComponent } from './pagina/checkout-exito/checkout-exito';

import { MenuComponent } from './pagina/admin/menu/menu';
import { DashboardComponent } from './pagina/admin/dashboard/dashboard';
import { GestionVentasComponent } from './pagina/admin/gestion-ventas/gestion-ventas';
import { GestionVentasOnlineComponent } from './pagina/admin/gestion-ventas-online/gestion-ventas-online';
import { GestionInventariosComponent } from './pagina/admin/gestion-inventarios/gestion-inventarios';
import { GestionProductosComponent } from './pagina/admin/gestion-productos/gestion-productos';
import { GestionUsuariosComponent } from './pagina/admin/gestion-usuarios/gestion-usuarios';
import { VerClientesComponent } from './pagina/admin/ver-clientes/ver-clientes';
import { ReportesComponent } from './pagina/admin/reportes/reportes';
import { GestionRolesComponent } from './pagina/admin/gestion-roles/gestion-roles';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'productos', component: ProductosComponent },
  { path: 'carrito', component: CarritoComponent },
  { path: 'perfil', component: PerfilComponent, canActivate: [AuthGuard] },
  {
    path: 'checkout',
    children: [
      { path: 'email', component: CheckoutEmailComponent, canActivate: [CheckoutEmailGuard] },
      { path: 'entrega', component: CheckoutEntregaComponent, canActivate: [CheckoutEntregaGuard] },
      { path: 'pago', component: CheckoutPagoComponent, canActivate: [CheckoutEntregaGuard] },
      { path: 'exito', component: CheckoutExitoComponent, canActivate: [CheckoutEntregaGuard] },
      { path: '', redirectTo: 'email', pathMatch: 'full' },
    ],
  },
  {
    path: 'admin',
    component: MenuComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard]  },
      { path: 'ventas', component: GestionVentasComponent, canActivate: [AuthGuard]  },
      { path: 'online', component: GestionVentasOnlineComponent, canActivate: [AuthGuard]  },
      { path: 'inventarios', component: GestionInventariosComponent , canActivate: [AuthGuard] },
      { path: 'productos', component: GestionProductosComponent , canActivate: [AuthGuard] },
      { path: 'usuarios', component: GestionUsuariosComponent , canActivate: [AuthGuard] },
      { path: 'roles', component: GestionRolesComponent, canActivate: [AuthGuard] },
      { path: 'reportes', component: ReportesComponent , canActivate: [AuthGuard] },
      { path: 'cliente', component: VerClientesComponent , canActivate: [AuthGuard] },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  { path: '**', redirectTo: '' },
];
