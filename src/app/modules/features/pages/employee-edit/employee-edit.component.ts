import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Observable, startWith } from 'rxjs';
import { EmployeeService } from '../../service/employee.service';
import { Employee } from '../../model/employee';

@Component({
  selector: 'app-employee-edit',
  templateUrl: './employee-edit.component.html',
  styleUrls: ['./employee-edit.component.scss']
})
export class EmployeeEditComponent implements OnInit {
  employeeForm!: FormGroup;
  groups: string[] = [
    'Engineering', 'HR', 'Finance', 'Marketing',
    'Operations', 'Sales', 'Support', 'Legal',
    'R&D', 'Management'
  ];
  filteredGroups$!: Observable<string[]>;
  maxDate = new Date();
  isUppdateting = false;
  employeeId = '';

  @ViewChild('groupSelect') groupSelect!: MatSelect;

  get f() {
    return this.employeeForm.controls;
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private employeeService: EmployeeService
  ) { }

  ngOnInit(): void {
    this.buildForm();
    this.setupGroupFilter();

    this.employeeId = this.route.snapshot.paramMap.get('id') || '';
    if (this.employeeId) {
      this.loadEmployee(this.employeeId);
    }
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
    this.filteredGroups$ = this.employeeForm.get('group')!.valueChanges.pipe(
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

  loadEmployee(id: string): void {
    this.employeeService.getEmployeeById(id).subscribe({
      next: (emp) => {
        this.employeeId = emp.id ?? '';
        this.employeeForm.patchValue({
          ...emp,
          birthDate: emp.birthDate ? new Date(emp.birthDate) : null,
          status: emp.status?.trim().toUpperCase()
        });
      }
    });
  }

  onUpdate(): void {
    if (this.employeeForm.valid) {
      const employee: Employee = {
        ...this.employeeForm.getRawValue(),
        id: this.employeeId
      };

      this.employeeService.updateEmployee(this.employeeId, employee).subscribe({
        next: () => this.router.navigate(['/employee-list'])
      });
    }
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
