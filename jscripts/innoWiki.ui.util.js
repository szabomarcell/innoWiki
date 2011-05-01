innoWiki.ui.util = {
	getPos: function (e){
		$(e).offset();
	},
	
	keypressHandler: function (ed, e){
	// handles tabulator
	// runs detectchanges
		var charCode = (e.which ? e.which : e.keyCode);
		if (charCode == 9 && !e.altKey && !e.ctrlKey)
		{
			if (e.shiftKey)
				ed.editorCommands.Outdent();
			else
				ed.editorCommands.Indent();
		return tinymce.dom.Event.cancel(e); 
		}
		if(charCode<33 || charCode>40) setTimeout(function(){innoWiki.frontend.loadSave.detectChanges()},1);
	}
}

innoWiki.events.ContentKeypress.add(innoWiki.ui.util.keypressHandler);
