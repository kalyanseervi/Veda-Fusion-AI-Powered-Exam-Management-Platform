import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SubjectService } from '../../../../../services/subject/subject.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ClassService } from '../../../../../services/class/class.service';

@Component({
  selector: 'app-subject-create',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './subject-create.component.html',
  styleUrl: './subject-create.component.css'
})
export class SubjectCreateComponent {
  subjectForm: FormGroup;
  classes: any[] = []; // Array to hold the classes for the dropdown


  constructor(
    private subjectService: SubjectService,
    private router: Router,
    private fb: FormBuilder,
    private classService: ClassService, 
    private route: ActivatedRoute
  ) {
    this.subjectForm = this.fb.group({
      subjectName: ['', Validators.required],
     
      classId: ['', Validators.required], 
      
    });
  }

  ngOnInit(): void {
    this.loadClasses(); // Fetch classes on initialization
    // If updating, fetch and populate subject details
    if (this.route.snapshot.paramMap.get('id')) {
      this.loadSubject(); // Load subject details if updating
    }
  }

  loadClasses(): void {
    this.classService.getClasses().subscribe((classes: any[]) => {
      this.classes = classes; // Populate the classes array
      
    });
  }

  loadSubject(): void {
    const subjectId = this.route.snapshot.paramMap.get('id');
    if (subjectId) {
      this.subjectService.getSubjectById(subjectId).subscribe(subject => {
        this.subjectForm.patchValue(subject);
      });
    }
  }

  saveSubject(): void {
    if (this.subjectForm.valid) {
      const subjectData = this.subjectForm.value;
      if (this.route.snapshot.paramMap.get('id')) {
        this.subjectService.updateSubject(this.route.snapshot.paramMap.get('id')!, subjectData)
          .subscribe(() => this.router.navigate(['/dashboard/admin/subject-manage/subject-list']));
      } else {
        this.subjectService.createSubject(subjectData)
          .subscribe(() => this.router.navigate(['/dashboard/admin/subject-manage/subject-list']));
      }
    }
  }
}