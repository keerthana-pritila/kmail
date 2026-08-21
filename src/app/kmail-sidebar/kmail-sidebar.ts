import { Component } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-kmail-sidebar',
  imports: [
    MatSidenavModule,
   MatButtonModule,
    MatIconModule
  ],
  templateUrl: './kmail-sidebar.html',
  styleUrl: './kmail-sidebar.scss',
})
export class KmailSidebar {}
