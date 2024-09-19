import { Component, OnInit } from '@angular/core';
import { ExamService } from '../../../../../services/exam/exam.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamAssignComponent } from "../exam-assign/exam-assign.component";

@Component({
  selector: 'app-exam-list',
  standalone: true,
  imports: [CommonModule, ExamAssignComponent],
  templateUrl: './exam-list.component.html',
  styleUrl: './exam-list.component.css',
})
export class ExamListComponent implements OnInit {
  allExams: any[] = [];
  selectedExamId: string | undefined;
  message: string = '';

  constructor(private examservice: ExamService, private router: Router,private route: ActivatedRoute,) {}
  ngOnInit(): void {
    this.loadAllExams();
  }
  loadAllExams(): void {
    this.examservice.getAllExam().subscribe((exams) => {

      this.allExams = exams;
    });
  }

  isPopupVisible = false;

  openPopup(): void {
    
  }

  closePopup(): void {
    this.isPopupVisible = false;
  }


 

  examQuestionsManage(selectedExamId: string) {
    this.router.navigate([
      `/dashboard/teacher/exam-questions-manage/${selectedExamId}`,
    ]);
  }
  generateResult(selectedExamId:string){
    this.router.navigate([
      `/dashboard/teacher/exam-generate-result/${selectedExamId}`,
    ]);
  }

  examAssign(arg0:string){
    this.selectedExamId = arg0
    this.isPopupVisible = true;
  }
  deleteExam(arg0:string){
    console.log('i am here',arg0)
    this.examservice.deleteExamById(arg0).subscribe({
      next:(response)=>{
        alert('Exam Deleted Successfully')
      },
      error:(err)=> {
        alert('Error Occured')
        console.log('error in deleting exam',err)
      },
    })
  }
}
