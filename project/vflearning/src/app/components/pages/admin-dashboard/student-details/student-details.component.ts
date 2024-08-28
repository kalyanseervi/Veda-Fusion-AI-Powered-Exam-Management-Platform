import { Component, OnInit } from '@angular/core';
import { StudentListComponent } from './student-list/student-list.component';
import { Router, RouterModule } from '@angular/router';
import { StudentCreateComponent } from './student-create/student-create.component';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-student-details',
  standalone: true,
  imports: [StudentListComponent,RouterModule,StudentCreateComponent,CommonModule],
  templateUrl: './student-details.component.html',
  styleUrl: './student-details.component.css'
})
export class StudentDetailsManageComponent {
  isPopupVisible = false;

  openPopup(): void {
    this.isPopupVisible = true;
  }

  closePopup(): void {
    this.isPopupVisible = false;
  }
}
