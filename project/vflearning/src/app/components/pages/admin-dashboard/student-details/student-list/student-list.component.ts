import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { StudentService } from '../../../../../services/student/student.service';
import { Router } from '@angular/router';


declare var $: any; // Import jQuery
@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.css'
})
export class StudentListComponent implements OnInit {
  students: any[] = [];
  singleStudent: any;

  constructor(private studentService: StudentService, private router: Router) {}

  ngOnInit(): void {
    this.loadStudents();
    
  }

  loadStudents(): void {
    this.studentService.getAllStudent().subscribe({
      next:(students:any)=>{

        this.students = students;
        console.log(students)
      },
      error:(error) => {
        console.error('Error fetching student details: ', error);
      },
      complete: () => {
        setTimeout(() => {
          this.initializeDataTable();
        }, 0); // Ensure DataTable initializes after data is loaded
      }
    })
  }

  isPopupVisible = false;

  openPopup(): void {
    this.isPopupVisible = true;
  }

  closePopup(): void {
    this.isPopupVisible = false;
  }

  viewStudentDetail(arg0: any) {
    this.isPopupVisible = true;

    this.studentService.getStudentById(arg0).subscribe({
      next:(student) => {
        if (student && typeof student === 'object') {
          this.singleStudent = student;
          
        } else {
          console.error('Invalid student data');
        }
       
      },
      error:(error) => {
        console.error('Error fetching student details: ', error);
      }
  });
    
  }

  editStudent(studentId: string): void {
    this.router.navigate(['/dashboard/admin/student-details', studentId]);
  }

  deleteStudent(studentId: string): void {
    if (confirm('Are you sure you want to delete this student?')) {
      this.studentService.deleteStudent(studentId).subscribe(() => {
        alert('student deleted successfully.');
        this.loadStudents(); // Refresh the list after deletion
      });
    }
  }

  initializeDataTable(): void {
    $('#studentListTable').DataTable({
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
        search: `<span class="filter-search">Filter records:</span>`,
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
}
