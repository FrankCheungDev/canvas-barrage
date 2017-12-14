;
(function() {

  /**
   * 
   * @param {object, string} oCanvas 
   * @param {array} aBarrage 
   * @param {object} option
   * 
   * option = {
   * multiLine: boolean,
   * diffSpeed: boolean,
   * speed: number,
   * interval: number,
   * colorArr: array,
   * fontSize: number
   * 
   * } 
   */
  // 弹幕方法
  var canvasBarrage = function(oCanvas, aBarrage, option) {
    // 对传入数据进行处理
    if (!oCanvas || !aBarrage || !aBarrage.length) {
      return;
    }
    // 对传入option处理
    option = option ? option : {
      multiLine: false,
      diffSpeed: false,
      speed: 1,
      // interval: number,
      // colorArr: array,
      // fontSize: number
    };
    
    // 对传入的canvas参数进行处理
    if (typeof oCanvas === 'string') {
      var canvas = document.querySelector(oCanvas);
      canvasBarrage(canvas, aBarrage, option);
      return;
    }
    
    var canvas = oCanvas;
    var context = canvas.getContext('2d');
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    // 计数器，用于计算绘制次数
    var lastCounter = 0;
    var curCounter = 0;
    
    // 存储弹幕实例
    var store = {}; 

    // 字体大小
    var fontSize = option.fontSize || canvas.width / 30;
    
    // 颜色数组
    var colorArr = ['red', 'skyblue', 'yellow', 'orange'] || option.colorArr;
    var colorArrLength = colorArr.length;

    // 上条弹幕字符数
    var lastBarrageLength = 0;
    
    // 上个弹幕位置
    var lastX = 0;
    
    // 弹幕间隔
    var interval = option.interval || fontSize * 5;

    // 弹幕实例方法
    var Barrage = function(obj, index) {
      // 判断X位置，第一个弹幕与其他弹幕的位置设置区别
      this.x = index === 0 ? canvas.width : lastX;
      
      // 判断是否多行
      // 不是多行则默认Y位置为字体大小
      this.y = option.multiLine ? canvas.height * Math.random() : fontSize;
      // 若多行Y位置的极限状态（上要留空一个字体大小的位置，下最大紧贴底部）
      if (this.y < fontSize) {
        this.y = fontSize;
      } else if (this.y > canvas.height - fontSize) {
        this.y = canvas.height - fontSize;
      }
      
      // 判断弹幕速度是否相同
      this.speed = option.speed || 1;
      this.moveX = option.diffSpeed ? this.speed + Math.random() * 3 : this.speed;
      
      // 储存当前弹幕参数
      this.params = obj;
      
      // 定义当前弹幕的绘制方法
      this.draw = function () {
        var params = this.params;
        // 弹幕的边框颜色
        context.strokeStyle = colorArr[index % colorArrLength];
        // 定义弹幕字体
        context.font = fontSize + 'px "microsoft yahei", sans-serif';
        // 弹幕的填充颜色
        context.fillStyle = colorArr[index % colorArrLength];
        // 填充弹幕（根据弹幕实例自身的x、y值）
        context.fillText(params.value, this.x, this.y);
        // 绘制弹幕轮廓（根据弹幕实例自身的x、y值）
        context.strokeText(params.value, this.x, this.y);
      };
      
      // 储存当前弹幕的字符数
      lastBarrageLength = obj.value.length;
      // 储存当前弹幕长度加上间隔显示完的X位置
      lastX = this.x + lastBarrageLength * fontSize + interval;
      
    };
    
    // 定义绘制弹幕方法
    var draw = function () {
      for (var index in store) {
        // 取出弹幕实例
        var barrage = store[index];
        // 获取当前弹幕实例的字数
        var textLength = barrage.params.value.length;
        
        // 位置变化
        barrage.x -= barrage.moveX;
        
        // 判断弹幕的横向位置，到达极值则重置位置
        // 没有到达极值则继续按照原来的参数绘制
        if (barrage.x < -1 * textLength * fontSize) {
          // 移动到画布外部时候从右侧开始继续位移
          // 重置当前弹幕位置时，判断最后一条评论的位置，如果已经全部显示在屏幕上，则重新开始的评论从屏幕右侧开始；
          // 如果没有显示，则在最后一条评论后一定间隔后开始。
          
          // 获取最后一条弹幕当前的横向位置（通过绘制次数及每次变化的X值求出移动距离）
          var nowLastX = lastX - barrage.moveX * (curCounter - lastCounter);
          // 更新当前弹幕的横向位置
          barrage.x = nowLastX < canvas.width ? canvas.width : nowLastX;
          
          // 更新当前弹幕的垂直位置
          barrage.y = option.multiLine ? canvas.height * Math.random() : fontSize;
          if (barrage.y < fontSize) {
            barrage.y = fontSize;
          } else if ( barrage.y > canvas.height - fontSize ) {
            barrage.y = canvas.height - fontSize;
          }
          
          // 更新当前弹幕的变化速度
          barrage.moveX = option.diffSpeed ? barrage.speed + Math.random() * 3 : barrage.speed;
          
          // 储存当前弹幕的字数长度
          lastBarrageLength = textLength;
          // 储存当前弹幕长度加上间隔显示完的X位置
          lastX = barrage.x + lastBarrageLength * fontSize + interval;
          // 更新计数器，记录当前弹幕重置时的计数器
          lastCounter = curCounter;
        }
        // 根据新位置绘制圆圈圈
        store[index].draw();
      }
    };
    
    // 定义渲染方法
    var render = function (timeStamp) {
      // 更新计数器
      curCounter++;

      // 清除画布
      context.clearRect(0, 0, canvas.width, canvas.height);

      // 执行绘制方法，绘制所有弹幕实例
      draw();

      // 调用原生方法，根据当前屏幕帧率继续渲染
      requestAnimationFrame(render);
    };
    
    // 处理弹幕数组创建弹幕实例
    aBarrage.forEach(function (obj, index) {
      store[index] = new Barrage(obj, index);
    });
    
    // 调用渲染方法
    render();
    
  };
  window.canvasBarrage = canvasBarrage;

}());