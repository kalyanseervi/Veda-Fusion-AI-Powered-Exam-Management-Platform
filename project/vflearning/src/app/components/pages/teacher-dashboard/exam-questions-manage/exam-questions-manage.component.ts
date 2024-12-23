import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ExamQuestionsListComponent } from './exam-questions-list/exam-questions-list.component';
import { ExamQuestionsGenerateComponent } from './exam-questions-generate/exam-questions-generate.component';
import { CommonModule } from '@angular/common';
import { ExamService } from '../../../../services/exam/exam.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { QuestionsService } from '../../../../services/questions/questions.service';

@Component({
  selector: 'app-exam-questions-manage',
  standalone: true,
  imports: [
    ExamQuestionsListComponent,
    RouterModule,
    ExamQuestionsGenerateComponent,
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './exam-questions-manage.component.html',
  styleUrl: './exam-questions-manage.component.css',
})
export class ExamQuestionsManageComponent implements OnInit {
  selectedExamId: string | null = null;
  examForm!: FormGroup;
  showQuestionTypeFields: { [key: string]: boolean } = {};
  mcqOutput: string = '';
  iscompleteMcqOutput = false
  completeMcqOutput:any
  isProcessing = false;
  errorMessage: string | null = null;
  examId: string='';
  pdfFile: File | null = null;
  

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private examService: ExamService,
    private examQuestionsService: QuestionsService
  ) {}

  ngOnInit(): void {
    // Retrieve the selectedExamId from the route parameters
    this.selectedExamId = this.route.snapshot.paramMap.get('selectedExamId');
    this.initializeForm();
    // You can now use the selectedExamId in your component logic
    
  
  }

  examQuestionsCreate() {
    this.router.navigate([`exam-questions-create`, this.selectedExamId], {
      relativeTo: this.route,
    });
  }

  isPopupVisible = false;

  openPopup(): void {
    this.isPopupVisible = true;
  }

  closePopup(): void {
    this.isPopupVisible = false;
  }

  // Method to handle file selection and update the form with selected file
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.pdfFile = input.files[0]; // Store the selected file in pdfFile variable
    }
  }

  initializeForm() {
    this.examForm = this.fb.group({
      class: ['', Validators.required],
      subject: ['', Validators.required],
      topics: [''],
      pdfInput: [null],
      questionTypes: this.fb.group({
        mcq: this.fb.group({
          count: [0],
          marks: [0],
        }),
        short_answer: this.fb.group({
          count: [0],
          marks: [0],
        }),
        long_answer: this.fb.group({
          count: [0],
          marks: [0],
        }),
        yes_no: this.fb.group({
          count: [0],
          marks: [0],
        }),
        fill_in_the_blanks: this.fb.group({
          count: [0],
          marks: [0],
        }),
      }),
      difficulty_levels: ['easy'],
      total_marks: [{ value: '', disabled: true }],
    });
  }

  onQuestionTypeChange(type: string, event: Event) {
    const checkbox = event.target as HTMLInputElement;
    this.showQuestionTypeFields[type] = checkbox.checked;
    this.updateTotalMarks();
  }

  updateTotalMarks() {
    const questionTypes = this.examForm.get('questionTypes')?.value;
    const totalMarks = Object.keys(questionTypes).reduce((total, type) => {
      const count = parseFloat(questionTypes[type].count) || 0;
      const marks = parseFloat(questionTypes[type].marks) || 0;
      return total + count * marks;
    }, 0);
    this.examForm.get('total_marks')?.setValue(totalMarks);
  }

  onSubmit(): void {
    if (this.examForm.valid) {
      this.isProcessing = true;
      this.mcqOutput = '';

      const formData = new FormData();
      const formValue = this.examForm.value;

      // Append form values to FormData
      Object.keys(formValue).forEach((key) => {
        if (key === 'pdfInput') return;
        if (formValue[key] !== null && formValue[key] !== '') {
          if (key === 'questionTypes') {
            Object.keys(formValue[key]).forEach((qType) => {
              Object.keys(formValue[key][qType]).forEach((subKey) => {
                formData.append(
                  `questionTypes[${qType}][${subKey}]`,
                  formValue[key][qType][subKey]
                );
              });
            });
          } else {
            formData.append(key, formValue[key]);
          }
        }
      });

      // Append PDF file if available
    if (this.pdfFile instanceof File) {  // Check if pdfFile is a File object
      formData.append('pdfInput', this.pdfFile, this.pdfFile.name);  // Append file
    } else {
      console.error('PDF file is not valid');
    }

      // Subscribe to the response stream
      this.examService.genQuestions(formData).subscribe({
        next: (chunk) => {
          // Append each chunk to mcqOutput
          this.mcqOutput += chunk;
        },
        error: (err) => {
          this.errorMessage = `Error: ${err.message}`;
          this.isProcessing = false;
        },
        complete: () => {
          this.isProcessing = false;
          

          try {
            const parsedResponse = this.cleanAndParseResponse(this.mcqOutput);
            this.iscompleteMcqOutput =true

            this.completeMcqOutput =parsedResponse.questions;
            if(!this.completeMcqOutput){
              this.completeMcqOutput =parsedResponse;
              console.log('completed mcq output',this.completeMcqOutput)

            }
          } catch (e) {
            console.error('Error parsing final response:', e);
            this.errorMessage = 'Error parsing final response';
          }
        },
      });
    }
  }
  displayQuestions(questions: any) {
    throw new Error('Method not implemented.');
  }

  cleanAndParseResponse(response: string): any {
    try {
      // Remove unwanted characters
      let cleanedResponse = response
        .replace(/```json/g, '') // Remove "```json"
        .replace(/```/g, '') // Remove "```"
        .trim(); // Trim whitespace

      // Log cleaned response for debugging
     

      // Parse JSON
      const parsedResponse = JSON.parse(cleanedResponse);
      return parsedResponse;
    } catch (e) {
      console.error('Error parsing response:', e);
      throw new Error('Error parsing response');
    }
  }


  saveResponse():void{
    const response = this.completeMcqOutput;
   

    const submittedQuestions = response.map(
      (question: {
        question_type: any;
        question: any;
        marks: any;
        word_limit: any;
        answer: any;
        options: any;
        imageUrl: any;
      }) => ({
        type: question.question_type,
        title: question.question,
        marks: question.marks,
        wordLimit: question.question_type === 'short'|| question.question_type === 'short_answer' ? 30 : question.question_type === 'long'||question.question_type === 'long_answer' ? 400 : 50,
        answer: question.answer,
        options: Array.isArray(question.options) ? question.options : [], // Ensure options is an array "short_answer", "long_answer"
        imageUrl: question.imageUrl,
      })
    );

    this.examQuestionsService
        .createExamQuestion({ examId:this.selectedExamId, questions: response })
        .subscribe({
          next: (response) => {
            console.log('Questions successfully submitted:', response);
            // Reset the form and clear fields after successful submission
          },
          error: (error) => {
            alert('something went wrong')
            console.error('Error submitting questions:', error);
            // Handle errors, e.g., show an error message to the user
          },
          complete:()=>{
            alert('response sumbmitted Scuccessfully')
          }
        });

  }
}
