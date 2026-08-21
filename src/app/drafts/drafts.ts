import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { EmailService } from '../email-service';
import { EmailInterface } from '../email-interface';
import { MatDialog } from '@angular/material/dialog';
import { Compose } from '../compose/compose';


@Component({
  selector: 'app-drafts',
  imports: [
    MatIconModule
  ],
  templateUrl: './drafts.html',
  styleUrl: './drafts.scss',
})
export class Drafts {
  emailService = inject(EmailService);
   dialog = inject(MatDialog);
  drafts: EmailInterface[] = [];

  ngOnInit() {
    this.loadDrafts();
  }

  loadDrafts() {
    this.emailService.getEmails().subscribe({
      next: (emails) => {
        this.drafts = emails.filter(
          email => email.category === 'draft'
        );
      },

      error: (error) => {
        console.error('Error loading drafts:', error);
      }
    });
  }
  openDraft(draft: EmailInterface) {
    this.dialog.open(Compose, {
      width: '500px',
      position: {
        right: '25px',
        bottom: '25px'
      },
      panelClass: 'compose-dialog',
      data: draft
    });
    //data: draft --This sends the selected draft into the Compose component
  }
}
