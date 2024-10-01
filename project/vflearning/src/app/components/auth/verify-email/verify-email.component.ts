import { Component,OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.css'
})
export class VerifyEmailComponent implements OnInit {
  successMessage = '';
  errorMessage = '';

  constructor(private route: ActivatedRoute, private router: Router, private authService: AuthService) {}

  ngOnInit() {
    const token = this.route.snapshot.paramMap.get('token');
    if (token) {
      this.authService.verifyEmail(token).subscribe({
        next: () => (this.successMessage = 'Email verified successfully!'),
        error: (err) => (this.errorMessage = 'Verification failed.'),
      });
    }
  }

  onSignIn():void{
    this.router.navigate(['/login']);
  }
  homebtn():void{
    this.router.navigate(['/vflearning']);
  }
}
