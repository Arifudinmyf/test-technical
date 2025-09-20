import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ModulesRoutingModule } from './modules-routing.module';
import { LoginComponent } from './features/pages/login/login.component';
import { EmployeeListComponent } from './features/pages/employee-list/employee-list.component';
import { MaterialModule } from './shared/material/material.module';
import { FormsModule } from '@angular/forms';
import { EmployeeAddComponent } from './features/pages/employee-add/employee-add.component';
import { EmployeeEditComponent } from './features/pages/employee-edit/employee-edit.component';
import { EmployeeDetailComponent } from './features/pages/employee-detail/employee-detail.component';


@NgModule({
  declarations: [
    LoginComponent,
    EmployeeListComponent,
    EmployeeAddComponent,
    EmployeeEditComponent,
    EmployeeDetailComponent
  ],
  imports: [
    CommonModule,
    ModulesRoutingModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule
]
})
export class ModulesModule { }
