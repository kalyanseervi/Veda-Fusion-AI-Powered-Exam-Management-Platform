import { Component } from '@angular/core';
import { ClassListComponent } from "./class-list/class-list.component";
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-class-manage',
  standalone: true,
  imports: [ClassListComponent,RouterModule],
  templateUrl: './class-manage.component.html',
  styleUrl: './class-manage.component.css'
})
export class ClassManageComponent {

}
