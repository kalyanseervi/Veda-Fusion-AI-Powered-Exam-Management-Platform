import { Component, OnInit } from '@angular/core';
import { RightsidebarComponent } from '../rightsidebar/rightsidebar.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidenavbar',
  standalone: true,
  imports: [RightsidebarComponent, CommonModule,
    ReactiveFormsModule, RouterLink],
  templateUrl: './sidenavbar.component.html',
  styleUrl: './sidenavbar.component.css'
})
export class SidenavbarComponent implements OnInit{
  userRole: string | null = null;
  constructor(private authService: AuthService, private router: Router){}
  ngOnInit(): void {
    this.authService.getRole().subscribe({
      next: (role) => {
        console.log('User role in login:', role);
        this.userRole = role;
      },
      error: (err) => {
        console.error('Failed to retrieve role:', err);
        this.router.navigate(['/unauthorized']);
      }
    });
  }
  onLogout(): void {
    this.authService.logout();
  }
  isActive(linkPath: string): boolean {
    return this.router.url.includes(linkPath);
  }
}


