import '@testing-library/jest-dom'

// jsdom does not implement showModal/close, so buttons inside a <dialog>
// are hidden from the accessibility tree unless the `open` attribute is set.
// Mock both methods to keep the DOM state in sync with what a real browser does.
HTMLDialogElement.prototype.showModal = function () {
  this.setAttribute('open', '')
}
HTMLDialogElement.prototype.close = function () {
  this.removeAttribute('open')
}
