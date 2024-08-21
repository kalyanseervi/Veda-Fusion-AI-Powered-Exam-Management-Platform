import { Component,OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  message = '';

  constructor(private route: ActivatedRoute, private authService: AuthService) {}

  ngOnInit() {
    const token = this.route.snapshot.paramMap.get('token');
    if (token) {
      this.authService.verifyEmail(token).subscribe({
        next: () => (this.message = 'Email verified successfully!'),
        error: (err) => (this.message = 'Verification failed.'),
      });
    }
  }
}
