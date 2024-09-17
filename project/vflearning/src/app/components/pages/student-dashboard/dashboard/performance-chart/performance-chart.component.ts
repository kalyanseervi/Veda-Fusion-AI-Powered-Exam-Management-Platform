import { Component, OnInit, OnDestroy } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { DashboardService } from '../../../../../services/dashbaord/dashboard.service';
import { CommonModule } from '@angular/common';

Chart.register(...registerables);

@Component({
  selector: 'app-performance-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './performance-chart.component.html',
  styleUrl: './performance-chart.component.css',
})
export class PerformanceChartComponent implements OnInit, OnDestroy {
  exams: any[] = [];
  subjects: any[] = [];
  studentResults: any[] = [];
  filteredResults: any[] = []; // Array to store filtered results for the table
  chart: Chart | undefined;
  selectedExam: string = 'all';
  selectedSubject: string = 'all';

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
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
        ...new Set(data.studentResults.map((result: { examId: any; }) => result.examId)),
      ];
  
      // Extract unique subjects based on subject name
      this.subjects = Array.from(
        new Set(data.studentResults.map((result: { examId: { subject: any; }; }) => result.examId.subject.subjectName))
      ).map(subjectName => {
        return data.studentResults.find((result: { examId: { subject: { subjectName: unknown; }; }; }) => result.examId.subject.subjectName === subjectName)?.examId.subject;
      }).filter((subject, index, self) =>
        index === self.findIndex((s) => s.subjectName === subject.subjectName)
      );
  
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
        this.selectedSubject === 'all' ||
        result.examId.subject._id === this.selectedSubject;
      return matchesExam && matchesSubject;
    });

    // Create unique labels combining exam and subject names
    const labels = this.filteredResults.map(
      (result) => `${result.examId.examName} (${result.examId.subject.subjectName})`
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
              text: 'Exams and Subjects'
            }
          },
          y: {
            beginAtZero: true,
            min: 0, // Ensure y-axis starts from 0
            max: 100, // Ensure y-axis goes up to 100
            ticks: {
              callback: (value) => `${value}%` // Append '%' to the tick values
            },
            title: {
              display: true,
              text: 'Percentage'
            }
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
