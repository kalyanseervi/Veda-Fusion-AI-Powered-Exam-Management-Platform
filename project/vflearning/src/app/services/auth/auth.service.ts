import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth'; // Replace with your backend URL

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password });
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData);
  }
  verifyEmail(token: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/verify/${token}`);
  }
  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('token');
    } else {
      return null;
    }
  }
  decodeToken(): Observable<any> {
    const token = this.getToken();
    return this.http.get<any>(`${this.apiUrl}/userDecodeDetail/${token}`);
  }
  getRole(): Observable<string | null> {
    return this.decodeToken().pipe(map((data) => data?.user?.userRole || null));
  }
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']); // Redirect to login page
  }
}
