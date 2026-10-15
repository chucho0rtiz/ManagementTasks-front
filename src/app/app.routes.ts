import { Routes } from "@angular/router";
import { RequestsPageComponent } from "./features/requests/requests-page/requests-page.component";

export const routes: Routes = [
  { path: "requests", component: RequestsPageComponent },
  { path: "", redirectTo: "/requests", pathMatch: "full" },
  { path: "**", redirectTo: "/requests" }
];