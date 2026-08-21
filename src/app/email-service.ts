import { Injectable,inject } from '@angular/core';
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

//send email
sendEmail(email: EmailInterface): Observable<EmailInterface> {
  return this.http.post<EmailInterface>( this.apiUrl, email );
}
}
