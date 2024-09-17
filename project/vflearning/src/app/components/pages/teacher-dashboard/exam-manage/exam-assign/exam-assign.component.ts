import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TeacherService } from '../../../../../services/teacher/teacher.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ExamService } from '../../../../../services/exam/exam.service';
import { AssignExamService } from '../../../../../services/assignExam/assign-exam.service';


declare var $: any; // Import jQuery
@Component({
  selector: 'app-exam-assign',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './exam-assign.component.html',
  styleUrl: './exam-assign.component.css',
})
export class ExamAssignComponent implements OnInit, AfterViewInit {
  @Input() examId: string = ''; // Accept examId as input
  selectedExamId: any;
  totalStudents: any | undefined;
  selectedStudents: boolean[] = [];
  errorMessage: string = '';
  loading: boolean = false;
  constructor(
    private route: ActivatedRoute,
    private teacherservice: TeacherService,
    private assignexam: AssignExamService
  ) {}

  ngOnInit(): void {
    // Retrieve the selectedExamId from the route parameters
    this.selectedExamId = this.examId;
    this.classStudents();
    // You can now use the selectedExamId in your component logic
    
  }

  ngAfterViewInit(): void {
    // Initialize DataTable after view is initialized
    // this.initializeDataTable();
  }

  classStudents(): void {

    this.teacherservice.studdentBySubjects().subscribe({
      next:(students) => {
        
        this.totalStudents = students; // Store the students data
      },
      error:(error) => {
        console.error('Error fetching students: ', error);
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

  selectAll(): void {
    this.selectedStudents = this.selectedStudents.map(() => true);
    
  }

  clearSelection(): void {
    this.selectedStudents = this.selectedStudents.map(() => false);
  }

  assignExamAndNotify(): void {
    // Assuming this.authService.assignExamAndNotify() sends a request to the server to handle the assignment and notification
    const selectedStudentIds = this.totalStudents
      .filter((student: any, index: any) => this.selectedStudents[index])
      .map((student: any) => student._id);
    const selectedStudentEmail = this.totalStudents
      .filter((student: any, index: any) => this.selectedStudents[index])
      .map((student: any) => student.email);

    if (selectedStudentIds.length === 0) {
      this.errorMessage = 'No students selected.';
      
      return;
    }

    this.assignexam
      .assignExamAndNotify(
        this.examId,
        selectedStudentIds,
        selectedStudentEmail
      )
      .subscribe({
        next: (response) => {
          this.errorMessage =
            'Exam assigned and notifications sent successfully:';
         
          // Optionally, handle success response
        },
        error: (error) => {
          this.errorMessage = error.error;
          console.error(
            'Error assigning exam and sending notifications:',
            error
          );
          // Optionally, handle error
        },
      });
  }

  initializeDataTable(): void {
    $('#examAssignTable').DataTable({
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

  toggleSelection(event: any, index: number): void {
    this.selectedStudents[index] = event.target.checked;
    
  }
}
