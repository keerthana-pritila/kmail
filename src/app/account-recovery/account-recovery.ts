import { Component,inject } from '@angular/core';
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

   accountFound = false;
  accountNotFound = false;
  foundEmail = '';

  findAccount () {
    if (this.recoveryForm.invalid) {
      this.recoveryForm.markAllAsTouched();
      return;
    }


    // Get entered phone number
    const phone = this.recoveryForm.controls.phone.value;

    // Get accounts from json-server
    this.accountService.getAccounts().subscribe({
      next: (accounts) => {

        // Search for matching phone number
        const account = accounts.find(
          user => user.phone === phone
        );


        // Account found
        if (account) {
          this.accountFound = true;
          this.accountNotFound = false;
          this.foundEmail = account.username;
        }


        // Account not found
        else {
          this.accountFound = false;
          this.accountNotFound = true;
          this.foundEmail = '';
        }

      },

      error: (error) => {
        console.error('Error finding account:', error);
      }

    });

  }
}
