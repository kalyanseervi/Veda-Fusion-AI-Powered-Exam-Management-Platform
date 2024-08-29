import { Component, OnInit } from '@angular/core';
import { ExamService } from '../../../../../services/exam/exam.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-exam-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exam-list.component.html',
  styleUrl: './exam-list.component.css'
})
export class ExamListComponent implements OnInit {

  
  allExams: any[] = [];
 


  constructor(private examservice:ExamService,private router: Router){}
  ngOnInit(): void {
    this.loadAllExams();
  }
  loadAllExams():void{
    this.examservice.getAllExam().subscribe((exams)=>{
      console.log(exams);
      this.allExams = exams;
    })
  }

  examQuestionsManage(selectedExamId:string) {
    this.router.navigate([`/dashboard/teacher/exam-questions-manage/${selectedExamId}`]);
    }

}
