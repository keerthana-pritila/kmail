import { Component, inject,signal} from '@angular/core';
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
  dialogRef = inject(MatDialogRef<ForgotPassword>, { optional: true });
  hidePassword = signal(true);
  hideConfirmPassword = signal(true);
 

  currentStep = signal(1);
  accountFound = signal(false) ;
  accountNotFound = signal(false);
  selectedAccount: any = null;
  isDialog = false;

  ngOnInit() {
  this.isDialog = !!this.dialogRef;
}

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
    const emailControl = this.forgotForm.controls.email;


  // Check email validation
    if(emailControl.invalid) {
      emailControl.markAsTouched();
      emailControl.updateValueAndValidity();
      return;
    }

    // const email = this.forgotForm.controls.email.value;
     const email = emailControl.value.trim().toLowerCase();

    this.accountService.getAccounts().subscribe({
      next: (accounts) => {
        const account = accounts.find(
          user => user.username.toLowerCase() === email
        );

        if (account) {

          this.accountFound.set(true);
          this.accountNotFound.set(false);
          this.selectedAccount = account;
          this.currentStep.set(2); //Change the signal's value to 2.
          

           // Account not found
        } else {
          this.accountFound.set(false);
          this.accountNotFound.set(true);
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
  const confirmPassword = this.forgotForm.controls.confirmPassword;
  if (confirmPassword.value) {
    confirmPassword.markAsTouched();
  }

}

clickPassword(event: MouseEvent) {
  event.preventDefault();
  this.hidePassword.set(!this.hidePassword());
}

clickConfirmPassword(event: MouseEvent) {
  event.preventDefault();
  this.hideConfirmPassword.set(!this.hideConfirmPassword());
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
        if (this.isDialog) {

    // Opened from Kmail Home
    this.dialogRef?.close(); //Close the dialog if a dialog exists.

  } else {
    // Opened normally from Sign in page
    this.router.navigate(['/signin']);
  }
      },
      error: (error) => {
        console.error('Error resetting password:',error);
        this.toastr.error('Unable to reset password','Error' );
      }

    });

  }

  backToSignIn() {
  if (this.isDialog) {
    this.dialogRef?.close();
  } else {
    this.router.navigate(['/signin']);
  }
}
 
  closeDialog() {
  if (this.dialogRef) {
    this.dialogRef.close();
  }
}

}
