import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SchoolService } from '../../../../../services/school/school.service';
import { ClassService } from '../../../../../services/class/class.service';
import { SubjectService } from '../../../../../services/subject/subject.service';
import { StudentService } from '../../../../../services/student/student.service';



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
  selector: 'app-student-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './student-create.component.html',
  styleUrl: './student-create.component.css'
})
export class StudentCreateComponent implements OnInit {
  isPopupVisible = false;
  studentForm: FormGroup;
  availableSchools: School[] = [];
  availableClasses: Class[] = [];
  availableSubjects: Subject[] = [];
  isSecondSectionActive = false;
  selectedFile: File | null = null;
  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private schoolService: SchoolService,
    private classService: ClassService,
    private subjectService: SubjectService,
    private router: Router
  ) {
    this.studentForm = this.fb.group({
      name: ['', [Validators.required]],
      // contactNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      // dob: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      // city: ['', [Validators.required]],
      // district: ['', [Validators.required]],
      // state: ['', [Validators.required]],
      // country: ['', [Validators.required]],
      // school: ['', [Validators.required]],
      studentClass: ['', [Validators.required]],
      studentsubjects: ['', [Validators.required]],
      // address: ['', [Validators.required]],
      // photo: [null]
    });
  }

  ngOnInit(): void {
    this.loadSchools();
    this.loadClasses();
    this.studentForm.get('studentClass')?.valueChanges.subscribe(classId => {
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
      this.studentForm.patchValue({ photo: file });
      this.studentForm.get('photo')?.updateValueAndValidity();
    }
  }

  onSubmit(): void {
    if (this.studentForm.valid) {
      const formData = new FormData();
      Object.keys(this.studentForm.controls).forEach(key => {
        if (key === 'photo' && this.selectedFile) {
          formData.append(key, this.selectedFile);
        } else {
          formData.append(key, this.studentForm.get(key)?.value);
        }
      });

      this.studentService.createStudent(formData).subscribe(
        () => {
          alert('Student registered successfully!');
          this.router.navigate(['/dashboard/admin']);
        },
        (error: any) => {
          console.error('Error registering student:', error);
          alert('Failed to register student. Please try again.');
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

