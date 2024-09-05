import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { ClassService } from '../../../../../services/class/class.service';
import { SubjectService } from '../../../../../services/subject/subject.service';
import { TeacherService } from '../../../../../services/teacher/teacher.service';
import { SchoolService } from '../../../../../services/school/school.service';

interface School {
  _id: string;
  name: string;
}

interface Class {
  _id: string;
  classname: string;
}

interface Subject {
  _id: string;
  subjectName: string;
}

@Component({
  selector: 'app-teacher-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './teacher-create.component.html',
  styleUrls: ['./teacher-create.component.css']
})
export class TeacherCreateComponent implements OnInit {
  isPopupVisible = false;
  teacherForm: FormGroup;
  availableSchools: School[] = [];
  availableClasses: Class[] = [];
  availableSubjects: Subject[] = [];
  isSecondSectionActive = false;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private teacherService: TeacherService,
    private schoolService: SchoolService,
    private classService: ClassService,
    private subjectService: SubjectService,
    private router: Router
  ) {
    this.teacherForm = this.fb.group({
      name: ['', [Validators.required]],
      // contactNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      // city: ['', [Validators.required]],
      // district: ['', [Validators.required]],
      // state: ['', [Validators.required]],
      // country: ['', [Validators.required]],
      // school: ['', [Validators.required]],
      teachingClasses: ['', [Validators.required]],
      teachingSubjects: ['', [Validators.required]],
      // qualification: ['', [Validators.required]],
      // experience: ['', [Validators.required, Validators.min(0)]],
      // address: ['', [Validators.required]],
      // photo: [null]
    });
  }

  ngOnInit(): void {
    this.loadSchools();
    this.loadClasses();
    this.teacherForm.get('teachingClasses')?.valueChanges.subscribe(classId => {
      this.loadSubjects(classId); // Load subjects based on the selected class
    });
  }

  loadSchools(): void {
    this.schoolService.getAllSchools().subscribe((schools) => {
      this.availableSchools = schools;
    });
  }

  loadClasses(): void {
    this.classService.getClasses().subscribe((classes: Class[]) => {
      this.availableClasses = classes;
    });
  }

  loadSubjects(classId: string): void {
    this.subjectService.getSubjectsByClass(classId).subscribe((subjects: Subject[]) => {
      this.availableSubjects = subjects;
    });
  }

  next(): void {
    
      this.isSecondSectionActive = true;
    
  }

  back(): void {
    this.isSecondSectionActive = false;
  }

  onFileSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.teacherForm.patchValue({ photo: file });
      this.teacherForm.get('photo')?.updateValueAndValidity();
    }
  }

  onSubmit(): void {
    if (this.teacherForm.valid) {
      const formData = new FormData();
      Object.keys(this.teacherForm.controls).forEach(key => {
        if (key === 'photo' && this.selectedFile) {
          formData.append(key, this.selectedFile);
        } else {
          formData.append(key, this.teacherForm.get(key)?.value);
        }
      });

      this.teacherService.createTeacher(formData).subscribe(
        () => {
          alert('Teacher registered successfully!');
          this.router.navigate(['/dashboard/admin']);
        },
        (error) => {
          console.error('Error registering teacher:', error);
          alert('Failed to register teacher. Please try again.');
        }
      );
    } else {
      alert('Please fill in all required fields correctly.');
    }
  }

  openPopup(): void {
    this.isPopupVisible = true;
  }

  closePopup(): void {
    this.isPopupVisible = false;
  }
}
