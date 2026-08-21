import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { EmailInterface } from '../email-interface';

@Component({
  selector: 'app-email-details',
  imports: [
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './email-details.html',
  styleUrl: './email-details.scss',
})
export class EmailDetails {
    // receive the selected email from KmailHome
  email = input.required<EmailInterface>();

  // Tell KmailHome when back button is clicked
  //why void ? this event does not pass any data when it is triggered
  backClicked = output<void>();

  // Back button
  goBack() {
    this.backClicked.emit();
    //.emit(): This is the action function. 
    // It fires the event and sends the signal upward to the parent component. 
    // Because it is <void>, the parentheses () are  empty.
  }
}
