import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Technician, ServiceType } from "../models/models";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class CatalogsApiService {
  private readonly base = environment.apiUrl;
  private readonly http = inject(HttpClient);

  getTechnicians(): Observable<Technician[]> {
    return this.http.get<Technician[]>(`${this.base}/technicians`);
  }

  getServiceTypes(): Observable<ServiceType[]> {
    return this.http.get<ServiceType[]>(`${this.base}/service-types`);
  }
}
