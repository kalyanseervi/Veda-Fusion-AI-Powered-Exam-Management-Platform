import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ExamQuestionsListComponent } from './exam-questions-list/exam-questions-list.component';
import { ExamQuestionsGenerateComponent } from "./exam-questions-generate/exam-questions-generate.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-exam-questions-manage',
  standalone: true,
  imports: [ExamQuestionsListComponent, RouterModule, ExamQuestionsGenerateComponent,CommonModule],
  templateUrl: './exam-questions-manage.component.html',
  styleUrl: './exam-questions-manage.component.css',
})
export class ExamQuestionsManageComponent implements OnInit {
  selectedExamId: string | null = null;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    // Retrieve the selectedExamId from the route parameters
    this.selectedExamId = this.route.snapshot.paramMap.get('selectedExamId');

    // You can now use the selectedExamId in your component logic
    console.log('Selected Exam ID:', this.selectedExamId);
  }

  examQuestionsCreate() {
    this.router.navigate([`exam-questions-create`, this.selectedExamId], {
      relativeTo: this.route,
    });
  }

  isPopupVisible = false;

  openPopup(): void {
    this.isPopupVisible = true;
  }

  closePopup(): void {
    this.isPopupVisible = false;
  }

  generateQuestionsAi() {
    // Your logic to generate questions using AI goes here
    console.log('Generating questions using AI...');
  }
}
