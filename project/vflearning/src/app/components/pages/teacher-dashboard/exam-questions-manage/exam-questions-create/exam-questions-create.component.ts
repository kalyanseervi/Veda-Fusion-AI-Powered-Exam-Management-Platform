import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { QuestionsService } from '../../../../../services/questions/questions.service';

@Component({
  selector: 'app-exam-questions-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './exam-questions-create.component.html',
  styleUrls: ['./exam-questions-create.component.css'],
})
export class ExamQuestionsCreateComponent implements OnInit {
  selectedExamId: string | null = null;
  questionsForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private examQuestionsService: QuestionsService
  ) {
    this.questionsForm = this.fb.group({
      questions: this.fb.array([this.createQuestionFormGroup()]),
    });
  }

  ngOnInit(): void {
    // Retrieve the selectedExamId from the route parameters
    this.selectedExamId = this.route.snapshot.paramMap.get('selectedExamId');
    console.log('Selected Exam ID:', this.selectedExamId);
  }

  createQuestionFormGroup(): FormGroup {
    return this.fb.group({
      type: ['mcq', Validators.required],
      title: ['', Validators.required],
      marks: [null, Validators.required],
      wordLimit: [null],
      answer: ['', Validators.required],
      options: this.fb.array([]),
      imageUrl: [''],
    });
  }

  get questions(): FormArray {
    return this.questionsForm.get('questions') as FormArray;
  }

  addQuestion() {
    this.questions.push(this.createQuestionFormGroup());
  }

  removeQuestion(index: number) {
    this.questions.removeAt(index);
  }

  addOption(questionIndex: number) {
    const options = this.getOptionsControl(questionIndex);
    options.push(this.fb.control('', Validators.required));
  }

  removeOption(questionIndex: number, optionIndex: number) {
    const options = this.getOptionsControl(questionIndex);
    options.removeAt(optionIndex);
  }

  onQuestionTypeChange(index: number) {
    const question = this.questions.at(index) as FormGroup;
    const type = question.get('type')?.value;

    if (type === 'mcq') {
      this.populateOptions(question);
    } else {
      this.clearOptions(question);
    }
  }

  populateOptions(question: FormGroup) {
    const options = question.get('options') as FormArray;
    while (options.length) {
      options.removeAt(0);
    }
    // Example options, adjust as needed
    ['Option 1', 'Option 2'].forEach((option) =>
      options.push(this.fb.control(option))
    );
  }

  clearOptions(question: FormGroup) {
    const options = question.get('options') as FormArray;
    while (options.length) {
      options.removeAt(0);
    }
  }

  onImageUpload(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const question = this.questions.at(index) as FormGroup;
        question.get('imageUrl')?.setValue(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.questionsForm.valid) {
      // Prepare data for submission
      const examId = this.selectedExamId;
      const submittedQuestions = this.questionsForm.value.questions.map(
        (question: {
          type: any;
          title: any;
          marks: any;
          wordLimit: any;
          answer: any;
          options: any;
          imageUrl: any;
        }) => ({
          type: question.type,
          title: question.title,
          marks: question.marks,
          wordLimit: question.wordLimit,
          answer: question.answer,
          options: Array.isArray(question.options) ? question.options : [], // Ensure options is an array
          imageUrl: question.imageUrl,
        })
      );

      console.log('Submitted Questions:', submittedQuestions);

      // Assuming you have a service method to handle the POST request
      this.examQuestionsService
        .createExamQuestion({ examId, questions: submittedQuestions })
        .subscribe({
          next: (response) => {
            console.log('Questions successfully submitted:', response);
            // Reset the form and clear fields after successful submission
            this.questionsForm.reset();
            this.questions.clear();
            this.addQuestion(); // Add an empty question form group to start with
          },
          error: (error) => {
            console.error('Error submitting questions:', error);
            // Handle errors, e.g., show an error message to the user
          },
        });
    } else {
      console.log('Form is invalid');
      // Optionally, trigger form validation feedback
    }
  }

  getOptionsControl(questionIndex: number): FormArray {
    const question = this.questions.at(questionIndex) as FormGroup;
    return question.get('options') as FormArray;
  }

  getQuestionType(index: number): string {
    const question = this.questions.at(index) as FormGroup;
    return question.get('type')?.value || '';
  }

  getWordLimit(index: number): number | null {
    const question = this.questions.at(index) as FormGroup;
    return question.get('wordLimit')?.value || null;
  }
}
