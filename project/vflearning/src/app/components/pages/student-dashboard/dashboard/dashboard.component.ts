import { Component, OnInit } from '@angular/core';
import { ExamGenResultService } from '../../../../services/examGenResult/exam-gen-result.service';
import { Chart, registerables } from 'chart.js';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  examData: any[] = [];
  chart: Chart | undefined;
  constructor(private examDataService: ExamGenResultService) {}
  ngOnInit(): void {
    this.examDataService.examData().subscribe({
      next: (data) => {
        console.log('Fetched data:', data); // Log the entire data
        this.examData = data.results;
        console.log('Results:', this.examData); // Log the results
        Chart.register(...registerables);
        this.createCharts();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  createCharts() {
    const ctx = document.getElementById('examChart') as HTMLCanvasElement;
    if (!ctx) return;

    const chartData = this.examData.map((item) => ({
      label: item.examName,
      percentage: item.userResults.percentage,
    }));
    console.log('chartName', chartData);

    this.chart = new Chart(ctx.getContext('2d') as CanvasRenderingContext2D, {
      type: 'bar',
      data: {
        labels: chartData.map((data) => data.label),
        datasets: [
          {
            label: 'Percentage',
            data: chartData.map((data) => data.percentage),
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top' as const,
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return `${context.label}: ${context.raw}%`;
              },
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Exam Name',
            },
          },
          y: {
            title: {
              display: true,
              text: 'Percentage',
            },
          },
        },
      },
    });
  }
}
