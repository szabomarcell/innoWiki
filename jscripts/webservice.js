/*
params = {
	url: "http://xy/xy.asmx",
	soapaction: "...",
	body: "<foo>bar</foo>"
}
*/

function callWebService(params){
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open("POST", params.url, false);
	xmlHttp.setRequestHeader("Content-Type", "text/xml; charset=utf-8");
	xmlHttp.setRequestHeader("SOAPAction", params.soapaction);
	s = "<?xml version='1.0' ?>"
	+ "<soap:Envelope xmlns:soap='http://schemas.xmlsoap.org/soap/envelope/' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema'><soap:Body>"
	+ params.body
	+ "</soap:Body></soap:Envelope>";
	
	if(window.ActiveXObject){
		var xmldoc = new ActiveXObject("Microsoft.XMLDOM");
		xmldoc.loadXML(s);
	} else if(document.implementation.createDocument){
		 var vParser = new DOMParser();
		 xmldoc = vParser.parseFromString(s, "text/xml");
	}

	xmlHttp.send(xmldoc);
	//debug(xmlHttp.responseText); //alert(params.soapaction);
	return xmlHttp.responseXML;
}