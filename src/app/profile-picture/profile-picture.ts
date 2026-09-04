import { Component,inject} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef,MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-profile-picture',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatIconModule
  ],
  templateUrl: './profile-picture.html',
  styleUrl: './profile-picture.scss',
})
export class ProfilePicture {
  toastr = inject(ToastrService);
  dialogRef = inject(MatDialogRef<ProfilePicture>);
  data = inject(MAT_DIALOG_DATA);
  cdr = inject(ChangeDetectorRef);
  previewUrl: string = '';  // This will contain the selected image

  constructor() {
     this.previewUrl = this.data?.profilePicture || '';
  }

  // When user selects an image
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if(!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    // Make sure selected file is an image
    if(!file.type.startsWith('image/')) {
      this.toastr.error("Please select an image file");
      return;
    }

    //Read the image 
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result as string;
      this.cdr.detectChanges();  //tell angular to update screen
    };
    reader.readAsDataURL(file);
    }

    //Take a picture
    takePicture() {
      this.toastr.error("please enable camera");
    }

    //save picture
    savePicture() {
      if(!this.previewUrl) {
        return;
      }
      this.dialogRef.close(this.previewUrl);
    }

    //close dialog
    closeDialog() {
      this.dialogRef.close();
    }
}
