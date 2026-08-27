import { Component, inject, signal } from '@angular/core';
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
import { MatSnackBar } from '@angular/material/snack-bar';
import { Trash } from '../trash/trash';

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
    EmailRow,
    EmailDetails,
    Drafts,
    Trash
  ],
  templateUrl: './kmail-home.html',
  styleUrl: './kmail-home.scss',
})
export class KmailHome {

  private _snackBar = inject(MatSnackBar);
  durationInSeconds = signal(5);
  emailService = inject(EmailService);  // Inject EmailService
  emails: EmailInterface[] = [];   // Store all emails here
  draftEmails: EmailInterface[] = [];   // Store draft emails
  currentUserEmail = '';
  dialog = inject(MatDialog);  //inject MatDialog
  router = inject(Router);

  selectedFolder = 'inbox';
  // selectedFolder = 'all';
  searchText = '';
  selectedEmail: EmailInterface | null = null;
  // EmailInterface | null -- hold properties  one of 2 things . interface or null .
  //  =null -- indicates when application loaded no email selected


  // Get only Primary emails
  get primaryEmails(): EmailInterface[] {
    return this.emails.filter(
      email => email.category === 'primary' && !email.archived && !email.trashed
    );
  }

  // Get only promotion emails
  get promotionEmails(): EmailInterface[] {
    return this.emails.filter(
      email => email.category === 'promotions' && !email.archived && !email.trashed
    );
  }

  // Get only Social emails
  get socialEmails(): EmailInterface[] {
    return this.emails.filter(
      email => email.category === 'social' && !email.archived && !email.trashed
    );
  }

  // Get all emails except drafts
  get allEmails(): EmailInterface[] {
    return this.filteredEmails.filter(
      email => email.category !== 'draft' && !email.trashed
    );
  }

  // Get only sent emails
  get sentEmails(): EmailInterface[] {
    return this.filteredEmails.filter(
      email => email.category === 'sent' &&  email.senderEmail === this.currentUserEmail && !email.trashed
    );
  }

  // Get only starred emails
  get starredEmails(): EmailInterface[] {
    return this.filteredEmails.filter(
      email => email.starred === true && !email.trashed
    );
  }

  // Get only trashed emails
  get trashedEmails(): EmailInterface[] {
    return this.filteredEmails.filter(
      email => email.trashed === true
    );
  }

//runs right after a draft is successfully sent
  draftSent(sentDraft: EmailInterface) {
    console.log('Removing sent draft:', sentDraft.id);

    // Remove the sent draft from the screen immediately
    //means  --  // Look through all drafts and keep only the ones that were NOT just sent
    this.draftEmails = this.draftEmails.filter(
      draft => draft.id !== sentDraft.id
    );

  }

  //if user is not logged in -- goes to sign page , if logged in --  load mails
  //for add account tab -- storing in session storage, normal tab -- local storage
  ngOnInit() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') || localStorage.getItem('isLoggedIn');

    if (isLoggedIn !== 'true') {
      this.router.navigate(['/signin']);
      return;
    }

    // Get current logged-in user's email
  this.currentUserEmail = sessionStorage.getItem('username') || localStorage.getItem('username') || '';
    console.log('Current user:', this.currentUserEmail);
  
    this.loadEmails();
  }

//to check if the email belongs to the current user (either as a recipient or the sender)
  isMyEmail(email: EmailInterface): boolean {
  const receivedByMe = (email.to || '')
    .split(',')
    .map(value => value.trim())
    .includes(this.currentUserEmail);

    // Compares the sender's email directly with the current user's email
  const sentByMe = email.senderEmail === this.currentUserEmail;
  
  // Returns true --if the user either received it OR sent it
  return receivedByMe || sentByMe;
}

  // Get emails from the db.json
 loadEmails() { 
  this.emailService.getEmails().subscribe({
    next: (response) => {

      // Store emails belonging to current user
      this.emails = response.filter(email =>
        this.isMyEmail(email)
      );

      // Get drafts separately
      this.draftEmails = this.emails.filter(
        email =>
          email.category === 'draft' &&
          email.senderEmail === this.currentUserEmail &&
          !email.trashed
      );

      console.log('Emails for:', this.currentUserEmail);
      console.log(this.emails);

      console.log('Drafts:', this.draftEmails);
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

  archiveEmail(email: EmailInterface) {
    email.archived = true;   // Change archived from false to true
    // Save the change to db.json
    this.emailService.updateEmail(email).subscribe({
      next: (response) => {
        console.log('Email archived successfully');
        // this.toastr.success("Email archived successfully");

        //show snackbar
        this._snackBar.open('Email archived', 'Dismiss',
          {
            duration: 5000
          }
        );

        this.loadEmails();  // Reload emails
      },

      error: (error) => {
        console.error('Error archiving email:', error);
      }
    });
  }

  deleteEmail(email: EmailInterface) {
    email.trashed = true; // Mark email as trashed
    //means,email is now in trash

    // Save change to db.json
    this.emailService.updateEmail(email).subscribe({

      next: (response) => {
        console.log('Email moved to Trash');
        // this.toastr.success('Email moved to Trash', 'Trash');
        this.openSnackBar();  // Show Snackbar
        this.loadEmails(); // Reload emails
      },

      error: (error) => {
        console.error('Error moving email to Trash:', error);
      }

    });
  }

  openSnackBar() {
    this._snackBar.open('Email moved to Trash',
      'Dismiss',
      {
        duration: this.durationInSeconds() * 1000,
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
    this.selectedEmail = null;
    this.selectedFolder = 'inbox';
  }

  openAllMail() {
    this.selectedEmail = null;
    this.selectedFolder = 'all';
  }

  openSent() {
    this.selectedEmail = null;
    this.selectedFolder = 'sent';
  }

  //test method for incoming mails
  testIncomingEmails() {
    const email: EmailInterface = {
      sender: 'Instagram',
      senderEmail: 'instagram@example.com',
      to: this.currentUserEmail,
      subject: 'Someone liked your post',
      message: 'Your friend liked your post and mentioned you.',
      category: 'primary', //i know its 'social' but to test given as 'primary'
      date: new Date().toISOString(),
      read: false,
      starred: false,
      archived: false,
      trashed: false

    };

    this.emailService.addIncomingEmail(email).subscribe({
      next: (response) => {
        console.log('Incoming email added:', response);
        console.log('Category:', response.category);
        this.loadEmails();

      },

      error: (error) => {
        console.error('Error adding incoming email:', error);
      }
    });

  }

  openStarred() {
    this.selectedEmail = null;   //closes the email
    this.selectedFolder = 'starred'; //chooses the folder
  }

  openDrafts() {
    this.selectedEmail = null;
    this.selectedFolder = 'drafts';
  }

  openTrash() {
    this.selectedEmail = null;
    this.selectedFolder = 'trash';
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
