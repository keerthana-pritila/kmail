import { Component, inject,input,output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
//import { EmailService } from '../email-service';
import { EmailInterface } from '../email-interface';
import { MatDialog } from '@angular/material/dialog';
import { Compose } from '../compose/compose';


@Component({
  selector: 'app-drafts',
  imports: [
    MatIconModule
  ],
  templateUrl: './drafts.html',
  styleUrl: './drafts.scss',
})
export class Drafts {
  //emailService = inject(EmailService);
   dialog = inject(MatDialog);
  // currentUserEmail = '';
 // drafts: EmailInterface[] = [];
 
  // Receive drafts from KmailHome
  drafts = input.required<EmailInterface[]>();

  // Tell KmailHome that something changed(like refresh)
 draftChanged = output<EmailInterface>();

  
  openDraft(draft: EmailInterface) {

   const dialogRef =  this.dialog.open(Compose, {
      width: '500px',
      position: {
        right: '25px',
        bottom: '25px'
      },
      panelClass: 'compose-dialog',
      data: draft
    });
    //data: draft --This sends the selected draft into the Compose component
    
    //after compose dialog closes - reload drafts
    dialogRef.afterClosed().subscribe((result) => {
   
      // If draft was sent or changed
      if (result === 'sent') {
        console.log('Draft was sent');

          this.draftChanged.emit(draft);
      }
  });
  }
}
