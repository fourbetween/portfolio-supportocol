import type { ReactiveController, ReactiveControllerHost } from "lit";

export class TouchController implements ReactiveController {
  private _host: ReactiveControllerHost;
  private _isTouchDevice: boolean = false;
  private _mediaQuery: MediaQueryList;

  constructor(host: ReactiveControllerHost) {
    (this._host = host).addController(this);
    this._mediaQuery = window.matchMedia("(pointer: coarse)");
    this._updateTouchStatus();
  }

  hostConnected() {
    this._mediaQuery.addEventListener("change", this._handleMediaQueryChange);
  }

  hostDisconnected() {
    this._mediaQuery.removeEventListener(
      "change",
      this._handleMediaQueryChange
    );
  }

  get isTouchDevice() {
    return this._isTouchDevice;
  }

  private _handleMediaQueryChange = () => {
    this._updateTouchStatus();
    this._host.requestUpdate();
  };

  private _updateTouchStatus() {
    this._isTouchDevice =
      this._mediaQuery.matches ||
      navigator.maxTouchPoints > 0 ||
      "ontouchstart" in window;
  }
}
