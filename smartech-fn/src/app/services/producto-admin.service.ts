import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Categoria } from '../models/productos.models';

@Injectable({
  providedIn: 'root',
})
export class ProductoService {
  private baseUrl = '/api/admin/productos';
  private categoriasUrl = '/api/categorias';

  constructor(private http: HttpClient) {}

  listarProductos(
    pagina: number,
    size: number,
    nombre?: string,
    categoriaId?: number
  ): Observable<any> {
    let params = new HttpParams().set('page', pagina).set('size', size);

    if (nombre) params = params.set('nombre', nombre);
    if (categoriaId) params = params.set('categoriaId', categoriaId);

    return this.http.get(`${this.baseUrl}`, { params });
  }

  guardarProducto(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}`, formData);
  }

  actualizarProducto(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }

  cambiarEstadoProducto(id: number, estado: number): Observable<any> {
    const params = new HttpParams().set('estado', estado);
    return this.http.put(`${this.baseUrl}/${id}/estado`, null, { params });
  }

  actualizarImagen(id: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('imagen', file);

    return this.http.put(`${this.baseUrl}/${id}/imagen`, formData);
  }

  eliminarImagen(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}/imagen`);
  }

  listarCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.categoriasUrl);
  }

  guardarCategoria(data: any): Observable<any> {
    return this.http.post(this.categoriasUrl, data);
  }

  actualizarCategoria(id: number, data: any): Observable<any> {
    return this.http.put(`${this.categoriasUrl}/${id}`, data);
  }

  eliminarCategoria(id: number): Observable<any> {
    return this.http.delete(`${this.categoriasUrl}/${id}`);
  }

  buscarProductosPorTienda(texto: string, tiendaId: number): Observable<any[]> {
    const params = new HttpParams().set('buscar', texto).set('tiendaId', tiendaId);

    return this.http.get<any[]>(`${this.baseUrl}/buscar-por-tienda`, { params });
  }
}
