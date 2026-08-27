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
