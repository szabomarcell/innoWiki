innoWiki.events.ContentChange.add(function(){
	innoWiki.ui.TOC.show();
});

innoWiki.widgets.add("toc",
	new innoWiki.widgets.BoxContent(
	'Table of Contents',
	'<div id="innowiki_ui_toc_div"></div>'
));	


innoWiki.ui.TOC = {
	headings: new Array(),
	
	generate: function(){
			this.headings = new Array();
			$("*",innoWiki.frontend.editor.getBody()).each(function(){
				if( this.tagName.match(/h[1-9]/i) ){
					innoWiki.ui.TOC.headings.push(this);
				}
			})
	},

	getHTML: function(){
		var ret;
		if(this.headings.length>0){
			ret = "<ul>";
			for(var i=0; i<this.headings.length; i++){
				ret += "<li class='"+this.headings[i].tagName.toLowerCase()+"'><a href='heading:"+$(this.headings[i]).text()+"' onclick='innoWiki.ui.TOC.select("+i+");return false;'>"+$(this.headings[i]).text()+"</a></li>";
			}
			ret += "</ul>";
		} else {
			ret = "No headings on the page.<br/> To create a heading, set the format of a paragraph to heading!"
		}
		return ret;
	},
	
	show: function(){
		this.generate();
		$("#innowiki_ui_toc_div").html(this.getHTML());
	},
	
	select: function(i){
		this.headings[i].scrollIntoView();
		var ed = innoWiki.frontend.editor;
		ed.selection.select(this.headings[i]);
		ed.selection.collapse(true);
		ed.focus();
	}
	
}