// declare global {
//     interface Window { [index: string]: any }
// }
// import { ChromeBrowser } from "../src/browserFacades/chromeBrowser";
// import { BookmarkManager } from "../src/bookmarkManager";

export class ConstructorSpies<T> {
    private _constructorSpy: jasmine.Spy<jasmine.Func>;
    private _spyObject: T;

    constructor(constructorName: string) {
        // Hinky note: Technically this is making the constructor function return the same
        //   object every call (like a singleton). This could cause odd behavior for some unit tests.
        this._spyObject = <T>{};
        this._constructorSpy = jasmine.createSpy(constructorName + " constructor").and.returnValue(this._spyObject);
        window[constructorName] = this._constructorSpy;
    }

    getConstructorSpy() {
        return this._constructorSpy;
    }

    getSpyObject() {
        return this._spyObject;
    }
}
