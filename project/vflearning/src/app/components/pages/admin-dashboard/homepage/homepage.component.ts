import { Component, OnInit } from '@angular/core';
import { Teacher } from '../../../../models/teacher.model';
import { TeacherService } from '../../../../services/teacher/teacher.service';
import { Router } from '@angular/router';
import { StudentService } from '../../../../services/student/student.service';

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
  totalStudents:Number |0 |undefined;

  constructor(private teacherService: TeacherService, private router: Router, private studentService: StudentService) {}

  ngOnInit(): void {
    this.loadTeachers();
    this.loadStudents();
  }

  loadTeachers(): void {
    this.teacherService.getAllTeachers().subscribe((teachers: Teacher[]) => {
      this.teachers = teachers;
      this.totalTeachers = teachers.length
    });
  }
  loadStudents():void{
    this.studentService.getAllStudent().subscribe((students:any[])=>{
      this.totalStudents = students.length
    })
  }

}
