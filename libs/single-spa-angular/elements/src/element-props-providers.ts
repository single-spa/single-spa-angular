import { Injectable, StaticProvider } from '@angular/core';
import { ReplaySubject, Subject } from 'rxjs';

@Injectable()
export class SingleSpaElementPropsService<T> {
  private subjects: Map<string, Subject<T>>;

  constructor() {
    this.subjects = new Map<string, ReplaySubject<T>>();
  }

  setProps(parcelName: string, props: T) {
    if (!this.subjects.has(parcelName)) {
      this.subjects.set(parcelName, new ReplaySubject<T>(1));
    }
    this.subjects.get(parcelName)!.next(props);
  }

  getProps(parcelName: string) {
    if (!this.subjects.has(parcelName)) {
      this.subjects.set(parcelName, new ReplaySubject<T>(1));
    }
    return this.subjects.get(parcelName)!.asObservable();
  }
}

export function getSingleSpaElementPropsExtraProviders<T>(): StaticProvider[] {
  return [
    {
      provide: SingleSpaElementPropsService,
      useFactory: () => {
        return new SingleSpaElementPropsService<T>();
      },
    },
  ];
}
