import type { ReactiveController, ReactiveControllerHost } from "lit";

export class TitleController implements ReactiveController {
  private _originalTitle: string;

  constructor(host: ReactiveControllerHost) {
    host.addController(this);
    this._originalTitle = document.title;
  }

  hostConnected() {}

  hostDisconnected() {
    document.title = this._originalTitle;
  }

  update(title?: string) {
    if (title) {
      document.title = title;
    } else {
      document.title = this._originalTitle;
    }
  }
}
