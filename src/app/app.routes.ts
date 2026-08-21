import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Create } from './create/create';
import { Signin } from './signin/signin';
import { KmailHome } from './kmail-home/kmail-home';
import { AccountRecovery } from './account-recovery/account-recovery';
import { ForgotPassword } from './forgot-password/forgot-password';


export const routes: Routes = [
    { path: '', component: Home },
    { path: 'create', component: Create},
    { path: 'signin', component: Signin},
    { path: 'kmail-home', component: KmailHome },
    { path : 'account-recovery', component: AccountRecovery},
    { path : 'forgot-password', component : ForgotPassword}
];
