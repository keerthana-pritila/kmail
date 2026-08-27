import { Component, inject} from '@angular/core';
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
import { RouterModule, Router } from '@angular/router';
import { AccountService } from '../account-service';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-forgot-password',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    RouterModule
  ],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPassword {
  accountService = inject(AccountService);
  router = inject(Router);
  toastr = inject(ToastrService);
  dialog = inject(MatDialogRef<ForgotPassword>); 

  currentStep = 1;
  accountFound = false;
  accountNotFound = false;
  selectedAccount: any = null;

  forgotForm = new FormGroup({

    email: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.email,
       Validators.pattern(/^[a-zA-Z0-9._]+@kmail\.com$/)
      ]
    }),

    password: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(6)
      ]
    }),

    confirmPassword: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required
      ]
    })

  });


  findAccount() {

    if (this.forgotForm.controls.email.invalid) {
      this.forgotForm.controls.email.markAsTouched();
      return;
    }

    const email = this.forgotForm.controls.email.value;
    this.accountService.getAccounts().subscribe({
      next: (accounts) => {
        const account = accounts.find(
          user => user.username.toLowerCase() === email.toLowerCase()
        );

        if (account) {

          this.accountFound = true;
          this.accountNotFound = false;
          this.selectedAccount = account;
          this.currentStep = 2;

        } else {
          this.accountFound = false;
          this.accountNotFound = true;
          this.selectedAccount = null;
        }

      },

      error: (error) => {
        console.error('Error finding account:', error);
        this.toastr.error( 'Unable to find account', 'Error' );

      }

    });
  }


  checkPasswordMatch(): boolean {
    const password = this.forgotForm.controls.password.value;
    const confirmPassword = this.forgotForm.controls.confirmPassword.value;
    return password === confirmPassword;
  }

 checkConfirmPassword() {
  const confirmPassword =
    this.forgotForm.controls.confirmPassword;
  if (confirmPassword.value) {
    confirmPassword.markAsTouched();
  }

}
  resetPassword() {
    const password = this.forgotForm.controls.password;
    const confirmPassword = this.forgotForm.controls.confirmPassword;

    if (password.invalid || confirmPassword.invalid) {
      password.markAsTouched();
      confirmPassword.markAsTouched();
      return;
    }


    if (!this.checkPasswordMatch()) {
      confirmPassword.markAsTouched();
      return;
    }


    // Create updated account
    const updatedAccount = {
      ...this.selectedAccount,
      password: password.value
    };


    this.accountService.updateAccount(
      this.selectedAccount.id,
      updatedAccount
    ).subscribe({
      next: () => {
        this.toastr.success( 'Password reset successfully','Success');
        this.router.navigate(['/signin']);
      },
      error: (error) => {
        console.error('Error resetting password:',error);
        this.toastr.error('Unable to reset password','Error' );
      }

    });

  }
 

}
