import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class QuestionsService {
  private baseUrl = 'http://localhost:5000/api/exam-questions';

  constructor(private http: HttpClient) {}

  // Create a new exam question
  createExamQuestion(data: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`,
    });
    return this.http
      .post(`${this.baseUrl}/exam-questions`, data, { headers })
      .pipe(catchError(this.handleError));
  }

  // Get all exam questions with optional filtering, pagination, and sorting
  getExamQuestions(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`,
    });

    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }

    return this.http
      .get(`${this.baseUrl}/exam-questions`, { params: httpParams, headers })
      .pipe(catchError(this.handleError));
  }

  getExamPortalQuestions(examId:any):Observable<any>{
    
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`,
    });
    return this.http.get(`${this.baseUrl}/examportalQues/${examId}`, { headers })
 

  }

  // Get a single exam question by ID
  getExamQuestionById(id: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`,
    });
    return this.http
      .get(`${this.baseUrl}/exam-questions/${id}`, { headers })
      .pipe(catchError(this.handleError));
  }

  // Update an existing exam question by ID
  updateExamQuestion(id: string, data: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`,
    });
    return this.http
      .put(`${this.baseUrl}/exam-questions/${id}`, data, { headers })
      .pipe(catchError(this.handleError));
  }

  // Delete an exam question by ID
  deleteExamQuestion(id: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`,
    });
    return this.http
      .delete(`${this.baseUrl}/exam-questions/${id}`, { headers })
      .pipe(catchError(this.handleError));
  }

  private getToken(): string | null {
    return localStorage.getItem('token'); // Adjust as per your authentication flow
  }

  // Handle errors from HTTP requests
  private handleError(error: any): Observable<never> {
    console.error('An error occurred', error);
    throw error;
  }
}
