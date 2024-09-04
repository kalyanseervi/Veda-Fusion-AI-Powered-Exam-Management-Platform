import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AssignExamService } from '../../../../services/assignExam/assign-exam.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-student-exams',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-exams.component.html',
  styleUrl: './student-exams.component.css'
})
export class StudentExamsComponent implements OnInit {

  stdexamdtl: any;
  errorMessage:string|undefined;
  constructor(
    private route: ActivatedRoute,
    private assignexam: AssignExamService,
    private router: Router
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
        this.errorMessage = error.error
        console.error('Error fetching student exam details: ', error);
      },
    });
  }

  startExam(examId: any) {
    const examData = { examId};
    // Navigate to the exam page with the examId and examName as route parameters
    this.assignexam.startExam(examData).subscribe({
      next: (response) => {
        console.log('This is my response: ', response);
        this.router.navigate([
          '/dashboard/student/exam-portal',
          examId
        ]);
      },
      error: (error) => {
        this.errorMessage = error.error;
      },
    });
  }
}
