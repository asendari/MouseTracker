(function(){

	var root = this;

	var MouseViewer = root.MouseViewer = {};

	MouseViewer.VERSION = '0.0.1';

	

	var Viewer = MouseViewer.Viewer = function(records){
		if(!records) return;
		if(records.p.length <= 0) return;
		MouseViewer._record = records;

		var NS="http://www.w3.org/2000/svg";
		var svg=document.createElementNS(NS,"svg");
		svg.id="recordPlay";
		svg.setAttribute("width",records.sw);
		svg.setAttribute("height",records.sh);
		svg.setAttribute("version","1.1");
		svg.setAttribute("xmlns","http://www.w3.org/2000/svg");
		svg.setAttribute("style","overflow: hidden; position: absolute; left: 0px; top: 0px; ");


		var path = "M"+records.p[0].x+","+records.p[0].y;
		for(i=1; i<records.p.length; i++){
			path += "L"+records.p[i].x+","+records.p[i].y;
			if(records.p[i].t=='click'){
				var circle = document.createElementNS(NS, "circle");
				circle.setAttributeNS(null, "cx", records.p[i].x);
				circle.setAttributeNS(null, "cy", records.p[i].y);
				circle.setAttributeNS(null, "r",  10);
				circle.setAttributeNS(null, "fill", "green");
				svg.appendChild(circle);
			}
		}


		var pathEl=document.createElementNS(NS,"path");
		pathEl.setAttribute("fill","none");
		pathEl.setAttribute("stroke","#000000");
		pathEl.setAttribute("d",path);



		svg.appendChild(pathEl);
		document.body.appendChild(svg);

	}

	window.addEventListener('keydown', function(e){
		if(e.keyCode == 80){
			console.log('Print Record');
			MouseViewer.Viewer(MouseTracker._record);
		}
	});



})(this, document);
