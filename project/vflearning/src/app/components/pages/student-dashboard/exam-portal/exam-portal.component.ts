import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  HostListener,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionsService } from '../../../../services/questions/questions.service';
import { ExamService } from '../../../../services/exam/exam.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ExamPortalService } from '../../../../services/examPortal/exam-portal.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-exam-portal',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './exam-portal.component.html',
  styleUrls: ['./exam-portal.component.css'],
})
export class ExamPortalComponent implements OnInit, OnDestroy {
  @Output() fullscreenChange = new EventEmitter<boolean>();
  @Output() isExamPortal = new EventEmitter<boolean>();

  examId: string | undefined;
  questions: any[] = [];
  selectedOptions: string[] = [];
  currentQuestionIndex: number = 0;
  currentQuestion: any;
  totalTime: number | undefined;
  Message: string = '';
  isRunning = true;
  isExamPortalEnabled = false;
  canLeavePage = false;
  timerInterval: any;
  remainingTime = 0;
  wordsLeft: number | undefined;
  confirmationModal = false;
  attemptedCount = 0;
  unattemptedCount = 0;
  notVisitedCount = 0;
  visitedQuestions: any;
  markedAsReadQuestions: any;
  visitedCount = 0;

  constructor(
    private examService: ExamService,
    private route: ActivatedRoute,
    private examQuestionsService: QuestionsService,
    private examPortalService: ExamPortalService,
    private authService: AuthService,
    private location: Location,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.examId = params['examId'];
      if (this.examId) {
        this.fetchQuestions(this.examId);
        this.loadExamDetails(this.examId);
      }
    });

    this.enterFullscreen();
    this.isExamPortalEnabled = true;
    this.isExamPortal.emit(this.isExamPortalEnabled);

    // Prevent navigation back
    this.location.go(this.router.url);
    window.history.pushState(null, '', this.router.url);
    window.onpopstate = (event) => {
      this.location.go(this.router.url);
    };

    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('contextmenu', this.handleContextMenu.bind(this));
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
  }

  ngOnDestroy(): void {
    this.clearTimer();
    window.removeEventListener('keydown', this.handleKeyDown.bind(this));
    window.removeEventListener('contextmenu', this.handleContextMenu.bind(this));
    window.removeEventListener('beforeunload', this.handleBeforeUnload.bind(this));
  }

  loadExamDetails(examId: string): void {
    this.examService.getExamById(examId).subscribe(
      (response: any) => {
        if (response && response.exam && response.exam.examEndTime) {
          const examEndTime = new Date(response.exam.examEndTime);

          if (isNaN(examEndTime.getTime())) {
            console.error('Invalid exam end time:', response.exam.examEndTime);
            this.Message = 'Invalid exam end time. Please contact support.';
            return;
          }

          this.remainingTime = Math.max(
            (examEndTime.getTime() - new Date().getTime()) / 1000,
            0
          );

          if (this.remainingTime > 0) {
            this.startCountdown();
          } else {
            this.Message = 'The exam time has already ended.';
            this.submitExam(); // Automatically submit if the exam is over
            this.authService.logout();
          }
        } else {
          console.error('Exam details not found in response:', response);
          this.Message = 'Exam details not found. Please contact support.';
        }
      },
      (error) => {
        console.error('Error fetching exam details:', error);
        this.Message =
          'An error occurred while fetching exam details. Please try again later.';
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
        this.visitedQuestions = new Array(this.questions.length).fill(false);
        this.markedAsReadQuestions = new Array(this.questions.length).fill(false);
        this.currentQuestion = this.questions[this.currentQuestionIndex];
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
        if (this.remainingTime <= 0) {
          this.Message = 'Time is up!';
          this.submitExam();
        }
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
    const seconds = Math.floor(remainingTime % 60);
    return `${hours}h ${minutes}m ${seconds}s`;
  }


  goToQuestion(index: number): void {
    if (index >= 0 && index < this.questions.length) {
      this.currentQuestionIndex = index;
      this.currentQuestion = this.questions[index];
      this.enforceWordLimit();
      this.attemptedfn();
    }
  }

  prevQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.saveResponse(this.currentQuestionIndex);
      this.goToQuestion(this.currentQuestionIndex - 1);
      this.attemptedfn();
    }
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.saveResponse(this.currentQuestionIndex);
      this.goToQuestion(this.currentQuestionIndex + 1);
      this.attemptedfn();
      
    }
  }

  // Mark a question as read
  markAsRead(): void {
    if (this.currentQuestionIndex !== undefined) {
      this.markedAsReadQuestions[this.currentQuestionIndex] = true;
    }
  }

  // Mark a question as visited
  markAsVisited(): void {
    if (this.currentQuestionIndex !== undefined) {
      this.visitedQuestions[this.currentQuestionIndex] = true;
    }
  }

  // Clear the selection for the current question
  clearSelection(): void {
    if (this.currentQuestionIndex !== undefined) {
      this.selectedOptions[this.currentQuestionIndex] = '';
      this.attemptedfn()
    }
  }

  enforceWordLimit(): void {
    const currentText =
      this.selectedOptions[this.currentQuestionIndex || 0] || '';
    const wordLimit = this.currentQuestion?.word_limit || 0;
    const wordsTyped = currentText
      .split(/\s+/)
      .filter((word) => word.length > 0).length;

    if (wordsTyped > wordLimit) {
      this.selectedOptions[this.currentQuestionIndex || 0] = currentText
        .split(/\s+/)
        .slice(0, wordLimit)
        .join(' ');
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
    if (question && singleOption && this.examId) {
      this.examPortalService
        .submitResponseSingleId(this.examId, question._id, singleOption)
        .subscribe(
          (response: any) => {
            // Optionally, navigate to a confirmation page or display a success message
          },
          (error: any) => {
            console.error('Error submitting response:', error);
          }
        );
    } else {
      console.warn(
        'Question, selected option, or exam ID missing for saving response'
      );
    }
  }
  attemptedfn():void{
    this.attemptedCount = this.selectedOptions.filter((option) => option !== '')
      .length;
    this.unattemptedCount =
      this.questions.length - this.selectedOptions.filter((option) => option !== '').length;
    this.visitedCount = this.visitedQuestions.filter((visited: any) => visited).length;
  }
  // Confirmation modal for submitting the exam
  showConfirmationModal(): void {
    this.attemptedCount = this.selectedOptions.filter((option) => option !== '')
      .length;
    this.unattemptedCount =
      this.questions.length - this.selectedOptions.filter((option) => option !== '').length;
    this.visitedCount = this.visitedQuestions.filter((visited: any) => visited).length;
    this.confirmationModal = true;
  }

  onOptionSelected(option: string, index: number): void {
    this.selectedOptions[this.currentQuestionIndex] = option;
  }

  confirmSubmit(): void {
    this.submitExam();
    this.authService.logout()
    // this.router.navigate(['/dashboard/student']);
    
  }

  submitExam(): void {
    const attempted = this.selectedOptions.filter(
      (option) => option !== ''
    ).length;
    const notVisited =
      this.questions.length -
      this.selectedOptions.filter((option) => option !== undefined).length;
    const unattempted = this.questions.length - attempted - notVisited;

    if (!this.examId) {
      console.error('Exam ID is undefined');
      return;
    }

    const confirmSubmit = confirm(`You have:
      - Attempted: ${attempted}
      - Unattempted: ${unattempted}
      - Not visited: ${notVisited}
      Do you want to submit the exam?`);
    if (confirmSubmit) {
      this.examPortalService
        .submitResponses(this.examId, this.selectedOptions)
        .subscribe(
          (response) => {
            console.log('Exam submitted successfully');
            this.authService.logout()
            // this.router.navigate(['/dashboard/student']);
          },
          (error) => {
            console.error('Error submitting exam:', error);
          }
        );
    }
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'F11' || (event.ctrlKey && event.key === 'F')) {
      event.preventDefault();
    }
  }

  handleContextMenu(event: MouseEvent): void {
    event.preventDefault();
  }

  handleBeforeUnload(event: BeforeUnloadEvent): void {
    if (!this.canLeavePage) {
      event.preventDefault();
      event.returnValue = ''; // Prompt the user to confirm leaving the page
    }
  }

  @HostListener('document:fullscreenchange', ['$event'])
  fullscreenListener() {
    if (!document.fullscreenElement) {
      this.enterFullscreen();
    }
  }

  enterFullscreen(): void {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } 
    this.fullscreenChange.emit(true);
  }
}
