import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TeacherCreateComponent } from "./teacher-create/teacher-create.component";
import { TeacherListComponent } from "./teacher-list/teacher-list.component";
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-teacher-details',
  standalone: true,
  imports: [RouterModule, TeacherCreateComponent, TeacherListComponent, CommonModule],
  templateUrl: './teacher-details.component.html',
  styleUrl: './teacher-details.component.css'
})
export class TeacherDetailsComponent {
  isPopupVisible = false;

  openPopup(): void {
    this.isPopupVisible = true;
  }

  closePopup(): void {
    this.isPopupVisible = false;
  }
}
