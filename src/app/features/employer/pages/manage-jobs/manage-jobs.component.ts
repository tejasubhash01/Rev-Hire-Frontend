import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EmployerService, JobPostSummary } from '../../../../core/services/employer.service';
import { JobService } from '../../../../core/services/job.service';

@Component({
  selector: 'app-manage-jobs',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './manage-jobs.component.html',
  styleUrls: ['./manage-jobs.component.css']
})
export class ManageJobsComponent implements OnInit {
  jobs: JobPostSummary[] = [];
  loading = true;
  error = '';

  constructor(
    private employerService: EmployerService,
    private jobService: JobService
  ) {}

  ngOnInit() {
    this.loadJobs();
  }

  loadJobs() {
    this.employerService.getMyJobs().subscribe({
      next: (jobs) => {
        this.jobs = jobs;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to load jobs.';
        this.loading = false;
      }
    });
  }

  closeJob(id: number) {
    if (confirm('Are you sure you want to close this job? It will no longer be visible to applicants.')) {
      this.jobService.closeJobPost(id).subscribe({
        next: () => this.loadJobs(),
        error: (err) => console.error(err)
      });
    }
  }

  reopenJob(id: number) {
    if (confirm('Reopen this job? It will become active again.')) {
      this.jobService.reopenJobPost(id).subscribe({
        next: () => this.loadJobs(),
        error: (err) => console.error(err)
      });
    }
  }

  markFilled(id: number) {
    if (confirm('Mark this job as filled? This will close it and mark as filled.')) {
      this.jobService.markJobFilled(id).subscribe({
        next: () => this.loadJobs(),
        error: (err) => console.error(err)
      });
    }
  }

  deleteJob(id: number) {
    if (confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      this.jobService.deleteJobPost(id).subscribe({
        next: () => this.loadJobs(),
        error: (err) => console.error(err)
      });
    }
  }

  getStatus(job: JobPostSummary): string {
    if (job.isFilled) return 'Filled';
    if (job.isActive) return 'Active';
    return 'Closed';
  }
}
