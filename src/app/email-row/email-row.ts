import { Component , input , output} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule,MatCheckboxChange  } from '@angular/material/checkbox';
import { EmailInterface } from '../email-interface';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-email-row',
  imports: [
     MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    DatePipe
  ],
  templateUrl: './email-row.html',
  styleUrl: './email-row.scss',
})
export class EmailRow {
  // Receive one email from KmailHome means
  //KmailHome will give me one email
  email = input.required<EmailInterface>();

  // Show star by default
  showStar = input(true);

  showArchive = input(true);
  showDelete = input(true);

  // Send the email back to KmailHome when star is clicked
  starClicked = output<EmailInterface>();

  // Send the email back to KmailHome when row is clicked
  emailClicked = output<EmailInterface>();

  archiveClicked = output<EmailInterface>();
  deleteClicked = output<EmailInterface>();
  checkboxChanged = output<EmailInterface>();
  

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

  //checkoxes selected 
  onCheckboxChange(event: MatCheckboxChange) {
  this.email().selected = event.checked;
  this.checkboxChanged.emit(this.email());
}

 // Display email beside  date 
displayDate(date: string): string {

  const emailDate = new Date(date);
  const today = new Date();

  // Check whether the email is from today
  const isToday =
    emailDate.getDate() === today.getDate() &&
    emailDate.getMonth() === today.getMonth() &&
    emailDate.getFullYear() === today.getFullYear();

  if (isToday) {
    // Show time for today's emails
    return emailDate.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  // Show date for older emails
  return emailDate.toLocaleDateString([], {
    month: 'short',
    day: 'numeric'
  });
}
}
