import { Component, DestroyRef, inject, signal } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
  Request,
  RequestForm,
  Priority,
  Technician,
  ServiceType,
} from "../../../core/models/models";
import { RequestsApiService } from "../../../core/api/requests-api.service";
import { NotificationService } from "../../../core/services/notification.service";

export interface RequestFormDialogData {
  mode: "create" | "edit";
  request?: Request;
  technicians: Technician[];
  serviceTypes: ServiceType[];
}

interface FormValue {
  title: string;
  description: string;
  requesterName: string;
  technicianId: string | number;
  serviceTypeId: string | number;
  priority: Priority;
}

@Component({
  selector: "app-request-form-dialog",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: "./request-form-dialog.component.html",
  styleUrl: "./request-form-dialog.component.scss",
})
export class RequestFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly requestsApi = inject(RequestsApiService);
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogRef = inject(MatDialogRef<RequestFormDialogComponent>);
  private readonly data: RequestFormDialogData = inject(MAT_DIALOG_DATA);

  readonly saving = signal(false);
  readonly isEdit = this.data.mode === "edit";
  readonly title = this.isEdit ? "Editar solicitud" : "Nueva solicitud";

  readonly priorities: { value: Priority; label: string }[] = [
    { value: "LOW", label: "Baja" },
    { value: "MEDIUM", label: "Media" },
    { value: "HIGH", label: "Alta" },
  ];

  get technicians(): Technician[] {
    return this.data.technicians;
  }
  get serviceTypes(): ServiceType[] {
    return this.data.serviceTypes;
  }

  readonly form = this.fb.group({
    title: ["", [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    description: ["", [Validators.maxLength(1000)]],
    requesterName: ["", [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],

    technicianId: [null as number | null, [Validators.required]],
    serviceTypeId: [null as number | null, [Validators.required]],
    priority: ["MEDIUM" as Priority, [Validators.required]],
  });

  constructor() {
    if (this.data.request) {
      const r = this.data.request;
      this.form.patchValue({
        title: r.title,
        description: r.description ?? "",
        requesterName: r.requesterName,
        technicianId: r.technician.id,
        serviceTypeId: r.serviceType.id,
        priority: r.priority,
      });
    }
  }

  fieldError(name: keyof FormValue): string | null {
    const control = this.form.get(name);
    if (!control || !control.errors) return null;
    if (control.hasError("server")) return control.getError("server") as string;
    if (control.hasError("required")) return "Este campo es obligatorio";
    if (control.hasError("minlength"))
      return `Mínimo ${control.getError("minlength").requiredLength} caracteres`;
    if (control.hasError("maxlength"))
      return `Máximo ${control.getError("maxlength").requiredLength} caracteres`;
    return null;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const payload: RequestForm = {
      title: v.title ?? "",
      description: v.description ? v.description : undefined,
      requesterName: v.requesterName ?? "",
      technicianId: Number(v.technicianId),
      serviceTypeId: Number(v.serviceTypeId),
      priority: (v.priority ?? "MEDIUM") as Priority,
    };

    this.saving.set(true);
    const request$ = this.isEdit
      ? this.requestsApi.update(this.data.request!.id, payload)
      : this.requestsApi.create(payload);

    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (result) => {
        this.saving.set(false);
        this.dialogRef.close(result);
      },
      error: (err) => {
        this.saving.set(false);
        this.notifications.error(err?.error?.message ?? "No se pudo guardar la solicitud");
        const details = err?.error?.details;
        if (Array.isArray(details)) {
          details.forEach((d: { field: string; message: string }) => {
            const control = this.form.get(d.field);
            if (control) {
              control.setErrors({ server: d.message });
              control.markAsTouched();
            }
          });
        }
      },
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
