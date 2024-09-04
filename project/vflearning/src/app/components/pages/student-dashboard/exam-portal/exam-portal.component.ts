import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QuestionsService } from '../../../../services/questions/questions.service';
import { ExamService } from '../../../../services/exam/exam.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-exam-portal',
  standalone: true,
  imports: [FormsModule,CommonModule,ReactiveFormsModule],
  templateUrl: './exam-portal.component.html',
  styleUrl: './exam-portal.component.css'
})
export class ExamPortalComponent implements OnInit, OnDestroy {

  @Output() fullscreenChange = new EventEmitter<boolean>();
  examId: string | undefined;
  questions: any[] = [];
  selectedOptions: string[] = [];
  timers: number[] = [];
  currentQuestionIndex: number | undefined;
  currentQuestion: any;
  @Input() totalTime: number | undefined;

  isRunning: boolean = true;
  fullscreenEnabled = false;
  canLeavePage = false;
  userId: any;
  timerInterval: any;
  singleIndex: number | undefined;
  timerDuration: any;
  remainingTime: number = 0;
  errorMessage: string | undefined;
  wordsLeft: number | undefined;

  constructor(
    private examservice: ExamService,
    private route: ActivatedRoute,
    private examQuestionsService: QuestionsService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.examId = params['examId'];
      console.log(this.examId);

      if (this.examId) {
        this.fetchQuestions(this.examId);
        this.examservice.getExamById(this.examId).subscribe(
          (response: any) => {
            console.log(response);
            this.totalTime = response.examDuration;
            this.remainingTime = response.examDuration;

            if (this.remainingTime > 0 && this.totalTime) {
              this.totalTime *= 60;
              this.remainingTime *= 60;
            }
            this.startCountdown();
          },
          (error) => {
            console.error('Error fetching exam details:', error);
          }
        );
      }
    });

    if (this.currentQuestion?.wordLimit) {
      this.enforceWordLimit();
    }

    // Start in fullscreen mode
    this.enterFullScreen();

    // Disable keyboard and context menu events
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

  startCountdown(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.timerInterval = setInterval(() => {
      if (this.remainingTime > 0 && this.isRunning) {
        this.remainingTime--;
      } else {
        clearInterval(this.timerInterval);
        this.submitExam(); // Submit the exam if time is up
      }
    }, 1000);
  }

  fetchQuestions(examId: string): void {
    this.examQuestionsService.getExamPortalQuestions(examId).subscribe(
      (questions: any[]) => {
        this.questions = questions;
        console.log(questions);
        this.currentQuestionIndex = 0;
        this.currentQuestion = this.questions[0];
        this.selectedOptions = new Array(this.questions.length).fill('');
      },
      (error: any) => {
        console.error('Error fetching questions:', error);
      }
    );
  }

  startTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.isRunning = true;
    this.timerInterval = setInterval(() => {
      if (this.remainingTime > 0) {
        this.remainingTime--;
      } else {
        clearInterval(this.timerInterval);
        this.isRunning = false;
      }
    }, 1000);
  }

  enforceWordLimit() {
    const currentText = this.selectedOptions[this.currentQuestionIndex || 0] || '';
    const wordLimit = this.currentQuestion?.word_limit || 0;
    const wordsArray = currentText.split(/\s+/).filter(word => word.length > 0);
    const wordsTyped = wordsArray.length;

    if (wordsTyped > wordLimit) {
      // If the word limit is exceeded, truncate the text to the allowed number of words
      this.selectedOptions[this.currentQuestionIndex || 0] = wordsArray.slice(0, wordLimit).join(' ');
      this.wordsLeft = 0;
    } else {
      this.wordsLeft = wordLimit - wordsTyped;
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
    this.startTimer();
    this.enforceWordLimit();
  }

  prevQuestion(): void {
    if (this.currentQuestionIndex && this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.currentQuestion = this.questions[this.currentQuestionIndex];
      this.startTimer();
      
    }
    this.enforceWordLimit();
  }

  nextQuestion(): void {
    if (
      this.currentQuestionIndex !== undefined &&
      this.currentQuestionIndex < this.questions.length - 1
    ) {
      this.currentQuestionIndex++;
      this.currentQuestion = this.questions[this.currentQuestionIndex];
      this.startTimer();
    }
    this.enforceWordLimit();
  }

  onOptionSelected(index: number) {
    console.log(`Option ${index} selected for question ${this.currentQuestionIndex}`);
    // Additional logic can be added here if needed
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

  submitExam(): void {
    console.log('exam submitted successfully');
  }

  toggleFullScreen(): void {
    const docEl = document.documentElement as HTMLElement;

    if (!document.fullscreenElement) {
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen();
      } else if ((docEl as any).mozRequestFullScreen) {
        (docEl as any).mozRequestFullScreen();
      } else if ((docEl as any).webkitRequestFullscreen) {
        (docEl as any).webkitRequestFullscreen();
      } else if ((docEl as any).msRequestFullscreen) {
        (docEl as any).msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  @HostListener('document:fullscreenchange')
  @HostListener('document:webkitfullscreenchange')
  @HostListener('document:mozfullscreenchange')
  @HostListener('document:MSFullscreenChange')
  handleFullscreenChange() {
    this.fullscreenEnabled = !!document.fullscreenElement;
    this.fullscreenChange.emit(this.fullscreenEnabled);
    // Re-enter fullscreen if the user exits it
    if (!this.fullscreenEnabled) {
      this.enterFullScreen();
    }
  }

  handleKeyDown(event: KeyboardEvent) {
    const forbiddenKeys = ['F12', 'F5', 'Control', 'Alt'];
    if (forbiddenKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  handleContextMenu(event: MouseEvent) {
    event.preventDefault();
  }

  handleBeforeUnload(event: BeforeUnloadEvent) {
    if (!this.canLeavePage) {
      event.preventDefault();
      event.returnValue =
        'Are you sure you want to leave this page? Your progress may be lost.';
    }
  }

  enterFullScreen(): void {
    this.toggleFullScreen();
  }

  exitFullScreen(): void {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}
