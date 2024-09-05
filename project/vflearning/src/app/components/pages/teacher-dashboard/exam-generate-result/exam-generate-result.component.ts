import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamGenResultService } from '../../../../services/examGenResult/exam-gen-result.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-exam-generate-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exam-generate-result.component.html',
  styleUrl: './exam-generate-result.component.css',
})
export class ExamGenerateResultComponent implements OnInit {
  selectedExamId: any;
  studentResponseList:any

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private genResult: ExamGenResultService
  ) {}

  ngOnInit(): void {
    // Retrieve the selectedExamId from the route parameters
    this.selectedExamId = this.route.snapshot.paramMap.get('selectedExamId');
    // You can now use the selectedExamId in your component logic
    this.loadStudents()
    console.log('Selected Exam ID:', this.selectedExamId);
  }

  loadStudents(): void {
    this.genResult.studnetOfResult(this.selectedExamId).subscribe(
      (response: any) => {
        console.log(response);
        this.studentResponseList = response;
      },
      (error) => {
        console.log(error);
      }
    );
  }
}
