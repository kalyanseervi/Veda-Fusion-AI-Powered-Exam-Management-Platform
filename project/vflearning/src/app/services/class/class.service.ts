import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClassService {

  private apiUrl = 'http://localhost:5000/api/class/classes'; // Replace with your backend URL
  
  constructor(private http: HttpClient, private router: Router) {}

  // Get all classes
  getClasses(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Get a single class by ID
  getClass(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Create a new class
  createClass(userData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, userData);
  }

  // Update an existing class
  updateClass(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  // Delete a class
  deleteClass(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
