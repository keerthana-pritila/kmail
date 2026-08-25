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
      email => email.category === 'sent' && !email.trashed
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
      this.emails = response;
      console.log('Emails loaded:', this.emails);
      console.log( 'Promotion emails:',
        this.emails.filter(email =>
          email.category === 'promotions'
        )
      );

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
    this.selectedFolder = 'inbox';
  }

  openAllMail() {
    this.selectedFolder = 'all';
  }

  openSent() {
    this.selectedFolder = 'sent';
  }

  //test method for incoming mails
  testIncomingEmails() {
  const email: EmailInterface = {
    sender: 'Instagram',
    senderEmail: 'instagram@example.com',
    to: 'keerthana@kmail.com',
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
      console.error(  'Error adding incoming email:',  error );
    }
  });

}

  openStarred() {
    this.selectedFolder = 'starred';
  }

  openDrafts() {
    this.selectedFolder = 'drafts';
  }

  openTrash() {
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
