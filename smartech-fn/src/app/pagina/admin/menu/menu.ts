import { Component } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { SessionService } from '../../../services/session.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, NgClass],
  templateUrl: './menu.html',
  styleUrls: ['./menu.css'],
})
export class MenuComponent {
  menuInventariosAbierto = false;
  menuUsuariosAbierto = false;
  menuTiendaAbierto = false;

  esAdmin = false;
  esEmpleado = false;

  constructor(private session: SessionService) {
    this.verificarRoles();
  }

  verificarRoles() {
    this.esAdmin = this.session.esAdmin;
    this.esEmpleado = this.session.esEmpleado;
  }

  toggleVentas() {
    this.menuTiendaAbierto = !this.menuTiendaAbierto;
  }

  toggleInventarios() {
    this.menuInventariosAbierto = !this.menuInventariosAbierto;
  }

  toggleUsuarios() {
    this.menuUsuariosAbierto = !this.menuUsuariosAbierto;
  }
}
