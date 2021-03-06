const assert = require('assert')
const rewire = require('rewire')

// User rewire to access private `viewports` array to get/reset state for tests
const viewprt = rewire('../dist/viewprt.cjs.js')
const _viewports = viewprt.__get__('viewports')
const getViewports = () => _viewports.slice()
const resetViewports = () => (_viewports.length = 0)

const { PositionObserver, ElementObserver } = viewprt

// jsdom won't let you get/set document.body.scrollHeight directly
let bodyScrollHeight = 0
Object.defineProperty(document.body, 'scrollHeight', {
  get: () => bodyScrollHeight,
  set: (v) => { bodyScrollHeight = v }
})

describe('viewprt', () => {
  beforeEach(() => {
    window.pageYOffset = 0
    window.innerWidth = 1024
    window.innerHeight = 768
    document.body.scrollHeight = 768
  })

  afterEach(() => {
    resetViewports()
  })

  describe('options', () => {
    it('resolves the offest option', () => {
      let observer = PositionObserver()
      assert.equal(observer.offset, 0)
      observer = ElementObserver()
      assert.equal(observer.offset, 0)

      observer = PositionObserver({ offset: 100 })
      assert.equal(observer.offset, 100)
      observer = ElementObserver(null, { offset: 100 })
      assert.equal(observer.offset, 100)

      observer = PositionObserver({ offset: -100 })
      assert.equal(observer.offset, -100)
      observer = ElementObserver(null, { offset: -100 })
      assert.equal(observer.offset, -100)

      observer = PositionObserver({ offset: '100' })
      assert.equal(observer.offset, 100)
      observer = ElementObserver(null, { offset: '100' })
      assert.equal(observer.offset, 100)

      observer = PositionObserver({ offset: null })
      assert.equal(observer.offset, 0)
      observer = ElementObserver(null, { offset: null })
      assert.equal(observer.offset, 0)

      observer = PositionObserver({ offset: 'abc' })
      assert.equal(observer.offset, 0)
      observer = ElementObserver(null, { offset: 'abc' })
      assert.equal(observer.offset, 0)
    })

    it('resolves the container option', () => {
      let observer = PositionObserver()
      assert.equal(observer.container, document.body)
      observer = ElementObserver()
      assert.equal(observer.container, document.body)

      let container = document.createElement('div')
      observer = PositionObserver({ container })
      assert.equal(observer.container, container)
      observer = ElementObserver(null, { container })
      assert.equal(observer.container, container)
    })

    it('resolves the once option', () => {
      let observer = PositionObserver()
      assert.equal(observer.once, false)
      observer = ElementObserver()
      assert.equal(observer.once, false)

      observer = PositionObserver({ once: true })
      assert.equal(observer.once, true)
      observer = ElementObserver(null, { once: true })
      assert.equal(observer.once, true)

      observer = PositionObserver({ once: 0 })
      assert.equal(observer.once, false)
      observer = ElementObserver(null, { once: 0 })
      assert.equal(observer.once, false)

      observer = PositionObserver({ once: null })
      assert.equal(observer.once, false)
      observer = ElementObserver(null, { once: null })
      assert.equal(observer.once, false)
    })
  })

  describe('PositionObserver', () => {
    it('can create instances', () => {
      let observer = new PositionObserver()
      assert.ok(observer instanceof PositionObserver)

      observer = PositionObserver()
      assert.ok(observer instanceof PositionObserver)
    })

    it('reuses the same viewport if containers are the same', () => {
      let observer = PositionObserver()
      assert.equal(getViewports().length, 1)
      assert.equal(getViewports()[0].observers.length, 1)
      assert.equal(getViewports()[0].observers[0], observer)

      observer = PositionObserver()
      assert.equal(getViewports().length, 1)
      assert.equal(getViewports()[0].observers.length, 2)
      assert.equal(getViewports()[0].observers[1], observer)

      let container = document.createElement('div')
      observer = PositionObserver({ container })
      assert.equal(getViewports().length, 2)
      assert.equal(getViewports()[1].observers.length, 1)
      assert.equal(getViewports()[1].observers[0], observer)

      observer = PositionObserver({ container })
      assert.equal(getViewports().length, 2)
      assert.equal(getViewports()[1].observers.length, 2)
      assert.equal(getViewports()[1].observers[1], observer)
    })

    it('auto activates', () => {
      let observer = PositionObserver()
      assert.equal(getViewports().length, 1)
      assert.equal(getViewports()[0].observers.length, 1)
      assert.equal(getViewports()[0].observers[0], observer)

      observer = PositionObserver({ container: document.createElement('div') })
      assert.equal(getViewports().length, 2)
      assert.equal(getViewports()[1].observers.length, 1)
      assert.equal(getViewports()[1].observers[0], observer)
    })

    it('can (re)activate', () => {
      let observer = PositionObserver()
      assert.equal(getViewports().length, 1)
      assert.equal(getViewports()[0].observers.length, 1)

      observer.activate() // doesn't do anything. already activated
      assert.equal(getViewports().length, 1)
      assert.equal(getViewports()[0].observers.length, 1)

      observer.destroy()
      assert.equal(getViewports().length, 0)
      observer.activate() // re-activated
      assert.equal(getViewports().length, 1)
      assert.equal(getViewports()[0].observers.length, 1)
    })

    it('can destroy', () => {
      let observer = PositionObserver()
      assert.equal(getViewports().length, 1)
      assert.equal(getViewports()[0].observers.length, 1)
      observer.destroy()
      assert.equal(getViewports().length, 0)

      observer.destroy() // destroying again doesn't throw
      assert.equal(getViewports().length, 0)
      assert.ok(observer) // still an instance, just not checked
    })

    it('does not trigger callbacks when content and container are same size', () => {
      window.innerHeight = 500
      document.body.scrollHeight = 500

      let observer = PositionObserver({
        once: true,
        onTop () {
          assert(0)
        },
        onBottom () {
          assert(0)
        }
      })

      assert.equal(getViewports().length, 1)
      assert.equal(getViewports()[0].observers.length, 1)
      assert.equal(getViewports()[0].observers[0], observer)
    })

    it('triggers bottom callback if created while at bottom', (done) => {
      window.pageYOffset = 300
      window.innerHeight = 500
      document.body.scrollHeight = 800

      PositionObserver({
        onBottom () {
          assert(1)
          done()
        }
      })
    })
  })

  describe('ElementObserver', () => {
    it('can create instances', () => {
      let observer = new ElementObserver()
      assert.ok(observer instanceof ElementObserver)

      observer = ElementObserver()
      assert.ok(observer instanceof ElementObserver)
    })

    it('auto activates (if element exists and in DOM)', () => {
      let div = document.createElement('div')
      document.body.appendChild(div)
      let observer = ElementObserver(div)
      assert.equal(getViewports().length, 1)
      assert.equal(getViewports()[0].observers.length, 1)
      assert.equal(getViewports()[0].observers[0], observer)
    })

    it('triggers onEnter if in view on creation', () => {
      let div = document.createElement('div')
      div.getBoundingClientRect = () => ({
        top: 10,
        left: 10,
        bottom: 10,
        right: 10,
        width: 10,
        height: 10
      })

      document.body.appendChild(div)
      let observer = ElementObserver(div, {
        onEnter () {
          assert(1)
        }
      })

      assert.equal(getViewports().length, 1)
      assert.equal(getViewports()[0].observers.length, 1)
      assert.equal(getViewports()[0].observers[0], observer)
    })

    it('respects once option', () => {
      let div = document.createElement('div')
      div.getBoundingClientRect = () => ({
        top: 10,
        left: 10,
        bottom: 10,
        right: 10,
        width: 10,
        height: 10
      })

      document.body.appendChild(div)
      ElementObserver(div, {
        once: true,
        onEnter () {
          assert(1)
        }
      })

      assert.equal(getViewports().length, 0)
    })

    it('can (re)activate', () => {
      let observer = ElementObserver()
      assert.equal(getViewports().length, 1)
      assert.equal(getViewports()[0].observers.length, 1)

      observer.activate() // doesn't do anything. already activated
      assert.equal(getViewports().length, 1)
      assert.equal(getViewports()[0].observers.length, 1)

      observer.destroy()
      assert.equal(getViewports().length, 0)
      observer.activate() // re-activated
      assert.equal(getViewports().length, 1)
      assert.equal(getViewports()[0].observers.length, 1)
    })

    it('auto destroys if no longer DOM', () => {
      let div = document.createElement('div')
      document.body.appendChild(div)
      let observer = ElementObserver(div)

      assert.equal(getViewports().length, 1)
      assert.equal(getViewports()[0].observers.length, 1)
      assert.equal(getViewports()[0].observers[0], observer)

      document.body.removeChild(div)
      getViewports()[0].checkObservers()
      assert.equal(getViewports().length, 0)
    })

    it('does not auto-destroy if not initiallly in DOM, only when checked', () => {
      let div = document.createElement('div')
      let observer = ElementObserver(div)

      assert.equal(getViewports().length, 1)
      assert.equal(getViewports()[0].observers.length, 1)
      assert.equal(getViewports()[0].observers[0], observer)

      getViewports()[0].checkObservers()
      assert.equal(getViewports().length, 0)
    })

    it('can destroy', () => {
      let div = document.createElement('div')
      document.body.appendChild(div)
      let observer = ElementObserver(div)
      assert.equal(getViewports().length, 1)
      assert.equal(getViewports()[0].observers.length, 1)

      observer.destroy()
      assert.equal(getViewports().length, 0)
      observer.destroy() // destroying again doesn't throw
      assert.equal(getViewports().length, 0)
      assert.ok(observer) // still an instance, just not checked
    })
  })
})
