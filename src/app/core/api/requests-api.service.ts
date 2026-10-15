import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { Request, RequestForm, Page, RequestFilters } from "../models/models";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class RequestsApiService {
  private readonly base = `${environment.apiUrl}/requests`;
  private readonly http = inject(HttpClient);

  list(filters: RequestFilters): Observable<Page<Request>> {
    let params = new HttpParams()
      .set("page", String(filters.page))
      .set("pageSize", String(filters.pageSize));
    if (filters.status) params = params.set("status", filters.status);
    if (filters.technicianId) params = params.set("technicianId", String(filters.technicianId));
    if (filters.serviceTypeId) params = params.set("serviceTypeId", String(filters.serviceTypeId));
    if (filters.q) params = params.set("q", filters.q);
    if (filters.sort) params = params.set("sort", filters.sort);
    if (filters.order) params = params.set("order", filters.order);
    return this.http.get<Page<Request>>(this.base, { params });
  }

  detail(id: number): Observable<Request> {
    return this.http.get<Request>(`${this.base}/${id}`);
  }

  create(form: RequestForm): Observable<Request> {
    return this.http.post<Request>(this.base, form);
  }

  update(id: number, form: RequestForm): Observable<Request> {
    return this.http.put<Request>(`${this.base}/${id}`, form);
  }

  changeStatus(id: number, status: string): Observable<Request> {
    return this.http.patch<Request>(`${this.base}/${id}/status`, { status });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
