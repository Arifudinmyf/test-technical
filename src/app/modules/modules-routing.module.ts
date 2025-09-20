import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './features/pages/login/login.component';
import { EmployeeListComponent } from './features/pages/employee-list/employee-list.component';
import { AuthGuard } from './core/guards/auth.guard';
import { EmployeeAddComponent } from './features/pages/employee-add/employee-add.component';
import { EmployeeEditComponent } from './features/pages/employee-edit/employee-edit.component';
import { EmployeeDetailComponent } from './features/pages/employee-detail/employee-detail.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'employee-list',
    component: EmployeeListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'add-employee',
    component: EmployeeAddComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'edit-employee/:id',
    component: EmployeeEditComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'employee-detail/:id',
    component: EmployeeDetailComponent,
    canActivate: [AuthGuard]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ModulesRoutingModule { }
