/**
 * @author shawnwu
 */
define(['jquery', 'core/Base','core/Template', 'core/XTemplate'],
    function($,Base,Template,XTemplate){
    
        
    var i = 1,
        pre = 'id_shawn_';
    /**
	 * @description 公用基础功能
	 * @exports core/Common
	 */
	var common =  {
        "id": function(){return pre + (++i);},
        "jQuery": $,
        "Base": Base,
        /** @property {core/Template} Template
         *  @readonly
         *  @see core/Template
         *  @description 基础模板
         *  */
        "Template": Template,
        "XTemplate": XTemplate
	};
    return common;
});