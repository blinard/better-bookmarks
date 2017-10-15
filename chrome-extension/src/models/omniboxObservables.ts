import * as Rx from "../../node_modules/rxjs/Rx";
import { OmniboxInputChangedData } from "./omniboxInputChangedData";

export class OmniboxObservables {
    constructor(private _inputChanged: Rx.Observable<OmniboxInputChangedData>, private _inputEntered: Rx.Observable<string>) {
    }

    get inputChanged(): Rx.Observable<OmniboxInputChangedData> {
        return this._inputChanged;
    }

    get inputEntered(): Rx.Observable<string> {
        return this._inputEntered;
    }
}