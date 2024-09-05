import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { QuestionsService } from '../../../../../services/questions/questions.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule

@Component({
  selector: 'app-exam-questions-list',
  standalone: true,
  imports: [CommonModule, FormsModule], // Include FormsModule in imports
  templateUrl: './exam-questions-list.component.html',
  styleUrls: ['./exam-questions-list.component.css'] // Ensure correct spelling here
})
export class ExamQuestionsListComponent implements OnInit {
  questions: any[] = [];
  isEditing: { [key: string]: boolean } = {}; 
  total: number = 0;
  page: number = 1;
  limit: number = 10;
  examId: string = '';
  type: string = '';
  sortBy: string = 'createdAt';
  order: string = 'asc';

  constructor(private http: HttpClient, private examQuestionsService: QuestionsService) {}

  ngOnInit(): void {
    this.loadQuestions();
  }

  loadQuestions(): void {
    const params = {
      page: this.page,
      limit: this.limit,
      examId: this.examId || undefined,
      type: this.type || undefined,
      sortBy: this.sortBy || undefined,
      order: this.order || 'asc'
    };

    this.examQuestionsService.getExamQuestions(params).subscribe(response => {
      this.questions = response.data;
      console.log(this.questions);
      this.total = response.total;
    });
  }

  // Enable edit mode for a specific question
  enableEditMode(questionId: string): void {
    this.isEditing[questionId] = true;
  }

  // Cancel edit mode
  cancelEdit(questionId: string): void {
    
    this.isEditing[questionId] = false;
  }

  examQuestionsEdit(question:any){
    this.examQuestionsService.updateExamQuestion(question._id, question).subscribe(
      (response) => {
        console.log('Question updated successfully:', response);
        this.isEditing[question._id] = false; // Exit edit mode
      },
      (error) => {
        console.error('Error updating question:', error);
      }
    );
  }

  onPageChange(page: number): void {
    this.page = page;
    this.loadQuestions();
  }

  onFilterChange(): void {
    this.page = 1; // Reset to first page when filters change
    this.loadQuestions();
  }

  onSortChange(sortBy: string): void {
    this.sortBy = sortBy;
    this.order = this.order === 'asc' ? 'desc' : 'asc'; // Toggle order
    this.loadQuestions();
  }

  get totalPages(): number {
    return Math.ceil(this.total / this.limit);
  }
}
