import {
  Component,
  ChangeDetectionStrategy,
  OnDestroy,
  ChangeDetectorRef,
  OnInit,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';

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
export class AppComponent implements OnInit, OnDestroy {
  users: User[] = [];

  constructor(private ref: ChangeDetectorRef, private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<User[]>('https://jsonplaceholder.typicode.com/users').subscribe(users => {
      this.users = users;
      this.ref.detectChanges();
    });
  }

  ngOnDestroy(): void {
    console.log('Custom element <elements-root> has been destroyed');
  }
}
