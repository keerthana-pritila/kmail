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

@Component({
  selector: 'app-compose',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule

  ],
  templateUrl: './compose.html',
  styleUrl: './compose.scss',
})
export class Compose {

  private _snackBar = inject(MatSnackBar);
  durationInSeconds = signal(5);
  emailService = inject(EmailService);  // Email service
  dialogRef = inject(MatDialogRef<Compose>);  // Reference to the currently opened dialog
  data = inject(MAT_DIALOG_DATA, { optional: true });
  showFrom = false;      //initially 'From' is hidden
  emailSent = false;  

  selectedFile: File | null = null;
  // : File | null: This defines the type of data allowed inside this variable. 
  //  =null -- indicates when application loaded no file selected

  selectedFileUrl: string | null = null;

  // Compose form
  composeForm = new FormGroup({

    from: new FormControl('', {
      nonNullable: true
    }), 
    
    to: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.email
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
  const username = localStorage.getItem('username') ;
  this.composeForm.controls.from.setValue(username || '');
  
  // Check if this Compose window was opened from a draft

  if (this.data) {

    //patchValue() -- puts those values back into the form
    //So when you click the draft, Compose opens with the previous information.

    this.composeForm.patchValue({
      to: this.data.to,
      subject: this.data.subject,
      message: this.data.message
    });
    this.showFrom = true;
  }

   // Detect click outside the compose window
  this.dialogRef.backdropClick().subscribe(() => {
    this.saveDraft();
    //backdropClick() detects that background click.
  });
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
    !this.selectedFile
  ) {
    this.dialogRef.close();
    return;
  }

  const draft: EmailInterface = {
    sender: 'Me',
    senderEmail: this.composeForm.controls.from.value,
    to: to,
    subject: subject,
    message: message,
    category: 'draft',

    date: new Date().toISOString(),
    read: true,
    starred: false,
    attachmentName: this.selectedFile ? this.selectedFile.name : '',
    attachmentUrl: this.selectedFileUrl ? this.selectedFileUrl : ''
  };
 // EXISTING DRAFT
  if (this.data?.id) {

    this.emailService.updateEmail(draft).subscribe({

      next: (response) => {

        console.log('Draft updated successfully');

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

        console.error(
          'Error updating draft:',
          error
        );

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
    // Create email object
    const email: EmailInterface = {

      sender: 'Me',
      senderEmail: this.composeForm.controls.from.value!,
      to: this.composeForm.controls.to.value!,
      subject: this.composeForm.controls.subject.value!,
      message: this.composeForm.controls.message.value!,
      category: 'sent',
      date: new Date().toISOString(),
      read: true,
      starred: false,
       attachmentName: this.selectedFile ? this.selectedFile.name : '',
      attachmentUrl: this.selectedFileUrl  ? this.selectedFileUrl : ''
    };


    // Save email to db.json
    this.emailService.sendEmail(email).subscribe({
      next: (response) => {
        console.log('Email sent successfully');
         this.emailSent = true;
        this.openSnackBar(); // Show snackbar

        // Close compose  dialog
        this.dialogRef.close(response);
      },
      error: (error) => {
        console.error('Error sending email', error);
      }
    });
  }

  // Cancel compose
  closeDialog() {
    if (this.emailSent) {
    this.dialogRef.close();
    return;
  }
  this.saveDraft(); 
  }

  onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;

  if (input.files && input.files.length > 0) {
    this.selectedFile = input.files[0]; //stores selected file
    this.selectedFileUrl = URL.createObjectURL(this.selectedFile);  // Create a temporary URL for the selected file
    console.log('Selected file:', this.selectedFile.name);
  }
}
}
