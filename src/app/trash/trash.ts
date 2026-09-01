import { Component,input ,output} from '@angular/core';
//import { EmailService } from '../email-service';
import { EmailInterface } from '../email-interface';
import { EmailRow } from '../email-row/email-row';

@Component({
  selector: 'app-trash',
  imports: [EmailRow],
  templateUrl: './trash.html',
  styleUrl: './trash.scss',
})
export class Trash {
 
   // Receive trash emails from KmailHome
  emails = input.required<EmailInterface[]>();

   // Send selected email to KmailHome
  checkboxChanged = output<EmailInterface>();
}
