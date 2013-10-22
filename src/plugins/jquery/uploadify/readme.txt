        
        使用例子：
        jQuery('#file_upload').uploadify({
            auto: false,
//            removeCompleted : false,
            width: 80,
            height: 30,
            multi:true,
            buttonText: "Browse",
            uploader: 'http://shawn.tianya.cn:5678/src/plugin/jquery/uploadify/uploadify.swf',
            script: 'upload.php'      // 上传接口
        });
如果使用uploadify_alpha.swf,则通常用样式，把 file_upload 设置为隐藏，并
定义好 宽度、高度，
另外，在给出一张背景图片，用来显示【上传】或【浏览】二字
<div style="width:80;height:30px;overflow:hidden;background:url(上传)">
<span id="file_upload"></span></div>        