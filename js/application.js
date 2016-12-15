// 这个文件只是等待浏览器完成加载的时候执行游戏的初始化
// 从性能的角度看，这么短小的JS文件是不应该单独放在一个文件里的，这会增加网络连接的次数
// 但这是一个清晰的框架结构，人们很容易识别出这里是游戏逻辑的入口
// 如果做性能优化，我们可以轻易地把所有JS文件和合并成1个并压缩。所以，性能不是一个问题。
// Wait till the browser is ready to render the game (avoids glitches)
window.requestAnimationFrame(function () {
  new GameManager(4, KeyboardInputManager, HTMLActuator, LocalStorageManager);
});
