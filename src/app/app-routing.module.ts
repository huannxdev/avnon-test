import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AnswerGuard} from "./guards/answer.guard";

const routes: Routes = [
  {
    path: 'form',
    children: [
      {
        path: 'builder',
        loadComponent: () => import('./modules/builder/form/form.component').then(mol => mol.FormComponent)
      },
      {
        path: 'answer',
        canActivate: [AnswerGuard],
        loadComponent: () => import('./modules/answer-preview/answer-preview.component').then(mol => mol.AnswerPreviewComponent)
      },
      {
        path: '',
        redirectTo: 'builder',
        pathMatch: "full"
      }
    ],
  },
  {
    path: '',
    redirectTo: 'form',
    pathMatch: "full"
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
