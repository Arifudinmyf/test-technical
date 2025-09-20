import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EmployeeService } from '../../service/employee.service';
import { Employee } from '../../model/employee';
import { MatSelect } from '@angular/material/select';
import { map, Observable, startWith } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-employee-add',
  templateUrl: './employee-add.component.html',
  styleUrls: ['./employee-add.component.scss']
})
export class EmployeeAddComponent implements OnInit {
  employeeForm!: FormGroup;
  groups: string[] = [
    'Engineering', 'HR', 'Finance', 'Marketing',
    'Operations', 'Sales', 'Support', 'Legal',
    'R&D', 'Management'
  ];
  filteredGroups!: Observable<string[]>;
  maxDate = new Date();
  isSubmitting = false;

  @ViewChild('groupSelect') groupSelect!: MatSelect;

  get f() {
    return this.employeeForm.controls;
  }

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private readonly snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.buildForm();
    this.setupGroupFilter();
  }

  buildForm(): void {
    this.employeeForm = this.fb.group({
      username: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      birthDate: [null, [Validators.required, this.maxDateValidator()]],
      basicSalary: [null, [Validators.required, Validators.pattern('^[0-9]*$')]],
      status: ['', Validators.required],
      group: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  setupGroupFilter(): void {
    this.filteredGroups = this.employeeForm.get('group')!.valueChanges.pipe(
      startWith(''),
      map(value => this.filterGroups(value || ''))
    );
  }

  filterGroups(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.groups.filter(group => group.toLowerCase().includes(filterValue));
  }

  maxDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      return value && value > this.maxDate ? { maxDate: true } : null;
    };
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const employee: Employee = this.mapFormToEmployee();

    this.employeeService.addEmployee(employee).subscribe({
      next: () => {
        this.router.navigate(['/employee-list'])

        this.snackBar.open(`Data saved`, 'X', {
          duration: 3000,
          panelClass: ['save-snackbar'],
          verticalPosition: 'top',
        });
      },
      error: (err) => {
        this.isSubmitting = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/employee-list']);
  }

  mapFormToEmployee(): Employee {
    const formValue = this.employeeForm.value;
    return {
      username: formValue.username,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      birthDate: formValue.birthDate,
      basicSalary: Number(formValue.basicSalary),
      status: formValue.status,
      group: formValue.group,
      description: formValue.description
    };
  }
}
