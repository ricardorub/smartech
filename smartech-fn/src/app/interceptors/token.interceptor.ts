import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { SessionService } from '../services/session.service';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {

  const sessionService = inject(SessionService);
  const token = sessionService.usuarioActual?.token;

  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      }
    });
    return next(authReq);
  }

  return next(req);
};
