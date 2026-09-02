import { Component,inject } from '@angular/core';
import { MatDialogRef,MatDialogModule  } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirmation-dialog',
  imports: [MatButtonModule,MatDialogModule ],
  templateUrl: './confirmation-dialog.html',
  styleUrl: './confirmation-dialog.scss',
})
export class ConfirmationDialog {
  private dialogRef = inject(MatDialogRef<ConfirmationDialog>);

  cancel() {
    this.dialogRef.close(false);
  }

  confirm() {
    this.dialogRef.close(true);
  }

}
