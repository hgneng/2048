// JavaScript的学名是ECMAScript，本身是一个不断发展的过程，目前广泛支持的是ES5，正在向ES6进化。
// 在进化过程，有些浏览器版本的JavaScript对象有bind方法，有些没有，下面的语句是为没有的JavaScript解释器增加等价的功能。
// (A || B)是一个逻辑或的判断，如果A为真，那么B不需要运算。如果Function.prototype.bind有定义，则表示“真”，那么就不执行后面的语句。
// 换言之，这里的逻辑是：如果方法bind定义了，就等于自己。如果没有定义，就给它定义成一个函数。
// 最终，所有JavaScript对象将增加一个bind的方法（在面向过程的术语里，我们成为函数；在面向对象的术语里我们成为方法），
// bind方法有一个参数target，其功能是让对象增加一个新的名称为target的方法。
// 这里可能有点难理解，不理解也不要紧，它不影响理解主要的游戏逻辑。
Function.prototype.bind = Function.prototype.bind || function (target) {
  var self = this;
  return function (args) {
    if (!(args instanceof Array)) {
      args = [args];
    }
    self.apply(target, args);
  };
};
