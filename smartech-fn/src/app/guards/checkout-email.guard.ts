// src/app/guards/checkout-email.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SessionService } from '../services/session.service';

@Injectable({ providedIn: 'root' })
export class CheckoutEmailGuard implements CanActivate {

  constructor(
    private sessionService: SessionService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.sessionService.estaAutenticado && this.sessionService.esCliente) {
      this.router.navigate(['/checkout/entrega']);
      return false;
    }
    return true;
  }
}
