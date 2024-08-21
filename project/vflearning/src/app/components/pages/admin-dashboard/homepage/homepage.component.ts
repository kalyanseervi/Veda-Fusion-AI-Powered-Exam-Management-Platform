import { Component, OnInit } from '@angular/core';
import { Teacher } from '../../../../models/teacher.model';
import { TeacherService } from '../../../../services/teacher/teacher.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css'
})
export class HomepageComponent implements OnInit {
  teachers: Teacher[] = [];
  totalTeachers: Number | 0 | undefined;

  constructor(private teacherService: TeacherService, private router: Router) {}

  ngOnInit(): void {
    this.loadTeachers();
  }

  loadTeachers(): void {
    this.teacherService.getAllTeachers().subscribe((teachers: Teacher[]) => {
      this.teachers = teachers;
      this.totalTeachers = teachers.length
    });
  }

}
