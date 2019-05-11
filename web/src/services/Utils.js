
export default class Utils {
  static isInChromeExtension() {
    return window.location.protocol === "chrome-extension:";
  }
}