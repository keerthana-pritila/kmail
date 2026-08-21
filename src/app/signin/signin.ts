import { Component, signal, inject } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AccountService } from '../account-service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-signin',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatIconModule,
    RouterModule
  ],
  templateUrl: './signin.html',
  styleUrl: './signin.scss',
})
export class Signin {

  accountService = inject(AccountService);
  router = inject(Router);
  toastr = inject(ToastrService); //Inject Toastr

  signinForm = new FormGroup({

    email: new FormControl('', {
      validators: [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._]+@kmail\.com$/)
      ]
    }),
    password: new FormControl('', {
      validators: [
        Validators.required,
        Validators.minLength(6)
      ]
    })
  });

   ngOnInit() {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  if (isLoggedIn === 'true') {
    this.router.navigate(['/kmail-home']);
  }
}
// So here if the user is already logged in and  reaches /signin through left arrow, 
// Angular immediately sends them back to KmailHome

  hide = signal(true);
  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  signIn() {

    if (this.signinForm.invalid) {
      this.signinForm.markAllAsTouched();
      return;
    }

    const email = this.signinForm.controls.email.value;
    const password = this.signinForm.controls.password.value;

    this.accountService.getAccounts().subscribe({
      next: (accounts) => {
        const account = accounts.find(
          user =>
            user.username === email &&
            user.password === password
        );

        if (account) {
          // Save logged-in user's name
          localStorage.setItem('loggedInUserName', account.name);
          
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('username', account.username);

          this.toastr.success('Sign in successful', 'Success'); // Show success toast
          this.router.navigate(['/kmail-home']);

        } else {
          this.toastr.error('Invalid email or password', 'Sign in failed');
        }

      },

      error: (error) => {
        console.error('Error while signing in', error);

      }

    });

  }
}
