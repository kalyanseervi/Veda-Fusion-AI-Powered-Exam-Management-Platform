import { Component, OnInit, Pipe } from '@angular/core';
import { TeacherService } from '../../../../services/teacher/teacher.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StudentService } from '../../../../services/student/student.service';

@Component({
  selector: 'app-student-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-details.component.html',
  styleUrl: './student-details.component.css',
})
export class StudentDetailsComponent implements OnInit {
  students: any[] = [];
  singleStudent: Record<string, any> = [];

  constructor(
    private teacherservice: TeacherService,
    private studentservice: StudentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.classStudents();
  }

  classStudents(): void {
    this.teacherservice.studdentBySubjects().subscribe(
      (students) => {
       
        this.students = students; // Store the students data
      },
      (error) => {
        console.error('Error fetching students: ', error);
      }
    );
  }

  isPopupVisible = false;

  openPopup(): void {
    this.isPopupVisible = true;
  }

  closePopup(): void {
    this.isPopupVisible = false;
  }

  viewStudentDetail(arg0: any) {
    this.isPopupVisible = true;

    this.studentservice.getStudentById(arg0).subscribe(
      (student: any) => {
        if (student && typeof student === 'object') {
          this.singleStudent = student;
        } else {
          console.error('Invalid student data');
        }
       
      },
      (error) => {
        console.error('Error fetching student details: ', error);
      }
    );
    
  }
}
