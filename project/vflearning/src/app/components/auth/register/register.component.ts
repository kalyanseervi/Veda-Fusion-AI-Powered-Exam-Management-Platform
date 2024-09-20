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
  message: string = '';
  loading: boolean = false;
  errorFields: string[] = [];

  constructor(private authService: AuthService, private router: Router, private fb: FormBuilder) {
    this.registrationForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]*$/)]], // No special characters
      email: ['', [Validators.required, Validators.email]],
      instituteName: ['', Validators.required],
      instituteAddress: ['', Validators.required],
      institutephoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]], // 10-digit phone number
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmpassword: ['', [Validators.required, Validators.minLength(6)]],
    }, { validators: this.passwordMatchValidator }); // Custom validator for matching passwords
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmpassword');
    return password && confirmPassword && password.value !== confirmPassword.value ? { passwordsMismatch: true } : null;
  }

  nextStep() {
    console.log('Next Step Clicked');
    console.log('Form Valid:', this.registrationForm.valid);
    console.log('Form Errors:', this.registrationForm.errors);
    console.log(this.registrationForm.value);
    
    if (this.stepIndex < 2 && this.registrationForm.valid) {
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
    this.registrationForm.markAllAsTouched();
    this.errorFields = [];

    if (this.registrationForm.invalid) {
      // Collect invalid fields
      Object.keys(this.registrationForm.controls).forEach(key => {
        const controlErrors: AbstractControl | null = this.registrationForm.get(key);
        if (controlErrors && controlErrors.invalid) {
          this.errorFields.push(key); // Add invalid field name to errorFields array
        }
      });

      // Show error message in modal or alert
      this.message = `Please correct the following fields: ${this.errorFields.join(', ')}`;
      console.log('Form is invalid:', this.errorFields);
      return;
    }
    this.loading = true

    // Submit form if valid
    this.authService.register(this.registrationForm.value).subscribe({
      next: () => {
        this.message = 'Registration successful!';
        this.loading = false;
        alert('Admin registered successfully!');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading = false;
        this.message = `${err.error['msg']}`;
        console.error(err);
      }
    });
  }

  onSignIn():void{
    this.router.navigate(['/login']);
  }
}
