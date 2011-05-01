innoWiki.events.Startup.add(function(){
	innoWiki.frontend.conflictHandler.init();
});

innoWiki.events.BeforeSave.add(function(){
	innoWiki.frontend.conflictHandler.reset();
});

innoWiki.frontend.conflictHandler = {
	frame: null,
	mychanges: new Array(),
	foreignchanges: new Array(),

	init:	function (){
		this.frame = document.createElement("iframe");
		this.frame.style.display = "none";
		document.body.appendChild(this.frame);
		},
		
	reset: function (){
		this.mychanges = new Array();
		this.foreignchanges = new Array();
		},

	highlight: function (){
		jQuery.each(this.mychanges,function(){innoWiki.ui.highlighter.highlight(this,1)});
		jQuery.each(this.foreignchanges,function(){innoWiki.ui.highlighter.highlight(this,2)});
		},

		
	run: function(){
		var loaded = innoWiki.backend.pages.loaded;
		loaded.getContent();
		
		
		if(innoWiki.frontend.loadSave.shouldSave()){
			innoWiki.ui.alerter.addAlert(
				loaded.editor.getHTML() + " has modified this page. New version merged, delete unneccessary content!"
			);
			var newdoc = this.frame.contentWindow.document;
			var olddoc = innoWiki.frontend.editor.getDoc();
			innoWiki.frontend.ChangeTracker.compareWithReference();
			$(newdoc.body).html(loaded.getContent());
			$("*",olddoc.body).each(function(){
				if( ! newdoc.getElementById(this.id)){
					//it is written by me
					innoWiki.frontend.conflictHandler.mychanges.push(this);
					//$(this).addClass("highlighted1");
				}
			})
			$("*",newdoc.body).each(function(){
				if( ! olddoc.getElementById(this.id)){
					//it is written by the other user
					
					//IE doesn't like to insert element from another doc
					// but supports outerHTML
					var toInsert = this.outerHTML ? this.outerHTML : this;
					
					if($(this).prev().length>0){
						//this is not the first sibling
						$(olddoc.getElementById($(this).prev()[0].id)).after(toInsert);
					} else {
						//this is the first sibling
						$(olddoc.getElementById($(this).parent()[0].id)).prepend(toInsert);
					}
					innoWiki.frontend.conflictHandler.foreignchanges.push(olddoc.getElementById(this.id));
				}
			})
			$(newdoc.body).html("");
			innoWiki.frontend.ChangeTracker.saveReference();
			$("#conflict_radio_li").show();
			$("#conflict_radio").get(0).checked=true;
			this.highlight();
		} else {
			innoWiki.ui.alerter.addAlert(
				loaded.editor.getHTML() + " has modified this page. Page reloaded."
			);
			innoWiki.frontend.loadSave.load(loaded.title);
		}
		innoWiki.frontend.editor.setProgressState(0);
	}
}