import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const guestGuard = () =>
  inject(AuthService).isAuthenticated() ? inject(Router).parseUrl('/home') : true;
