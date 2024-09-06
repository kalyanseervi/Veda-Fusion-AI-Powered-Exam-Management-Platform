import { AfterViewInit, Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-vflearning',
  standalone: true,
  imports: [],
  templateUrl: './vflearning.component.html',
  styleUrl: './vflearning.component.css',
})
export class VflearningComponent implements AfterViewInit {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadScript('/assets/vendor/jquery/jquery.min.js');
      this.loadScript('/assets/vendor/bootstrap/js/bootstrap.min.js');
      this.loadScript('/assets/js/isotope.min.js');
      this.loadScript('/assets/js/owl-carousel.js');
      this.loadScript('/assets/js/counter.js');
      this.loadScript('/assets/js/custom.js');
    }
  }

  private loadScript(url: string): void {
    const script = document.createElement('script');
    script.src = url;
    script.onload = () => {
      console.log('Script loaded successfully.');
    };
    script.onerror = () => {
      console.error('Script loading failed.');
    };
    document.body.appendChild(script);
  }
}
