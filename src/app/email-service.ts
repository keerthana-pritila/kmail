import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmailInterface } from './email-interface';

@Injectable({
  providedIn: 'root',
})
export class EmailService {

  private http = inject(HttpClient);  // Inject HttpClient
  private apiUrl = 'http://localhost:5000/emails';  // json-server emails URL

  // Get all emails
  getEmails(): Observable<EmailInterface[]> {
    return this.http.get<EmailInterface[]>(this.apiUrl);
  }

  //update email
  updateEmail(email: EmailInterface): Observable<EmailInterface> {
    return this.http.put<EmailInterface>(
      `${this.apiUrl}/${email.id}`,
      email
    );
  }

  //delete email
  deleteEmail(id: string) {
    return this.http.delete(
      `${this.apiUrl}/${id}`
    );
  }

  //emails categorise into primary,socail & promotions
  getEmailCategory(
    sender: string,
    subject: string,
    message: string
  ): 'primary' | 'promotions' | 'social' {

    const text = (sender + ' ' + subject + ' ' + message).toLowerCase();
    // Combine all inputs into a single string, separating them with spaces
    //  Convert the entire combined string to lowercase using .toLowerCase() so that it will be case-insensitive
    // so that 'sale', 'Sale' ,SALE will match

    // Promotions words
    if (
      text.includes('offer') ||
      text.includes('sale') ||
      text.includes('discount') ||
      text.includes('deal') ||
      text.includes('coupon') ||
      text.includes('shopping') ||
      text.includes('buy now') ||
      text.includes('limited time') ||
      text.includes('cashback') ||
      text.includes('promo') ||
      text.includes('exclusive')
    ) {
      return 'promotions';
    }

    // Social words
    else if (
      text.includes('notification') ||
      text.includes('comment') ||
      text.includes('follow') ||
      text.includes('friend') ||
      text.includes('social') ||
      text.includes('like') ||
      text.includes('liked your') ||
      text.includes('mentioned you') ||
      text.includes('new follower') ||
      text.includes('post')
    ) {
      return 'social';
    }
    else {
      // Everything else
      //If it's not promotional and not social, it is classified as primary
      return 'primary';
    }

  }

  //send email
  sendEmail(email: EmailInterface): Observable<EmailInterface> {
    return this.http.post<EmailInterface>(this.apiUrl, email);
  }

  //incoming emails(like somebody sent an email)
  addIncomingEmail(email: EmailInterface): Observable<EmailInterface> {

  email.category = this.getEmailCategory(
    email.sender,
    email.subject,
    email.message
  );

  return this.http.post<EmailInterface>(
    this.apiUrl,
    email
  );
}
}
