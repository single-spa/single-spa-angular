import {
  Component,
  ChangeDetectionStrategy,
  OnDestroy,
  Input,
  ChangeDetectorRef,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
}

@Component({
  selector: 'elements-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnChanges, OnDestroy {
  @Input() users: User[] = [];

  constructor(private ref: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.users) {
      this.ref.detectChanges();
    }
  }

  ngOnDestroy(): void {
    console.log('Custom element <elements-root> has been destroyed');
  }
}
