innoWiki.events.PageLoaded.add(function(){
	innoWiki.frontend.ChangeTracker.saveReference();		
});

innoWiki.events.BeforeSave.add(function(){
	innoWiki.frontend.ChangeTracker.compareWithReference();		
});

innoWiki.widgets.add("changes",
	new innoWiki.widgets.BoxContent(
	'Changes',
	'<div id="innowiki_frontend_changetracker_div"></div>'
));

function convertDate(s){
	if(!s) return null;
	var d = s.split(/[-T:]/);
	return new Date(d[0],d[1],d[2],d[3],d[4],d[5]);
};

innoWiki.frontend.ChangeTracker = {

reference: new Object(),

editors: {
	list: new Object(),
	dates: new Object(),
	
	addElement: function(e){
		var parts, editor, datestr, d, date;
		if(e.id.substring(0,7)=="edited:"){
			parts = e.id.substring(7).split(";");
			editor = parts[0];
			datestr = parts[1];

			this.dates[datestr] = convertDate(datestr);
			if( ! this.list[editor]) this.list[editor] = new innoWiki.classes.Editor(editor);
			this.list[editor].edits.push(e);
		};
	},
	
	getHTML: function (){
		s = "<ul>";
		s += "<li><input type='radio' name='highlight' value='' checked='checked'/>"
				+ "no highlighting</li>";
		s += "<li><input type='radio' name='highlight' value='#dates' id='dates_radio'/>"
				+ "<select id='date_select' onchange='document.getElementById(\"dates_radio\").checked=true; innoWiki.frontend.ChangeTracker.editors.highlight()'>"
				+ "<option value='' disabled='yes' selected='yes'>since...</option>"
		var dates = new Array();
		for(var i in this.dates){
			dates.push(i);
		}
		dates.sort();
		for(var i=0; i<dates.length; i++){
			s += "<option value='"+dates[i] +"'>"+ convertDate(dates[i]).format("yyyy.mm.dd HH:MM") +"</option>";
		}			

		s += "</select></li>";
		for(var i in this.list){
			s += "<li><input type='radio' name='highlight' value='" + i + "' />"
				+ "<a href='mailto:" + innoWiki.backend.users.listByLogin[i].email
				+ "' title='" + innoWiki.backend.users.listByLogin[i].email
				+ "'>" + innoWiki.backend.users.listByLogin[i].name + "</a></li>";
		}
		s += "<li id='conflict_radio_li' style='display:none'><input type='radio' name='highlight' value='#conflict' id='conflict_radio'/>"
			+ "<span class='highlighted1'>My</span> / <span class='highlighted2'>Foreign</span></li>";
		s+="</ul>";
		return s;
	},
	

	display: function(){
		$("#innowiki_frontend_changetracker_div").html(this.getHTML());
		$("#innowiki_frontend_changetracker_div input[type='radio']").click(
			function(){innoWiki.frontend.ChangeTracker.editors.highlight()}
		);
	},

	highlight: function(){
		innoWiki.ui.highlighter.unhighlight();
		$("#innowiki_frontend_changetracker_div input").each( function () {
			if(this.checked) switch(this.value){
				case "#dates": 
					if(document.getElementById("date_select").value!=""){
						$("*",innoWiki.frontend.editor.getDoc()).each( function () {
							var d = convertDate(this.id.substring(7).split(";")[1]);
							var d2 = convertDate(document.getElementById("date_select").value);
							if( d && d>=d2) innoWiki.ui.highlighter.highlight(this,0);
						});
					}
					break;
				case "#conflict":
					innoWiki.frontend.conflictHandler.highlight();
					break;
				default:
					var editor = innoWiki.frontend.ChangeTracker.editors.list[this.value];
					if(editor) editor.highlight();
			}
		});
	}
},


saveReference: function (){
	this.reference = new Object();
	this.editors.list = new Object();
	$("*",innoWiki.frontend.editor.getDoc()).each( function () {
		if(this.id!=""){
			//debugpp(this.id + " " + innoWiki.frontend.ChangeTracker.elementToString(this));
			innoWiki.frontend.ChangeTracker.reference[this.id] = innoWiki.frontend.ChangeTracker.elementToString(this);
			innoWiki.frontend.ChangeTracker.editors.addElement(this);
		}
	});
	//debugpp("---");
	
	this.editors.display();
},

elementToString: function(e){
	var ch, s = "innerText=";
	for(var i=0; i<e.childNodes.length; i++){
		ch = e.childNodes[i];
		if(ch.nodeType == 3) s += ch.nodeValue.replace(/[\f\n\r\t\v\u00A0\u2028\u2029]/g,"");
	}
	//debugpp(s);
	return s;
},

compareWithReference: function(){
	this.idPrefix = "edited:"
		+ innoWiki.backend.users.current.login + ";"
		+ (new Date()).format("isoDateTime") + ";";
		
	this.idSuffix = 0;
	
	$("*",innoWiki.frontend.editor.getBody()).each( function () {
		var cht = innoWiki.frontend.ChangeTracker;
		if(	this.id=="" || (! cht.reference[this.id]) || (cht.reference[this.id] != cht.elementToString(this))){
				//debugpp(this.id + " " + cht.elementToString(this));
				this.id = cht.idPrefix + (cht.idSuffix++);
		}
	});
	
	return this.idSuffix;
}

}

