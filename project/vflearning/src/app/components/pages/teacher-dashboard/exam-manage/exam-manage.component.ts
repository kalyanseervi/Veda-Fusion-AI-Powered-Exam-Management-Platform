import { Component } from '@angular/core';
import { ExamListComponent } from "./exam-list/exam-list.component";
import { ExamCreateComponent } from "./exam-create/exam-create.component";
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-exam-manage',
  standalone: true,
  imports: [ExamListComponent, ExamCreateComponent,RouterModule,CommonModule],
  templateUrl: './exam-manage.component.html',
  styleUrl: './exam-manage.component.css'
})
export class ExamManageComponent {
  isPopupVisible = false;

  openPopup(): void {
    this.isPopupVisible = true;
  }

  closePopup(): void {
    this.isPopupVisible = false;
  }
}
