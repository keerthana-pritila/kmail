import { Component, inject, signal, ChangeDetectorRef } from '@angular/core';
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
import { ConfirmationDialog } from '../confirmation-dialog/confirmation-dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

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
    Trash,
    ConfirmationDialog,
    MatTooltipModule
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
      email =>
        email.category === 'primary' &&
        !email.archived &&
        !email.trashed &&
        !email.snoozed
    );
  }

  // Get only promotion emails
  get promotionEmails(): EmailInterface[] {
    return this.emails.filter(
      email =>
        email.category === 'promotions' &&
        !email.archived &&
        !email.trashed &&
        !email.snoozed
    );
  }

  // Get only Social emails
  get socialEmails(): EmailInterface[] {
    return this.emails.filter(
      email =>
        email.category === 'social' &&
        !email.archived &&
        !email.trashed &&
        !email.snoozed
    );
  }

  // Get all emails
get allEmails(): EmailInterface[] {
  return this.filteredEmails.filter(
    email => !email.trashed
  );
}


  // Get only sent emails
  get sentEmails(): EmailInterface[] {
    return this.filteredEmails.filter(
      email => email.category === 'sent' && email.senderEmail === this.currentUserEmail && !email.trashed
    );
  }

  // Get only starred emails
  get starredEmails(): EmailInterface[] {
    return this.filteredEmails.filter(
      email => email.starred === true && !email.trashed
    );
  }

  //Get only snoozed emails
  get snoozedEmails(): EmailInterface[] {
    return this.filteredEmails.filter(
      email =>
         email.snoozed === true &&
         !email.archived &&
         !email.trashed
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
        console.error('Error updating star:', error);

        // Restore previous state if API fails
        this.replaceEmail(email);
      }

    });

  }

  //snooze email
  snoozeEmail(event :
    {
      email: EmailInterface;
       snoozeUntil: string;
    }
    ) {
    const email = event.email;  //selected email
    const snoozeUntil = event.snoozeUntil;   // Time selected from snooze menu
    const originalEmail = { ...email }; // Remember original email

    //Create updated snoozed email
    const snoozedEmail: EmailInterface = {
      ...email,
      snoozed: true,
      snoozedUntil: snoozeUntil,
      selected: false
    };

    //Remove email from Inbox immediately
    this.replaceEmail(snoozedEmail);

    // Save the snoozed email in db.json
    this.emailService.updateEmail(snoozedEmail).subscribe({

      next: () => {

           // Format selected time for snackbar
        const displayTime = new Date (
          snoozeUntil
        ).toLocaleString([],{
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit'
        });

        //show snackBar
        const snackBarRef = this._snackBar.open(
          `Email snoozed until ${displayTime}`,
          'UNDO',
          {
            duration: 5000
          }
        );

        // UNDO clicked
        snackBarRef.onAction().subscribe(() => {
          console.log('Undo snooze clicked');

        //  Create restored email
        const restoredEmail: EmailInterface = {
          ...originalEmail,
          snoozed: false,
          snoozedUntil: '',
          selected: false
        };
         // Immediately put email back into UI
        this.replaceEmail(restoredEmail);

        //save restored email to db.json
        this.emailService.updateEmail(restoredEmail).subscribe({
          next: (response) => {
             // Use server response
            this.replaceEmail({
              ...response,
              selected: false
            });
            //show confirmation
            this._snackBar.open(
              'snooze undone',
              'dismiss',
              {
                duration:3000,
              }
            );
          },
          error:() =>{
              // If restore fails,
            // put the email back into snoozed state
            this.replaceEmail({
              ...snoozedEmail,
              snoozed: true,
              selected: false
            });
            this._snackBar.open(
              'could not undo snooze',
              'Dismiss',
              {
                duration: 3000
              }
            );
          }
        });

        });
      },

      error: () => {

        // If API fails(snooze fails), bring the email back
        this.replaceEmail(originalEmail);

        this._snackBar.open(
          'Could not snooze email',
          'Dismiss',
          {
            duration: 3000
          }
        );
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
              console.error('Error restoring email:', error);

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
        console.error('Error archiving email:', error);

        // If archive fails,
        // restore the original email
        this.replaceEmail({
          ...originalEmail,
          selected: false
        });

      }

    });

  }


  // Delete email and  UNDO
deleteEmail(email: EmailInterface) {

  // Remember the original email
  const originalEmail = { ...email };

  // Create trashed email
  const trashedEmail: EmailInterface = {
    ...email,
    trashed: true,
    selected: false
  };

  // Remove from current folder immediately
  this.replaceEmail(trashedEmail);

  // Save to db.json
  this.emailService.updateEmail(trashedEmail).subscribe({

    next: (response) => {

      // Use server response
      this.replaceEmail({
        ...response,
        selected: false
      });

      console.log('Email moved to Trash');

      // Shows snackbar with UNDO
      const snackBarRef = this._snackBar.open(
        'Email moved to Trash',
        'UNDO',
        {
          duration: 5000
        }
      );

      // UNDO clicked
      snackBarRef.onAction().subscribe(() => {

        console.log('Undo delete clicked');

        // Create restored email
        const restoredEmail: EmailInterface = {
          ...originalEmail,
          trashed: false,
          selected: false
        };

        // Bring email back immediately
        this.replaceEmail(restoredEmail);

        // Save restored email to db.json
        this.emailService.updateEmail(restoredEmail).subscribe({

          next: (response) => {

            console.log('Email restored successfully');

            // Use server response
            this.replaceEmail({
              ...response,
              selected: false
            });

            // Show restored message
            this._snackBar.open(
              'Email restored',
              'Dismiss',
              {
                duration: 3000
              }
            );

          },

          error: (error) => {
            console.error( 'Error restoring email:',  error );

            // If restoring fails,
            // put the email back into Trash
            this.replaceEmail({
              ...trashedEmail,
              trashed: true,
              selected: false
            });

          }

        });

      });

    },

    error: (error) => {
      console.error( 'Error moving email to Trash:',  error);

      // If moving to Trash fails,
      // restore the original email
      this.replaceEmail({
        ...originalEmail,
        selected: false
      });

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
    this.updateEmailLists();
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

  //Open compose from draft email row 
  openDraftCompose(draft: EmailInterface) {
  const dialogRef = this.dialog.open(
    Compose,
    {
      width: '500px',

      position: {
        right: '25px',
        bottom: '25px'
      },

      panelClass: 'compose-dialog',
      disableClose: true,
      data: draft
    }
  );

  dialogRef.afterClosed().subscribe({
    next: (result) => {
      if (result) {
        this.loadEmails();
      }

    }
  });
}

  replyEmail(email: EmailInterface) {
    const dialogRef = this.dialog.open(
      Compose,
      {
        width: '500px',

        position: {
          right: '25px',
          bottom: '25px'
        },
        panelClass: 'compose-dialog',

        disableClose: true,

        data: {
          mode: 'reply',
          to: email.senderEmail,
          subject: email.subject.startsWith('Re:')
            ? email.subject
            : 'Re: ' + email.subject,

          message:
            '\n\n-----------------------------\n'
            + 'On ' + email.date + ', ' +
            email.senderEmail + ' wrote:\n\n' +
            email.message
        }
      }
    );

    // After Reply is sent, reload emails
    dialogRef.afterClosed().subscribe({
      next: (result) => {
        if (result) {
          console.log("reply sent successfully");
          this.loadEmails();
          this.selectedEmail = null;  // Close the opened email
        }

      }
    });
  }


  forwardEmail(email: EmailInterface) {
    const dialogRef = this.dialog.open(
      Compose,
      {
        width: '500px',

        position: {
          right: '25px',
          bottom: '25px'
        },

        panelClass: 'compose-dialog',

        disableClose: true,

        data: {
          mode: 'forward',

          to: '',

          subject: email.subject.startsWith('Fwd:')
            ? email.subject
            : 'Fwd: ' + email.subject,

          message:
            '\n\n-----------------------------\n' +
            'Forwarded message\n\n' +
            'From: ' + email.senderEmail + '\n' +
            'To: ' + email.to + '\n' +
            'Date: ' + email.date + '\n' +
            'Subject: ' + email.subject + '\n\n' +
            email.message
        }
      }
    );

    // After Forward is sent, reload emails
    dialogRef.afterClosed().subscribe({
      next: (result) => {
        if (result) {
          console.log("Forward sent successfully");
          this.loadEmails();
          this.selectedEmail = null;  // Close the opened email
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

  //test method for Primary mails
  testPrimaryEmail() {

    const email: EmailInterface = {
      sender: 'Keer',
      senderEmail: 'keer@kmail.com',
      to: this.currentUserEmail,
      subject: 'meeting tomorrow',
      message: 'Hi, pease join meeting at 10 am',
      category: 'primary',
      date: new Date().toISOString(),
      read: false,
      starred: false,
      archived: false,
      trashed: false,
    };
    this.emailService.addIncomingEmail(email).subscribe({
      next: () => {
        this.loadEmails();
      },
    });
  }

  //test method for Promotion mails
  testPromotionEmail() {

  const email: EmailInterface = {
    sender: 'Amazon',
    senderEmail: 'offers@amazon.com',
    to: this.currentUserEmail,
    subject: 'Special offer just for you!',
    message: 'Get amazing discounts on selected products today.',
    category: 'promotions',
    date: new Date().toISOString(),
    read: false,
    starred: false,
    archived: false,
    trashed: false
  };
  this.emailService.addIncomingEmail(email).subscribe({
    next: () => {
      this.loadEmails();
    },

  });
}

//test method for Social mails
  testSocialEmail() {
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
      next: () => {
        this.loadEmails();
      },

    });
  }

  openStarred() {
    this.selectedEmail = null;   //closes the email
    this.selectedFolder = 'starred'; //chooses the folder

    this.clearSelections();
  }

  openSnoozed() {
    this.selectedEmail = null;
    this.selectedFolder = 'snoozed';
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

      // If this is a draft, open Compose dialog
  if (email.category === 'draft') {
    this.openDraftCompose(email);
    return;
  }

    this.selectedEmail = email;

    // Mark email as read
    if (!email.read) {
    const updatedEmail: EmailInterface = {
      ...email,
      read: true
    };

    // Update UI immediately
    this.replaceEmail(updatedEmail);

    // Save to db.json
    this.emailService.updateEmail(updatedEmail).subscribe({

      next: (response) => {
        console.log('Email marked as read');

        this.replaceEmail({
          ...response,
          selected: false
        });

        // Keep opened email updated
        this.selectedEmail = response;

      },

      error: (error) => {
        console.error( 'Error marking email as read:', error);

        // If API fails, keep it unread
        this.replaceEmail(email);

        this.selectedEmail = email;
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

    if (this.selectedFolder === 'snoozed') {
      return this.snoozedEmails;
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
          console.error('Error archiving email:', error);
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
            console.error('Error restoring email:', error);

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

  // Save the selected emails
  const selected = [...this.selectedEmails];

  if (selected.length === 0) {
    return;
  }

  // Make copies so we can restore the original emails when Undo is clicked
  const originalEmails = selected.map(email => ({ ...email }));


  // Move every selected email to Trash
  selected.forEach(email => {

    const trashedEmail: EmailInterface = {
      ...email,
      trashed: true,
      selected: false
    };

    // Update UI immediately
    this.replaceEmail(trashedEmail);

    // Save change to db.json
    this.emailService.updateEmail(trashedEmail).subscribe({

      next: (response) => {
        console.log( 'Email moved to trash:',  response.subject );
      },

      error: (error) => {
        console.error(  'Error moving email to trash:',  error);

        // Restore if API fails
        this.replaceEmail({
          ...email,
          selected: false
        });

      }

    });

  });


  // Clear selection
  this.selectedEmails = [];


  // Show Undo snackbar
  const snackBarRef = this._snackBar.open(
    `${selected.length} emails moved to Trash`,
    'UNDO',
    {
      duration: 5000
    }
  );


  // When user clicks UNDO
  snackBarRef.onAction().subscribe(() => {

    console.log('Undo delete clicked');


    // Restore every email
    originalEmails.forEach(originalEmail => {

      const restoredEmail: EmailInterface = {
        ...originalEmail,
        trashed: false,
        selected: false
      };


      // Update UI immediately
      this.replaceEmail(restoredEmail);

      // Save restored email to db.json
      this.emailService.updateEmail(restoredEmail).subscribe({

        next: (response) => {
          console.log(  'Email restored:',  response.subject );
        },

        error: (error) => {
          console.error( 'Error restoring email:', error);

          // If restore fails,
          // put the email back into Trash
          this.replaceEmail({
            ...restoredEmail,
            trashed: true,
            selected: false
          });

        }

      });

    });


    // Show restored message
    this._snackBar.open(
      `${originalEmails.length} emails restored`,
      'Dismiss',
      {
        duration: 3000
      }
    );

  });

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

  //mark emails as read
  markSelectedAsRead() {

  const selected = [...this.selectedEmails]; //Create a copy of the currently selected emails

  //If no emails are selected, stop
  if (selected.length === 0) {
    return;
  }

  selected.forEach(email => {

     // Create a new email object marked as read and unselected
    const updatedEmail: EmailInterface = {
      ...email,
      read: true,
      selected: false
    };

    // Update UI immediately
    this.replaceEmail(updatedEmail);

    // Save the update to db.json
    this.emailService.updateEmail(updatedEmail).subscribe({

       // If saving succeeds, update the UI 
      next: (response) => {

        console.log('Email marked as read:', response.subject);

        this.replaceEmail({
          ...response,
          selected: false
        });

      },

      error: (error) => {
        console.error('Error marking email as read:', error );
      }

    });

  });


  // Clear selection
  this.selectedEmails = [];


  // Show message
  this._snackBar.open(
    `${selected.length} emails marked as read`,
    'Dismiss',
    {
      duration: 3000
    }
  );

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

    this.primaryEmailList = this.filteredEmails.filter(
      email =>
        email.category === 'primary' &&
        !email.archived &&
        !email.trashed &&
        !email.snoozed
    );

    this.promotionEmailList = this.filteredEmails.filter(
      email =>
        email.category === 'promotions' &&
        !email.archived &&
        !email.trashed &&
        !email.snoozed
    );

    this.socialEmailList = this.filteredEmails.filter(
      email =>
        email.category === 'social' &&
        !email.archived &&
        !email.trashed &&
        !email.snoozed
    );

  }

  //delete forever in trash
  // Permanently delete selected emails from Trash
 
  deleteForeverSelected() {

console.log('DELETE FOREVER BUTTON CLICKED');

  const selected = [...this.selectedEmails];

  if (selected.length === 0) {
    return;
  }

  // Open confirmation dialog
  const dialogRef = this.dialog.open(
    ConfirmationDialog,
    {
      width: '400px'
    }
  );


  // Wait for user's answer
  dialogRef.afterClosed().subscribe(result => {

    // User clicked Cancel
    if (result !== true) {
      return;
    }


    // User clicked Delete forever
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

          this.updateEmailLists(); // Update lists
          this.cdr.detectChanges(); // Refresh UI

        },


        error: (error) => {
          console.error( 'Error deleting email forever:', error);
        }

      });

    });


    // Clear selected emails
    this.selectedEmails = [];

    // Show message
    this._snackBar.open(
      `${selected.length} emails deleted forever`,
      'Dismiss',
      {
        duration: 3000
      }
    );

  });

}


}
