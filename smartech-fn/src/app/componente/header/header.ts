import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { SessionService } from '../../services/session.service';
import { UsuarioModalComponent } from '../../componente/usuario-modal/usuario-modal';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, UsuarioModalComponent],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class HeaderComponent implements OnInit {
  totalItems = 0;
  usuarioActual: any = null;
  showLoginModal = false;
  @ViewChild(UsuarioModalComponent) modal!: UsuarioModalComponent;

  constructor(private cart: CartService, private session: SessionService, private router: Router) {}

  ngOnInit() {
    this.cart.carrito$.subscribe((items) => {
      this.totalItems = items.reduce((acc, it) => acc + it.cantidad, 0);
    });
    this.session.usuarioActual$.subscribe((usuario) => {
      this.usuarioActual = usuario;
    });
  }

  abrirModalLogin() {
    this.showLoginModal = true;

    setTimeout(() => {
      if (this.modal) {
        this.modal.iniciarEnLogin();
      }
    }, 0);
  }

  cerrarModalLogin() {
    this.showLoginModal = false;
  }

  logout() {
    this.session.cerrarSesion();
    this.router.navigate(['/']);
  }
}
