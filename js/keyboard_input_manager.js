// 从文件名，我们可以猜测，这个文件的作用是处理键盘输入的
function KeyboardInputManager() {
  this.events = {};

  // 不同的浏览器有不同的事件
  if (window.navigator.msPointerEnabled) {
    //Internet Explorer 10 style
    this.eventTouchstart    = "MSPointerDown";
    this.eventTouchmove     = "MSPointerMove";
    this.eventTouchend      = "MSPointerUp";
  } else {
    this.eventTouchstart    = "touchstart";
    this.eventTouchmove     = "touchmove";
    this.eventTouchend      = "touchend";
  }

  this.listen();
}

// 我们定义KeyboardInputManager.on(event, callback)这个方法
// 它可以监听event事件，例如键盘按下、鼠标点击等，当事件触发的时候就执行
KeyboardInputManager.prototype.on = function (event, callback) {
  if (!this.events[event]) {
    this.events[event] = [];
  }
  this.events[event].push(callback); // 注册的回调函数是以数组方式保存的，后注册的并不会覆盖之前注册的，只是按顺序执行回调函数
                                     // 例如，我们可以在一个地方注册某个格子点击后回闪一下，在另外一个地方注册同一个格子点击后发成“滴”一声
                                     // 那么实际点击该格子，就会既闪一下，又发出“滴”一声
};

// emit方法触发事件的回调函数，并以data作为参数逐一执行回调函数。
KeyboardInputManager.prototype.emit = function (event, data) {
  var callbacks = this.events[event];
  if (callbacks) {
    callbacks.forEach(function (callback) {
      callback(data);
    });
  }
};

KeyboardInputManager.prototype.listen = function () {
  var self = this;

  // 下面是键盘键对应的ASCII码，从这个列表我们可以发现，原来不单止上下左右方向键可以操作，WSAD也可以。
  // 事实上，在PC双打的游戏中WSAD就是常用的第二个玩家的方向键
  var map = {
    38: 0, // Up
    39: 1, // Right
    40: 2, // Down
    37: 3, // Left
    75: 0, // Vim up
    76: 1, // Vim right
    74: 2, // Vim down
    72: 3, // Vim left
    87: 0, // W
    68: 1, // D
    83: 2, // S
    65: 3  // A
  };

  // Respond to direction keys
  document.addEventListener("keydown", function (event) {
    var modifiers = event.altKey || event.ctrlKey || event.metaKey ||
                    event.shiftKey;
    var mapped    = map[event.which];

    if (!modifiers) {
      if (mapped !== undefined) {
        event.preventDefault();
        self.emit("move", mapped);
      }
    }

    // R key restarts the game
    if (!modifiers && event.which === 82) {
      self.restart.call(self, event);
    }
  });

  // Respond to button presses
  this.bindButtonPress(".retry-button", this.restart);
  this.bindButtonPress(".restart-button", this.restart);
  this.bindButtonPress(".keep-playing-button", this.keepPlaying);

  // Respond to swipe events
  var touchStartClientX, touchStartClientY;
  var gameContainer = document.getElementsByClassName("game-container")[0];

  // 除了用键盘控制，我们还可以在手机上通过触摸控制，这就是Touchstart事件，和Touchend事件
  gameContainer.addEventListener(this.eventTouchstart, function (event) {
    if ((!window.navigator.msPointerEnabled && event.touches.length > 1) ||
        event.targetTouches.length > 1) {
      return; // Ignore if touching with more than 1 finger
    }

    if (window.navigator.msPointerEnabled) {
      touchStartClientX = event.pageX;
      touchStartClientY = event.pageY;
    } else {
      touchStartClientX = event.touches[0].clientX;
      touchStartClientY = event.touches[0].clientY;
    }

    event.preventDefault();
  });

  gameContainer.addEventListener(this.eventTouchmove, function (event) {
    event.preventDefault();
  });

  gameContainer.addEventListener(this.eventTouchend, function (event) {
    if ((!window.navigator.msPointerEnabled && event.touches.length > 0) ||
        event.targetTouches.length > 0) {
      return; // Ignore if still touching with one or more fingers
    }

    var touchEndClientX, touchEndClientY;

    if (window.navigator.msPointerEnabled) {
      touchEndClientX = event.pageX;
      touchEndClientY = event.pageY;
    } else {
      touchEndClientX = event.changedTouches[0].clientX;
      touchEndClientY = event.changedTouches[0].clientY;
    }

    var dx = touchEndClientX - touchStartClientX;
    var absDx = Math.abs(dx);

    var dy = touchEndClientY - touchStartClientY;
    var absDy = Math.abs(dy);

    // 通过计算触摸事件的起止位置差，判断用户是做上下左右哪个方向的移动
    if (Math.max(absDx, absDy) > 10) { // 移动距离最小是10个单位
      // (right : left) : (down : up)
      // 调用move方法，0-3作为参数。0表示向上移动，1表示向右移动，2表示向下移动，3表示向左移动
      self.emit("move", absDx > absDy ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0));
    }
  });
};

KeyboardInputManager.prototype.restart = function (event) {
  event.preventDefault(); // 阻止事件向上传递。比如说，有个人要闯进公司，守门口的保安把他拦住了，他没有必要把这件事告诉老板。
                          // 如果他没有把事件拦住，老板可能又会叫另外一个保安过来驱赶这个人。
  this.emit("restart");
};

KeyboardInputManager.prototype.keepPlaying = function (event) {
  event.preventDefault();
  this.emit("keepPlaying");
};

KeyboardInputManager.prototype.bindButtonPress = function (selector, fn) {
  var button = document.querySelector(selector);
  button.addEventListener("click", fn.bind(this));
  button.addEventListener(this.eventTouchend, fn.bind(this));
};
