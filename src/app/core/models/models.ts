export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type Status = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface TechnicianRef {
  id: number;
  fullName: string | null;
}

export interface ServiceTypeRef {
  id: number;
  name: string | null;
}

export interface Request {
  id: number;
  title: string;
  description: string | null;
  requesterName: string;
  technician: TechnicianRef;
  serviceType: ServiceTypeRef;
  priority: Priority;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

// Cuerpo de crear/editar (POST/PUT).
export interface RequestForm {
  title: string;
  description?: string;
  requesterName: string;
  technicianId: number;
  serviceTypeId: number;
  priority: Priority;
}

export interface Page<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// Catálogos (arrays directos en camelCase).
export interface Technician {
  id: number;
  fullName: string;
  email: string;
  isActive: boolean;
}

export interface ServiceType {
  id: number;
  name: string;
  description: string | null;
}

// Filtros del listado.
export interface RequestFilters {
  page: number;
  pageSize: number;
  status?: Status;
  technicianId?: number;
  serviceTypeId?: number;
  q?: string;
  sort?: string;
  order?: "asc" | "desc";
}

// Formato único de error
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: { field: string; message: string }[];
  };
}
