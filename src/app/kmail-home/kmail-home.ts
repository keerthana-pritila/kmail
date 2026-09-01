import { Component, inject, signal,ChangeDetectorRef  } from '@angular/core';
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
   private cdr = inject(ChangeDetectorRef);
  emailService = inject(EmailService);  // Inject EmailService
  emails: EmailInterface[] = [];         // Store all emails here

  primaryEmailList: EmailInterface[] = [];
  promotionEmailList: EmailInterface[] = [];
  socialEmailList: EmailInterface[] = [];

  selectedEmails: EmailInterface[] = []; //store all selected emails(checkbox emails) 
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

      // Store emails belonging to current user ,also don't save selected into db.json
      //bcz selected checkbox ,star is only for UI so not reqd into json,
      // So old selections don't remain after reload
     this.emails = response
  .filter(email => this.isMyEmail(email))
  .map(email => ({
    ...email,
    selected: false
  }))
   .sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime(); //sort mails newest to oldest
  });

   // Create fresh Primary, Promotions and Social lists
      this.updateEmailLists();

      // Get drafts separately
      this.draftEmails = this.emails.filter(
        email =>
          email.category === 'draft' &&
          email.senderEmail === this.currentUserEmail &&
          !email.trashed
      );
      this.cdr.detectChanges();

      console.log('Emails for:', this.currentUserEmail);
      console.log(this.emails);

       console.log('Primary:', this.primaryEmailList);
      console.log('Promotions:', this.promotionEmailList);
      console.log('Social:', this.socialEmailList);
      console.log('Drafts:', this.draftEmails);
    },

    error: (error) => {
      console.error('Error loading emails:', error);
    }
  });
}

  // toggleStar(email: EmailInterface) {
  //   email.starred = !email.starred;
  //   this.emailService.updateEmail(email).subscribe({
  //     next: (response) => {
  //       console.log('Star updated', response);
  //     },
  //     error: (error) => {
  //       console.error('Error updating star', error);
  //     }
  //   });

  // }

  toggleStar(email: EmailInterface) {

  const updatedEmail: EmailInterface = {
    ...email,
    starred: !email.starred
  };

  // Update UI immediately
  this.replaceEmail(updatedEmail);

  // Save to db.json
  this.emailService.updateEmail(updatedEmail).subscribe({
    next: (response) => {
      console.log('Star updated');

      this.replaceEmail({
        ...response,
        selected: false
      });

    },

    error: (error) => {
      console.error( 'Error updating star:', error);

      // Restore previous state if API fails
      this.replaceEmail(email);
    }

  });

}

  //archive email
archiveEmail(email: EmailInterface) {

  // Remember the original values
  const originalEmail = { ...email };

  // Create the new archived part
  const archivedEmail: EmailInterface = {
    ...email,
    archived: true,
    selected: false
  };

  // Update UI immediately
  this.replaceEmail(archivedEmail);

  // Save to db.json
  this.emailService.updateEmail(archivedEmail).subscribe({

    next: (response) => {

      console.log('Email archived successfully');

      const snackBarRef = this._snackBar.open(
        'Email archived',
        'UNDO',
        {
          duration: 5000
        }
      );

     
      // UNDO
     
      snackBarRef.onAction().subscribe(() => {
        console.log('Undo archive clicked');

        // Create a completely new email object
        const restoredEmail: EmailInterface = {
          ...originalEmail,
          archived: false,
          selected: false
        };

        // Restore immediately on screen
        this.replaceEmail(restoredEmail);

        // Save restored email to db.json
        this.emailService.updateEmail(restoredEmail).subscribe({

          next: (response) => {

            console.log('Email restored successfully');

            // Use the server response as the latest version
            this.replaceEmail({
              ...response,
              selected: false
            });

            this._snackBar.open(
              'Email restored',
              'Dismiss',
              {
                duration: 3000
              }
            );

          },

          error: (error) => {
            console.error(  'Error restoring email:',  error );

            // If restore fails,
            // put it back into archived state
            this.replaceEmail({
              ...archivedEmail,
              archived: true,
              selected: false
            });

          }

        });

      });

    },

    error: (error) => {
      console.error( 'Error archiving email:', error);

      // If archive fails,
      // restore the original email
      this.replaceEmail({
        ...originalEmail,
        selected: false
      });

    }

  });

}

//Delete email
  deleteEmail(email: EmailInterface) {

  const trashedEmail: EmailInterface = {
    ...email,
    trashed: true,
    selected: false
  };

  // Update UI immediately
  this.replaceEmail(trashedEmail);

  // Save to db.json
  this.emailService.updateEmail(trashedEmail).subscribe({

    next: (response) => {
    
      this.replaceEmail({
        ...response,
        selected: false
      });

      this.openSnackBar();
    },

    error: (error) => {

      console.error( 'Error moving email to Trash:',  error);

      // Restore if API fails
      this.replaceEmail(email);
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

    this.clearSelections(); //resets everything
  }

  openAllMail() {
    this.selectedEmail = null;
    this.selectedFolder = 'all';

    this.clearSelections();
  }

  openSent() {
    this.selectedEmail = null;
    this.selectedFolder = 'sent';

    this.clearSelections();
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

    this.clearSelections();
  }

  openDrafts() {
    this.selectedEmail = null;
    this.selectedFolder = 'drafts';
  }

  openTrash() {
    this.selectedEmail = null;
    this.selectedFolder = 'trash';
     this.clearSelections();
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

  //checkbox select
 checkboxChanged(email: EmailInterface) {

  if (email.selected) {
    const alreadySelected = this.selectedEmails.some(
      selected => selected.id === email.id
    );

    if (!alreadySelected) {
      this.selectedEmails.push(email);
    }

  } else {
    this.selectedEmails =
      this.selectedEmails.filter(
        selected => selected.id !== email.id
      );
  }
  console.log('Selected emails:', this.selectedEmails);
}

//
allEmailsSelected(): boolean {
  const visibleEmails = this.getCurrentVisibleEmails();
  return visibleEmails.length > 0 && visibleEmails.every(email => email.selected);
}

//
getCurrentVisibleEmails(): EmailInterface[] {

  if (this.selectedFolder === 'inbox') {
     // Combine  primary, promotion, and social emails into a single flat array
        // using  spread operator (...) and return it
    return [
      ...this.primaryEmails,
      ...this.promotionEmails,
      ...this.socialEmails
    ];
  }

  if (this.selectedFolder === 'all') {
    return this.allEmails; // Return the array containing every single email
  }

  if (this.selectedFolder === 'sent') {
    return this.sentEmails;  // Return only the emails that the user has sent
  }

  if (this.selectedFolder === 'starred') {
    return this.starredEmails;  // Return the array of emails that marked with a star
  }

  if (this.selectedFolder === 'trash') {
    return this.trashedEmails;
  }

  return []; //return empty array,if above categories doesn't match
}

//select all will select all visible emails And clicking it again will unselect them
selectAllEmails(event: any) {
  const visibleEmails = this.getCurrentVisibleEmails();
  visibleEmails.forEach(email => {
    email.selected = event.checked;
  });

  if (event.checked) {
     // Create a new array containing copies of all visible emails
    this.selectedEmails = [...visibleEmails];
  } else {
     // If the checkbox was unchecked, clear out all selections completely
    this.selectedEmails = [];
  }

}

// for multiple archiveSelected
archiveSelected() {

  // Make a copy of selected emails
  const selected = [...this.selectedEmails];

  // Remember original state
  const originalEmails = selected.map(email => ({
    ...email
  }));

  
  // ARCHIVE

  selected.forEach(email => {
    const archivedEmail: EmailInterface = {
      ...email,
      archived: true,
      selected: false
    };

    this.replaceEmail(archivedEmail);

  });

  // Clear selected emails
  this.selectedEmails = [];

  // Save every email to db.json
  selected.forEach(email => {

    const archivedEmail: EmailInterface = {
      ...email,
      archived: true,
      selected: false
    };

    this.emailService.updateEmail(archivedEmail).subscribe({

      next: (response) => {

        console.log(
          'Email archived:',
          response.subject
        );

      },

      error: (error) => {
        console.error(
          'Error archiving email:',
          error
        );

      }

    });

  });

 
  // SNACKBAR

  const snackBarRef = this._snackBar.open(
    'Emails archived',
    'UNDO',
    {
      duration: 5000
    }
  );

  
  // UNDO

  snackBarRef.onAction().subscribe(() => {

    console.log('Undo archive clicked');
    originalEmails.forEach(originalEmail => {
      const restoredEmail: EmailInterface = {
        ...originalEmail,
        archived: false,
        selected: false
      };

      // Restore immediately
      this.replaceEmail(restoredEmail);

      // Save restored state
      this.emailService.updateEmail(restoredEmail).subscribe({

        next: (response) => {

          console.log(
            'Email restored:',
            response.subject
          );

          // Use server response
          this.replaceEmail({
            ...response,
            selected: false
          });

        },

        error: (error) => {
          console.error('Error restoring email:', error );

          // If restore failed,
          // keep it archived
          this.replaceEmail({
            ...originalEmail,
            archived: true,
            selected: false
          });

        }

      });

    });

    this.selectedEmails = [];

    this._snackBar.open(
      'Emails restored',
      'Dismiss',
      {
        duration: 3000
      }
    );

  });

}

//Delete selected--now multiple delete works

deleteSelected() {
  const selected = [...this.selectedEmails];
  selected.forEach(email => {

    email.trashed = true;
    email.selected = false;

    this.emailService.updateEmail(email).subscribe({
      next: () => {
        console.log('Email moved to trash:', email.subject);
      },
      error: (error) => {
        console.error('Error moving email to trash:', error);
      }
    });
  });

  this.selectedEmails = [];
  this._snackBar.open(
    'Email moved to Trash' ,
    'Dismiss' ,
    {
      duration: 3000
    }
  );
 // this.loadEmails();
}

//Star selected -- should become star
starSelected() {
  const selected = [...this.selectedEmails];
  selected.forEach(email => {

    email.starred = true;
    email.selected = false;

    this.emailService.updateEmail(email).subscribe({
      next: () => {
        console.log('Email starred:', email.subject);
      },
      error: (error) => {
        console.error('Error starring email:', error);
      }
    });

  });
  this.selectedEmails = [];
  this._snackBar.open(
    'Emails starred',
    'Dismiss',
    {
      duration: 3000
    }
  );
  //this.loadEmails();
}

//resets everything
clearSelections() {
  this.emails.forEach(email => {
    email.selected = false;
  });
  this.selectedEmails = [];
}

//new email object so angular knows to update the email row
replaceEmail(updatedEmail: EmailInterface) {
  this.emails = this.emails.map(email =>
    email.id === updatedEmail.id
      ? { ...updatedEmail }
      : email
  );
 this.updateEmailLists();

  // Tell Angular to update the UI
  this.cdr.detectChanges();
}

//to update lists
updateEmailLists() {

  this.primaryEmailList = this.emails.filter(
    email =>
      email.category === 'primary' &&
      !email.archived &&
      !email.trashed
  );

  this.promotionEmailList = this.emails.filter(
    email =>
      email.category === 'promotions' &&
      !email.archived &&
      !email.trashed
  );

  this.socialEmailList = this.emails.filter(
    email =>
      email.category === 'social' &&
      !email.archived &&
      !email.trashed
  );

}

//delete forever in trash
// Permanently delete selected emails from Trash
// Permanently delete selected emails from Trash
// Permanently delete selected emails from Trash
deleteForeverSelected() {

  const selected = [...this.selectedEmails];

  if (selected.length === 0) {
    return;
  }

  selected.forEach(email => {
    if (!email.id) {
      return;
    }

    this.emailService.deleteEmail(email.id).subscribe({
      next: () => {

        console.log(  'Email deleted forever:',  email.subject );

        // Remove email from UI
        this.emails = this.emails.filter(
          item => item.id !== email.id
        );

        // Update lists
        this.updateEmailLists();

        // Refresh UI
        this.cdr.detectChanges();

      },

      error: (error) => {
        console.error(  'Error deleting email forever:', error );
      }

    });

  });

  // Clear selected emails immediately
  this.selectedEmails = [];

  // Show snackbar
  this._snackBar.open(
    'Email deleted forever',
    'Dismiss',
    {
      duration: 3000
    }
  );
}
}
