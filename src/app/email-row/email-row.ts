import { Component , input , output} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { EmailInterface } from '../email-interface';

@Component({
  selector: 'app-email-row',
  imports: [
     MatButtonModule,
    MatIconModule,
    MatCheckboxModule
  ],
  templateUrl: './email-row.html',
  styleUrl: './email-row.scss',
})
export class EmailRow {
  // Receive one email from KmailHome means
  //KmailHome will give me one email
  email = input.required<EmailInterface>();

  // Send the email back to KmailHome when star is clicked
  starClicked = output<EmailInterface>();

  // Send the email back to KmailHome when row is clicked
  emailClicked = output<EmailInterface>();

  archiveClicked = output<EmailInterface>();
  deleteClicked = output<EmailInterface>();


  // Star button clicked
  onStarClick(event: MouseEvent) {
    event.stopPropagation(); //  on star click -- Don't open the email
    this.starClicked.emit(this.email());
  }


  // Checkbox clicked
  onCheckboxClick(event: MouseEvent) {
    event.stopPropagation(); // Don't open the email
  }

  //archive clicked
  onArchiveClick(event: MouseEvent) {
  event.stopPropagation();
  //bcz Without stopPropagation(), clicking Archive could also open the email
  this.archiveClicked.emit(this.email());
}

  // Email row clicked
  onEmailClick() {
    this.emailClicked.emit(this.email());
  }

  //delete is clicked
  onDeleteClick(event: MouseEvent) {
    event.stopPropagation();
    this.deleteClicked.emit(this.email());
  }
}
