import { Component, OnInit } from '@angular/core';
import { SubjectService } from '../../../../../services/subject/subject.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-subject-list',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './subject-list.component.html',
  styleUrl: './subject-list.component.css'
})
export class SubjectListComponent implements OnInit {
  subjects: any[] = [];

  constructor(private subjectService: SubjectService, private router: Router) {}

  ngOnInit(): void {
    this.loadSubjects();
  }

  loadSubjects(): void {
    this.subjectService.getSubjects().subscribe(data => {
      this.subjects = data;
     
    });
  }

  deleteSubject(subjectId: string): void {
    if (confirm('Are you sure you want to delete this subject?')) {
      this.subjectService.deleteSubject(subjectId).subscribe(() => {
        this.loadSubjects(); // Reload the subject list after deletion
      });
    }
  }
}

