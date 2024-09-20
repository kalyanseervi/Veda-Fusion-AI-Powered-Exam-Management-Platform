import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
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
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './student-create.component.html',
  styleUrls: ['./student-create.component.css']
})
export class StudentCreateComponent implements OnInit {
  studentForm: FormGroup;
  availableSchools: School[] = [];
  availableClasses: Class[] = [];
  availableSubjects: Subject[] = [];
  isSecondSectionActive = false;
  selectedFile: File | null = null;
  loading: boolean = false;
  isEditMode = false;
  studentId: any;

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private schoolService: SchoolService,
    private classService: ClassService,
    private subjectService: SubjectService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.studentForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      studentClass: ['', [Validators.required]],
      studentsubjects: ['', [Validators.required]],
      photo: [null]
    });
  }

  ngOnInit(): void {
    this.loadSchools();
    this.loadClasses();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.studentId = params['id'];
        this.isEditMode = true;
        this.loadStudentData(this.studentId);
      }
    });

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

  loadStudentData(id: string): void {
    this.studentService.getStudentById(id).subscribe(student => {
      console.log(student);
      
      this.studentForm.patchValue({
        name: student.name,
        email: student.email,
        studentClass: student.studentClass.map((c: { _id: any; }) => c._id).join(','),  // Get classname from studentClass object
        studentsubjects: student.studentsubjects.map((s: { _id: any; }) => s._id).join(',')  // Get subjectName from studentsubjects object
      });
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
    this.loading = true;
    if (this.studentForm.valid) {
      const formData = new FormData();
      Object.keys(this.studentForm.controls).forEach(key => {
        if (key === 'photo' && this.selectedFile) {
          formData.append(key, this.selectedFile);
        } else {
          formData.append(key, this.studentForm.get(key)?.value);
        }
      });

      const request$ = this.isEditMode
        ? this.studentService.updateStudent(this.studentId!, formData)
        : this.studentService.createStudent(formData);

      request$.subscribe({
        next: (response) => {
          this.loading = false;
          alert(this.isEditMode ? 'Student updated successfully!' : 'Student registered successfully!');
          this.router.navigate(['/dashboard/admin']);
        },
        error: (error) => {
          this.loading = false;
          console.error('Error submitting form:', error);
          alert('Failed to submit form. Please try again.');
        }
      });
    } else {
      this.loading = false
      alert('Please fill in all required fields correctly.');
    }
  }

  openPopup(): void {
    // Additional logic if needed
  }

  closePopup(): void {
    // Additional logic if needed
  }
}
