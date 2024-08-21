import { Component, OnInit } from '@angular/core';
import { ClassService } from '../../../../../services/class/class.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-class-update',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './class-update.component.html',
  styleUrls: ['./class-update.component.css']
})
export class ClassUpdateComponent implements OnInit {

  classForm: FormGroup;
  classId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private classService: ClassService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.classForm = this.fb.group({
      classname: ['', Validators.required],
      description: [''],
      academicYear: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.classId = this.route.snapshot.paramMap.get('id');
    if (this.classId) {
      this.classService.getClass(this.classId).subscribe(classData => {
        this.classForm.patchValue({
          classname: classData.classname
        });
      });
    }
  }

  updateClass(): void {
    if (this.classForm.valid && this.classId) {
      this.classService.updateClass(this.classId, this.classForm.value).subscribe(() => {
        this.router.navigate(['/class-list']);
      });
    } else {
      console.log('Form is invalid or class ID is missing');
    }
  }
}
