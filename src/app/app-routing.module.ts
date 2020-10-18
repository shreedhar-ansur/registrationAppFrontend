import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SuccessComponent} from './success/success.component';
import {RegisterComponent} from './register/register.component';

const appRoutes: Routes = [
  {
    path: 'success',
    component: SuccessComponent
  },
  {
    path: '',
    component: RegisterComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      appRoutes
    )
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
