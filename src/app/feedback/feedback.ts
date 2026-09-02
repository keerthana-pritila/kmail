import { Component,inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-feedback',
  imports: [
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './feedback.html',
  styleUrl: './feedback.scss',
})
export class Feedback {
  feedbackText = '';   //stores whatever the user types
  private dialogRef = inject(MatDialogRef<Feedback>);
  private snackBar = inject(MatSnackBar);

cancel() {
this.dialogRef.close();
}

sendFeedback() {

if (!this.feedbackText.trim()) {
  this.snackBar.open(
    'Please enter your feedback',
    'Dismiss',
    {
      duration: 3000
    }
  );

  return;
}

this.dialogRef.close();

this.snackBar.open(
  'Thank you for your feedback!',
  'Dismiss',
  {
    duration: 3000
  }
);

}
}
