(function(){

	var root = this;

	var MouseViewer = root.MouseViewer = {};

	MouseViewer.VERSION = '0.0.1';

	

	var Viewer = MouseViewer.Viewer = function(records){
		console.log(records);
		MouseViewer._record = records;
		// Creates canvas 320 × 200 at 10, 50
		var paper = Raphael(0, 0, 1000, 1000);

		var path = "M"+records.p[0].x+","+records.p[0].y;
		for(i=1; i<records.p.length; i++){
			path += "L"+records.p[i].x+","+records.p[i].y;
			if(records.p[i].t=='click'){
				paper.circle(records.p[i].x, records.p[i].y, 10).attr("fill","red");
			}
		}
		paper.path(path);

	}



})(this, document);
