import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { StudentService } from '../../../../../services/student/student.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.css'
})
export class StudentListComponent implements OnInit {
  students: any[] = [];

  constructor(private studentService: StudentService, private router: Router) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.studentService.getAllStudent().subscribe((students: any[]) => {
      this.students = students;
    });
  }

  viewStudentDetails(studentId: string): void {
    this.router.navigate(['/dashboard/admin/student-details', studentId]);
  }

  editStudent(studentId: string): void {
    this.router.navigate(['/dashboard/admin/student-details/student-create', studentId]);
  }

  deleteStudent(studentId: string): void {
    if (confirm('Are you sure you want to delete this student?')) {
      this.studentService.deleteStudent(studentId).subscribe(() => {
        alert('student deleted successfully.');
        this.loadStudents(); // Refresh the list after deletion
      });
    }
  }
}
