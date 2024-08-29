import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SubjectService {
  private apiUrl = 'http://localhost:5000/api/subject/subjects'; // Adjust the URL based on your backend

  constructor(private http: HttpClient) {}

  getSubjects(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
  getSubjectById(id: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createSubject(subject: any): Observable<any> {
    return this.http.post(this.apiUrl, subject);
  }

  updateSubject(id: string, subject: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, subject);
  }

  deleteSubject(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getSubjectsByClass(classId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/classSubject/${classId}`);
  }
}
