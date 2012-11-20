(function(){

	var root = this;

	var MouseTracker = root.MouseTracker = {};

	MouseTracker.VERSION = '0.0.1';

	var refresh = MouseTracker.refresh = 50;
	var debugLevel = MouseTracker.debugLevel = 0;

	var Tracker = MouseTracker.Tracker = function(options){
		refresh = MouseTracker.refresh = options.refresh || MouseTracker.refresh;
		debugLevel = MouseTracker.debugLevel = options.debugLevel || MouseTracker.debugLevel;
	}

	var Start = MouseTracker.Start = function(){
		MouseTracker._record = {id:'idGenial', ts:(new Date()).getTime(), p:[], sw:document.documentElement.clientWidth	, sh:document.documentElement.clientHeight};

		window.onmousemove = MouseTracker.MouseMoveTrack;
		window.onclick = MouseTracker.MouseClickTrack;
		window.ondblclick = MouseTracker.MouseDblClickTrack;
		window.onmousedown = MouseTracker.MouseDownTrack;
		window.onmouseup = MouseTracker.MouseUpTrack;
	}

	var Stop = MouseTracker.Stop = function(){
		window.onmousemove = null;
		window.onclick = null;
		window.ondblclick = null;
		window.onmousedown = null;
		window.onmouseup = null;
		MouseTrackerDB.insertRecord(JSON.stringify(MouseTracker._record));
	}


	var MouseMoveTrack = MouseTracker.MouseMoveTrack = function(e){
		if(!window.onMouseTrackerRecord){
			window.onMouseTrackerRecord = setTimeout(function(){MouseTracker.MouseMoveTrackFired(e)}, MouseTracker.refresh);
		}
	}
	var MouseMoveTrackFired = MouseTracker.MouseMoveTrackFired = function(e){
		Record.addPoint(e,"move");
		window.onMouseTrackerRecord = null;
	}

	var MouseClickTrack = MouseTracker.MouseClickTrack = function(e){
		Record.addPoint(e,"click");
	}
	var MouseDblClickTrack = MouseTracker.MouseDblClickTrack = function(e){
		Record.addPoint(e,"dblClick");
	}
	var MouseDownTrack = MouseTracker.MouseDownTrack = function(e){
		Record.addPoint(e,"down");
	}
	var MouseUpTrack = MouseTracker.MouseUpTrack = function(e){
		Record.addPoint(e,"up");
	}


	
	var Record = MouseTracker.Record = {};
	Record.addPoint = function(e, type){MouseTracker._record.p.push({ts:(new Date()).getTime()-MouseTracker._record.ts,x:e.pageX, y:e.pageY, t:type}); }
	Record.save = function(){ Debug(JSON.stringify(MouseTracker._record)); }
	


	var Debug = MouseTracker.Debug = function (){
		if(this.console){
			if(MouseTracker.debugLevel >= 2) console.trace();
			if(MouseTracker.debugLevel >= 1) console.log(Array.prototype.slice.call(arguments) );
		}
	}

	window.addEventListener('keydown', function(e){
		// s for save
		if(e.keyCode == 83){
			console.log('Save record');
			MouseTracker.Stop();
			MouseTracker.Record.save();			
		}else
		// r for record
		if(e.keyCode == 82){
			console.log('Start Record');
			MouseTracker.Start();
		}
	});

	if(typeof MouseTrackerDB == 'undefined'){
		var fileref=document.createElement('script');
		fileref.setAttribute("type","text/javascript");
		fileref.setAttribute("src", '../src/utils/MouseTrackerDB.js');
		document.getElementsByTagName("head")[0].appendChild(fileref)
	}


})(this, document);
