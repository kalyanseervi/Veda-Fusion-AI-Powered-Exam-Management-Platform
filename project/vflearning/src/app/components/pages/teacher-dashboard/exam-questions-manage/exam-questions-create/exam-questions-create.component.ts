import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-exam-questions-create',
  standalone: true,
  imports: [],
  templateUrl: './exam-questions-create.component.html',
  styleUrl: './exam-questions-create.component.css'
})
export class ExamQuestionsCreateComponent  implements OnInit {
  selectedExamId: string | null = null;

  constructor(private route: ActivatedRoute,private router: Router) {}

  ngOnInit(): void {
    // Retrieve the selectedExamId from the route parameters
    this.selectedExamId = this.route.snapshot.paramMap.get('selectedExamId');

    // You can now use the selectedExamId in your component logic
    console.log('Selected Exam ID:', this.selectedExamId);
  }

}
