import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
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
  viewResultOfStudent(id: string): Observable<any> {
    console.log('my id view', id);
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`,
    });
    return this.http.get(`${this.baseUrl}/viewResultOfStd/${id}`, { headers });
  }
  publishResult(id: string): Observable<any> {
    console.log('my id ', id);
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`,
    });
    return this.http.post(`${this.baseUrl}/publishResult/${id}`, { headers });
  }

  listOfResults(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`,
    });
    return this.http.get(`${this.baseUrl}/listOfResults/`, { headers });
  }

  downloadExcel(examId: string): void {
    const url = `${this.baseUrl}/results/download/${examId}`;

     this.http.get(url, { responseType: 'blob' }).subscribe(
      (response: Blob) => {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'results.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      },
      (error) => {
        console.error('Error downloading file', error);
      }
    );
  }

  examData():Observable<any>{
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`,
    })
    return this.http.get(`${this.baseUrl}/examData/`, {headers});
  }

  private getToken(): string | null {
    return localStorage.getItem('token'); // Adjust as per your authentication flow
  }
}
