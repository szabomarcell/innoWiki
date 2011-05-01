innoWiki.classes = {

UserItem: function (id, name, login, email){
	this.id = id;
	this.name = name;
	this.login = login;
	this.email = email;

	this.getHTML = function(){
		return "<a href='mailto:" + this.email + "'>" + this.name + "</a>";
	}
	
},

CustomItem: function (title){
	this.title = title;

	this.getHTML = function (){
		return "<tr><td class='title' colspan='3'>(NEW) " + this.title + "</td></tr>"
		+ "<tr><td colspan='3' class='summary'>(non-existent page named '" + this.title + "')</td></tr>";

	}
},

Editor: function (name){
	this.user = innoWiki.backend.users.listByLogin[name];
	this.edits = new Array();
	this.highlight = function(){
		for(var i=0; i<this.edits.length; i++){
			innoWiki.ui.highlighter.highlight(this.edits[i], 0);
		}
	}
},

PageListItem: function (){
	this.title = "";
	this.id = null;
	this.summary = "";
	this.content = null;
	this.editor = "";
	this.date = "";
	this.historyId = null;
	
	this.getContent = function() {
		if( ! this.content){
			this.content = innoWiki.backend.connection.getPageFromHistory(this.title).content;
		}
		return this.content;
	};
	
	this.setContent = function(content){
		this.content = content;
	};

	this.clearContent = function(){
		this.content = null;
	};
	
	this.getHTML = function(){
		return "<tr><td class='title'>" + this.title + "</td>"
		+ "<td class='editor'>" 
		+ (this.editor ? this.editor.getHTML() : "unknown")
		+ "</td><td class='date'>" + this.date + "</td></tr>"
		+ "<tr><td colspan='3' class='summary'>" + (this.summary!="" ? this.summary : "(no summary)") + "</td></tr>";
	};
	

}

}