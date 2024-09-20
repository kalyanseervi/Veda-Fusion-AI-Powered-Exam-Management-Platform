import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent {
  resetPasswordForm: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';
  token: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,private router: Router
  ) {
    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validator: this.passwordMatchValidator
    });

    this.token = this.route.snapshot.params['token'];
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.resetPasswordForm.valid) {
      const newPassword = this.resetPasswordForm.get('newPassword')?.value;
      this.authService.resetPassword(this.token, newPassword).subscribe({
        next: (response) => {
          this.successMessage = 'Password reset successful.';
          this.errorMessage = '';
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.errorMessage = err.error.message || 'Failed to reset password.';
          this.successMessage = '';
        }
      });
    }
  }
}
