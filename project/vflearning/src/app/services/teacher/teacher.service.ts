import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TeacherService {
  private baseUrl = 'http://localhost:5000/api/teachers'; // Adjust the base URL as needed

  constructor(private http: HttpClient) {}

  // Create a new teacher
  createTeacher(teacherData: FormData): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`,
    }); // Add token handling as needed
    return this.http.post(`${this.baseUrl}/create`, teacherData, { headers });
  }

  // Get all teachers
  getAllTeachers(): Observable<any[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`,
    }); // Add token handling as needed
    return this.http.get<any[]>(this.baseUrl, { headers });
  }

  // Get a single teacher by ID
  getTeacherById(id: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`,
    }); // Add token handling as needed
    return this.http.get<any>(`${this.baseUrl}/${id}`, { headers });
  }

  // Update a teacher
  updateTeacher(id: string, teacherData: FormData): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`,
    }); // Add token handling as needed
    return this.http.put(`${this.baseUrl}/${id}`, teacherData, { headers });
  }

  // Delete a teacher
  deleteTeacher(id: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`,
    }); // Add token handling as needed
    return this.http.delete(`${this.baseUrl}/${id}`, { headers });
  }

  // Utility method to get the auth token (implement as needed)
  private getToken(): string | null {
    return localStorage.getItem('token'); // Adjust as per your authentication flow
  }
}
