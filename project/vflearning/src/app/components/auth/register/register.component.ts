import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  providers: [AuthService]
})
export class RegisterComponent {
  stepIndex = 0;
  registrationForm: FormGroup;

  constructor(private authService: AuthService, private router: Router, private fb: FormBuilder) {
    this.registrationForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      dob: ['', Validators.required],
      instituteName: ['', Validators.required],
      instituteAddress: ['', Validators.required],
      institutephoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      department: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmpassword: ['', [Validators.required, Validators.minLength(6)]],
    }, );
  }

 



  nextStep() {
    console.log('Next Step Clicked');
    console.log('Form Valid:', this.registrationForm.valid);
    console.log('Form Errors:', this.registrationForm.errors);
    console.log(this.registrationForm.value);
    
    if ( this.stepIndex < 2) {
      this.stepIndex++;
      console.log('Step Index incremented:', this.stepIndex);
    } else {
      console.log('Cannot move to next step, form is invalid or stepIndex is maxed out');
    }
  }

  prevStep() {
    if (this.stepIndex > 0) {
      this.stepIndex--;
    }
  }

  onSubmit() {
    this.registrationForm.markAllAsTouched(); // Ensure all fields are marked as touched
    this.registrationForm.updateValueAndValidity(); // Re-trigger validation

    if (this.registrationForm.valid) {
      this.authService.register(this.registrationForm.value).subscribe({
        next: () => this.router.navigate(['/login']),
        error: (err) => console.error(err),
      });
    } else {
      console.log('Form is invalid:', this.registrationForm.errors); // Debugging line
    }
  }
}
