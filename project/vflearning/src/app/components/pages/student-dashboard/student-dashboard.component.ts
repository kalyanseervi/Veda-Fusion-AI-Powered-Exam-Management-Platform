import { Component, ElementRef, ViewChild, AfterViewInit, OnInit, OnDestroy, HostListener } from '@angular/core';
import { RightsidebarComponent } from '../rightsidebar/rightsidebar.component';
import { SidenavbarComponent } from '../sidenavbar/sidenavbar.component';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { ExamPortalComponent } from "./exam-portal/exam-portal.component";
import { ExamStateService } from '../../../services/exam/exam-state.service'; // Import the state service
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [RightsidebarComponent, SidenavbarComponent, RouterModule, CommonModule, ExamPortalComponent],
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css'],
})
export class StudentDashboardComponent implements AfterViewInit, OnInit, OnDestroy {
  username: string | null = null;
  userrole: string | null = null;
  isFullscreen = false;
  isexamportal = false;

  @ViewChild('sideMenu') sideMenu!: ElementRef;
  @ViewChild('menuBtn') menuBtn!: ElementRef;
  @ViewChild('closeBtn') closeBtn!: ElementRef;
  @ViewChild('themeToggler') themeToggler!: ElementRef;

  private routerEventsSub: Subscription | null = null;

  constructor(
    private authService: AuthService,
    private examStateService: ExamStateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to user information
    this.authService.decodeToken().subscribe({
      next: (res) => {
        this.username = res.user.userName;
        this.userrole = res.user.userRole.toUpperCase();
      },
      error: (err) => console.error(err),
    });

    // Subscribe to router events and check if we're in the exam-portal
    this.routerEventsSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.checkIfExamPortal(event.urlAfterRedirects);
    });
  }

  ngAfterViewInit(): void {
    // Menu and theme button event listeners
    this.menuBtn?.nativeElement.addEventListener('click', this.showSideMenu.bind(this));
    this.closeBtn?.nativeElement.addEventListener('click', this.hideSideMenu.bind(this));
    this.themeToggler?.nativeElement.addEventListener('click', this.toggleTheme.bind(this));
  }

  ngOnDestroy(): void {
    // Clean up router events subscription
    this.routerEventsSub?.unsubscribe();

    // Remove event listeners to avoid memory leaks
    this.menuBtn?.nativeElement.removeEventListener('click', this.showSideMenu.bind(this));
    this.closeBtn?.nativeElement.removeEventListener('click', this.hideSideMenu.bind(this));
    this.themeToggler?.nativeElement.removeEventListener('click', this.toggleTheme.bind(this));
  }

  @HostListener('document:fullscreenchange', ['$event'])
  onDocumentFullscreenChange(): void {
    this.isFullscreen = !!document.fullscreenElement;
  }

  private checkIfExamPortal(currentUrl: string): void {
    // Check if the current URL contains 'exam-portal', hide components accordingly
    this.isexamportal = currentUrl.includes('/exam-portal');
    this.examStateService.isInExamPortal = this.isexamportal;

    // Additional logic can be added to manage fullscreen mode behavior
    if (this.isexamportal) {
      console.log("In Exam Portal, hiding sidebars.");
    } else {
      console.log("Not in Exam Portal, showing sidebars.");
    }
  }

  private showSideMenu(): void {
    this.sideMenu.nativeElement.style.display = 'block';
  }

  private hideSideMenu(): void {
    this.sideMenu.nativeElement.style.display = 'none';
  }

  private toggleTheme(): void {
    document.body.classList.toggle('dark-theme-variables');
    this.toggleActiveClass(this.themeToggler.nativeElement, 1);
    this.toggleActiveClass(this.themeToggler.nativeElement, 2);
  }

  private toggleActiveClass(element: HTMLElement, childIndex: number): void {
    const child = element.querySelector(`span:nth-child(${childIndex})`);
    if (child) {
      child.classList.toggle('active');
    }
  }
}
