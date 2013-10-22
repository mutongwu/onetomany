//requirejs.config({
//    baseUrl: 'http://shawn.tianya.cn:5678/src'
//});
if(!window.console){
    window.console = {log: function(str){
        document.getElementById('output').value = 
        document.getElementById('output').value + "\r\n" + str;
    }};
}

require(['core/Common','io/Cookie','util/Json','util/Format','io/LocalStorage','ui/PageBar',
        'ui/MsgBox',
        'plugins/tiny_mce3.5.7/jscripts/tiny_mce',
        'plugins/jquery/livequery',
        'plugins/jquery/uploadify/uploadify'
        ],
    function(Common,Cookie,JSON,Format,LocalStorage,PageBar,
        MsgBox) {
           
     var jQuery = Common.jQuery,
         Template = Common.Template,
         XTemplate = Common.XTemplate;
         
 
     jQuery(function(){
//	    console.log("cc")
                tinyMCE.init({
                     mode : "textareas",
                     theme : "simple"
                    });
	            
return;
        jQuery(".aBox").livequery(function(){
            console.log("ok")
        });
        jQuery('#read').click(function(){
            var name = jQuery("#inputName").attr("value"),
                val = jQuery('#inputValue').attr("value");
            jQuery(document.body).append('<div class="aBox"></div>');
        });
        
        jQuery('#del').click(function(){
        });
     });
});