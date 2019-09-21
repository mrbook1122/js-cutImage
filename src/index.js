import $ from './jquery.min'
import html2canvas from './html2canvas.min'
import './jcanvas.min'

function drawRect(canvasId, sendResp) {
    // var that = this;

    // that.penColor = penColor;
    // that.penWidth = strokeWidth;
    var canvas = document.getElementById(canvasId);
    //canvas 的矩形框
    var canvasRect = canvas.getBoundingClientRect();
    //canvas 矩形框的左上角坐标
    var canvasLeft = canvasRect.left;
    var canvasTop = canvasRect.top;

    // 要画的矩形的起点 xy
    var x = 0;
    var y = 0;

    //鼠标点击按下事件，画图准备
    canvas.onmousedown = function (e) {

        //设置画笔颜色和宽度
        var color = 'red';
        var penWidth = 1;
        // 确定起点
        x = e.clientX - canvasLeft;
        y = e.clientY - canvasTop;
        // 添加layer
        $("#" + canvasId).addLayer({
            type: 'rectangle',
            strokeStyle: color,
            strokeWidth: 1,
            name: 'areaLayer',
            fromCenter: false,
            x: x, y: y,
            width: 1,
            height: 1
        });
        // 绘制
        $("#" + canvasId).drawLayers();
        $("#" + canvasId).saveCanvas();

        //鼠标移动事件，画图
        canvas.onmousemove = function (e) {

            // 要画的矩形的宽高
            var width = e.clientX - canvasLeft - x;
            var height = e.clientY - canvasTop - y;

            // 清除之前画的
            $("#" + canvasId).removeLayer('areaLayer');

            $("#" + canvasId).addLayer({
                type: 'rectangle',
                strokeStyle: color,
                strokeWidth: penWidth,
                name: 'areaLayer',
                fromCenter: false,
                x: x, y: y,
                width: width,
                height: height
            });

            $("#" + canvasId).drawLayers();
        }
    };
    //鼠标抬起
    canvas.onmouseup = function (e) {

        var color = 'red';
        var penWidth = 1;

        canvas.onmousemove = null;

        var width = e.clientX - canvasLeft - x;
        var height = e.clientY - canvasTop - y;

        $("#" + canvasId).removeLayer('areaLayer');

        $("#" + canvasId).addLayer({
            type: 'rectangle',
            strokeStyle: color,
            strokeWidth: 1,
            name: 'areaLayer',
            fromCenter: false,
            x: x, y: y,
            width: width,
            height: height
        });

        $("#" + canvasId).drawLayers();
        $("#" + canvasId).saveCanvas();

        // 把body转成canvas
        html2canvas(document.body, {
            scale: 1,
            // allowTaint: true,
            useCORS: true  //跨域使用
        }).then(canvas => {
            var capture_x, capture_y
            if (width > 0) {
                //从左往右画
                capture_x = x + 1
            } else {
                //从右往左画
                capture_x = x + width + 1
            }
            if (height > 0) {
                //从上往下画
                capture_y = y + 1
            } else {
                //从下往上画
                capture_y = y + height + 1
            }
            let data = printClip(canvas, capture_x, capture_y, Math.abs(width), Math.abs(height))
            sendResp({data: data})
        });
        // 移除画的选取框
        $("#" + canvasId).removeLayer('areaLayer');
        // 隐藏用于华画取框的canvas
        $("#" + canvasId).hide()
    }
}
function printClip(canvas, capture_x, capture_y, capture_width, capture_height) {
    // 创建一个用于截取的canvas
    var clipCanvas = document.createElement('canvas')
    clipCanvas.width = capture_width
    clipCanvas.height = capture_height
    // 截取
    clipCanvas.getContext('2d').drawImage(canvas, capture_x, capture_y, capture_width, capture_height, 0, 0, capture_width, capture_height)
    return clipCanvas.toDataURL()
}
var clientWidth = document.documentElement.clientWidth || document.body.clientWidth
var clientHeight = document.documentElement.clientHeight || document.body.clientHeight
// 更新canvas宽高
let canvas = document.createElement('canvas')
canvas.style.position = 'absolute'
canvas.style.left = 0;
canvas.style.top = 0;
canvas.style.zIndex = 1000;
canvas.id = 'bg_canvas'
document.body.appendChild(canvas)
$("#bg_canvas").attr("width", clientWidth);
$("#bg_canvas").attr("height", clientHeight);
$('#bg_canvas').hide()
chrome.runtime.onMessage.addListener((message, sender, sendResp) => {
    if (message.msg === 'cut') {
        $('#bg_canvas').show()
        drawRect('bg_canvas', sendResp)
    }
})