import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
startExam(arg0: any,arg1: any) {
throw new Error('Method not implemented.');
}
  stdexamdtl: any;
  errorMessage:string|undefined;
  constructor(
    private route: ActivatedRoute,
    private assignexam: AssignExamService
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
}
