import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import jwt_decode from 'jwt-decode';  // Import the JWT decoder

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = 'http://localhost:5000/api/admin/roles';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getRoles(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }



  addRole(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    // Customize the error handling logic as needed
    console.error(`RoleService error: ${error.message}`);
    return throwError(() => new Error('Something went wrong; please try again later.'));
  }
}
