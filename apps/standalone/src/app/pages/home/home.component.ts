import { Component } from '@angular/core';

@Component({
  selector: 'standalone-home',
  template: '{{ title }}',
  standalone: true,
})
export class HomeComponent {
  title = 'This is the home page of standalone application.';
}
