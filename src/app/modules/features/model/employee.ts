export interface Employee {
  id?: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  birthDate: Date;
  basicSalary: number;
  status: string;
  group: string;
  description: string;
}

export interface EmployeeParams {
  page?: number;
  pageSize?: number;
  total?: number;
  searchUsername?: string;
  searchStatus?: string;
  sort?: string;
  sortDirection?: string;
}

export interface EmployeeResponse {
  page?: number;
  pageSize?: number;
  total?: number;
  employees: Employee[];
}