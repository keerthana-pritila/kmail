import { Component, inject } from '@angular/core';
import { EmailService } from '../email-service';
import { EmailInterface } from '../email-interface';
import { EmailRow } from '../email-row/email-row';

@Component({
  selector: 'app-trash',
  imports: [EmailRow],
  templateUrl: './trash.html',
  styleUrl: './trash.scss',
})
export class Trash {
  emailService = inject(EmailService);
  emails: EmailInterface[] = [];

   ngOnInit() {
    this.loadTrashEmails();
  }

  // Get emails from db.json
  loadTrashEmails() {
    this.emailService.getEmails().subscribe({
      next: (response) => {

        // Only show emails that are in Trash
        this.emails = response.filter(
          email => email.trashed === true
        );
        console.log('Trash emails:', this.emails);
      },

      error: (error) => {
        console.error('Error loading Trash emails:', error);
      }
    });
  }

}
