import { Component, DestroyRef, OnInit, input, output, inject } from "@angular/core";
import { ChangeDetectionStrategy } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormControl, FormGroup } from "@angular/forms";
import { debounceTime } from "rxjs";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { RequestFilters, Status, Technician, ServiceType } from "../../../core/models/models";

@Component({
  selector: "app-request-filters",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: "./request-filters.component.html",
  styleUrl: "./request-filters.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestFiltersComponent implements OnInit {
  readonly filters = input<RequestFilters>({ page: 1, pageSize: 10 });
  readonly technicians = input<Technician[]>([]);
  readonly serviceTypes = input<ServiceType[]>([]);
  readonly filtersChange = output<RequestFilters>();

  private readonly destroyRef = inject(DestroyRef);

  readonly form = new FormGroup({
    q: new FormControl<string>(""),
    status: new FormControl<string>(""),
    technicianId: new FormControl<string>(""),
    serviceTypeId: new FormControl<string>(""),
  });

  readonly statusOptions: { value: Status; label: string }[] = [
    { value: "PENDING", label: "Pendiente" },
    { value: "IN_PROGRESS", label: "En progreso" },
    { value: "COMPLETED", label: "Completada" },
    { value: "CANCELLED", label: "Cancelada" },
  ];

  ngOnInit(): void {
    const current = this.filters();
    this.form.patchValue(
      {
        q: current.q ?? "",
        status: current.status ?? "",
        technicianId: current.technicianId ? String(current.technicianId) : "",
        serviceTypeId: current.serviceTypeId ? String(current.serviceTypeId) : "",
      },
      { emitEvent: false }
    );

    this.form
      .get("q")!
      .valueChanges.pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.emit());

    (["status", "technicianId", "serviceTypeId"] as const).forEach((key) =>
      this.form
        .get(key)!
        .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.emit())
    );
  }

  clear(): void {
    this.form.reset(
      { q: "", status: "", technicianId: "", serviceTypeId: "" },
      { emitEvent: false }
    );
    this.emit();
  }

  private emit(): void {
    const v = this.form.getRawValue();
    this.filtersChange.emit({
      page: 1,
      pageSize: this.filters().pageSize,
      sort: this.filters().sort,
      order: this.filters().order,
      status: (v.status || undefined) as Status | undefined,
      technicianId: v.technicianId ? Number(v.technicianId) : undefined,
      serviceTypeId: v.serviceTypeId ? Number(v.serviceTypeId) : undefined,
      q: v.q ? v.q : undefined,
    });
  }
}
