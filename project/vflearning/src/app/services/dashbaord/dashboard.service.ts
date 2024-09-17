import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private baseUrl = 'http://localhost:5000/api/dashbaord';

  constructor(private http: HttpClient) {}

  getDashboardData():Observable<any>{
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`,
    })
    return this.http.get(`${this.baseUrl}/student`, {headers});
  }

  private getToken(): string | null {
    return localStorage.getItem('token'); // Adjust as per your authentication flow
  }
}
