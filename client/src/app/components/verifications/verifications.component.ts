import { Component } from '@angular/core';
import {VerificationService} from "../../services/verification.service";
import {User} from "../../../../Users";
import { Router } from '@angular/router';

@Component({
  moduleId: module.id,
  selector: 'verifications',
  templateUrl: `verifications.component.html`,
  providers: []
})
export class VerificationsComponent  {
  user: User;
  phonenumber: string;
  verCode: number;
  displayVer: boolean;
  displayAlert: boolean;
  displayAlert2: boolean;

  constructor(private verificationService:VerificationService, private router:Router){
    this.displayVer = true;
  }

  checkUser(){
    this.verificationService.getUserByNumber(this.phonenumber)
      .subscribe(data => {
        console.log(data);
        if(data) {
          this.user = data;
          this.displayVer = false;
        }
      },
      err => {
        this.displayAlert = true;
      });
  }

  checkVerification(){
    if(this.verCode == this.user.setting_key) {
      this.verificationService.user = this.user;
      this.router.navigate(['./settings']);
      console.log(this.verificationService.user);
    }else{
      this.displayAlert2 = true;
    }
  }

}
