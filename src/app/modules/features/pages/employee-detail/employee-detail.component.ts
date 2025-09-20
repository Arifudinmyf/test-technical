import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Employee, EmployeeParams } from '../../model/employee';
import { EmployeeService } from '../../service/employee.service';

@Component({
  selector: 'app-employee-detail',
  templateUrl: './employee-detail.component.html',
  styleUrls: ['./employee-detail.component.scss']
})
export class EmployeeDetailComponent implements OnInit {
  employee?: Employee;
  returnParams: EmployeeParams = {};
  EmployeeId: string = '';

  constructor(
    private employeeService: EmployeeService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.EmployeeId = this.route.snapshot.paramMap.get('id') || '';
    this.returnParams = history.state['returnParams'] ?? {};
    this.getDetail();
  }

  getDetail() {
    this.employeeService.getEmployeeByUsername(this.EmployeeId).subscribe({
      next: (res: Employee) => {
        this.employee = res;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/employee-list'], {
      queryParams: this.returnParams,
      replaceUrl: true
    });
  }


}
