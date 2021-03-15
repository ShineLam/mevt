/**
 * 
 * @param {version} v1.0 
 */

(function (window) {
  function mEvent(selector) {
    return mEvent.prototype._init(selector)
  }
  function getDevice(dev) {
    var agent = navigator.userAgent
    var decive = {
      isadr: agent.indexOf('Android') != -1 || agent.indexOf('Adr') != -1,
      isios: agent.indexOf('iPhone') != -1
    }
    return decive['is' + dev.toLowerCase()]
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
    // x方向移动距离大于y则 认定为左右滑动, 反之则为上下滑动
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
    // 自定义滚动区域 代替scroll
    // 待优化项: 滚动速度 最大滑动值 = 列表高度 - 视口高度
    roll: function (handler) {
      this.elm.addEventListener('touchstart', touchFn)
      this.elm.addEventListener('touchmove', touchFn)
      
      var startY = 0,
        startEl = 0,
        translateY = 0,
        self = this
      function touchFn(e) {
        if (e.type === 'touchstart') {
          startY = e.changedTouches[0].pageY
          startEl = translateY
        } else if (e.type === 'touchmove') {
          var moveY = e.changedTouches[0].pageY
          // 距离 = 结束点 - 起始点
          var distance = moveY - startY
          translateY = startEl + distance
          e.distance = distance
          e.translateY = translateY
          self.elm.style.transform = 'translateY(' + translateY + 'px)'
          handler.call(this, e)
        }
      }
    },
    // 多点触摸
    gesture: function (handler) {
      this.gesture4Ios = function () {
        this.elm.addEventListener('gesturestart', gestureFn)
        this.elm.addEventListener('gesturechange', gestureFn)
        this.elm.addEventListener('gestureend', gestureFn)

        function gestureFn(e) {
          if (e.type === 'gesturestart') {
            handler && handler['start'](e)
          } else if (e.type === 'gesturechange') {
            handler && handler['move'](e)
          } else if (e.type === 'gestureend') {
            handler && handler['end'](e)
          }
        }
      }

      this.gesture4Adr = function () {
        let start = false
        this.elm.addEventListener('touchstart', (e) => {
          // 触摸点大于两个则认定为多点触摸
          if (e.touches.length >= 2) {
            start = true
            // 初始距离/角度
            this.startDistance = getDistance(e.touches[0], e.touches[1])
            this.startDeg = getDeg(e.touches[0], e.touches[1])
            handler && handler['start'](e)
          }
        })
        this.elm.addEventListener('touchmove', (e) => {
          // 触摸点大于两个则认定为多点触摸
          if (e.touches.length >= 2) {
            start = true
            // 实时距离/角度
            this.curDistance = getDistance(e.touches[0], e.touches[1])
            this.curDeg = getDeg(e.touches[0], e.touches[1])
            e.scale = this.curDistance / this.startDistance
            e.rotation = this.curDeg - this.startDeg
            // 计算实时距离与初始距离的比例
            handler && handler['change'](e)
          }
        })
        this.elm.addEventListener('touchend', (e) => {
          start = false
          handler && handler['end'](e)
        })
        // 获取两点间距离
        function getDistance(p1, p2) {
          const a = p1.clientX - p2.clientX
          const b = p1.clientY - p2.clientY
          // 勾股定理
          return Math.sqrt(a * a + b * b)
        }
        function getDeg(p1, p2) {
          const x = p1.clientX - p2.clientX
          const y = p1.clientY - p2.clientY
          // 正切
          const rotation = Math.atan2(y, x)
          return rotation * 180 / Math.PI
        }
      }
      getDevice('ios') && this.gesture4Ios()
      getDevice('adr') && this.gesture4Adr()
    }
  }
  window.mEvent = mEvent
})(window)