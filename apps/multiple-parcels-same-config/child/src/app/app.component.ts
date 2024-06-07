import { Component } from '@angular/core';
import { singleSpaPropsSubject } from '../single-spa/single-spa-props';
import { first } from 'rxjs';

@Component({
  selector: 'multiple-parcels-same-config-child',
  templateUrl: './app.component.html'
})
export class AppComponent {
  constructor() {}

  props: any = null;
  time: number = Date.now();

  ngOnInit() {
    singleSpaPropsSubject
      .pipe(first())
      .subscribe((props) => {
        this.props = props;
      });

    setInterval(() => {
      this.time = Date.now();
    }, 1000);
  }
}
