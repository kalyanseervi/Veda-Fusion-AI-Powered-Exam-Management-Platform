import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TeacherService } from '../../../../../services/teacher/teacher.service';

interface Teacher {
  _id: string;
  name: string;
  contactNumber: string;
  email: string;
  city: string;
  school: { name: string };
  teachingClasses: { classname: string }[];
  teachingSubjects: { subjectName: string }[];
}

@Component({
  selector: 'app-teacher-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './teacher-list.component.html',
  styleUrls: ['./teacher-list.component.css']
})
export class TeacherListComponent implements OnInit {
  teachers: Teacher[] = [];

  constructor(private teacherService: TeacherService, private router: Router) {}

  ngOnInit(): void {
    this.loadTeachers();
  }

  loadTeachers(): void {
    this.teacherService.getAllTeachers().subscribe((teachers: Teacher[]) => {
      this.teachers = teachers;
    });
  }

  viewTeacherDetails(teacherId: string): void {
    this.router.navigate(['/dashboard/admin/teacher-details', teacherId]);
  }

  editTeacher(teacherId: string): void {
    this.router.navigate(['/dashboard/admin/teacher-details/teacher-create', teacherId]);
  }

  deleteTeacher(teacherId: string): void {
    if (confirm('Are you sure you want to delete this teacher?')) {
      this.teacherService.deleteTeacher(teacherId).subscribe(() => {
        alert('Teacher deleted successfully.');
        this.loadTeachers(); // Refresh the list after deletion
      });
    }
  }
}
