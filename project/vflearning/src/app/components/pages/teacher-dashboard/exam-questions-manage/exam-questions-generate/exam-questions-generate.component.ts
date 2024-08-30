import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ExamService } from '../../../../../services/exam/exam.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-exam-questions-generate',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './exam-questions-generate.component.html',
  styleUrls: ['./exam-questions-generate.component.css'],
})
export class ExamQuestionsGenerateComponent implements OnInit {
  examForm!: FormGroup;
  showQuestionTypeFields: { [key: string]: boolean } = {};
  mcqOutput: string = '';
  isProcessing = false;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder,
    private examService: ExamService,
    private router: Router) {
      this.examForm = this.fb.group({
        class: ['', Validators.required],
        subject: ['', Validators.required],
        topics: [''],
        pdfInput: [null],
        questionTypes: this.fb.group({
          mcq: this.fb.group({
            count: [''],
            marks: [''],
          }),
          short_answer: this.fb.group({
            count: [''],
            marks: [''],
          }),
          long_answer: this.fb.group({
            count: [''],
            marks: [''],
          }),
          yes_no: this.fb.group({
            count: [''],
            marks: [''],
          }),
          fill_in_the_blanks: this.fb.group({
            count: [''],
            marks: [''],
          }),
        }),
        difficulty_levels: ['easy'],
        total_marks: [''],
      });
  
      this.updateVisibility();
    }

  ngOnInit() {
    
  }

  initializeForm() {
    
  }

  onQuestionTypeChange(type: string, event: Event) {
    const checkbox = event.target as HTMLInputElement;
    this.showQuestionTypeFields[type] = checkbox.checked;
    this.updateTotalMarks();
  }

  updateVisibility() {
    const questionTypes = this.examForm.get('questionTypes')?.value;
    this.showQuestionTypeFields = {
      mcq: !!(questionTypes.mcq.count || questionTypes.mcq.marks),
      short_answer: !!(
        questionTypes.short_answer.count || questionTypes.short_answer.marks
      ),
      long_answer: !!(
        questionTypes.long_answer.count || questionTypes.long_answer.marks
      ),
      yes_no: !!(questionTypes.yes_no.count || questionTypes.yes_no.marks),
      fill_in_the_blanks: !!(
        questionTypes.fill_in_the_blanks.count ||
        questionTypes.fill_in_the_blanks.marks
      ),
    };
  }

  updateTotalMarks() {
    const questionTypes = this.examForm.get('questionTypes')?.value;
    const totalMarks = Object.keys(questionTypes).reduce((total, type) => {
      const count = parseFloat(questionTypes[type].count) || 0;
      const marks = parseFloat(questionTypes[type].marks) || 0;
      return total + count * marks;
    }, 0);
    this.examForm.get('total_marks')?.setValue(totalMarks);
  }

  onSubmit(): void {
    if (this.examForm.valid) {
      this.isProcessing = true; // Show loading indicator
      this.mcqOutput=''
      
      // Create FormData and append the form values
      const formData = new FormData();
      Object.keys(this.examForm.controls).forEach(key => {
        const control = this.examForm.get(key);
        if (control && control.value) {
          formData.append(key, control.value);
        }
      });
  
      // Log FormData entries
      formData.forEach((value, key) => {
        console.log(`${key}: ${value}`);
      });
  
      // Call the service to create the exam
      this.examService.genQuestions(formData).subscribe({
        next: (chunk) => {
          this.mcqOutput += chunk;
          this.isProcessing = false;
          // Optionally, update uploadProgress based on data received
        },
        error: (err) => {
          this.errorMessage = `Error: ${err.message}`;
          this.isProcessing = false;
        },
        complete: () => {
          console.log('Streaming complete');
          this.isProcessing = false;
          // const jsonResponse = this.mcqOutput.trim();
          // this.router.navigate(['/mcq-output-display'], { state: { mcqOutput: jsonResponse } });
        }
      });
    }
}
}
