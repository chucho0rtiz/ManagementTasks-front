import { Component, ChangeDetectionStrategy, input, output, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatTableModule } from "@angular/material/table";
import { MatPaginatorModule, PageEvent } from "@angular/material/paginator";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { Request, Status, Priority } from "../../../core/models/models";

@Component({
  selector: "app-request-list",
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
  ],
  templateUrl: "./request-list.component.html",
  styleUrl: "./request-list.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestListComponent {
  readonly requests = input<Request[]>([]);
  readonly total = input(0);
  readonly pageIndex = input(0);
  readonly pageSize = input(10);

  readonly edit = output<Request>();
  readonly remove = output<Request>();
  readonly statusChange = output<{ request: Request; status: Status }>();
  readonly pageChange = output<PageEvent>();
  readonly view = output<Request>();

  readonly selected = signal<Request | null>(null);

  readonly displayedColumns = [
    "title",
    "requester",
    "technician",
    "serviceType",
    "priority",
    "status",
    "createdAt",
    "changeStatus",
    "actions",
  ];

  readonly statusLabels: Record<Status, string> = {
    PENDING: "Pendiente",
    IN_PROGRESS: "En progreso",
    COMPLETED: "Completada",
    CANCELLED: "Cancelada",
  };

  readonly priorityLabels: Record<Priority, string> = {
    LOW: "Baja",
    MEDIUM: "Media",
    HIGH: "Alta",
  };

  private readonly transitions: Record<Status, Status[]> = {
    PENDING: ["IN_PROGRESS", "COMPLETED", "CANCELLED"],
    IN_PROGRESS: ["COMPLETED", "CANCELLED"],
    COMPLETED: ["IN_PROGRESS"],
    CANCELLED: ["IN_PROGRESS"],
  };

  statusClass(status: Status): string {
    return `chip-status chip-${status.toLowerCase()}`;
  }

  priorityClass(priority: Priority): string {
    return `chip-priority chip-${priority.toLowerCase()}`;
  }

  statusLabel(status: Status): string {
    return this.statusLabels[status];
  }

  priorityLabel(priority: Priority): string {
    return this.priorityLabels[priority];
  }

  allowedFor(request: Request | null): Status[] {
    return request ? this.transitions[request.status] : [];
  }

  changeStatus(status: Status): void {
    const request = this.selected();
    if (request) this.statusChange.emit({ request, status });
    this.selected.set(null);
  }
}
