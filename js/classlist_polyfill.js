// 整个文件的代码由(function(){})();括起来，这种技巧是为了让文件里的变量不影响其它文件
// 比如说，如果这个文件定义了变量var i。如果不这样做，另外一个文件也有变量var i，那么就会冲突，并在逻辑上产生意外的结果。
// 这种技巧在其它现代的面向对象语言（如Java）里是通过名字空间实现的。
// 补充说明：Java和JavaScript是完全不同的计算机语言，没有任何关系。而C和C++语言则是有很大关系的。
// 和bind_polifill.js类似，带polifill后缀的3个JS文件都是对不支持某些有用方法的JavaScript解释器的补丁文件。
// 这个补丁文件是保证JavaScript对象有一个classList的方法可以获取元素的所有class
(function () {
  if (typeof window.Element === "undefined" ||
      "classList" in document.documentElement) {
    return;
  }

  var prototype = Array.prototype,
      push = prototype.push,
      splice = prototype.splice,
      join = prototype.join;

  function DOMTokenList(el) {
    this.el = el;
    // The className needs to be trimmed and split on whitespace
    // to retrieve a list of classes.
    var classes = el.className.replace(/^\s+|\s+$/g, '').split(/\s+/);
    for (var i = 0; i < classes.length; i++) {
      push.call(this, classes[i]);
    }
  }

  DOMTokenList.prototype = {
    add: function (token) {
      if (this.contains(token)) return;
      push.call(this, token);
      this.el.className = this.toString();
    },
    contains: function (token) {
      return this.el.className.indexOf(token) != -1;
    },
    item: function (index) {
      return this[index] || null;
    },
    remove: function (token) {
      if (!this.contains(token)) return;
      for (var i = 0; i < this.length; i++) {
        if (this[i] == token) break;
      }
      splice.call(this, i, 1);
      this.el.className = this.toString();
    },
    toString: function () {
      return join.call(this, ' ');
    },
    toggle: function (token) {
      if (!this.contains(token)) {
        this.add(token);
      } else {
        this.remove(token);
      }

      return this.contains(token);
    }
  };

  window.DOMTokenList = DOMTokenList;

  function defineElementGetter(obj, prop, getter) {
    if (Object.defineProperty) {
      Object.defineProperty(obj, prop, {
        get: getter
      });
    } else {
      obj.__defineGetter__(prop, getter);
    }
  }

  defineElementGetter(HTMLElement.prototype, 'classList', function () {
    return new DOMTokenList(this);
  });
})();
