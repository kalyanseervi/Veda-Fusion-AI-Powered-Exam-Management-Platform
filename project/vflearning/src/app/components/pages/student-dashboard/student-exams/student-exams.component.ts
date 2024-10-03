import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AssignExamService } from '../../../../services/assignExam/assign-exam.service';
import { CommonModule } from '@angular/common';
import { ExamGenResultService } from '../../../../services/examGenResult/exam-gen-result.service';

@Component({
  selector: 'app-student-exams',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-exams.component.html',
  styleUrl: './student-exams.component.css'
})
export class StudentExamsComponent implements OnInit {

  stdexamdtl: any;
  message:string|undefined;
  resultDtl:any;
  isPopupVisible = false;
  constructor(
    private route: ActivatedRoute,
    private assignexam: AssignExamService,
    private router: Router,
    private genResult: ExamGenResultService
  ) {}


  ngOnInit(): void {
      this.getStudentAssignedExamDetails();
  }


  getStudentAssignedExamDetails(): void {
    this.assignexam.stdAssignedExamUser().subscribe({
      next: (stdexamdtl) => {
        console.log(stdexamdtl)
        this.stdexamdtl = stdexamdtl;
       
      },
      error: (error) => {
        this.message = error.error
        console.error('Error fetching student exam details: ', error);
      },
    });
  }

  startExam(examId: any) {
    const examData = { examId};
    // Navigate to the exam page with the examId and examName as route parameters
    this.assignexam.startExam(examData).subscribe({
      next: (response) => {        
        this.router.navigate([
          '/dashboard/student/exam-portal',
          examId
        ]);
      },
      error: (error) => {
        console.log('exam error',error.error)
        this.message = error.error.error;
      },
    });
  }

  

  closePopup(): void {
    this.isPopupVisible = false;
  }
  viewResult(arg0:string):void{
    console.log(arg0)
    this.genResult.viewResultOfStudent(arg0).subscribe({
      next: (response) => {
        console.log(response.user)
        this.resultDtl = response.user;
        this.isPopupVisible = true;
      },
      error:(error)=>{
        this.message = error.error.msg;
      }
    })
  }
}
