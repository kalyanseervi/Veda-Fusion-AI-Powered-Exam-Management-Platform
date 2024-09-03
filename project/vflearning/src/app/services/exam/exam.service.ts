import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Exam {
  _id?: string;
  examName: string;
  examDate: Date;
  examTime: string;
  examDuration: number; // Duration in minutes
  examDescription: string;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  negativeMarking: boolean;
  negativeMarks?: number; // Only required if negativeMarking is true
  examType: 'multiple choice' | 'subjective' | 'both';
  screenCaptureInterval?: number; // Only required if captureScreenDuringExam is true
  captureScreenDuringExam: boolean;
  createdBy: string; // Teacher ID
}

@Injectable({
  providedIn: 'root',
})
export class ExamService {
  private baseUrl = 'http://localhost:5000/api/exam';
  private pyUrl = 'http://localhost:8000/api/questions/generate/';

  constructor(private http: HttpClient) {}

  createExam(examData: FormData): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`,
    }); // Add token handling as needed
    // console.log(examData.get)
    examData.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });
    return this.http.post(`${this.baseUrl}/create`, examData, { headers });
  }

  getAllExam(): Observable<any[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`,
    }); // Add token handling as needed
    return this.http.get<any[]>(`${this.baseUrl}/exams`, { headers });
  }

  genQuestions(formData: FormData): Observable<string> {
    console.log('FormData:', Array.from((formData as any).entries()));
    return new Observable((observer) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', this.pyUrl, true);
      // Do not set Content-Type header when sending FormData
      xhr.responseType = 'text';

      let accumulatedResponse = '';

      xhr.onprogress = () => {
        if (xhr.readyState === XMLHttpRequest.LOADING) {
          // Only push new chunk data
          const newChunk = xhr.responseText.substring(
            accumulatedResponse.length
          );
          accumulatedResponse += newChunk;
          observer.next(newChunk);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          observer.complete();
        } else {
          observer.error(xhr.statusText);
        }
      };

      xhr.onerror = () => observer.error(xhr.statusText);

      xhr.send(formData);
    });
  }

 

  private getToken(): string | null {
    return localStorage.getItem('token'); // Adjust as per your authentication flow
  }
}
