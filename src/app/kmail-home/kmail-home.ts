import { Component, inject } from '@angular/core';
import { Header } from '../header/header';
import { EmailRow } from '../email-row/email-row';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { EmailService } from '../email-service';
import { EmailInterface } from '../email-interface';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { Compose } from '../compose/compose';
import { Router } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { EmailDetails } from '../email-details/email-details';
import { Drafts } from '../drafts/drafts';


@Component({
  selector: 'app-kmail-home',
  imports: [
    Header,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatCheckboxModule,
    MatDialogModule,
    EmailRow ,
    EmailDetails,
    Drafts
  ],
  templateUrl: './kmail-home.html',
  styleUrl: './kmail-home.scss',
})
export class KmailHome {

  emailService = inject(EmailService);  // Inject EmailService
  emails: EmailInterface[] = [];   // Store all emails here
  dialog = inject(MatDialog);  //inject MatDialog
  router = inject(Router);

  selectedFolder = 'inbox';
  searchText = '';
  selectedEmail: EmailInterface | null = null;
  // EmailInterface | null -- hold properties  one of 2 things . interface or null .
  //  =null -- indicates when application loaded no email selected
  

  // Get only Primary emails
  get primaryEmails(): EmailInterface[] {
    return this.filteredEmails.filter(
      email => email.category === 'primary'
    );
  }

  // Get only promotion emails
  get promotionEmails(): EmailInterface[] {
    return this.filteredEmails.filter(
      email => email.category === 'promotions'
    );
  }

  // Get only Social emails
  get socialEmails(): EmailInterface[] {
    return this.filteredEmails.filter(
      email => email.category === 'social'
    );
  }

  // Get only sent emails
  get sentEmails(): EmailInterface[] {
    return this.filteredEmails.filter(
      email => email.category === 'sent'
    );
  }

  // Get only starred emails
  get starredEmails(): EmailInterface[] {
    return this.filteredEmails.filter(
      email => email.starred === true
    );
  }

  //if user is not logged in -- goes to sign page , if logged in --  load mails
  ngOnInit() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
      this.router.navigate(['/signin']);
      return;
    }
    this.loadEmails();
  }
 

  // Get emails from the db.json
  loadEmails() {
    this.emailService.getEmails().subscribe({
      next: (response) => {
        //  this Store API response
        this.emails = response;
        console.log('Emails:', this.emails);
      },

      error: (error) => {
        console.error('Error loading emails:', error);
      }
    });
  }

  toggleStar(email: EmailInterface) {
    email.starred = !email.starred;
    this.emailService.updateEmail(email).subscribe({
      next: (response) => {
        console.log('Star updated', response);
      },
      error: (error) => {
        console.error('Error updating star', error);
      }
    });

  }
  //user searches 
  searchEmails(text: string) {
    this.searchText = text.toLowerCase(); //converts all its letters to lowercase
  }

  //get filtered emails -- angular checks sender,subj,msg
  get filteredEmails(): EmailInterface[] {

    if (!this.searchText) {
      return this.emails;
    }

    return this.emails.filter(email =>
      email.sender.toLowerCase().includes(this.searchText) ||
      email.subject.toLowerCase().includes(this.searchText) ||
      email.message.toLowerCase().includes(this.searchText)
    );
  }


  openCompose() {
    const dialogRef = this.dialog.open(
      Compose,
      {
        width: '500px',
        position: {
          right: '25px',
          bottom: '25px'
        },

        panelClass: 'compose-dialog',
        disableClose: true
      });
    dialogRef.afterClosed().subscribe({
      next: (result) => {
        if (result) {
          this.loadEmails(); // Reload emails
        }
      }
    });
  }

  openInbox() {
    this.selectedFolder = 'inbox';
  }

  openSent() {
    this.selectedFolder = 'sent';
  }

  openStarred() {
    this.selectedFolder = 'starred';
  }

  openDrafts() {
  this.selectedFolder = 'drafts';
}

  openEmail(email: EmailInterface) {
  this.selectedEmail = email;

    // Mark email as read
  if (!email.read) {
    email.read = true;
    this.emailService.updateEmail(email).subscribe({
      // next: (response) => {
      //   console.log('Email marked as read', response);
      // },

      error: (error) => {
        console.error('Error updating email', error);
      }
    });
  }
}

closeEmail() {
  this.selectedEmail = null;
}

}
