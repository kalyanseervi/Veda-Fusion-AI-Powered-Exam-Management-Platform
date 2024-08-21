import { Component } from '@angular/core';
import { SubjectListComponent } from "./subject-list/subject-list.component";
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-subject-manage',
  standalone: true,
  imports: [SubjectListComponent,RouterModule],
  templateUrl: './subject-manage.component.html',
  styleUrl: './subject-manage.component.css'
})
export class SubjectManageComponent {

}
