innoWiki.events.BeforeSave.add(function(){
	innoWiki.ui.highlighter.unhighlight();
});


innoWiki.ui.highlighter = {

	highlight: function(element,number){
		if( ! number ) number = 0;
		$(element).addClass("highlighted"+number);
	},

	unhighlight: function(element){
		if( ! element) element = $("*",innoWiki.frontend.editor.getDoc());
		for(var i=0; i<10; i++) $(element).removeClass("highlighted"+i);
	},
	
	stripHighlighting: function(html){
		return html.replace(/ ?highlighted[0-9]/g,"").replace(/ ?class=""/g,"");
	}

}