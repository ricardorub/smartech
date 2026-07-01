import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  private apiUrl = '/api/productos';
  private apiCategoriasUrl = '/api/categorias';

  constructor(private http: HttpClient) {}
  
  getProductos(page: number = 0, size: number = 8, nombre?: string, categoriaId?: number | null): Observable<any> {
    let params = new HttpParams().set('page', page).set('size', size);

    if (nombre && nombre.trim() !== '') {
      params = params.set('nombre', nombre.trim());
    }

    if (categoriaId !== null && categoriaId !== undefined) {
      params = params.set('categoriaId', categoriaId);
    }

    return this.http.get<any>(this.apiUrl, { params });
  }

 
  getCategorias(): Observable<any[]> {
    return this.http.get<any[]>(this.apiCategoriasUrl);
  }
}
