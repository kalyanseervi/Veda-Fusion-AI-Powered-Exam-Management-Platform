import { Component } from '@angular/core';
import { ClassService } from '../../../../../services/class/class.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-class-create',
  standalone: true,
  imports: [ReactiveFormsModule ],
  templateUrl: './class-create.component.html',
  styleUrl: './class-create.component.css'
})
export class ClassCreateComponent {
  
  classForm: FormGroup;
  constructor(private classService: ClassService, private router: Router,private fb: FormBuilder) {
    this.classForm = this.fb.group({
      classname: ['', Validators.required],
      description: [''],
      academicYear: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.classForm.valid) {
    this.classService.createClass(this.classForm.value).subscribe(() => {
      this.router.navigate(['/dashboard/admin/class-manage/class-list']);
    });
  } else {
    console.log('Form is invalid:', this.classForm.errors); // Debugging line
  }
  }
}