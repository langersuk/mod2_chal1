import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { HomePage } from "./home.page";

const routes: Routes = [
  {
    path: "",
    component: HomePage,
  },
  {
    path: "edit",
    loadChildren: () =>
      import("./edit/edit.module").then((m) => m.EditPageModule),
  },
  {
    path: "edit/:receiptId",
    loadChildren: () =>
      import("./edit/edit.module").then((m) => m.EditPageModule),
  },
  {
    path: ":receiptId",
    loadChildren: () =>
      import("./detail/detail.module").then((m) => m.DetailPageModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomePageRoutingModule {}
