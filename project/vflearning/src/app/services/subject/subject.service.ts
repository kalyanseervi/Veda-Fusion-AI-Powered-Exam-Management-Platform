import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SubjectService {
  private apiUrl = 'http://localhost:5000/api/subject/subjects'; // Adjust the URL based on your backend

  constructor(private http: HttpClient) {}

   // Utility method to get the auth token (implement as needed)
   private getToken(): string | null {
    return localStorage.getItem('token'); // Adjust as per your authentication flow
  }

  getSubjects(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`,
    }); // Add token handling as needed
    return this.http.get(this.apiUrl,{headers});
  }
  getSubjectById(id: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`,
    }); // Add token handling as needed
    return this.http.get<any>(`${this.apiUrl}/${id}`,{headers});
  }

  createSubject(subject: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`,
    }); // Add token handling as needed
    return this.http.post(this.apiUrl, subject,{headers});
  }

  updateSubject(id: string, subject: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`,
    }); // Add token handling as needed
    return this.http.put(`${this.apiUrl}/${id}`, subject,{headers});
  }

  deleteSubject(id: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`,
    }); // Add token handling as needed
    return this.http.delete(`${this.apiUrl}/${id}`,{headers});
  }

  getSubjectsByClass(classId: string): Observable<any[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`,
    }); // Add token handling as needed
    return this.http.get<any[]>(`${this.apiUrl}/classSubject/${classId}`,{headers});
  }
}
