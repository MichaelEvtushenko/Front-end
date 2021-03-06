import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

/*
  TODO: Overwrite the whole component, using @Directive
*/

@Component({
  selector: 'app-logout',
  template: '<p>Redirecting to home page...</p>'
})
export class LogoutComponent implements OnInit {

  constructor(private router: Router) {
  }

  ngOnInit() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/']);
  }

}
