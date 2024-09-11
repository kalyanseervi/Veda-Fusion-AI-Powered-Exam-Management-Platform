import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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

  constructor(private fb: FormBuilder, private examService: ExamService, private router: Router) {}

  ngOnInit() {
    this.initializeForm();
  }

  initializeForm() {
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
      total_marks: [{ value: '', disabled: true }],
    });
  }

  onQuestionTypeChange(type: string, event: Event) {
    const checkbox = (event.target as HTMLInputElement);
    this.showQuestionTypeFields[type] = checkbox.checked;
    this.updateTotalMarks();
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
      this.isProcessing = true;
      this.mcqOutput = '';

      const formData = new FormData();
      const formValue = this.examForm.value;

      Object.keys(formValue).forEach(key => {
        if (key === 'pdfInput') return;
        if (formValue[key] !== null && formValue[key] !== '') {
          if (key === 'questionTypes') {
            Object.keys(formValue[key]).forEach(qType => {
              Object.keys(formValue[key][qType]).forEach(subKey => {
                formData.append(`questionTypes[${qType}][${subKey}]`, formValue[key][qType][subKey]);
              });
            });
          } else {
            formData.append(key, formValue[key]);
            
          }
        }
      });

      const pdfInput = this.examForm.get('pdfInput')?.value;
      if (pdfInput) {
        formData.append('pdfInput', pdfInput);
      }

      this.examService.genQuestions(formData).subscribe({
        next: (chunk) => {
          this.mcqOutput += chunk;
        },
        error: (err) => {
          this.errorMessage = `Error: ${err.message}`;
        },
        complete: () => {
          this.isProcessing = false;
         
        }
      });
    }
  }
}
