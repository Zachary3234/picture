const foot = document.getElementById('foot');
const lazyload = (function (){
    var srcsToLoad;
    var imgsLoading = [];
    var funcs;
    var loadFlag = true;
    // 尾部是否进入视口触发加载
    (new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                // console.log("foot in");
                if (loadFlag==false){
                    loadFlag = true;
                    lazyloadImgs();
                }
            }
        })
    },
        {
            threshold: 1,
            rootMargin: '0px 0px 500px 0px'
        }
    )).observe(foot);
    // 检查是否需加载
    function checkLoad(){
        const footTop = foot.getBoundingClientRect().top;
        const viewHeight = document.body.clientHeight;
        if (footTop - viewHeight < 500){
            if (loadFlag==false){
                loadFlag = true;
                lazyloadImgs();
            }
        }
    }
    
    //图片预加载
    var imgOnReady = (function () {
        var list = [], intervalId = null,

            // 用来执行队列
            tick = function () {
                var i = 0;
                for (; i < list.length; i++) {
                    list[i].end ? list.splice(i--, 1) : list[i]();
                };
                !list.length && stop();
            },

            // 停止所有定时器队列
            stop = function () {
                clearInterval(intervalId);
                intervalId = null;
            };

        return function (url, ready, load, error) {
            var onready, width, height, newWidth, newHeight;
            var img = new Image();
            img.src = url;
            img.state = 'craete';

            // 如果图片被缓存，则直接返回缓存数据
            if (img.complete) {
                img.state = 'load';
                ready.call(img);
                load && load.call(img);
                return img;
            };

            width = img.width;
            height = img.height;

            // 加载错误后的事件
            img.onerror = function () {
                error && error.call(img);
                onready.end = true;
                img.state = 'error';
                img = img.onload = img.onerror = null;
            };

            // 图片尺寸就绪
            onready = function () {
                newWidth = img.width;
                newHeight = img.height;
                if (newWidth !== width || newHeight !== height || newWidth * newHeight > 1024) {
                    // 如果图片已经在其他地方加载可使用面积检测
                    ready.call(img);
                    onready.end = true;
                    img.state = 'ready';
                };
            };
            onready();

            // 完全加载完毕的事件
            img.onload = function () {
                // onload在定时器时间差范围内可能比onready快
                // 这里进行检查并保证onready优先执行
                !onready.end && onready();

                load && load.call(img);

                img.state = 'load';
                // IE gif动画会循环执行onload，置空onload即可
                img = img.onload = img.onerror = null;
            };

            // 加入队列中定期执行
            if (!onready.end) {
                list.push(onready);
                // 无论何时只允许出现一个定时器，减少浏览器性能损耗
                if (intervalId === null) intervalId = setInterval(tick, 10);
            };

            return img;
        };
    })();

    // 懒加载图片
    async function lazyloadImgs(maxLength = 10){
        if (srcsToLoad.length==0)
            return;
        maxLength = Math.min(maxLength,srcsToLoad.length);
        imgsLoading = [];
        for (let i = 0; i < maxLength; i++) {
            imgsLoading.push(new Promise((resolve,reject)=>{
                imgOnReady((srcsToLoad.splice(0,1))[0], function () {
                    // 图片Ready
                    funcs.ready.call(this);
                    resolve(this);
                },funcs.load,funcs.error)
            }));
        }
        // 等待图片预加载完毕
        imgsLoading = await Promise.all(imgsLoading);
        // 全部加载完毕执行方法
        funcs.allready.call(imgsLoading);
        // 检查是否需继续加载
        loadFlag = false;
        checkLoad();
    }

    return {
        iniImgs: function (imgSrcs, allready, ready, load, error){
            srcsToLoad = imgSrcs;
            imgsLoading = [];
            // 启动懒加载图片
            funcs = {
                'allready': allready,
                'ready': ready,
                'load': load,
                'error': error
            };
            loadFlag = true;
            lazyloadImgs();
        }
    }
})();