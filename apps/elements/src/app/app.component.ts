import {
  Component,
  ChangeDetectionStrategy,
  OnDestroy,
  ChangeDetectorRef,
  OnInit,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { assetUrl, urlWithPublicPath } from '../single-spa/asset-url';

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

  lazyStylesHaveBeenLoaded = false;

  constructor(private ref: ChangeDetectorRef, private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<User[]>(assetUrl('/users.json')).subscribe(users => {
      this.users = users;
      this.ref.detectChanges();
    });
  }

  ngOnDestroy(): void {
    console.log('Custom element <elements-root> has been destroyed');
  }

  tryToReproduce187Issue(): void {
    System.import(urlWithPublicPath('dark-theme.js')).then(() => {
      this.lazyStylesHaveBeenLoaded = true;
      this.ref.detectChanges();
    });
  }
}
