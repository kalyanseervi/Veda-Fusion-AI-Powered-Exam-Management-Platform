import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ExamPortalService {
  private baseUrl = 'http://localhost:5000/api/assignExam';

  constructor(private http: HttpClient) {}

  startExam(examData: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`,
    });
    return this.http.post(`${this.baseUrl}/startExam`, examData, { headers });
  }

  private getToken(): string | null {
    return localStorage.getItem('token'); // Adjust as per your authentication flow
  }

  submitResponses(
    examId: string,
    responses: any[]
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`,
    });
    const body = {examId:examId,responses:responses}
    return this.http.post<any>(`${this.baseUrl}/quesresponseAll`,body, {headers});
  }

  submitResponseSingleId(
    examId: string,
    questionId: string,
    selectedOption: string
  ): Observable<any> {
    const body = {
      examId: examId,
      responses: [
        {
          questionId: questionId,
          selectedOption: selectedOption,
        },
      ],
    };
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`,
    });
    const url = `${this.baseUrl}/quesresponse/${questionId}`;
    // console.log("my body part is here",body);
    return this.http.post(url, body, { headers });
  }
}
