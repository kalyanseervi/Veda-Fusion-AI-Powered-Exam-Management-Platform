import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router, private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password).subscribe({
        next: (response) => {
          this.authService.setToken(response.token);

          // Now we use the getRole() observable
          this.authService.getRole().subscribe({
            next: (role) => {
              
              
              if (role === 'admin') {
                this.router.navigate(['/dashboard/admin/home-page']);
              } else if (role === 'teacher') {
                this.router.navigate(['/dashboard/teacher']);
              } else if (role === 'student') {
                this.router.navigate(['/dashboard/student']);
              } else {
                // Handle unexpected roles or errors
                this.errorMessage = `'Unexpected role:', role`;
                console.error('Unexpected role:', role);
                this.router.navigate(['/unauthorized']);
              }
            },
            error: (err) => {
              this.errorMessage = `Login failed, ${err.error['msg']}`
              console.error('Failed to retrieve role:', err);
              this.router.navigate(['/unauthorized']);
            }
          });
        },
        error: (err) => {
          this.errorMessage = `Login failed, ${err.error['msg']}`
          console.error('Login failed:', err)}
      });
    }
  }

  onForgotPassword() {
    // Logic to handle forgotten password
    this.router.navigate(['/forgot-password']);
  }
  
  onSignUp() {
    // Logic to navigate to the signup page
    this.router.navigate(['/register']);
  }
}
