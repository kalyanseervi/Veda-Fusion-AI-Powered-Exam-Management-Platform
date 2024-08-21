import { Component, OnInit } from '@angular/core';
import { ClassService } from '../../../../../services/class/class.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-class-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,RouterLink],
  templateUrl: './class-list.component.html',
  styleUrl: './class-list.component.css'
})
export class ClassListComponent implements OnInit {
  classes: any[] = [];

  constructor(private classService: ClassService) {}

  ngOnInit(): void {
    this.classService.getClasses().subscribe((data) => {
      this.classes = data;
    });
  }

  deleteClass(id: string): void {
    this.classService.deleteClass(id).subscribe(() => {
      this.classes = this.classes.filter((c) => c._id !== id);
    });
  }
}
