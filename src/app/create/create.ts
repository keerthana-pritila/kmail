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
import { debounceTime } from 'rxjs';

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
  usernameAvailable = false;
  checkingUsername = false;    //to check the username.so it won't allow another click(next btn).

  accountService = inject(AccountService);
  router = inject(Router);
  toastr = inject(ToastrService); //Inject Toastr

  today = new Date();
  //min age required is 18 
  maxDob = new Date(
    this.today.getFullYear() - 18,
    this.today.getMonth(),
    this.today.getDate()
  );

  //max age  is 100
  minDob = new Date(
  this.today.getFullYear() - 100,
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
        Validators.minLength(4),
        Validators.pattern(/^[a-zA-Z][a-zA-Z0-9._]*$/)
      ]
    }),
    //[a-zA-Z] This says:The first character must be a letter.
    //[a-zA-Z0-9._]* says:After the first character, letters, numbers, . and _ are allowed.

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
      password: this.createForm.controls.password.value,
       createdAt: new Date().toISOString()
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

  // Show validation errors
  dob.markAsTouched();
  gender.markAsTouched();
  phone.markAsTouched();

  // Check normal validation
  if (  dob.invalid ||  gender.invalid ||  phone.invalid ||  this.isUnder18() ||  this.isOver100()) {
    return;
  }

      // Now the phone has passed normal validation
      // So we can remove the old "phoneTaken" error
      phone.setErrors(null);

  // Get all existing accounts
  this.accountService.getAccounts().subscribe({

    next: (accounts) => {

      // Check whether phone number already exists
      const alreadyExists = accounts.some(account =>
        account.phone === phone.value
      );

      // Phone number already registered
      if (alreadyExists) {
        phone.setErrors({ phoneTaken: true });
        //The form gets an error called:phoneTaken
        return;
      }

      // Phone number is available
      this.currentStep++;
    },

    error: (error) => {
      this.toastr.error('Unable to check phone number',  'Error');
    }

  });
  return;
}

    if (this.currentStep === 3) {
      const username = this.createForm.controls.username;

      // Show validation only after user clicks Next
      username.markAsTouched();

      // Stop if username is empty or invalid
      if (username.invalid) {
        return;
      }

      // Stop if username is already taken
      if (!this.usernameAvailable) {
        return; 
      }
      this.currentStep++;

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

//to check if age of user is under 18 
  isUnder18(): boolean {

    //Retrieves the current value of the dob field 
    const dob = this.createForm.controls.dob.value;

    //if user did not enter dob ,then return false
    if (!dob) {
      return false;
    }
    // If user's DOB is greater than maxDob, they are too young, so it returns true
    return new Date(dob) > this.maxDob;
  }

  //to check if age of user is older than 100
  isOver100(): boolean {
  const dob = this.createForm.controls.dob.value;
  if (!dob) {
    return false;
  }
  return new Date(dob) < this.minDob;
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

//new tab for addaccount -- uses session storage 
//normal -- local storage 
ngOnInit() {
const isLoggedIn =  sessionStorage.getItem('isLoggedIn') ||  localStorage.getItem('isLoggedIn');
if (isLoggedIn === 'true') {
  this.toastr.warning( 'You are already logged in',);
  this.router.navigate(['/kmail-home']);
  return;
}
 // Watch username changes
  this.createForm.controls.username.valueChanges.pipe(debounceTime(500))
  .subscribe(username => {
    //username.valueChanges -->Every time the user types something, this runs.

    //.pipe() --> method is a built-in RxJS function that allows you to plug in operators
    //  (like debounceTime, map, or filter) to modify that data stream before it reaches your .subscribe() block
    //in simple words --->.pipe() is a connector that lets you clean up or change your data before using it.

    // Reset status whenever user changes username
    this.usernameAvailable = false;

    // Don't check empty username
    if (!username) {
      return;
    }

    // Don't check invalid username
    if (this.createForm.controls.username.invalid) {
      return;
    }

    this.checkUsername(username);

  });
}

//check username
checkUsername(username: string) {
  const email = `${username}@kmail.com`;
  this.accountService.getAccounts().subscribe({
    next: (accounts) => {

      const alreadyExists = accounts.some(account =>
        account.username.toLowerCase() === email.toLowerCase()
      );

      if (alreadyExists) {
        // Username is already taken
        this.usernameAvailable = false;
        this.createForm.controls.username.setErrors({
          taken: true
        });

        this.generateUsernameSuggestions( username,  accounts );
      } else {
        this.usernameAvailable = true;  // Username is available
        this.createForm.controls.username.setErrors(null); // Remove taken error
        this.usernameSuggestions = [];
      }
    },

    error: (error) => {
      console.error('Error checking username:', error);
    }
  });
}
}
