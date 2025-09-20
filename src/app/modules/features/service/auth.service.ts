import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, User } from '../model/user.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'https://dummyjson.com/auth/login';
  private readonly STORAGE_TOKEN = 'accessToken';
  private readonly STORAGE_REFRESH = 'refreshToken';
  private readonly STORAGE_USER = 'user';

  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.apiUrl, request).pipe(
      tap(res => {
        if (res.accessToken) {
          localStorage.setItem(this.STORAGE_TOKEN, res.accessToken);
          localStorage.setItem(this.STORAGE_REFRESH, res.refreshToken);
          localStorage.setItem(this.STORAGE_USER, JSON.stringify(res));
          this.isLoggedInSubject.next(true);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_TOKEN);
    localStorage.removeItem(this.STORAGE_REFRESH);
    localStorage.removeItem(this.STORAGE_USER);
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/login']);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.STORAGE_TOKEN);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.STORAGE_REFRESH);
  }

  getCurrentUser(): LoginResponse | null {
    const userData = localStorage.getItem(this.STORAGE_USER);
    return userData ? JSON.parse(userData) as LoginResponse : null;
  }

  isAuthenticated(): boolean {
    return this.isLoggedInSubject.value;
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.STORAGE_TOKEN);
  }
}
