import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { Employee, EmployeeParams, EmployeeResponse } from '../model/employee';
import { ResponseData } from '../model/responseData.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getEmployees(params: EmployeeParams) {
    const httpParams = new HttpParams({ fromObject: { ...params } });
    return this.http.get<ResponseData<EmployeeResponse>>(`${this.apiUrl}/list`, { params: httpParams });
  }

  addEmployee(employee: Employee) {
    return this.http.post<Employee>(`${this.apiUrl}/employees`, employee);
  }

  getEmployeeById(id: string) {
    return this.http.get<Employee>(`${this.apiUrl}/employees/${id}`)
      .pipe(map(emp => ({ ...emp, birthDate: new Date(emp.birthDate) })));
  }

  getEmployeeByUsername(id: string) {
    return this.http.get<Employee>(`${this.apiUrl}/employees/${id}`)
      .pipe(map(emp => ({ ...emp, birthDate: new Date(emp.birthDate) })));
  }

  updateEmployee(id: string, employee: Employee) {
    return this.http.put<{ employees: Employee[] }>(`${this.apiUrl}/employees/${id}`, employee)
  }

  deleteEmployee(id: string) {
    return this.http.delete<{ employees: Employee[] }>(`${this.apiUrl}/employees/${id}`);
  }

}
