import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Employee, EmployeeParams } from '../../model/employee';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { EmployeeService } from '../../service/employee.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss'],
})
export class EmployeeListComponent
  implements OnInit, AfterViewInit, OnDestroy {
  displayedColumns: string[] = [
    'no',
    'username',
    'firstName',
    'lastName',
    'email',
    'birthDate',
    'basicSalary',
    'status',
    'group',
    'actions',
  ];

  employees: Employee[] = [];

  dataSource = new MatTableDataSource<Employee>([]);

  searchUsername = new FormControl('');
  searchStatus = new FormControl('');

  pageOptions = [5, 10, 50, 100];
  page: number = 1;
  pageSize: number = 5;
  total: number = 0;

  queryParams: EmployeeParams = {
    page: this.page,
    pageSize: this.pageSize,
    total: this.total,
    searchUsername: '',
    searchStatus: '',
    sort: '',
    sortDirection: '',
  };

  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;

  private subscriptions = new Subscription();

  constructor(
    private readonly employeeService: EmployeeService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.filterEmployee();

    const qpSub = this.route.queryParams.subscribe((params) => {
      this.syncQueryParams(params);
      this.getEmployees();
    });

    this.subscriptions.add(qpSub);
  }

  ngAfterViewInit() {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }

    if (this.sort) {
      this.dataSource.sort = this.sort;

      const sortSub = this.sort.sortChange.subscribe((sort: Sort) => {
        this.applySort(sort);
      });
      this.subscriptions.add(sortSub);
    }

    const { sort, sortDirection } = this.queryParams;
    if (this.sort && sort && sortDirection) {
      setTimeout(() => {
        this.sort!.active = sort;
        this.sort!.direction = sortDirection as 'asc' | 'desc';
        this.sort!.sortChange.emit({
          active: sort,
          direction: this.sort!.direction
        });
      });
    }

  }

  filterEmployee() {
    const storedUsername = localStorage.getItem('searchUsername');
    const storedStatus = localStorage.getItem('searchStatus');

    this.searchUsername = new FormControl(storedUsername || '');
    this.searchStatus = new FormControl(storedStatus || '');

    if (storedUsername) {
      this.searchUsername.setValue(storedUsername, { emitEvent: false });
      this.queryParams.searchUsername = storedUsername;
    }
    if (storedStatus) {
      this.searchStatus.setValue(storedStatus, { emitEvent: false });
      this.queryParams.searchStatus = storedStatus;
    }

    const searchSub = this.searchUsername.valueChanges.subscribe(value => {
      this.queryParams.searchUsername = value?.trim().toLowerCase() || '';
    });
    this.subscriptions.add(searchSub);

    const statusSub = this.searchStatus.valueChanges.subscribe(value => {
      this.queryParams.searchStatus = value?.trim().toLowerCase() || '';
    });
    this.subscriptions.add(statusSub);
  }

  private syncQueryParams(params: Record<string, string>) {
    this.queryParams.page = params['page']
      ? Number(params['page'])
      : this.queryParams.page;
    this.queryParams.pageSize = params['pageSize']
      ? Number(params['pageSize'])
      : this.queryParams.pageSize;

    if (params['searchUsername'] !== undefined) {
      this.queryParams.searchUsername = params['searchUsername'];
      this.searchUsername.setValue(params['searchUsername'], { emitEvent: false });
    }
    if (params['searchStatus'] !== undefined) {
      this.queryParams.searchStatus = params['searchStatus'];
      this.searchStatus.setValue(params['searchStatus'], { emitEvent: false });
    }

    this.queryParams.sort = params['sort'] ?? '';
    this.queryParams.sortDirection = params['direction'] ?? '';

    this.page = Math.max(0, (this.queryParams.page ?? 1) - 1);
    this.pageSize = this.queryParams.pageSize ?? this.pageSize;
  }

  getEmployees() {
    const req: EmployeeParams = {
      ...this.queryParams,
      searchUsername: this.searchUsername.value?.trim().toLowerCase() || '',
      searchStatus: this.searchStatus.value?.trim().toLowerCase() || ''
    };

    const sub = this.employeeService.getEmployees(req).subscribe({
      next: (res) => {
        const response = res.data;
        this.employees = response.employees ?? [];
        if (this.queryParams && this.queryParams.searchUsername) {
          this.dataSource.data = this.employees.filter(e =>
            e.username.toLowerCase().includes(this.queryParams?.searchUsername?.toLowerCase() ?? '')
          );
        } else if (this.queryParams && this.queryParams.searchStatus) {
          this.dataSource.data = this.employees.filter(e =>
            e.status.toLowerCase().includes(this.queryParams?.searchStatus?.toLowerCase() ?? '')
          );
        } else {
          this.dataSource.data = this.employees;
        }
        this.queryParams.page = response.page ?? req.page;
        this.queryParams.pageSize = this.pageSize;
        this.total = response.total ?? 0;

        if (this.paginator) {
          this.paginator.pageIndex = this.page;
          this.paginator.pageSize = this.pageSize;
          this.paginator.length = this.total;
        }
      },
      error: () => {
        this.snackBar.open('Server error, try again', 'Close', {
          verticalPosition: 'top',
          duration: 3000,
          panelClass: ['snackbar-error'],
        });
      },
    });

    this.subscriptions.add(sub);
  }

  applySearch() {
    const searchValue = this.searchUsername.value?.trim().toLowerCase() || '';
    const statusValue = this.searchStatus.value?.trim().toLowerCase() || '';

    localStorage.setItem('searchUsername', searchValue);
    localStorage.setItem('searchStatus', statusValue);

    this.queryParams.searchUsername = this.searchUsername.value?.trim().toLowerCase() || '';
    this.queryParams.searchStatus = this.searchStatus.value?.trim().toLowerCase() || '';

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        searchUsername: this.queryParams.searchUsername || null,
        searchStatus: this.queryParams.searchStatus || null,
      },
      queryParamsHandling: 'merge'
    }).then(() => {
      this.getEmployees();
    });
  }

  applySort(sort: Sort) {
    const currentPage = this.route.snapshot.queryParams['page'] || 1;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        ...this.route.snapshot.queryParams,
        sort: sort.active || null,
        direction: sort.direction || null,
        page: currentPage
      },
      queryParamsHandling: 'merge',
    });
  }

  onPageChange(event: PageEvent) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: event.pageIndex + 1,
        pageSize: event.pageSize,
      },
      queryParamsHandling: 'merge',
    });
  }

  onEdit(employee: Employee) {
    this.router.navigate([`/edit-employee/${employee.id}`]);
  }

  onDelete(emp: Employee) {
    if (!emp?.id) {
      this.snackBar.open(`Employee ID is missing`, 'X', {
        duration: 3000,
        panelClass: ['error-snackbar'],
        verticalPosition: 'top',
      });
      return;
    }

    this.employeeService.deleteEmployee(emp?.id).subscribe({
      next: () => {
        this.employees = this.employees.filter(e => e.id !== emp.id);

        this.snackBar.open(`Employee ${emp.username} deleted successfully`, 'X', {
          duration: 3000,
          panelClass: ['delete-snackbar'],
          verticalPosition: 'top',
        });
      },
      error: (err) => {
        this.snackBar.open(`Detail Employee ${emp.username} is deleted`, 'X', {
          duration: 3000,
          panelClass: ['error-snackbar'],
          verticalPosition: 'top',
        });
      }
    });
  }

  navigateToAdd() {
    this.router.navigate(['/add-employee']);
  }

  onDetail(emp: Employee) {
    const currentParams = this.route.snapshot.queryParams;

    this.router.navigate(['/employee-detail', emp.id], {
      state: {
        returnParams: currentParams,
        queryParamsHandling: 'merge'
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
