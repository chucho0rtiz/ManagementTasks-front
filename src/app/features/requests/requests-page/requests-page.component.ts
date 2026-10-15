import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatDialog } from "@angular/material/dialog";
import { PageEvent } from "@angular/material/paginator";
import { finalize } from "rxjs";
import {
  Request,
  RequestFilters,
  Status,
  Technician,
  ServiceType,
} from "../../../core/models/models";
import { RequestsApiService } from "../../../core/api/requests-api.service";
import { CatalogsApiService } from "../../../core/api/catalogs-api.service";
import { NotificationService } from "../../../core/services/notification.service";
import { RequestFiltersComponent } from "../request-filters/request-filters.component";
import { RequestListComponent } from "../request-list/request-list.component";
import { RequestFormDialogComponent } from "../request-form-dialog/request-form-dialog.component";
import { ConfirmDialogComponent } from "../confirm-dialog/confirm-dialog.component";
import { RequestDetailDialogComponent } from "../request-detail-dialog/request-detail-dialog.component";

@Component({
  selector: "app-requests-page",
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RequestFiltersComponent,
    RequestListComponent,
  ],
  templateUrl: "./requests-page.component.html",
  styleUrl: "./requests-page.component.scss",
})
export class RequestsPageComponent implements OnInit {
  private readonly requestsApi = inject(RequestsApiService);
  private readonly catalogsApi = inject(CatalogsApiService);
  private readonly notifications = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly requests = signal<Request[]>([]);
  readonly meta = signal<{ page: number; pageSize: number; total: number; totalPages: number } | null>(
    null
  );
  readonly filters = signal<RequestFilters>({
    page: 1,
    pageSize: 10,
    sort: "created_at",
    order: "desc",
  });
  readonly technicians = signal<Technician[]>([]);
  readonly serviceTypes = signal<ServiceType[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadCatalogs();
    this.loadRequests();
  }

  private loadCatalogs(): void {
    this.catalogsApi.getTechnicians().subscribe({
      next: (t) => this.technicians.set(t),
      error: () => this.technicians.set([]),
    });
    this.catalogsApi.getServiceTypes().subscribe({
      next: (s) => this.serviceTypes.set(s),
      error: () => this.serviceTypes.set([]),
    });
  }

  loadRequests(): void {
    this.loading.set(true);
    this.error.set(null);
    this.requestsApi
      .list(this.filters())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (page) => {
          this.requests.set(page.data);
          this.meta.set(page.meta);
        },
        error: (err) => {
          this.error.set(err?.error?.message ?? "No se pudieron cargar las solicitudes");
          this.requests.set([]);
        },
      });
  }

  onFiltersChange(filters: RequestFilters): void {
    this.filters.set(filters);
    this.loadRequests();
  }

  onPageChange(event: PageEvent): void {
    this.filters.set({ ...this.filters(), page: event.pageIndex + 1, pageSize: event.pageSize });
    this.loadRequests();
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(RequestFormDialogComponent, {
      width: "600px",
      maxWidth: "95vw",
      data: {
        mode: "create",
        technicians: this.technicians(),
        serviceTypes: this.serviceTypes(),
      },
    });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.notifications.success("Solicitud creada correctamente");
        this.filters.set({ ...this.filters(), page: 1 });
        this.loadRequests();
      }
    });
  }

  openEditDialog(request: Request): void {
    const ref = this.dialog.open(RequestFormDialogComponent, {
      width: "600px",
      maxWidth: "95vw",
      data: {
        mode: "edit",
        request,
        technicians: this.technicians(),
        serviceTypes: this.serviceTypes(),
      },
    });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.notifications.success("Solicitud actualizada correctamente");
        this.loadRequests();
      }
    });
  }

  openDetailDialog(request: Request): void {
    this.dialog.open(RequestDetailDialogComponent, {
      width: "560px",
      maxWidth: "95vw",
      data: request,
    });
  }

  confirmDelete(request: Request): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: "440px",
      data: {
        title: "Eliminar solicitud",
        message: `¿Seguro que deseas eliminar "${request.title}"? Esta acción no se puede deshacer.`,
      },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.requestsApi.delete(request.id).subscribe({
          next: () => {
            this.notifications.success("Solicitud eliminada");
            if (this.requests().length === 1 && this.filters().page > 1) {
              this.filters.set({ ...this.filters(), page: this.filters().page - 1 });
            }
            this.loadRequests();
          },
          error: (err) =>
            this.notifications.error(err?.error?.message ?? "No se pudo eliminar la solicitud"),
        });
      }
    });
  }

  onStatusChange(event: { request: Request; status: Status }): void {
    this.requestsApi.changeStatus(event.request.id, event.status).subscribe({
      next: () => {
        this.notifications.success("Estado actualizado");
        this.loadRequests();
      },
      error: (err) =>
        this.notifications.error(err?.error?.message ?? "Transición de estado no permitida"),
    });
  }
}
