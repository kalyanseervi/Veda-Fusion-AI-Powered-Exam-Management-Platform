import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ExamGenResultService } from '../../../services/examGenResult/exam-gen-result.service';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-rightsidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rightsidebar.component.html',
  styleUrl: './rightsidebar.component.css'
})
export class RightsidebarComponent implements OnInit {
  resultDtl: any;
  message: any;
  private baseUrl = 'http://localhost:5000/api/examResult';

  constructor(private router: Router,private genResult: ExamGenResultService,private http: HttpClient){ }

  ngOnInit(): void {
    this.genResult.listOfResults().subscribe({
      next: (response) => {
        console.log("i am here",response)
        this.resultDtl = response.examResults;
        
      },
      error:(error)=>{
        this.message = error.error.msg;
      }
    })
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
 

}
