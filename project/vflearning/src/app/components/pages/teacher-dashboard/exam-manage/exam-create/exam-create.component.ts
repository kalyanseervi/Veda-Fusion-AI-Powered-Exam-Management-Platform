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
import { AuthService } from '../../../../../services/auth/auth.service';



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
  currentUserDtl:any

  // Define a list of holidays (Add as required)
  holidays = [
    '2024-01-26',  // Republic Day
    '2024-08-15',  // Independence Day
    '2024-10-02',  // Gandhi Jayanti
    // Add more holidays as needed
  ];
  message: any;



  constructor(
    private fb: FormBuilder,
    private examService: ExamService,
    private router: Router,
    private authservice:AuthService
  ) {
    this.examForm = this.fb.group({
      examName: ['', [Validators.required]],
      examDate: ['', [Validators.required]],
      examTime: ['', [Validators.required]],
      examDuration: [0, [Validators.required, Validators.min(1)]],
      examDescription: ['', [Validators.required]],
      class: ['', [Validators.required]], // Class field
      subject: ['', [Validators.required]], // Subject field
      negativeMarking: [false],
      negativeMarks: [{ value: '', disabled: true }, Validators.min(0)],
      
      captureScreenDuringExam: [false],
      screenCaptureInterval: [{ value: '', disabled: true }, Validators.min(1)],
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


    this.authservice.getUserDtl().subscribe({
      next: (response) => {
        console.log("my response",response);
        this.currentUserDtl = response
      },
      error: (error) => {
        this.message = error.error.msg;
      },
    });
  }



  onSubmit(): void {
    if (this.examForm.valid) {
      // Create FormData and append the form values
      const formData = new FormData();
  
      // Manually append each form control value
      Object.keys(this.examForm.controls).forEach(key => {
        const control = this.examForm.get(key);
        if (control && control.enabled) { // Only include enabled fields
          formData.append(key, control.value);
        } else if (!control?.enabled) {
          formData.append(key, ''); // Append empty string for disabled fields
        }
      });
  
      // Log FormData entries for debugging
      formData.forEach((value, key) => {
        console.log(key, value);
      });
  
      // Call the service to create the exam
      this.examService.createExam(formData).subscribe(
        (response) => {
          alert('Exam created successfully!');
          this.router.navigate(['/dashboard/teacher']);
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
