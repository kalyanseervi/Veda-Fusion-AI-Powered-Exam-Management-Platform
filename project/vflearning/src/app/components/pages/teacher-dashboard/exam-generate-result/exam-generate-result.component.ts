import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamGenResultService } from '../../../../services/examGenResult/exam-gen-result.service';
import { CommonModule } from '@angular/common';

declare var $: any; // Import jQuery

@Component({
  selector: 'app-exam-generate-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exam-generate-result.component.html',
  styleUrls: ['./exam-generate-result.component.css'],
})
export class ExamGenerateResultComponent implements OnInit, AfterViewInit {
  selectedExamId: any;
  studentResponseList: any[] = [];
  loading: boolean = false; // Loading indicator flag
  message: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private genResult: ExamGenResultService
  ) {}

  ngOnInit(): void {
    this.selectedExamId = this.route.snapshot.paramMap.get('selectedExamId');
    if (this.selectedExamId) {
      this.loadStudents();
    }
  }

  ngAfterViewInit(): void {
    // Initialize DataTable after view is initialized
    this.initializeDataTable();
  }

  loadStudents(): void {
    this.loading = true; // Show loading indicator
    this.genResult.studnetOfResult(this.selectedExamId).subscribe({
      next: (response: any) => {
        console.log(response.results);
        this.studentResponseList = response.results;
      },
      error: (error) => {
        this.loading = false;
        this.message = error.error.msg;
        console.log(error);
      },
      complete: () => {
        this.loading = false; // Hide loading indicator
        // Initialize DataTable after data is loaded
        setTimeout(() => {
          this.initializeDataTable();
        }, 0); // Ensure DataTable initializes after data is loaded
      },
    });
  }

  initializeDataTable(): void {
    $('#examResultsTable').DataTable({
      dom: 'Bfrtip', // Define the layout of the table controls
      buttons: ['copy', 'excel', 'pdf'], // Add export buttons
      scrollY: '400px', // Fixed vertical height with scroll
      scrollX: true, // Horizontal scrolling
      paging: true,
      lengthChange: true,
      searching: true,
      ordering: true,
      info: true,
      responsive: true,
      pageLength: 10,
      order: [[7, 'asc']], // Sort by Rank (index 7) ascending
      language: {
        search: 'Filter records:',
        lengthMenu: 'Display _MENU_ records per page',
        info: 'Showing page _PAGE_ of _PAGES_',
        infoEmpty: 'No records available',
        zeroRecords: 'No matching records found',
      },
      columnDefs: [
        {
          targets: -1, // Target the last column (Action column)
          orderable: false, // Disable sorting for the Action column
        },
      ],
    });
  }

  showresponse(arg: string): void {
    console.log(arg);
  }
  publishResult():void{
    this.genResult.publishResult(this.selectedExamId).subscribe(
      (response) => {
        console.log(response);

        this.message = "Results have been published.";
        
        },
        (error) => {
          this.message = error.error.msg;
          console.error(error);
        })
  }
}
