import { Injectable,inject} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AccountInterface } from './account-interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
   private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/accounts';

  createAccount(account: AccountInterface) {
    return this.http.post<AccountInterface>(
      this.apiUrl,
      account
    );
  }

  // getAccounts() {
  //   return this.http.get<AccountInterface[]>(
  //     this.apiUrl
  //   );

  // }
  getAccounts(): Observable<AccountInterface[]> {
  return this.http.get<AccountInterface[]>(
    this.apiUrl
  );
}

updateAccount(id: string, account: AccountInterface) {
  return this.http.put<AccountInterface>(
    `${this.apiUrl}/${id}`,
    account
  );
}
}
