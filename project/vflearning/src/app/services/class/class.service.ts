import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ClassService {

  private baseUrl = 'http://localhost:5000/api/class/classes'; // Replace with your backend URL
  
  constructor(private http: HttpClient, private router: Router,private authService:AuthService) {}




  // Utility method to get the auth token (implement as needed)
  private getToken(): string | null {
    return localStorage.getItem('token'); // Adjust as per your authentication flow
  }

  // Get all classes
  getClasses(): Observable<any[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`,
    }); // Add token handling as needed
    return this.http.get<any[]>(this.baseUrl,{headers});
  }

  // Get a single class by ID
  getClass(id: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`,
    }); // Add token handling as needed
    return this.http.get<any>(`${this.baseUrl}/${id}`,{headers});
  }

  // Create a new class
  createClass(userData: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`,
    }); // Add token handling as needed
    return this.http.post<any>(this.baseUrl, userData,{headers});
  }

  // Update an existing class
  updateClass(id: string, data: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`,
    }); // Add token handling as needed
    return this.http.put<any>(`${this.baseUrl}/${id}`, data,{headers});
  }

  // Delete a class
  deleteClass(id: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`,
    }); // Add token handling as needed
    return this.http.delete<any>(`${this.baseUrl}/${id}`,{headers});
  }
}
