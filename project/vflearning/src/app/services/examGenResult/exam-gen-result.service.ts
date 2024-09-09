import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExamGenResultService {

  private baseUrl = 'http://localhost:5000/api/examResult';


  constructor(private http: HttpClient) {}

  studnetOfResult(id: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`,
    });
    return this.http.get(`${this.baseUrl}/studentResponse/${id}`, { headers });
  }



  private getToken(): string | null {
    return localStorage.getItem('token'); // Adjust as per your authentication flow
  }

}