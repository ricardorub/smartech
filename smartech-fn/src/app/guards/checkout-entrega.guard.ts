// src/app/guards/checkout-entrega.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SessionService } from '../services/session.service';

@Injectable({ providedIn: 'root' })
export class CheckoutEntregaGuard implements CanActivate {

  constructor(
    private sessionService: SessionService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const user = this.sessionService.usuarioActual;

    if (user?.tipo === 'CLIENTE') {
      return true;
    }

    if (user?.tipo === 'INVITADO') {
      return true;
    }

    this.router.navigate(['/checkout/email']);
    return false;
  }
}
