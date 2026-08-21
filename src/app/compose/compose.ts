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
  showFrom = false;      //initially 'From' is hidden

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
      validators: [
        Validators.required,
        Validators.email
      ]
    }),

    subject: new FormControl('', {
      validators: [
        Validators.required
      ]
    }),

    message: new FormControl('', {
      validators: [
        Validators.required
      ]
    })

  });

  //get logged-in user's email
  ngOnInit() {
  const username = localStorage.getItem('username') ;
  this.composeForm.controls.from.setValue(username || '');
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
    this.dialogRef.close();
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
