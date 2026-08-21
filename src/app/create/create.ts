import { Component, signal, inject } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, FormsModule, AbstractControl } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AccountService } from '../account-service';
import { Router } from '@angular/router';
import { AccountInterface } from '../account-interface';
import { ToastrService } from 'ngx-toastr';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';


@Component({
  selector: 'app-create',
  providers: [provideNativeDateAdapter()],
  imports: [FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './create.html',
  styleUrl: './create.scss',
})

export class Create {

  currentStep = 1;
  usernameSuggestions: string[] = [];

  accountService = inject(AccountService);
  router = inject(Router);
  toastr = inject(ToastrService); //Inject Toastr

  today = new Date();
  maxDob = new Date(
    this.today.getFullYear() - 18,
    this.today.getMonth(),
    this.today.getDate()
  );


  createForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(10),
        Validators.pattern(/^[a-zA-Z ]+$/)
      ]
    }),

    surname: new FormControl('', {
      nonNullable: true,
    }),
    dob: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required
      ]
    }),
    gender: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required
      ]
    }),

    phone: new FormControl('', {
  nonNullable: true,
  validators: [
    Validators.required,
    Validators.pattern(/^[0-9]{10}$/)
  ]
}),
    username: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9._]+$/)
      ]
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(6)
      ]
    }),
    confirmpassword: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required
      ]
    })

  });

  hide = signal(true);
  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  //CHECK PASSORD MISMATCH
  checkPasswordMatch(): boolean {
    const password = this.createForm.controls.password.value;
    const confirmPassword = this.createForm.controls.confirmpassword.value;
    return password === confirmPassword;
  }

  createAccount() {
    // Check normal form validation
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    // Check minimum age
    if (this.isUnder18()) {
      this.createForm.controls.dob.markAsTouched();
      return;
    }

    //Check password and confirm password
    if (!this.checkPasswordMatch()) {
      this.createForm.controls.confirmpassword.markAsTouched();
      return;
    }

    // Get form values

    const account: AccountInterface = {
      name: this.createForm.controls.name.value,
      surname: this.createForm.controls.surname.value,
      dob: this.createForm.controls.dob.value,
      gender: this.createForm.controls.gender.value,
       phone: this.createForm.controls.phone.value,
      username: `${this.createForm.controls.username.value}@kmail.com`,
      password: this.createForm.controls.password.value
    };

    // Saving account to db.json
    this.accountService.createAccount(account).subscribe({
      next: (response) => {
        console.log('Account created successfully');
        this.toastr.success('Account created successfully', 'Success'); // Show success toast
        console.log(response);
        this.router.navigate(['/signin']);
      },
      error: (error) => {
        console.error('Error creating account', error);
      }
    });
  }

  allowOnlyLetters(event: KeyboardEvent) {
    const key = event.key;
    if (!/^[a-zA-Z ]$/.test(key)) {
      event.preventDefault();
    }

  }


  //to go next step in create form 
  nextStep() {
    if (this.currentStep === 1) {

      const name = this.createForm.controls.name;
      const surname = this.createForm.controls.surname;

      if (name.invalid) {
        name.markAsTouched();
        return;
      }

      // surname is optional, so we don't need to validate it

      this.currentStep++;
      return;
    }

    if (this.currentStep === 2) {
      const dob = this.createForm.controls.dob;
      const gender = this.createForm.controls.gender;
      const phone = this.createForm.controls.phone;

      if (dob.invalid || gender.invalid || phone.invalid || this.isUnder18()) {
        dob.markAsTouched();
        gender.markAsTouched();
        return;
      }
      //    // User is below 18
      // if (this.isUnder18()) {
      //   dob.markAsTouched();
      //   return;
      // }
      this.currentStep++;
      return;
    }

    if (this.currentStep === 3) {

      const username = this.createForm.controls.username;

      // Check required and pattern validation
      if (username.hasError('required') || username.hasError('pattern')) {
        username.markAsTouched();
        return;
      }

      //  Remove previous taken error
      username.setErrors(null);

      // Create complete email
      const email = `${username.value}@kmail.com`;

      //check accounts
      this.accountService.getAccounts().subscribe({
        next: (accounts) => {
          const alreadyExists = accounts.some(account =>
            account.username.toLowerCase() === email.toLowerCase()
          );

          // Username already exists
          if (alreadyExists) {
            username.setErrors({ taken: true });
            username.markAsTouched();
            this.generateUsernameSuggestions(username.value, accounts);
            return;
          }

          //when  Username is available clear suggestions
          username.setErrors(null); // Username is available
          this.usernameSuggestions = [];
          this.currentStep++;
        },

        error: (error) => {
          console.error('Error checking username:', error);
          this.toastr.error('Unable to check username', 'Error');
        }

      });

      return;
    }

    if (this.currentStep === 4) {

      const password = this.createForm.controls.password;
      const confirmPassword =
        this.createForm.controls.confirmpassword;

      if (password.invalid || confirmPassword.invalid) {
        password.markAsTouched();
        confirmPassword.markAsTouched();
        return;
      }

      if (!this.checkPasswordMatch()) {
        confirmPassword.markAsTouched();
        return;
      }
    }
  }

  //previous step
  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  isUnder18(): boolean {
    const dob = this.createForm.controls.dob.value;
    if (!dob) {
      return false;
    }
    return new Date(dob) > this.maxDob;
  }

  //for username suggestions
  generateUsernameSuggestions(username: string, accounts: AccountInterface[]) {
  const suggestions = [
    username + '1',
    username + '123',
    username + '2026',
    username + '01',
    username + '99'
  ];

  this.usernameSuggestions = suggestions.filter(suggestion => {
    // here .filter(..) -- loops through suggestions array

    const email = `${suggestion}@kmail.com`; //coverts username suggestion to email format
    return !accounts.some(account =>
      account.username.toLowerCase() === email.toLowerCase() //treats a ,A as same
    );
  }).slice(0, 3); //extracts only the first 3 items
}

//close suggestions on selecting one 
onUsernameSelected(event: MatAutocompleteSelectedEvent) {
  const selectedUsername = event.option.value;
  this.createForm.controls.username.setValue(selectedUsername);
  this.usernameSuggestions = []; // Clear suggestions
}
}
