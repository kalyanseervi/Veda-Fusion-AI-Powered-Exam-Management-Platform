import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QuestionsService } from '../../../../services/questions/questions.service';
import { ExamService } from '../../../../services/exam/exam.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ExamPortalService } from '../../../../services/examPortal/exam-portal.service';
import { AuthService } from '../../../../services/auth/auth.service';

@Component({
  selector: 'app-exam-portal',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './exam-portal.component.html',
  styleUrl: './exam-portal.component.css'
})
export class ExamPortalComponent implements OnInit, OnDestroy {

  @Output() fullscreenChange = new EventEmitter<boolean>();
  @Output() isExamPortal = new EventEmitter<boolean>();

  examId: string | undefined;
  questions: any[] = [];
  selectedOptions: string[] = [];
  currentQuestionIndex: number | undefined;
  currentQuestion: any;
  @Input() totalTime: number | undefined;
  Message: string = '';
  isRunning = true;
  fullscreenEnabled = false;
  isExamPortalEnabled = false;
  canLeavePage = false;
  timerInterval: any;
  remainingTime = 0;
  wordsLeft: number | undefined;

  constructor(
    private examService: ExamService,
    private route: ActivatedRoute,
    private examQuestionsService: QuestionsService,
    private examPortalService:ExamPortalService,
    private authservice:AuthService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.examId = params['examId'];
      if (this.examId) {
        this.fetchQuestions(this.examId);
        this.loadExamDetails(this.examId);
      }
    });

    this.enterFullScreen();
    this.isExamPortalEnabled = true;
    this.isExamPortal.emit(this.isExamPortalEnabled);

    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('contextmenu', this.handleContextMenu.bind(this));
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    window.removeEventListener('keydown', this.handleKeyDown.bind(this));
    window.removeEventListener('contextmenu', this.handleContextMenu.bind(this));
    window.removeEventListener('beforeunload', this.handleBeforeUnload.bind(this));
  }

  loadExamDetails(examId: string): void {
    this.examService.getExamById(examId).subscribe(
      (response: any) => {
        this.totalTime = response.examDuration * 60;
        this.remainingTime = this.totalTime;
        this.startCountdown();
      },
      (error) => {
        console.error('Error fetching exam details:', error);
      }
    );
  }

  fetchQuestions(examId: string): void {
    this.examQuestionsService.getExamPortalQuestions(examId).subscribe(
      (questions: any[]) => {
        this.questions = questions;
        this.currentQuestionIndex = 0;
        this.currentQuestion = this.questions[0];
        this.selectedOptions = new Array(this.questions.length).fill('');
        this.enforceWordLimit();
      },
      (error: any) => {
        console.error('Error fetching questions:', error);
      }
    );
  }

  startCountdown(): void {
    this.clearTimer();
    this.timerInterval = setInterval(() => {
      if (this.remainingTime > 0 && this.isRunning) {
        this.remainingTime--;
      } else {
        this.clearTimer();
        this.submitExam();
      }
    }, 1000);
  }

  clearTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  getFormattedTime(remainingTime: number): string {
    const hours = Math.floor(remainingTime / 3600);
    const minutes = Math.floor((remainingTime % 3600) / 60);
    const seconds = remainingTime % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  goToQuestion(index: number): void {
    this.currentQuestionIndex = index;
    this.currentQuestion = this.questions[index];
    this.enforceWordLimit();
  }

  prevQuestion(): void {
    if (this.currentQuestionIndex && this.currentQuestionIndex > 0) {
      this.saveResponse(this.currentQuestionIndex);
      this.goToQuestion(this.currentQuestionIndex - 1);
    }
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex !== undefined && this.currentQuestionIndex < this.questions.length - 1) {
      this.saveResponse(this.currentQuestionIndex);
      this.goToQuestion(this.currentQuestionIndex + 1);
      
    }
  }

  enforceWordLimit(): void {
    const currentText = this.selectedOptions[this.currentQuestionIndex || 0] || '';
    const wordLimit = this.currentQuestion?.word_limit || 0;
    const wordsTyped = currentText.split(/\s+/).filter(word => word.length > 0).length;

    if (wordsTyped > wordLimit) {
      this.selectedOptions[this.currentQuestionIndex || 0] = currentText.split(/\s+/).slice(0, wordLimit).join(' ');
      this.wordsLeft = 0;
    } else {
      this.wordsLeft = wordLimit - wordsTyped;
    }
  }

  shuffleOptions(): void {
    if (this.currentQuestionIndex !== undefined) {
      const options = this.questions[this.currentQuestionIndex].options;
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }
    }
  }

  saveResponse(index: number): void {
    const question = this.questions[index];
    const singleOption = this.selectedOptions[index];
    console.log(index)

    // console.log(question)
    if (question && singleOption) {
      // Save the response for the current question
      if (!this.examId) {
        console.log('exam id not found in single response save');
      } else {
        this.examPortalService
          .submitResponseSingleId(
            this.examId,
            question._id,            
            singleOption
          )
          .subscribe(
            (response:any) => {
             
              // Optionally, navigate to a confirmation page or display a success message
            },
            (error:any) => {
              console.error('Error submitting response:', error);
              // Handle error (e.g., display an error message to the user)
            }
          );
      }
    }
  }

  submitExam(): void {
    if (!this.examId) {
      console.error('Exam ID is undefined');
      return; // Exit the function if examId is undefined
    }
    const responses = [];
    for (let i = 0; i < this.questions.length; i++) {
      responses.push({
        questionId: this.questions[i]._id,
        selectedOption: this.selectedOptions[i], // Assuming selectedOptions is an array corresponding to each question
      });
    }

    this.examPortalService
      .submitResponses(this.examId, responses)
      .subscribe(
        (response) => {
          this.Message = `Congratulations! You have successfully Submited your Exam`;
         
          this.authservice.logout();
          // Optionally, navigate to a confirmation page or display a success message
        },
        (error) => {
          console.error('Error submitting responses:', error);
          // Handle error (e.g., display an error message to the user)
        }
      );
  }


  // Fullscreen handling
  toggleFullScreen(): void {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  @HostListener('document:fullscreenchange')
  handleFullscreenChange(): void {
    this.fullscreenEnabled = !!document.fullscreenElement;
    this.fullscreenChange.emit(this.fullscreenEnabled);

    if (!this.fullscreenEnabled) {
      const confirmExit = confirm("You exited fullscreen. Do you want to continue the exam?");
      if (!confirmExit) {
        this.submitExam();
      } else {
        this.enterFullScreen();
      }
    }
  }

  // Handle selection of options and save the selected option
  onOptionSelected(option: string, index: number): void {
    this.selectedOptions[this.currentQuestionIndex || 0] = option;
 
  }

  // Event handlers
  handleKeyDown(event: KeyboardEvent): void {
    const forbiddenKeys = ['F12', 'F5', 'Control', 'Alt'];
    if (forbiddenKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  handleContextMenu(event: MouseEvent): void {
    event.preventDefault();
  }

  handleBeforeUnload(event: BeforeUnloadEvent): void {
    if (!this.canLeavePage) {
      event.returnValue = 'Are you sure you want to leave this page? Your progress may be lost.';
    }
  }

  // Fullscreen control
  enterFullScreen(): void {
    this.toggleFullScreen();
  }

  exitFullScreen(): void {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}
