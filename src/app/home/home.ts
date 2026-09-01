import { Component,inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  router = inject(Router);
  toastr = inject(ToastrService);

   // Stores the logged-in user's name
  userName = '';

  // Stores whether user is logged in
  isLoggedIn = false;

  //FYI -- session storage is for another tab i.e,add account click
  ngOnInit() {
     // Check whether user is logged in
  const localLogin = localStorage.getItem('isLoggedIn');
  const sessionLogin = sessionStorage.getItem('isLoggedIn');

  if (localLogin === 'true' || sessionLogin === 'true') {
    this.isLoggedIn = true;
     // Get user's name
    this.userName = sessionStorage.getItem('loggedInUserName') ||  localStorage.getItem('loggedInUserName') || '';
  }
}

  //when user clicks on the username button, navigate to the Kmail home page
  openKmailHome() {
  this.router.navigate(['/kmail-home']);
} 

  createAccount() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
      this.toastr.warning(  'You are already logged in', );
      return;
    }

    // If user is not logged in
    this.router.navigate(['/create']);
  }
}
