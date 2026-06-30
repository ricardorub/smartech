import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CheckoutRequest
} from '../models/checkout.model';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

  private apiUrl = 'http://localhost:8080/api/checkout';

  constructor(private http: HttpClient) {}

  finalizarCompra(data: CheckoutRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/finalizar`, data);
  }
}
