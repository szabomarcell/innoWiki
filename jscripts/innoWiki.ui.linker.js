innoWiki.events.MceLoaded.add(function (){
	innoWiki.ui.linker.register();
});

innoWiki.events.MceLoaded.add(function(){
	// autolinker hover
	//TODO highlight
	$(".autolinker", innoWiki.frontend.editor.getDoc()).live(
		"mouseover", function(){$(this).addClass("autolinker_hover")}
		).live(
		"mouseout", function(){$(this).removeClass("autolinker_hover")}
		);
});



innoWiki.ui.linker = {

autolinkerCount: 0,
inAutolinker: false,

register: function(){
	innoWiki.frontend.editor.onKeyDown.add(this.keyDown_listener);
	innoWiki.frontend.editor.onNodeChange.add(this.nodeChange_listener);
},


nodeChange_listener: function(ed,cm,e,c,o){
	if(e.id.substr(0,10)=="autolinker"){
		if( ( ! innoWiki.ui.linker.inAutolinker)  || (innoWiki.ui.linker.currentAutoLinker.id!=e.id) ){
			if((innoWiki.ui.linker.currentAutoLinker) && (innoWiki.ui.linker.currentAutoLinker.id!=e.id)) {
				$(innoWiki.ui.linker.currentAutoLinker).removeClass("autolinker_selected");
			};
			innoWiki.ui.linker.currentAutoLinker = e;
			innoWiki.ui.linker.inAutolinker = true;
			innoWiki.ui.searchResultBox.setFilter(innoWiki.ui.linker.getCurrentContent());
			innoWiki.ui.linker.showResultBox();
			$(innoWiki.ui.linker.currentAutoLinker).addClass("autolinker_selected");
			innoWiki.frontend.editor.selection.setRng(innoWiki.ui.linker.selection.getShortenedRange(innoWiki.ui.linker.currentAutoLinker,2,2));
		}
	} else {
		innoWiki.ui.linker.stepOut();
	};
},

stepOut: function(){
		$(innoWiki.ui.linker.currentAutoLinker).removeClass("autolinker_selected");
		innoWiki.ui.searchResultBox.hide();
		innoWiki.ui.linker.inAutolinker = false;
},

showResultBox: function(){
	var iframepos = $(innoWiki.frontend.editor.getContentAreaContainer()).offset();
	iframepos.top  -= $(innoWiki.frontend.editor.getBody()).scrollTop();
	iframepos.left -= $(innoWiki.frontend.editor.getBody()).scrollLeft();

	var position = $(innoWiki.ui.linker.currentAutoLinker).offset();
	position.top  += $(innoWiki.ui.linker.currentAutoLinker).height() + iframepos.top;
	position.left += iframepos.left;
	
	innoWiki.ui.searchResultBox.show(position, innoWiki.ui.linker.setCurrentContent, innoWiki.ui.linker.convertToLink);
},

getCurrentContent: function(){
	// strip [ and ]
	return innoWiki.ui.linker.currentAutoLinker.innerHTML.replace(/[\[\]]/g,"");
},

setCurrentContent: function(s){
	innoWiki.ui.linker.currentAutoLinker.innerHTML = "[[" + s + "]]";

	var ed = innoWiki.frontend.editor;
	//set the caret just before the ]]

	ed.selection.setRng(innoWiki.ui.linker.selection.getShortenedRange(innoWiki.ui.linker.currentAutoLinker,2,2));
	ed.selection.collapse(false);
},

convertToLink: function(){
	innoWiki.ui.searchResultBox.hide();
	var title = innoWiki.ui.linker.getCurrentContent();
	var ed = innoWiki.frontend.editor;
	$(innoWiki.ui.linker.currentAutoLinker).replaceWith("<a href='"+innoWiki.urlExaminer.getPageUrl(title)+"'>"+title+"</a> <span id='autolinkAnchor'> </span>");
	ed.selection.select($("#autolinkAnchor", ed.getDoc())[0]);
	$("#autolinkAnchor", ed.getDoc()).remove();
	innoWiki.ui.linker.currentAutoLinker = null;
	innoWiki.ui.linker.inAutolinker = false;
},

keyDown_listener: function (ed, e){
	var charCode = (e.which ? e.which : e.keyCode);
	if( innoWiki.ui.linker.inAutolinker ){
		innoWiki.ui.linker.showResultBox();
		switch( charCode ){
		case 9: //tab
		case 13: //enter
			tinymce.dom.Event.cancel(e);
			innoWiki.ui.linker.convertToLink();
			return false;
			break;
		case 27: innoWiki.ui.linker.stepOut(); break;
		case 35: //end
			tinymce.dom.Event.cancel(e);
			ed.selection.setRng(innoWiki.ui.linker.selection.getShortenedRange(innoWiki.ui.linker.currentAutoLinker,2,2));
			ed.selection.collapse(false);
			break;
		case 36: //home
			tinymce.dom.Event.cancel(e);
			ed.selection.setRng(innoWiki.ui.linker.selection.getShortenedRange(innoWiki.ui.linker.currentAutoLinker,2,2));
			ed.selection.collapse(true);
			break;
		case 38: tinymce.dom.Event.cancel(e); innoWiki.ui.searchResultBox.moveSelectionBy(-1); break;
		case 40: tinymce.dom.Event.cancel(e); innoWiki.ui.searchResultBox.moveSelectionBy(1); break;
		default: window.setTimeout("innoWiki.ui.searchResultBox.setFilter(innoWiki.ui.linker.getCurrentContent());",1);
		}

	} else {
		//watch brackets
			//let's see what's before and after the caret!
			var after = innoWiki.ui.linker.selection.getTextAfter(ed.selection.getRng(),1);
			var before = innoWiki.ui.linker.selection.getTextBefore(ed.selection.getRng(),2);
			var b1 = before.length>0 ? before.charAt(before.length-1) : "";
			var b2 = before.length>1 ? before.charAt(before.length-2) : "";

			//if there is one [ before, then listen, maybe an other [ comes!
			if((b2!="[")&&(b1=="[")&&(after!="[")){
				// we don't want to decode the character
				// so just let things happen in the browser
				// and will examine the result 1 msec later
				setTimeout(innoWiki.ui.linker.whatchBrackets,1);
			}
	}
},

whatchBrackets: function(){
	var ed = innoWiki.frontend.editor;
	if("[["==innoWiki.ui.linker.selection.getTextBefore(ed.selection.getRng(),2)){
		ed.selection.setRng(innoWiki.ui.linker.selection.getRangeBefore(ed.selection.getRng(),2));
		ed.selection.setContent(
			"<span id='autolinker" + innoWiki.ui.linker.autolinkerCount + "' class='autolinker'>[[Type title, press TAB]]</span> "
		);
		ed.selection.setRng(innoWiki.ui.linker.selection.getShortenedRange(ed.getDoc().getElementById("autolinker"+innoWiki.ui.linker.autolinkerCount),2,2));
		innoWiki.ui.linker.autolinkerCount++;
	}
}

}






if(window.document.selection) {
//IE
//alert("ie");

innoWiki.ui.linker.selection = {
	getTextBefore: function (range, chars){
		var newsel = range.duplicate();
		newsel.collapse(true);
		newsel.moveStart("character",-chars);
		return(newsel.text);
	},

	getTextAfter: function (range, chars){
		var newsel = range.duplicate();
		newsel.collapse(false);
		newsel.moveEnd("character",chars);
		return(newsel.text);
	},	
	
	getRangeBefore: function (range, chars){
		var newsel = range.duplicate();
		newsel.collapse(true);
		newsel.moveStart("character",-chars);
		return(newsel);
	},

	getShortenedRange: function (element, startOffset, endOffset){
		var newsel = element.ownerDocument.body.createTextRange();
		newsel.moveToElementText(element);
		newsel.moveStart("character",startOffset);
		newsel.moveEnd("character",-endOffset);
		return(newsel);
	}
	
}

}
 
if(window.getSelection) {
//FF, chrome, etc.
//alert("ff");

innoWiki.ui.linker.selection = {
	getTextBefore: function (range, chars){
		var newsel = range.cloneRange();
		newsel.collapse(true);
		newsel.setStart(newsel.startContainer,Math.max(0,newsel.startOffset-chars));
		return(newsel.toString());
	},

	getTextAfter: function (range, chars){
		var newsel = range.cloneRange();
		newsel.collapse(false);
		try{newsel.setEnd(newsel.endContainer,newsel.endOffset+chars)} catch(err){};
		return(newsel.toString());
	},

	
	getRangeBefore: function (range, chars){
		var newsel = range.cloneRange();
		newsel.collapse(true);
		
		// if we are not in a textnode then FF steps nodes instead of chars
		var cont = newsel.startContainer;
		while(cont.firstChild) { cont = cont.firstChild };
		newsel.setStart(cont,Math.max(0,newsel.startOffset-chars));
		return(newsel);
	},
	
	getShortenedRange: function (element, startOffset, endOffset){
		var newsel = element.ownerDocument.createRange();
		newsel.selectNode(element.firstChild);
		newsel.setStart(element.firstChild,startOffset);
		newsel.setEnd(element.firstChild, element.firstChild.textContent.length - endOffset);
		return(newsel);
	}
	
}
}