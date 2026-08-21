import { Component, output,inject} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';

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
   userName = '';
  menuClicked = output<void>();       // This event will notify KmailHome when menu button is clicked
  searchChanged = output<string>();

  ngOnInit() {
    this.userName = localStorage.getItem('loggedInUserName') || '';
  }

  // Called when the side 3 lines button is clicked
  onMenuClick() {
    this.menuClicked.emit();
  }

  onSearch(event: Event) {
  const input = event.target as HTMLInputElement;
  this.searchChanged.emit(input.value);
}

  logout() {
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('username');
  localStorage.removeItem('loggedInUserName');
  this.router.navigate(['/signin']);
}
}
