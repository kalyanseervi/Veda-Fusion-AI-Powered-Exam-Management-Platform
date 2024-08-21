import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class SchoolService {
  private apiUrl = `http://localhost:5000/api/schools/schools`;

  constructor(private http: HttpClient) {}

  // Create a new school
  createSchool(school: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/create`, school, this.getHeaders());
  }

  // Get all schools
  getAllSchools(): Observable<any[]> {
    console.log('i am here')
    return this.http.get<any[]>(`${this.apiUrl}`);
  }

  // Get a school by ID
  getSchoolById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Update a school
  updateSchool(id: string, school: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, school, this.getHeaders());
  }

  // Delete a school
  deleteSchool(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Optional: Get headers with authorization token
  private getHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('token'); // Assuming you store your JWT token in local storage
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }),
    };
  }
}
