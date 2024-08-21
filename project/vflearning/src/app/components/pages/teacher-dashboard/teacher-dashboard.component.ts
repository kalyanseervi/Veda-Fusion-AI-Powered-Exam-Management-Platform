import { Component, ElementRef, ViewChild, AfterViewInit, OnInit,Pipe } from '@angular/core';
import { RightsidebarComponent } from "../rightsidebar/rightsidebar.component";
import { SidenavbarComponent } from "../sidenavbar/sidenavbar.component";
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [RightsidebarComponent, SidenavbarComponent,RouterModule],
  templateUrl: './teacher-dashboard.component.html',
  styleUrl: './teacher-dashboard.component.css'
})

export class TeacherDashboardComponent implements AfterViewInit,OnInit {

  
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
        this.userrole = res.user.userRole.toUpperCase()
      },
      error: (err) => console.log(err)
    })
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

  private toggleActiveClass(element: HTMLElement, childIndex: number): void {
    const child = element.querySelector(`span:nth-child(${childIndex})`);
    if (child) {
      child.classList.toggle('active');
    }
  }
}

