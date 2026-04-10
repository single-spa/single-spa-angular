import {
  Component,
  ElementRef,
  ChangeDetectionStrategy,
  input,
  effect,
  untracked,
  afterNextRender,
  DestroyRef,
  inject,
} from '@angular/core';
import { Parcel, ParcelConfig, AppProps } from 'single-spa';

const enum Action {
  Mount = 'mount',
  Update = 'update',
  Unmount = 'unmount',
}

@Component({
  selector: 'parcel',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParcelComponent {
  readonly config = input<ParcelConfig | null>(null);
  readonly mountParcel = input<AppProps['mountParcel'] | null>(null);
  readonly onParcelMount = input<(() => void) | null>(null);
  readonly wrapWith = input('div');
  readonly customProps = input<Record<string, unknown>>({});
  readonly appendTo = input<Node | null>(null);
  readonly handleError = input((error: Error) => console.error(error));

  private hasError = false;
  private unmounted?: boolean;
  private wrapper: HTMLElement | null = null;
  private parcel: Parcel | null = null;
  private task: Promise<void> | null = null;

  constructor(private host: ElementRef<HTMLElement>) {
    effect(() => {
      const customProps = this.customProps();
      untracked(() => {
        this.scheduleTask(Action.Update, () => {
          this.parcel?.update?.({
            ...customProps,
            domElement: this.wrapper,
          });
        });
      });
    });

    afterNextRender(() => {
      this.scheduleTask(Action.Mount, () => {
        const mountParcel = this.mountParcel();

        if (mountParcel === null) {
          throw new Error(
            'single-spa-angular: the [mountParcel] binding is required when using the <parcel> component. You can either (1) import mountRootParcel from single-spa or (2) use the mountParcel prop provided to single-spa applications.',
          );
        }

        this.wrapper = document.createElement(this.wrapWith());

        const appendTo = this.appendTo();
        if (appendTo !== null) {
          appendTo.appendChild(this.wrapper);
        } else {
          this.host.nativeElement.appendChild(this.wrapper);
        }

        this.parcel = mountParcel(this.config()!, {
          ...this.customProps(),
          domElement: this.wrapper,
        });

        const onParcelMount = this.onParcelMount();
        if (onParcelMount !== null) {
          this.parcel.mountPromise.then(onParcelMount);
        }

        this.unmounted = false;
        return this.parcel.mountPromise;
      });
    });

    inject(DestroyRef).onDestroy(() => {
      this.scheduleTask(Action.Unmount, () => {
        if (this.parcel?.getStatus() === 'MOUNTED') {
          return this.parcel.unmount().then(() => {
            this.parcel = null;
          });
        }
      });

      if (this.wrapper !== null) {
        this.wrapper.parentNode!.removeChild(this.wrapper);
      }

      this.unmounted = true;
    });
  }

  private scheduleTask(action: Action, task: () => void | Promise<any>): void {
    if (this.hasError && action !== Action.Unmount) {
      // In an error state, we don't do anything anymore except for unmounting
      return;
    }

    this.task = (this.task || Promise.resolve())
      .then(() => {
        if (this.unmounted && action !== Action.Unmount) {
          // Never do anything once the angular component unmounts
          return;
        }

        return task();
      })
      .catch((error: Error) => {
        this.task = Promise.resolve();
        this.hasError = true;

        if (error?.message) {
          error.message = `During '${action}', parcel threw an error: ${error.message}`;
        }

        const handleError = this.handleError();
        if (typeof handleError === 'function') {
          handleError(error);
        } else {
          setTimeout(() => {
            throw error;
          });
        }

        // No more things to do should be done -- the parcel is in an error state
        throw error;
      });
  }
}
