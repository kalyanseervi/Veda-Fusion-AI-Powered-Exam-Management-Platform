import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SubjectService } from '../../../../../services/subject/subject.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-subject-update',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './subject-update.component.html',
  styleUrl: './subject-update.component.css'
})
export class SubjectUpdateComponent implements OnInit {

  subjectForm: FormGroup;
  subjectId: string | null = null; // Allow null initially

  constructor(
    private subjectService: SubjectService,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {
    this.subjectForm = this.fb.group({
      subjectName: ['', Validators.required],
      subjectCode: ['', Validators.required],
      description: [''],
      academicYear: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.subjectId = this.route.snapshot.paramMap.get('id');
    if (this.subjectId) {
      this.loadSubject();
    } else {
      console.error('No subject ID provided');
    }
  }

  loadSubject(): void {
    if (this.subjectId) {
      this.subjectService.getSubjectById(this.subjectId).subscribe(subject => {
        this.subjectForm.patchValue(subject);
      });
    }
  }

  updateSubject(): void {
    if (this.subjectForm.valid && this.subjectId) {
      this.subjectService.updateSubject(this.subjectId, this.subjectForm.value).subscribe(() => {
        this.router.navigate(['/dashboard/admin/subject-manage/subject-list']);
      });
    } else {
      console.log('Form is invalid or subjectId is missing:', this.subjectForm.errors);
    }
  }
}