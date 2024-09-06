import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ExamService } from '../../../../../services/exam/exam.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FlatpickrModule } from 'angularx-flatpickr';
import { CommonModule } from '@angular/common';
import flatpickr from 'flatpickr';
import moment from 'moment';



@Component({
  selector: 'app-exam-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink,FlatpickrModule],
  templateUrl: './exam-create.component.html',
  styleUrls: ['./exam-create.component.css'], // Fix: Use styleUrls instead of styleUrl
})
export class ExamCreateComponent implements OnInit {
  @ViewChild('examDateInput') examDateInput!: ElementRef;
  examForm: FormGroup;
  examTypes: string[] = ['multiple choice', 'subjective', 'both'];
  difficultyLevels: string[] = ['easy', 'medium', 'hard'];
  minDate: string | undefined;

  // Define a list of holidays (Add as required)
  holidays = [
    '2024-01-26',  // Republic Day
    '2024-08-15',  // Independence Day
    '2024-10-02',  // Gandhi Jayanti
    // Add more holidays as needed
  ];



  constructor(
    private fb: FormBuilder,
    private examService: ExamService,
    private router: Router
  ) {
    this.examForm = this.fb.group({
      examName: ['', [Validators.required]],
      examDate: ['', [Validators.required]],
      examTime: ['', [Validators.required]],
      examDuration: [0, [Validators.required, Validators.min(1)]],
      examDescription: ['', [Validators.required]],
      difficultyLevel: ['', [Validators.required]],
      negativeMarking: [false],
      negativeMarks: [{ value: '', disabled: true }],
      examType: ['', [Validators.required]],
      captureScreenDuringExam: [false],
      screenCaptureInterval: [{ value: '', disabled: true }],
    });

    // Enable/Disable negativeMarks based on negativeMarking
    this.examForm.get('negativeMarking')?.valueChanges.subscribe((checked) => {
      const negativeMarksControl = this.examForm.get('negativeMarks');
      if (checked) {
        negativeMarksControl?.enable();
      } else {
        negativeMarksControl?.disable();
        negativeMarksControl?.setValue('');
      }
    });



    // Enable/Disable screenCaptureInterval based on captureScreenDuringExam
    this.examForm
      .get('captureScreenDuringExam')
      ?.valueChanges.subscribe((checked) => {
        const screenCaptureIntervalControl = this.examForm.get(
          'screenCaptureInterval'
        );
        if (checked) {
          screenCaptureIntervalControl?.enable();
        } else {
          screenCaptureIntervalControl?.disable();
          screenCaptureIntervalControl?.setValue('');
        }
      });
  }

  ngOnInit(): void {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
  }



  onSubmit(): void {
    if (this.examForm.valid) {
      // Create FormData and append the form values
      const formData = new FormData();
      Object.keys(this.examForm.controls).forEach(key => {
        const control = this.examForm.get(key);
        if (control) {
          formData.append(key, control.value);
        }
      });

      // Log FormData entries
      formData.forEach((value, key) => {
        console.log(`${key}: ${value}`);
      });

      // Call the service to create the exam
      this.examService.createExam(formData).subscribe(
        (response) => {
          console.log(response);
          alert('Exam created successfully!');
          this.router.navigate(['/dashboard/admin']);
        },
        (error: any) => {
          console.error('Error creating exam:', error);
          alert('Failed to create exam. Please try again.');
        }
      );
    } else {
      alert('Please fill in all required fields correctly.');
    }
  }
}
