import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AssignExamService {

  private baseUrl = 'http://localhost:5000/api/assignExam';


  constructor(private http: HttpClient) {}

 

  assignExamAndNotify(
    examId: string,
    studentIds: string[],
    email: string
  ): Observable<any> {
    const data = {
      examId: examId,
      studentIds: studentIds,
      email: email,
    };

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`,
    });
    // console.log(data)
    return this.http.post<any>(`${this.baseUrl}/assignExamAndNotify`, data, {
      headers,
    });
  }

  stdAssignedExamUser():Observable<any>{
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`,
    });
    return this.http.get(`${this.baseUrl}/assignedExams`,{headers})
  }

  startExam(examId: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`,
    }); 
    return this.http.post(`${this.baseUrl}/startExam`,examId,{headers});
  }


  private getToken(): string | null {
    return localStorage.getItem('token'); // Adjust as per your authentication flow
  }
}
