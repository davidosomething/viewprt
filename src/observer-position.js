import { Observer, ObserverInterface } from './observer-interface'

const PositionObserver = ObserverInterface(function PositionObserver (opts = {}) {
  if (!(this instanceof PositionObserver)) {
    return new PositionObserver(...arguments)
  }

  this.onTop = opts.onTop
  this.onBottom = opts.onBottom
  this._wasTop = true
  this._wasBottom = false

  const viewport = Observer.call(this, opts)
  this.check(viewport.getState())
})

PositionObserver.prototype.check = function (viewportState) {
  const { onBottom, onTop, _wasTop, _wasBottom, container, offset, once } = this
  const { scrollHeight } = container
  const { h, y } = viewportState
  const atTop = y - offset <= 0
  const atBottom = scrollHeight > h && h + y + offset >= scrollHeight

  if (onBottom && !_wasBottom && atBottom) {
    onBottom.call(this, container)
    once && this.destroy()
  } else if (onTop && !_wasTop && atTop) {
    onTop.call(this, container)
    once && this.destroy()
  }

  this._wasTop = atTop
  this._wasBottom = atBottom
}

export default PositionObserver
