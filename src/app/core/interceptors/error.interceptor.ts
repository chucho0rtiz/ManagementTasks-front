import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { catchError, throwError } from "rxjs";

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((err: unknown) => {
      let apiError: { status: number; error: unknown };

      if (err instanceof HttpErrorResponse) {
        const body = err.error;
        if (body && typeof body === "object" && "error" in (body as object)) {
          apiError = { status: err.status, error: body };
        } else {
          apiError = {
            status: err.status,
            error: {
              error: {
                code: err.status === 0 ? "NETWORK_ERROR" : "HTTP_ERROR",
                message:
                  err.status === 0
                    ? "No se pudo conectar con el servidor"
                    : err.message,
              },
            },
          };
        }
      } else {
        apiError = {
          status: 0,
          error: { error: { code: "UNKNOWN_ERROR", message: "Ocurrió un error inesperado" } },
        };
      }

      return throwError(() => apiError);
    })
  );
};
