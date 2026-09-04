import { Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { EmailService } from '../email-service';
import { EmailInterface } from '../email-interface';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {MatChipInputEvent, MatChipsModule} from '@angular/material/chips';
import { AccountService } from '../account-service';

@Component({
  selector: 'app-compose',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './compose.html',
  styleUrl: './compose.scss',
})
export class Compose {

  private _snackBar = inject(MatSnackBar);
  durationInSeconds = signal(5);
  emailService = inject(EmailService);  // Email service
  accountService = inject(AccountService); //Account service
  dialogRef = inject(MatDialogRef<Compose>);  // Reference to the currently opened dialog
  data = inject(MAT_DIALOG_DATA, { optional: true });
  showFrom = false;      //initially 'From' is hidden
  emailSent = false;
  isMinimized = false;
  isMaximized = false;

  recipients: string[] = [];  //stores the email IDs entered by the user
  selectedFiles: File[] = [];  //stores multiple attached files
  selectedFileUrls: string[] = [];
  
  // Compose form
  composeForm = new FormGroup({

    from: new FormControl('', {
      nonNullable: true
    }), 
    
    to: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required
      ]
    }),

    subject: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required
      ]
    }),

    message: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required
      ]
    })

  });

  //get logged-in user's email
  ngOnInit() {
  const username =   sessionStorage.getItem('username') || localStorage.getItem('username') || '' ;
  this.composeForm.controls.from.setValue(username || '');
  
  // Check if this Compose window was opened from a draft
  if (this.data) {

    //REPLY 
    if (this.data.mode === 'reply') {

    //patchValue() -- puts those values back into the form
    //So when you click the draft, Compose opens with the previous information.

    this.composeForm.patchValue({
      to: this.data.to,
      subject: this.data.subject,
      message: this.data.message
    });
   
    //convert saved receipients into chips
    if (this.data.to) {
     this.recipients = this.data.to
    .split(',')
    .map((email: string) => email.trim())
    .filter((email: string) => email);
}
 this.showFrom = true;
  }

  //FORWARD
  else if (this.data.mode === 'forward') { 
    this.composeForm.patchValue({
       to: '', 
       subject: this.data.subject,
        message: this.data.message
       }); 
       // No recipient for Forward
         this.recipients = [];
          this.showFrom = true;
         }

  //DRAFT
    else {

       this.composeForm.patchValue({
         to: this.data.to,
          subject: this.data.subject,
           message: this.data.message 
          }); 

          // Convert saved recipients into chips
            if (this.data.to) {

               this.recipients = this.data.to
                .split(',')
                .map((email: string) => email.trim())
                .filter((email: string) => email);

                 } 
                 this.showFrom = true; 

          }
        }

   // Detect click outside the compose window
  this.dialogRef.backdropClick().subscribe(() => {

      // Do not save Reply/Forward as draft
  if (this.isReplyOrForward()) {
    this.dialogRef.close();
    return;
  }
  
   // Normal compose / draft
    this.saveDraft();
    //backdropClick() detects that background click.
  });
}

//add receipient using material chips style
addRecipient(event: MatChipInputEvent): void {
  const value = (event.value || '').trim();
  if (!value) {
    return;
  }

  // Check whether email is valid
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailPattern.test(value)) {
    this._snackBar.open(
      'Please enter a valid email address',
      'Dismiss',
      {
        duration: 3000
      }
    );
    event.chipInput.clear();
    return;
  }

  // Don't add the same email twice
  if (this.recipients.some(
    recipient => recipient.toLowerCase() === value.toLowerCase()
  )
) {

    this._snackBar.open(  'Email already added',
      'Dismiss',
      {
        duration: 3000
      }
    );

    event.chipInput.clear();
    return;
  }

  this.recipients.push(value); // Add email to recipients
  event.chipInput.clear(); // Clear the input

  //and Store all recipients inside "to"
  this.composeForm.controls.to.setValue( this.recipients.join(', ') );
  this.composeForm.controls.to.markAsTouched();  // Mark To as touched
}

//Remove receipient in chips style
removeRecipient(recipient: string): void {
  const index = this.recipients.indexOf(recipient);
  if (index >= 0) {
    this.recipients.splice(index, 1);
  }

  // Update "to" form control
  this.composeForm.controls.to.setValue( this.recipients.join(', ') );
}


//to check multiple mail ids /mail ids valid or not (like proper mail format)
isValidRecipients(): boolean {
  const value = this.composeForm.controls.to.value;
  const emails = value.split(',');      // Split emails using comma
  // (if there are multiple mails ,separated by coma)

  // Check every email
  for (let email of emails) {
    email = email.trim();             //removes extra space
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // \s --space , @ at symbol -->should not be 
    // +@ --  means it has more than 1 
    // $ -- end of line

    if (!emailPattern.test(email)) {
      return false;
    }
  }
  return true;
}

saveDraft() {

  const to = this.composeForm.controls.to.value;
  const subject = this.composeForm.controls.subject.value;
  const message = this.composeForm.controls.message.value;

  // If nothing was typed, don't create a draft
  if (
    !to &&
    !subject &&
    !message &&
    this.selectedFiles.length === 0
  ) {
    this.dialogRef.close();
    return;
  }

  const draft: EmailInterface = {
    id:this.data?.id,

    sender: 'Me',
    senderEmail: this.composeForm.controls.from.value,
    to: to,
    subject: subject,
    message: message,
    category: 'draft',
    date: new Date().toISOString(),
    read: true,
    starred: false,
    archived: false,
    trashed:false,
    attachmentName: this.selectedFiles.map(file => file.name) ,
    attachmentUrl: this.selectedFileUrls
  };
 // EXISTING DRAFT
  if (this.data?.id) {
    this.emailService.updateEmail(draft).subscribe({
      next: (response) => {
        this._snackBar.open(
          'Draft updated',
          'Dismiss',
          {
            duration: this.durationInSeconds() * 1000
          }
        );
        this.dialogRef.close(response);
      },

      error: (error) => {
        console.error( 'Error updating draft:',  error );
      }
    });
  }
 // NEW DRAFT
  else {
  // Save draft to db.json
  this.emailService.sendEmail(draft).subscribe({
    next: (response) => {
      console.log('Draft saved successfully');
      this._snackBar.open(
        'Draft saved',
        'Dismiss',
        {
          duration: this.durationInSeconds() * 1000
        }
      );

      this.dialogRef.close(response);
    },

    error: (error) => {
      console.error('Error saving draft:', error);
    }
  });
}
}

  openSnackBar() {
    this._snackBar.open('Email sent successfully', 
      'Dismiss', 
      {
      duration: this.durationInSeconds() * 1000,
    });
  } 

  // Send email
  sendEmail() {

  // Check form
  if (this.composeForm.invalid) {
    this.composeForm.markAllAsTouched();
    return;
  }

  //check multiple mail addresses
  if (!this.isValidRecipients()) {
  this._snackBar.open(
    'Please enter valid email addresses',
    'Dismiss',
    {
      duration: 5000
    }
  );
  return;
}
  // Check whether users actually exist
  this.checkRecipientsExist();
}

//to check receipients exist in kmail 
checkRecipientsExist(): void {
  const recipientEmails = this.recipients;

  this.accountService.getAccounts().subscribe({
    next: (accounts) => {
      const invalidEmails = recipientEmails.filter(recipient =>
        !accounts.some(account =>
          account.username.toLowerCase() === recipient.toLowerCase()
        )
      );

      if (invalidEmails.length > 0) {

        this._snackBar.open(
          `Address not found: ${invalidEmails.join(', ')}      X`,
          'Dismiss',
          {
            duration: 5000,
            panelClass: ['address-not-found']
          }
        );
        //panelClass: ['address-not-found'] -->This gives this snackbar a custom CSS class.
        return;
      }

      // All recipients exist
      this.sendEmailToExistingUsers();
    },

    error: (error) => {
      console.error('Error checking accounts:', error);
      this._snackBar.open(
        'Unable to check recipient address',
        'Dismiss',
        {
          duration: 5000
        }
      );

    }

  });
}

  sendEmailToExistingUsers() {

    // Create sent email
    const email: EmailInterface = {
      // If this is a draft, keep the same id
      id: this.data?.id,
      sender: 'Me',
      senderEmail: this.composeForm.controls.from.value,
      to: this.composeForm.controls.to.value,
      subject: this.composeForm.controls.subject.value,
      message: this.composeForm.controls.message.value,
      category: 'sent',
      date: new Date().toISOString(),
      read: true,
      starred: false,
      archived: false,
      trashed: false,
      attachmentName: this.selectedFiles.map(file => file.name),
      attachmentUrl: this.selectedFileUrls

    };

    // Check whether this email came from a draft
      if (this.data?.id) {
         console.log('Sending existing draft:', this.data.id);

        // UPDATE the existing draft
        // Instead of POST + DELETE
    this.emailService.updateEmail(email).subscribe({

      next: (response) => {

        console.log('Draft converted to sent email:', response);
        this.emailSent = true;
        this.openSnackBar();

        // Tell Drafts/KmailHome that draft was sent
        this.dialogRef.close('sent');
      },

      error: (error) => {
        console.error(  'Error converting draft to sent email:',  error  );
      }

    });

  }

  // NEW MAIL
  else {

    //new mail does not have  an id yet
  this.emailService.sendEmail(email).subscribe({

      next: (response) => {
        console.log('New email sent:', response);
        this.emailSent = true;
        this.openSnackBar();
        this.dialogRef.close(response);
      },

      error: (error) => {
        console.error(  'Error sending email:',  error );
      }

    });
  }
 }

 //reply or fwd mode condition
isReplyOrForward(): boolean {
  return (
    this.data?.mode === 'reply' ||
    this.data?.mode === 'forward'
  );
}

  // Cancel compose
  closeDialog() {

     // Email was already sent
    if (this.emailSent) {
    this.dialogRef.close();
    return;
  }

   // Reply or Forward (dialog closes ,will not save as draft )
  if (this.isReplyOrForward()) {
    this.dialogRef.close();
    return;
  }

   // Normal compose / draft
  this.saveDraft(); 
  }

  //select files to attach in compose
  onFileSelected(event: Event) {

  const input = event.target as HTMLInputElement;

  if (input.files && input.files.length > 0) {

    // Add new files to existing files
    for (let file of Array.from(input.files)) {

      this.selectedFiles.push(file);
      const fileUrl = URL.createObjectURL(file);
      this.selectedFileUrls.push(fileUrl);

    }
  }
  input.value = ''; // Allow selecting the same file again
}

//remove file from compose 
removeFile(index: number) {
  URL.revokeObjectURL(this.selectedFileUrls[index]); // Free up memory by releasing the temporary preview URL
  this.selectedFiles.splice(index, 1); // Remove exactly 1 file object from the array at the given index
  this.selectedFileUrls.splice(index, 1); //Remove exactly 1 preview URL from the array at the matching index
}

//minimize Compose
minimizeCompose() {

  this.isMinimized = !this.isMinimized;

  if (this.isMinimized) {

    // If it was maximized, remove maximized mode
    this.isMaximized = false;
    this.dialogRef.removePanelClass('compose-maximized');

    // Make dialog small
    this.dialogRef.updateSize('500px', '52px');

  } else {

    // Restore normal compose size
    this.dialogRef.updateSize('500px', '600px');

  }
}

//maximize Compose
maximizeCompose() {

  this.isMaximized = !this.isMaximized;

  if (this.isMaximized) {

    // If maximized, make sure it is not minimized
    // Make sure form is visible
    this.isMinimized = false;

    this.dialogRef.updateSize(
      'calc(100vw - var(--sidenav-width) - 40px)',
      '90vh'
    );

    this.dialogRef.addPanelClass('compose-maximized');

  } else {

    // Back to normal size
    this.dialogRef.updateSize('500px', '600px');

    this.dialogRef.removePanelClass('compose-maximized');

  }
}
}
