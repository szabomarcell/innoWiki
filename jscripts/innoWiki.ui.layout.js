innoWiki.events.Startup.addToTop(function(){
		var l = innoWiki.ui.layout;
		l.init();
		l.leftPane.add(innoWiki.widgets.get("logo,jump,changes,help"));
		l.centerPane.add(innoWiki.widgets.get("title,alerts,content,debug"));
		l.rightPane.add(innoWiki.widgets.get("toc"));
	
		innoWiki.elements = {
			pageTitle:	document.getElementById("wikititle"),
			summary:	document.getElementById("summary"),
			saveBtn:	document.getElementById("btn_savenow"),
			autosave:	document.getElementById("autosave"),
			jumpto: document.getElementById("input_jumpto")
		}
});


innoWiki.ui.layout = {
	
	//Private Classes
	Pane: function(element){
		this.element = $(element);
		//this.contentList = new Array();
		this.add = function(content){
			if($.isArray(content)){
				for(var i=0; i<content.length; i++){
					this.element.append(content[i].element);
				}
			} else {
				this.element.append(content.element);
			}
		};
	},
	
	//functions
	init: function(){
		$(document.body).html('<table id="layout_table"><tr><td id="layout_left"></td><td id="layout_center"></td><td id="layout_right"></td></tr></table>');
		$("#layout_table").width("100%");		
		this.leftPane = new this.Pane($("#layout_left"));
		this.centerPane = new this.Pane($("#layout_center"));
		this.rightPane = new this.Pane($("#layout_right"));
		$("#layout_center").width("100%");		
	}

}