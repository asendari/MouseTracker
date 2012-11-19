(function(){

	var root = this;

	var MouseViewer = root.MouseViewer = {};

	MouseViewer.VERSION = '0.0.1';

	

	var Viewer = MouseViewer.Viewer = function(records){
		if(!records) return;
		if(records.p.length <= 0) return;
		MouseViewer._record = records;

		var paper = Raphael(0, 0, records.sw, records.sh);

		var path = "M"+records.p[0].x+","+records.p[0].y;
		for(i=1; i<records.p.length; i++){
			path += "L"+records.p[i].x+","+records.p[i].y;
			if(records.p[i].t=='click'){
				paper.circle(records.p[i].x, records.p[i].y, 10).attr("fill","red");
			}
		}
		paper.path(path);

	}

	window.addEventListener('keydown', function(e){
		if(e.keyCode == 80){
			console.log('Print Record');
			MouseViewer.Viewer(MouseTracker._record);
		}
	});



})(this, document);
