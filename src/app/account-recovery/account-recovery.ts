import { Component,inject,signal} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { AccountService } from '../account-service';

@Component({
  selector: 'app-account-recovery',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    RouterModule
  ],
  templateUrl: './account-recovery.html',
  styleUrl: './account-recovery.scss',
})
export class AccountRecovery {
  accountService = inject(AccountService);

  recoveryForm = new FormGroup({
    phone: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern(/^[0-9]{10}$/)
      ]

    })
  });

   accountFound = signal(false);
  accountNotFound = signal(false);
  foundEmail = signal('');

  findAccount () {
    if (this.recoveryForm.invalid) {
      this.recoveryForm.markAllAsTouched();
      return;
    }


    // Get entered phone number
    const phone = this.recoveryForm.controls.phone.value.trim();

    // Get accounts from json-server
    this.accountService.getAccounts().subscribe({
      next: (accounts) => {

        // Search for matching phone number
        const account = accounts.find(
          user => String(user.phone).trim() === phone
        );


        // Account found
        if (account) {
          this.accountFound.set(true) ;
          this.accountNotFound.set(false);
          this.foundEmail.set(account.username);
        }


        // Account not found
        else {
          this.accountFound.set(false);
          this.accountNotFound.set(true) ;
          this.foundEmail.set('');
        }

      },

      error: (error) => {
        console.error('Error finding account:', error);
      }

    });

  }
}
