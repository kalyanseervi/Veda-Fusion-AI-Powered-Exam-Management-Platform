import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TeacherService } from '../../../../../services/teacher/teacher.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ExamService } from '../../../../../services/exam/exam.service';
import { AssignExamService } from '../../../../../services/assignExam/assign-exam.service';

@Component({
  selector: 'app-exam-assign',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './exam-assign.component.html',
  styleUrl: './exam-assign.component.css',
})
export class ExamAssignComponent implements OnInit {
  @Input() examId: string = ''; // Accept examId as input
  selectedExamId: any;
  totalStudents: any | undefined;
  selectedStudents: boolean[] = [];
  errorMessage: string = '';
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

  classStudents(): void {
    this.teacherservice.studdentBySubjects().subscribe(
      (students) => {
        
        this.totalStudents = students; // Store the students data
      },
      (error) => {
        console.error('Error fetching students: ', error);
      }
    );
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

  toggleSelection(event: any, index: number): void {
    this.selectedStudents[index] = event.target.checked;
    
  }
}
