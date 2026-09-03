import { Component , input , output} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule,MatCheckboxChange  } from '@angular/material/checkbox';
import { EmailInterface } from '../email-interface';
import { DatePipe } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-email-row',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    DatePipe,
    MatTooltipModule,
    MatMenuModule
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
  snoozeClicked = output<
  {
    email : EmailInterface;
    snoozeUntil: string;
  }
  >();
  //snoozeClicked -- >so it sends email + selected  snooze time

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

//snooze clicked
// onSnoozeClick(event: MouseEvent) {
//   event.stopPropagation();              //click event stops
//   this.snoozeClicked.emit(this.email()); // Sends the current email data to the parent component
// }

  // Email row clicked
  onEmailClick() {
    this.emailClicked.emit(this.email());
    //'.emit()' --  sends an event/data up to the parent component
      // 'this.email()'-- calls a Signal to get the current value of the email object
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

//to show snooze in email row
getSnoozeTime(snoozedUntil: string | undefined): string {
if(!snoozedUntil) {
  return '';
}
const snoozeDate = new Date(snoozedUntil);
return  snoozeDate.toLocaleTimeString([], {
  hour:'numeric',
  minute:'2-digit'
});
}

//select snooze time 
selectSnoozeTime(hours: number) {

  const snoozeTime = new Date(); //Get the current date and time

  // Add selected number of hours
  snoozeTime.setHours( snoozeTime.getHours() + hours );

  // Send email + selected snooze time to parent
  this.snoozeClicked.emit({
    email: this.email(),
    snoozeUntil: snoozeTime.toISOString()
  });

}

//snooze Tomorrow
snoozeTomorrow() {
  const tomorrow = new Date();  //Get the current date and time

  tomorrow.setDate(tomorrow.getDate() + 1); //Add exactly 1 day to move the calendar to tomorrow

  // Set tomorrow to 8:00 AM(hours, minutes, seconds, milliseconds)
  tomorrow.setHours(8, 0, 0, 0);

  //Send  the snooze event with the email and the tomorrow date formatted as text
  this.snoozeClicked.emit({
    email: this.email(),
    snoozeUntil: tomorrow.toISOString()
  });

}

//SNOOZE NEXT WEEK
snoozeNextWeek() {

  const nextMonday = new Date(); //get the current date & time
  const day = nextMonday.getDay(); //get today's day of week
  const daysUntilMonday = day === 0 ? 1 : 8 - day;
  //day === 0  It checks if today is Sunday.

  //? 1 -->If today is Sunday, it sets daysUntilMonday to 1
  // If today is Sunday, we only need 1 day to reach Monday

  //: 8 - day -->If today is not Sunday, it subtracts the current day number from 8

  //Advance the date calendar forward to next Monday
  nextMonday.setDate( nextMonday.getDate() + daysUntilMonday );

  nextMonday.setHours(8, 0, 0, 0);  //Set the time to exactly 8:00 AM 

  //Send  the snooze event with the email and the target date formatted as text
  this.snoozeClicked.emit({
    email: this.email(),
    snoozeUntil: nextMonday.toISOString()
  });

}
}
