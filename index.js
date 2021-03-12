/**
 * 
 * @param {version} v1.0 
 */

(function (window) {
  function mEvent(selector) {
    return mEvent.prototype._init(selector)
  }
  mEvent.prototype = {
    _init: function (selector) {
      if (typeof selector === 'string') {
        this.elm = window.document.querySelector(selector)
        return this
      }
    },
    // 监听开始/结束触摸事件并分别记录触发时间, 触摸时间差小于300ms则认定为点击事件
    tap: function (handler) {
      var startTime, endTime
      this.elm.addEventListener('touchstart', touchFn)
      this.elm.addEventListener('touchend', touchFn)

      function touchFn(e) {
        e.preventDefault()
        if (e.type === 'touchstart') {
          startTime = new Date().getTime()
        } else if (e.type === 'touchend') {
          endTime = new Date().getTime()
          if (endTime - startTime < 300) {
            handler.call(this, e)
          }
        }
      }
    },
    // 开始触摸事件触发超过1s则认定为触发长按事件, 触摸移动/接触触摸都清除定时器, 不认定为长按事件
    longtap: function (handler) {
      this.elm.addEventListener('touchstart', touchFn)
      this.elm.addEventListener('touchmove', touchFn)
      this.elm.addEventListener('touchend', touchFn)

      var timer
      function touchFn(e) {
        if (e.type === 'touchstart') {
          timer = setTimeout(() => {
            handler.call(this, e)
          }, 1000)
        } else if (e.type === 'touchmove') {
          clearTimeout(timer)
        } else if (e.type === 'touchend') {
          clearTimeout(timer)
        }
      }
    },
    // x方向移动距离大于y则 认定为滑动
    slide: function (handler) {
      this.elm.addEventListener('touchstart', touchFn)
      this.elm.addEventListener('touchend', touchFn)

      var startX, startY, endX, endY
      function touchFn(e) {
        e.preventDefault()
        // 屏幕上正在移动的点
        var firstTouch = e.changedTouches[0]
        if (e.type === 'touchstart') {
          startX = firstTouch.pageX
          startY = firstTouch.pageY
        } else if (e.type === 'touchend') {
          endX = firstTouch.pageX
          endY = firstTouch.pageY
          if (Math.abs(endX - startX) >= Math.abs(endY - startY)) {
            // 左右滑动
            // 滑动距离够再触发
            if (Math.abs(startX - endX) >= 30) {
              startX - endX > 0 ? handler['left'].call(this, e) : handler['right'].call(this, e)
            }
          } else {
            // 上下滑动
            if (Math.abs(startY - endY) >= 30) {
              startY - endY > 0 ? handler['up'].call(this, e) : handler['down'].call(this, e)
            }
          }
        }
      }
    },
    gesture: function (handler) {
      
    }
  }
  window.mEvent = mEvent
})(window)