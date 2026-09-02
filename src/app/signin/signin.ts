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
import { ActivatedRoute } from '@angular/router';

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
  route = inject(ActivatedRoute);
  toastr = inject(ToastrService); //Inject Toastr

  isAddAccount = false;

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
    const addAccount = this.route.snapshot.queryParamMap.get('addAccount');
    //overall it checks the URL for a parameter named addAccount and grabs its value
    //this.route.snapshot:   Looks at the exact state of the current page URL right now.
    // queryParamMap.get('addAccount'):   Searches the URL for the word 

    if (addAccount === 'true') {
      this.isAddAccount = true;
    }

    if (isLoggedIn === 'true' && addAccount !== 'true') {
      this.router.navigate(['/kmail-home'],{
         replaceUrl: true
      });
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

          if (this.isAddAccount) {

            // New tab gets its own session storage
            sessionStorage.setItem('loggedInUserName', account.name);
            sessionStorage.setItem('username', account.username);
            sessionStorage.setItem('isLoggedIn', 'true');

            this.toastr.success('Account added successfully','Success');

          } 
          else {
            //normal login
            // Save logged-in user's name
            localStorage.setItem('loggedInUserName', account.name);
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', account.username);

            this.toastr.success('Sign in successful', 'Success'); // Show success toast
          }
          this.router.navigate(['/kmail-home'],{
             replaceUrl: true
          });
          //means Go to Kmail Home and replace the current Sign In history entry

        } 
        else {
          this.toastr.error('Invalid email or password', 'Sign in failed');
        }

      },   

      // error: (error) => {
      //   console.error('Error while signing in', error);
      // }

    });

  }
}
