import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private baseUrl = 'http://localhost:5000/api/student'; // Adjust the base URL as needed

  constructor(private http: HttpClient) {}

  // Create a new Student
  createStudent(studentData: FormData): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`,
    }); // Add token handling as needed
    return this.http.post(`${this.baseUrl}/create`, studentData, { headers });
  }

  // Get all Student
  getAllStudent(): Observable<any[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`,
    }); // Add token handling as needed
    return this.http.get<any[]>(this.baseUrl, { headers });
  }

  // Get a single Student by ID
  getStudentById(id: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`,
    }); // Add token handling as needed
    return this.http.get<any>(`${this.baseUrl}/${id}`, { headers });
  }

  // Update a teacher
  updateStudent(id: string, studentData: FormData): Observable<any> {
    console.log("my studentData",studentData)
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`,
    }); // Add token handling as needed
    return this.http.put(`${this.baseUrl}/${id}`, studentData, { headers });
  }

  // Delete a teacher
  deleteStudent(id: string): Observable<any> {
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
