innoWiki.events.ContentChange.add(function(){
	innoWiki.frontend.loadSave.detectChanges();
});

innoWiki.events.PageLoaded.add(function(){
		innoWiki.elements.saveBtn.disabled = true;
		document.title = innoWiki.backend.pages.loaded.title + " -- innoWiki";
		var ls = innoWiki.frontend.loadSave;
		ls.originalSummary = innoWiki.backend.pages.loaded.summary;	
		ls.originalContent = innoWiki.ui.highlighter.stripHighlighting(innoWiki.frontend.editor.getContent());
		ls.private_shouldSave = false;
});

innoWiki.frontend.loadSave = {

	isLoaded: false,
	private_shouldSave: false,
	originalContent: "",
	originalSummary: "",
	
	detectChanges: function(){
		if( ! this.private_shouldSave ){
			if( innoWiki.elements.summary.value != this.originalSummary
				|| innoWiki.ui.highlighter.stripHighlighting(innoWiki.frontend.editor.getContent()) != this.originalContent
			){
				//debugpp(innoWiki.elements.summary.value != this.originalSummary);
				this.private_shouldSave = true;
				innoWiki.elements.saveBtn.disabled = false;
			}
		}
	},
	
	shouldSave: function(){
		this.detectChanges();
		return this.private_shouldSave;
		},
	
	load: function (title){
		try{ this.save() }
		catch(e){ 
			//TODO: this could be more elegant
			// + hash gets corrupted
			alert("Concurrent edit detected. Please review changes!");
			return;
		}

		this.isLoaded = true;
		
		var ed = innoWiki.frontend.editor;
		
		ed.setProgressState(1); // Show progress

		innoWiki.backend.pages.load(title);

		var loaded = innoWiki.backend.pages.loaded;
		
		innoWiki.elements.pageTitle.value = loaded.title;
		innoWiki.elements.summary.value = loaded.summary;
		innoWiki.frontend.editor.setContent(loaded.getContent());
		
		ed.setProgressState(0); // Hide progress
		ed.focus();
		ed.selection.select(ed.getBody().firstChild);
		ed.selection.collapse(true);

		innoWiki.events.PageLoaded.dispatch();
		
		},

	save: function (){
			//alert("save");
			if( this.isLoaded && innoWiki.elements.autosave.checked ){
				this.saveNow();
			}
		},
		
	saveNow: function (){
	
			if( this.shouldSave() ){
				
				innoWiki.events.BeforeSave.dispatch();
				
				var ed = innoWiki.frontend.editor;
				ed.setProgressState(1); // Show progress

				var loaded = innoWiki.backend.pages.loaded;
				loaded.summary = innoWiki.elements.summary.value;
				loaded.setContent(ed.getContent());
				
				innoWiki.backend.pages.save();
				
				ed.setProgressState(0); // Hide progress
				alert("saved");
				
				innoWiki.events.PageLoaded.dispatch();

			}

		}
		
}

