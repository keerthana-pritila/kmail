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
   userName = '';
  menuClicked = output<void>();       // This event will notify KmailHome when menu button is clicked
  searchChanged = output<string>();
  goToInboxClicked = output<void>(); //event from Header to KmailHome.

  //for add account -- storing in session storage
  //If Add Account opened the tab, it will contain the new account otherwise local storage
  ngOnInit() {
  this.userName =
    sessionStorage.getItem('loggedInUserName') ||localStorage.getItem('loggedInUserName') || '';
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
