import { Component,inject } from '@angular/core';
import {
  FormControl,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import { AccountService } from '../account-service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profile',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  accountService = inject(AccountService);
  dialogRef = inject(MatDialogRef<Profile>);
  toastr = inject(ToastrService);

  currentEmail = '';  // Current email
  canEditEmail = false;

   // New email
  newEmail = new FormControl('', {
    nonNullable: true,

    validators: [
      Validators.required,
      Validators.email,
      Validators.pattern(
        /^[a-zA-Z0-9._]+@kmail\.com$/
      )
    ]
  });

 // Password
  password = new FormControl('', {
    nonNullable: true,

    validators: [
      Validators.required
    ]
  });


  ngOnInit() {
  // Get logged-in email
  this.currentEmail = localStorage.getItem('username') || '';

  // Get all accounts
  this.accountService.getAccounts().subscribe({
    next: (accounts) => {

      // Find logged-in account
      const account = accounts.find(
        user => user.username === this.currentEmail
      );

      if (!account) {
        console.log('Account not found');
        return;
      }

      // Check 60 minute limit
      this.checkEditTime(account.createdAt);
    },

    error: (error) => {
      console.error('Error loading account:', error);
    }

  });

}

checkEditTime(createdAt: string) {

  //  gets the Account creation time
  const createdTime = new Date(createdAt).getTime();

  // Current time
  const currentTime = new Date().getTime();

  // Difference in milliseconds
  const difference = currentTime - createdTime;

  // Convert milliseconds to minutes
  const minutesPassed = difference / (1000 * 60);

  console.log('Minutes passed:', minutesPassed);

  // Allow editing only within 60 minutes
  if (minutesPassed < 60) {
    this.canEditEmail = true;
  } else {
    this.canEditEmail = false;
  }

}
  updateEmail() {

    if (!this.canEditEmail) {
  console.log('Email editing time has expired');
  this.toastr.error("Email editing time has expired");
  return;
}

  //  Check validation
  if (this.newEmail.invalid || this.password.invalid ) {
    this.newEmail.markAsTouched();
    this.password.markAsTouched();
    return;
  }

  //  Get entered values
  const enteredEmail = this.newEmail.value;
  const enteredPassword = this.password.value;

  console.log('New email:', enteredEmail);
  console.log('Entered password:', enteredPassword);

  //  Get all accounts
  this.accountService.getAccounts().subscribe({
    next: (accounts) => {
      // Find the currently logged-in account
      const account = accounts.find(
        user => user.username === this.currentEmail
      );

      console.log('Current account:', account);
      // Account not found
      if (!account) {
        console.log('Account not found');
        return;
      }

      //  Check password
      if (account.password !== enteredPassword) {
        console.log('Wrong password');
        this.password.setErrors({
          incorrect: true
        });
        return;
      }

      //  Create updated account
      const updatedAccount = {
        ...account,
        username: enteredEmail
      };

      console.log('Updated account:', updatedAccount);

      //  Save updated account
      this.accountService.updateAccount(
        account.id!,
        updatedAccount
      ).subscribe({

        next: (response) => {
          console.log('Email updated successfully');
          this.toastr.success("Email updated successfully",'success');

          //  Update localStorage
          localStorage.setItem( 'username',  response.username );
          localStorage.setItem( 'loggedInUserName',  response.name);

          // Close dialog
          this.dialogRef.close(response);
        },

        error: (error) => {
          console.error( 'Error updating email:', error);
        }
      });
    },

    error: (error) => {
      console.error( 'Error getting accounts:', error);
    }
  });
}

  closeDialog() {
    this.dialogRef.close();
  }
}
