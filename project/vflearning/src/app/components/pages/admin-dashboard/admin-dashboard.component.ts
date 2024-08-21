import { Component, ElementRef, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { TeacherDetailsComponent } from "./teacher-details/teacher-details.component";
import { SidenavbarComponent } from "../sidenavbar/sidenavbar.component";
import { RightsidebarComponent } from "../rightsidebar/rightsidebar.component";
import { ThemetoggleComponent } from "../themetoggle/themetoggle.component";
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, TeacherDetailsComponent, SidenavbarComponent, RightsidebarComponent, ThemetoggleComponent, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements AfterViewInit,OnInit {

  username:String | null = null
  userrole:String | null = null

  @ViewChild('sideMenu') sideMenu!: ElementRef;
  @ViewChild('menuBtn') menuBtn!: ElementRef;
  @ViewChild('closeBtn') closeBtn!: ElementRef;
  @ViewChild('themeToggler') themeToggler!: ElementRef;

  constructor(private authService:AuthService){}
  ngOnInit(): void {
    this.authService.decodeToken().subscribe({
      next: (res) => {
        this.username = res.user.userName
        this.userrole = res.user.userRole
      },
      error: (err) => console.log(err)
    })
  }

  ngAfterViewInit(): void {
    this.initializeMenuButtons();
    this.initializeThemeToggler();
  }

  private initializeMenuButtons(): void {
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
  }

  private initializeThemeToggler(): void {
    if (this.themeToggler) {
      this.themeToggler.nativeElement.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme-variables');
        this.toggleActiveClass(this.themeToggler.nativeElement, 1);
        this.toggleActiveClass(this.themeToggler.nativeElement, 2);
      });
    }
  }

  private toggleActiveClass(element: HTMLElement, childIndex: number): void {
    const child = element.querySelector(`span:nth-child(${childIndex})`);
    if (child) {
      child.classList.toggle('active');
    }
  }
}
