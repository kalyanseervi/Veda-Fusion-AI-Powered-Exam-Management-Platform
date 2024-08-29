import { Component, OnInit, Pipe } from '@angular/core';
import { TeacherService } from '../../../../services/teacher/teacher.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-student-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-details.component.html',
  styleUrl: './student-details.component.css',
})
export class StudentDetailsComponent implements OnInit {
  deleteStudent(arg0: any) {
    throw new Error('Method not implemented.');
  }
  editStudent(arg0: any) {
    throw new Error('Method not implemented.');
  }
  viewStudentDetails(arg0: any) {
    throw new Error('Method not implemented.');
  }
  students: any[] = [];
  constructor(private teacherservice: TeacherService, private router: Router) {}

  ngOnInit(): void {
    this.classStudents();
  }

  classStudents(): void {
    this.teacherservice.studdentBySubjects().subscribe(
      (students) => {
        console.log('Students fetched: ', students);
        this.students = students; // Store the students data
      },
      (error) => {
        console.error('Error fetching students: ', error);
      }
    );
  }
}
