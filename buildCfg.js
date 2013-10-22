({
    appDir: "./src",
    baseUrl: "./",
    dir: "dist/test",
    paths:{
        "jquery":"empty:"
    },
    
    //uglify/closure/none
    optimize: "none",
    fileExclusionRegExp: /^\./,
    
    //把多个文件合并
    modules: [{
            name: "core/Common"
        },{
            name: "main",
            exclude: [
                "plugins/tiny_mce3.5.7/jscripts/tiny_mce"
            ]
        }
    ],
    shim:{
    }
})
