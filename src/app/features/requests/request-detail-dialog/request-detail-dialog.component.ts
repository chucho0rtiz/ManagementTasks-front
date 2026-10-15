import { Component, ChangeDetectionStrategy, computed, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MAT_DIALOG_DATA, MatDialogModule } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { Request, Status, Priority } from "../../../core/models/models";

@Component({
  selector: "app-request-detail-dialog",
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: "./request-detail-dialog.component.html",
  styleUrl: "./request-detail-dialog.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestDetailDialogComponent {
  readonly request: Request = inject(MAT_DIALOG_DATA);

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

  readonly estaCerrada = computed(
    () => this.request.status === "COMPLETED" || this.request.status === "CANCELLED"
  );

  readonly diasAbierto = computed(() => {
    const inicio = new Date(this.request.createdAt).getTime();
    const fin = this.estaCerrada()
      ? new Date(this.request.updatedAt).getTime()
      : Date.now();
    const diff = Math.max(0, fin - inicio);
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  });

  readonly diasTexto = computed(() => {
    const d = this.diasAbierto();
    if (d === 0) return this.estaCerrada() ? "cerrada el mismo día" : "abierta hoy";
    if (d === 1) return this.estaCerrada() ? "1 día abierta" : "1 día abierta";
    return this.estaCerrada() ? `${d} días abierta` : `${d} días abierta`;
  });

  statusClass(status: Status): string {
    return `chip-status chip-${status.toLowerCase()}`;
  }

  priorityClass(priority: Priority): string {
    return `chip-priority chip-${priority.toLowerCase()}`;
  }
}
