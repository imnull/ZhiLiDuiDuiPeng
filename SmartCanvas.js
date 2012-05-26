(function(w){

var T = {
	/* 获得视口尺寸 viewport size */
	view : function(){
		return { w : w.innerWidth, h : w.innerHeight }
	},
	/* 获得视口宽度高度比 */
	viwr : function(reverse){
		return w.innerWidth / w.innerHeight;
	},
	/* 添加事件 */
	evnt : function(obj, name, callback, useCapture){
		obj.addEventListener(name, callback, !!useCapture)
	},
	/* 创建元素 */
	elem : function(nodeName){
		var el = document.createElement(nodeName);
		return el;
	},
	/* 适用于平板的获取事件参数方法 */
	gete : function(e){
		return (e = e || window.event).touches && e.touches.length ? e.touches[0] : e;
	},
	/*  */
	epos: function (evt) {
		evt = this.gete(evt);
		var x, y;
		if ('pageX' in evt) {
			x = evt.pageX - evt.target.offsetLeft;
			y = evt.pageY - evt.target.offsetTop;
		} else if ('offsetX' in evt) {
			x = evt.offsetX;
			y = evt.offsetY;
		} else if ('clientX' in evt) {
			x = evt.clientX - evt.target.offsetLeft;
			y = evt.clientY - evt.target.offsetTop;
		} else {
			x = y = 0;
		}
		return { x: x, y: y, e: evt };
	}
}

w.T = T;

function evtObj(){
	this.callbacks = {};
}
evtObj.prototype = {
	add : function(host, evtName, callback){
		if(!(evtName in this.callbacks)){
			this.callbacks[evtName] = [];
		}
		this.callbacks[evtName].push({
			host : host, callback : callback
		})
	},
	fire : function(evtName){
		if(!(evtName in this.callbacks)) return;
		var cbs = this.callbacks[evtName], i = cbs.length;
		var args = Array.prototype.slice.call(arguments, 1);
		while(--i >= 0){
			cbs[i].callback.apply(cbs[i].host, args);
		}
		cbs = null;
	}
}

function SmartCanvas(){
	var cvs = T.elem('canvas');
	var ctx = cvs.getContext('2d');
	var cvsEventObj = new evtObj();
	var doc = new CanvasDocument(ctx);
	var callbacks = {};

	function addEvent(evtName, callback){
		if(!(evtName in callbacks))
			callbacks[evtName] = [];
		callbacks[evtName].push(callback);
	}
	function doEvent(evtName, arg){
		var i = callbacks[evtName].length;
		if(i < 1) return;
		while(--i >= 0)
			callbacks[evtName][i](arg, i);
		doc.fresh();
	}
	function fireEvent(evtName){
		return function(e){
			if(!(evtName in callbacks)) return;
			doEvent(evtName, T.epos(e));
		}
	}

	//T.evnt(cvs, 'mousemove', fireEvent('mousemove'));
	//T.evnt(cvs, 'mousedown', fireEvent('mousedown'));
	//T.evnt(cvs, 'mouseup', fireEvent('mouseup'));
	T.evnt(cvs, 'click', fireEvent('mouseclick'));

	cvs.context = function(){
		return ctx;
	}

	cvs.fit = function(){
		var r = T.viwr();
	}

	cvs.document = function(){
		return doc;
	}

	cvs.size = function(w, h){
		this.width = w;
		this.height = h;
	}

	function addCommonMethod(){
		var args = Array.prototype.slice.call(arguments, 0);
		var o = args.shift();
		var i = args.length;
		while(--i >= 0){
			o[args[i]] = (function(n){
				return function(callback){
					o.eo.add(this, n, callback);
					return this;
				}
			})(args[i])
		}
	}
	function addCommonEvent(){
		var args = Array.prototype.slice.call(arguments, 0);
		var o = args.shift();
		for(var i = 0, len = args.length; i < len; i++){
			addEvent(args[i], (function(n){
				return function(arg, i){
					if(o.check(arg)){
						o.eo.fire(n, arg, i, n);
					}
				}
			})(args[i]));
		}
	}
	function createObj(){
		var o = {
			args : Array.prototype.slice.call(arguments, 0),
			fillStyle : '#000',
			strokeStyle : '#000',
			lineWidth : 0,
			rotateAngle : 0,
			scaleValue : { x : 1, y : 1 },
			globalAlpha : 1,
			eo : new evtObj(),
			moveTo : function(_x, _y){
				this.args[0] = _x;
				this.args[1] = _y;
				return this;
			},
			invoke : function(callback){
				var a = this.args.slice(0);
				a.unshift(ctx);
				return callback.apply(this, a)
			},
			scale : function(x, y){
				this.scaleValue.x = x;
				this.scaleValue.y = y;
				return this;
			},
			rotate : function(deg){
				this.rotateAngle = deg;
			}
		}
		addCommonMethod(o
			//, 'mousemove', 'mouseover', 'mouseout', 'mousedown', 'mouseup'
			, 'mouseclick'
			);
		addCommonEvent(o
			, 'mouseclick'
			//, 'mouseup', 'mousedown'
			);
		/*
		addEvent('mousemove', function(arg, i){
			if(o.check(arg)){
				o.eo.fire('mousemove', arg, i, 'mousemove');
				if(!o.mouseIn){
					o.mouseIn = true;
					o.eo.fire('mouseover', arg, i, 'mouseover');
				}
			} else if(o.mouseIn){
				o.mouseIn = false;
				o.eo.fire('mouseout', arg, i, 'mouseout');
			}
		});
		*/
		return o;
	}

	cvs.circle = function(_x, _y, _r){
		var o = createObj(_x, _y, _r);
		o.path = function(ctx){
			ctx.translate(this.args[0], this.args[1]);
			ctx.rotate(this.rotateAngle * Math.PI / 180);
			ctx.scale(this.scaleValue.x, this.scaleValue.y);
			ctx.arc(0, 0, this.args[2], 0, Math.PI * 2);
			return this;
		}
		o.check = function(a){
			var _x = a.x - this.args[0], _y = a.y - this.args[1];
			var d = _x * _x + _y * _y - this.args[2] * this.args[2];
			return d < 0;
		}
		o.center = function(){
			return {
				x : this.args[0],
				y : this.args[1]
			}
		}
		return o;
	}

	cvs.box = function(_x, _y, _w, _h){
		var o = createObj(_x, _y, _w, _h);
		o.path = function(ctx){
			var c = this.center();
			ctx.translate(c.x, c.y);
			ctx.rotate(this.rotateAngle * Math.PI / 180);
			ctx.scale(this.scaleValue.x, this.scaleValue.y);
			ctx.rect(this.args[2] * -.5, this.args[3] * -.5, this.args[2], this.args[3]);
			return this;
		}
		o.check = function(arg){
			var a = arg.x - this.args[0], b = arg.y - this.args[1];
			return a > 0 && b > 0 && a < this.args[2]  && b < this.args[3];
		}
		o.moveCenterTo = function(x, y){
			x -= this.args[2] * .5;
			y -= this.args[3] * .5;
			return this.moveTo(x, y);
		}
		o.center = function(){
			return {
				x : this.args[2] * .5 + this.args[0],
				y : this.args[3] * .5 + this.args[1]
			}
		}
		o.drawImage = function(ctx){
			if(!this.image) return;
			ctx.drawImage(this.image, this.args[2] * -.5, this.args[3] * -.5, this.args[2], this.args[3]);
		}
		o.drawText = function(ctx){
			if(!this.text) return;
			ctx.font = '20pt Arial';
			ctx.fillText(this.text, this.args[0], this.args[1]);
		}
		return o;
	}

	cvs.card = function(_x, _y, _w, _h, _r){
		var o = createObj(_x, _y, _w, _h, _r || 0);
		o.path = function(ctx){
			var c = this.center();
			ctx.translate(c.x, c.y);
			ctx.rotate(this.rotateAngle * Math.PI / 180);
			ctx.scale(this.scaleValue.x, this.scaleValue.y);

			var left = this.args[2] * -.5, top = this.args[3] * -.5,
				right = left + this.args[2], bottom = top + this.args[3];
			var r = this.args[4];
			ctx.moveTo(left, top + r);
			ctx.arc(left + r, top + r, r, Math.PI, Math.PI * 1.5, false);
			ctx.lineTo(right - r, top);
			ctx.arc(right - r, top + r, r, Math.PI * 1.5, Math.PI * 2, false);
			ctx.lineTo(right, bottom - r);
			ctx.arc(right - r, bottom - r, r, 0, Math.PI * .5, false);
			ctx.lineTo(left + r, bottom);
			ctx.arc(left + r, bottom - r, r, Math.PI * .5, Math.PI, false);
			ctx.closePath();
			return this;
		}
		o.check = function(arg){
			var a = arg.x - this.args[0], b = arg.y - this.args[1];
			return a > 0 && b > 0 && a < this.args[2]  && b < this.args[3];
		}
		o.moveCenterTo = function(x, y){
			x -= this.args[2] * .5;
			y -= this.args[3] * .5;
			return this.moveTo(x, y);
		}
		o.center = function(){
			return {
				x : this.args[2] * .5 + this.args[0],
				y : this.args[3] * .5 + this.args[1]
			}
		}
		o.drawImage = function(ctx){
			if(!this.image) return;
			var img;
			if(this.image instanceof Array){
				if(this.image.length < 1) return;
				img = this.image[0]
			} else {
				img = this.image;
			}
			var r = this.args[4];
			if(!this.imageCoord){
				ctx.drawImage(img
					, this.args[2] * -.5 + r
					, this.args[3] * -.5 + r
					, this.args[2] - r * 2
					, this.args[3] - r * 2);
			} else {
				ctx.drawImage(img
					, this.imageCoord[0]
					, this.imageCoord[1]
					, this.imageCoord[2]
					, this.imageCoord[3]
					, this.args[2] * -.5 + r
					, this.args[3] * -.5 + r
					, this.args[2] - r * 2
					, this.args[3] - r * 2
					);
			}
			img = null;
			
		}
		o.drawText = function(ctx){
			if(!this.text) return;
			ctx.font = '20pt Arial';
			ctx.fillText(this.text, 0, 0);
		}
		return o;
	}

	return cvs;
}

function drawElement(el, ctx, callback){
	if(typeof callback === 'function'){
		el.invoke(callback);
		return;
	}
	ctx.save();
	

	ctx.globalAlpha = el.globalAlpha;
	var c = el.center();

	ctx.beginPath();
	el.path(ctx);

	//ctx.shadowOffsetX = typeof el.shadowOffsetX === 'number' ? el.shadowOffsetX : 5;
	//ctx.shadowOffsetY = typeof el.shadowOffsetY === 'number' ? el.shadowOffsetY : 5;
	//ctx.shadowBlur = typeof el.shadowBlur === 'number' ? el.shadowBlur : 5;
	//ctx.shadowColor = el.shadowColor || "rgba(0,0,0,0.5)";
	ctx.fillStyle = el.fillStyle;
	ctx.fill();

	//ctx.shadowOffsetX = 0;
	//ctx.shadowOffsetY = 0;
	//ctx.shadowBlur = 0;

	if(typeof el.drawImage === 'function'){
		el.drawImage(ctx);
	}

	if(typeof el.drawText === 'function'){
		if(el.fontColor) ctx.fillStyle = el.fontColor;
		el.drawText(ctx);
	}

	if(el.strokeStyle && el.lineWidth){
		ctx.strokeStyle = el.strokeStyle;
		ctx.lineWidth = el.lineWidth;
		ctx.stroke();
	}

	if(el.extFillStyle){
		ctx.fillStyle = el.extFillStyle;
		ctx.fill();
	}

	
	ctx.restore();
}

function CanvasDocument(ctx){
	var children = [];
	var _ = this;
	this.add = function(el){
		el.parent = _;
		children.push(el);
	}
	this.clear = function(color){
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		return;
		if(color){
			ctx.save();
			ctx.beginPath();
			ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
			ctx.closePath();
			ctx.fillStyle = color;
			ctx.fill();
			ctx.restore();
		}
	}
	this.draw = function(){
		for(var i = 0, len = children.length; i < len; i++){
			if(children[i].parent != this) continue;
			drawElement(children[i], ctx)
		}
	}
	this.fresh = function(bk){
		this.clear(bk);
		this.draw()
	}
}

w.SmartCanvas = SmartCanvas;
w.CanvasDocument = CanvasDocument;

})(window)