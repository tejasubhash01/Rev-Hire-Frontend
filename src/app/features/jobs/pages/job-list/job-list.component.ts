import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { JobService, JobPost, JobSearchFilter } from '../../../../core/services/job.service';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.css']
})
export class JobListComponent implements OnInit {
  jobs: JobPost[] = [];
  filter: JobSearchFilter = { title: '', location: '', page: 0, size: 10 };
  loading = false;
  error = '';
  totalPages = 0;
  page = 0;

  constructor(private jobService: JobService) {}

  ngOnInit() {
    this.search();
  }

  search() {
    this.loading = true;
    this.error = '';
    this.jobService.searchJobs(this.filter).subscribe({
      next: (res) => {
        this.jobs = res.content;
        this.totalPages = res.totalPages;
        this.page = res.number;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load jobs.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  changePage(newPage: number) {
    this.filter.page = newPage;
    this.search();
  }
}
