import { Component, ElementRef, ViewChild, AfterViewInit, OnInit, Pipe, HostListener } from '@angular/core';
import { RightsidebarComponent } from '../rightsidebar/rightsidebar.component';
import { SidenavbarComponent } from '../sidenavbar/sidenavbar.component';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { ExamPortalComponent } from "./exam-portal/exam-portal.component";
import { ExamStateService } from '../../../services/exam/exam-state.service'; // Import the state service

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [RightsidebarComponent, SidenavbarComponent, RouterModule, CommonModule, ExamPortalComponent],
  templateUrl: './student-dashboard.component.html',
  styleUrl: './student-dashboard.component.css',
})
export class StudentDashboardComponent implements AfterViewInit, OnInit {
  username: String | null = null;
  userrole: String | null = null;
  isFullscreen = false;
  isexamportal = false;

  @ViewChild('sideMenu') sideMenu!: ElementRef;
  @ViewChild('menuBtn') menuBtn!: ElementRef;
  @ViewChild('closeBtn') closeBtn!: ElementRef;
  @ViewChild('themeToggler') themeToggler!: ElementRef;

  constructor(private authService: AuthService, private examStateService: ExamStateService) {} // Inject the state service

  ngOnInit(): void {
    this.authService.decodeToken().subscribe({
      next: (res) => {
        this.username = res.user.userName;
        this.userrole = res.user.userRole.toUpperCase();
      },
      error: (err) => console.log(err),
    });
  }

  ngAfterViewInit(): void {
    if (this.menuBtn) {
      this.menuBtn.nativeElement.addEventListener('click', () => {
        this.sideMenu.nativeElement.style.display = 'block';
      });
    }

    if (this.closeBtn) {
      this.closeBtn.nativeElement.addEventListener('click', () => {
        this.sideMenu.nativeElement.style.display = 'none';
      });
    }

    if (this.themeToggler) {
      this.themeToggler.nativeElement.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme-variables');
        this.toggleActiveClass(this.themeToggler.nativeElement, 1);
        this.toggleActiveClass(this.themeToggler.nativeElement, 2);
      });
    }
  }

  onFullscreenChange(event: Event): void {
    this.isFullscreen = !!document.fullscreenElement;
  }

  onexamportal(event: Event): void {
    this.isexamportal = true;
    this.examStateService.isInExamPortal = true; // Set the state when entering exam portal
  }

  exitExamPortal() {
    this.isexamportal = false;
    this.examStateService.isInExamPortal = false; // Reset the state when exiting exam portal
  }

  @HostListener('document:fullscreenchange', ['$event'])
  onDocumentFullscreenChange(event: Event): void {
    this.onFullscreenChange(event);
  }

  private toggleActiveClass(element: HTMLElement, childIndex: number): void {
    const child = element.querySelector(`span:nth-child(${childIndex})`);
    if (child) {
      child.classList.toggle('active');
    }
  }
}
