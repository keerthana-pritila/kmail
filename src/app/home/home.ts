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

  ngOnInit() {

    // Check whether user is logged in
    const loggedIn = localStorage.getItem('isLoggedIn');
    if (loggedIn === 'true') {
      this.isLoggedIn = true;
      // Get user's name
      this.userName = localStorage.getItem('loggedInUserName') || '';
    }
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
