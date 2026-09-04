import { Component, output,inject} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Profile } from '../profile/profile';
import { ForgotPassword } from '../forgot-password/forgot-password';
import { Feedback } from '../feedback/feedback';
import { QuickTips } from '../quick-tips/quick-tips';
import { ProfilePicture } from '../profile-picture/profile-picture';
import { AccountService } from '../account-service';
import { ChangeDetectorRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-header',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule 
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  router = inject(Router);
  dialog = inject(MatDialog);
  accountService = inject(AccountService);
  cdr = inject(ChangeDetectorRef);
  toastr = inject(ToastrService);

  userName = '';
  profilePicture = '';
  menuClicked = output<void>();       // This event will notify KmailHome when menu button is clicked
  searchChanged = output<string>();
  goToInboxClicked = output<void>(); //event from Header to KmailHome.

  //for add account -- storing in session storage
  //If Add Account opened the tab, it will contain the new account otherwise local storage
  ngOnInit() {
  this.userName =
    sessionStorage.getItem('loggedInUserName') ||localStorage.getItem('loggedInUserName') || '';

    this.loadProfilePicture();
}

//LOAD PROFILE PICTURE
loadProfilePicture() {

  const currentUsername =
    sessionStorage.getItem('username') || localStorage.getItem('username') || '';

  if (!currentUsername) {
    return;
  }

  this.accountService.getAccounts().subscribe(
    (accounts) => {

      const account = accounts.find(
        user => user.username === currentUsername
      );

      if (account) {
        this.profilePicture = account.profilePicture || '';
        console.log('Loaded profile picture:', account.profilePicture);
      }

    }
  );
}

//get first letter in icon user profile
getFirstLetter(): string {

 if (!this.userName) {
    return '?';  //if username empty displays ? in icon
  }

  return this.userName.charAt(0).toUpperCase();
}


  // Called when the side 3 lines button is clicked
  onMenuClick() {
    this.menuClicked.emit();
  }

  onSearch(event: Event) {
  const input = event.target as HTMLInputElement;
  this.searchChanged.emit(input.value);
}

openProfile() {
this.dialog.open(Profile, {
    width: '450px'
  });
}

openProfilePicture() {
  const dialogRef = this.dialog.open(
    ProfilePicture,
    {
      width: '450px',
      data: {
         profilePicture: this.profilePicture
      }
    }
  );
  dialogRef.afterClosed().subscribe(
    (result) => {

      //if user cancelled ,do nothing
      if(!result) {
        return;
      }

      //get currently logged-in username or mail
      const currentUsername = 
      sessionStorage.getItem('username') || localStorage.getItem('username') || '';

      if(!currentUsername) {
        return;
      }

      //get all accounts
      this.accountService.getAccounts().subscribe(
        (accounts) => {

          //find logged-in account
          const account = accounts.find(
            user => user.username === currentUsername
          );

          if(!account || !account.id) {
            return;
          }

          //add profile picture to account

          const updatedAccount = {
            ...account,
            profilePicture: result
          };

          //save account to db.json
          this.accountService.updateAccount(account.id, updatedAccount)
          .subscribe(
            (response) => {

              //update picture in header 
              this.profilePicture = response.profilePicture || result;
              
              this.cdr.detectChanges(); // Immediately refresh the Header

              console.log("profile picture saved successfully");
              this.toastr.success("profile picture saved ", "success");
            }
          );
        }
      );
    }
  );
}

removeProfilePicture() {

  const currentUsername =
    sessionStorage.getItem('username') || localStorage.getItem('username') || '';

  if (!currentUsername) {
    return;
  }

  this.accountService.getAccounts().subscribe(
    (accounts) => {

      const account = accounts.find(
        user => user.username === currentUsername
      );

      if (!account || !account.id) {
        return;
      }

      const updatedAccount = {
        ...account,
        profilePicture: ''
      };

      this.accountService
        .updateAccount(account.id, updatedAccount)
        .subscribe(
          () => {

            // Remove picture from Header immediately
            this.profilePicture = '';

            // Refresh Header immediately
            this.cdr.detectChanges();

            console.log('Profile picture removed successfully');
            this.toastr.warning("Profile picture removed ");
          }
        );
    }
  );
}

openFeedback() {
this.dialog.open(Feedback, {
width: '500px'
});
}

openTraining() {
  window.open(
    'https://support.google.com/a/users/answer/9259748?visit_id=639239464862273953-2441922567&p=gmail_training&rd=1',
    '_blank'
  );
}


openForgotPassword() {
  this.dialog.open(ForgotPassword, {
    width: '500px'
  });
}

//when add account clicked,opens in new tab 
addAccount() {
  window.open('/signin?addAccount=true', '_blank');
//'_blank': A parameter that forces the browser to open the link in a new tab rather than the current one.
}

logout() {
  const isAddAccount = sessionStorage.getItem('isLoggedIn') === 'true';

  if (isAddAccount) {

    // Logout only this tab
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('loggedInUserName');

  } else {

    // Logout normal account
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('loggedInUserName');

  }
  this.router.navigate(['/signin']);
}

//when clicked on logo kmail -- navigates to inbox 
goToInbox() {
  this.router.navigate(['/kmail-home']);
  this.goToInboxClicked.emit();
}

//when Tips  clicked --from dropdown
openQuickTips() {
  this.dialog.open(QuickTips, {
    width: '500px'
  });
}

}
