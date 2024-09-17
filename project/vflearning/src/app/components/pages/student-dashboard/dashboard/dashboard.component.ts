import { Component, OnInit, OnDestroy } from '@angular/core';
import { DashboardService } from '../../../../services/dashbaord/dashboard.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { BaseChartDirective } from 'ng2-charts';
import { PerformanceChartComponent } from './performance-chart/performance-chart.component';
import { Chart, registerables } from 'chart.js';
import { CommonModule } from '@angular/common';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [BaseChartDirective, PerformanceChartComponent, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit, OnDestroy {
  DashboardData: any;
  exams: any[] = [];
  subjects: any[] = [];
  studentResults: any[] = [];
  filteredResults: any[] = []; // Array to store filtered results for the table
  chart: Chart | undefined;
  selectedExam: string = 'all';
  selectedSubject: string = 'all';
  averagePercentage: number | null = null; // To store the average percentage

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.dashboardService.getDashboardData().subscribe({
      next: (res) => {
        this.DashboardData = res;
        console.log(res);
      },
      error: (err) => {
        console.log(err);
      },
    });
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  loadDashboardData(): void {
    this.dashboardService.getDashboardData().subscribe((data) => {
      this.studentResults = data.studentResults;

      // Extract unique exams
      this.exams = [
        ...new Set(data.studentResults.map((result: { examId: any }) => result.examId)),
      ];

      // Extract unique subjects based on subject name
      this.subjects = Array.from(
        new Set(data.studentResults.map((result: { examId: { subject: any } }) => result.examId.subject.subjectName))
      )
        .map((subjectName) => {
          return data.studentResults.find((result: { examId: { subject: { subjectName: unknown } } }) => result.examId.subject.subjectName === subjectName)?.examId.subject;
        })
        .filter((subject, index, self) => index === self.findIndex((s) => s.subjectName === subject.subjectName));

      this.updateChartAndTable();
    });
  }

  onFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = target.value;
    const id = target.id;

    if (id === 'examFilter') {
      this.selectedExam = value;
    } else if (id === 'subjectFilter') {
      this.selectedSubject = value;
    }

    this.updateChartAndTable();
  }

  updateChartAndTable(): void {
    if (this.chart) {
      this.chart.destroy();
    }

    this.filteredResults = this.studentResults.filter((result) => {
      const matchesExam =
        this.selectedExam === 'all' || result.examId._id === this.selectedExam;
      const matchesSubject =
        this.selectedSubject === 'all' || result.examId.subject._id === this.selectedSubject;
      return matchesExam && matchesSubject;
    });

    // Calculate the average percentage for the filtered results
    const totalPercentage = this.filteredResults.reduce((sum, result) => {
      return sum + result.userResults[0].percentage;
    }, 0);

    this.averagePercentage =
      this.filteredResults.length > 0
        ? parseFloat((totalPercentage / this.filteredResults.length).toFixed(2))
        : null;

    // Create unique labels combining exam and subject names
    const labels = this.filteredResults.map(
      (result) => `${result.examId.subject.subjectName}`
    );

    // Extract corresponding percentages
    const data = this.filteredResults.map(
      (result) => result.userResults[0].percentage
    ); // Assuming single result per user

    // Create the chart
    this.chart = new Chart('performanceChart', {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Percentage',
            data: data,
            backgroundColor: 'rgba(115, 192, 255, 0.6)',
            borderColor: 'rgba(115, 192, 255, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          x: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Exams and Subjects',
            },
          },
          y: {
            beginAtZero: true,
            min: 0,
            max: 100, // Ensure y-axis goes up to 100
            ticks: {
              callback: (value) => `${value}%`, // Append '%' to the tick values
            },
            title: {
              display: true,
              text: 'Percentage',
            },
          },
        },
      },
    });
  }

  getGrade(percentage: number): string {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    return 'D';
  }
}
