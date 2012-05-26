var __COMPARE_GROUP__ = [];
var __COUNTER__ = 0;
var __SCORE__ = 0;
var __SCORE_ADDER__ = 1;
var __ERROR_COUNTER__ = 0;
var __ERROR_COUNTER_MAX__ = 5;
var __WAIT_TIME__ = 2000;
var __START_COUNT__ = 3;

var theme = 'fruit';

(function(w){

var cvs = SmartCanvas();
var doc = cvs.document();

var backCvs = SmartCanvas();
var backDoc = backCvs.document();

var textBar = backCvs.box(0, 0, 10, 40);
textBar.fillStyle = 'rgba(0,0,0,0.0)'
textBar.fontColor = '#000';
textBar.drawText = function(ctx){
	if(!this.text) return;
	ctx.font = this.font || '20pt Arial';
	ctx.fillText(this.text, this.args[2] * -.5 + 5, 10);
}
backDoc.add(textBar);


var ddp = {
	cardCanvas : cvs,
	cardDoc : doc,
	scoreCanvas : backCvs,
	scoreDoc : backDoc,
	cardImage : new Image(),
	cardBack : new Image(),
	textStartWait : function(tb){
		tb.text = 'You have '
			+ (__WAIT_TIME__ / 1000)
			+ ' seconds to catch them.';
		tb.parent.fresh();
	},
	textStartGame : function(tb){
		tb.text = 'Here we go ~';
		tb.parent.fresh();
	},
	textShowScore : function(tb){
		tb.text = 'Score: ' + __SCORE__ 
			+ '  Next: +' + __SCORE_ADDER__
			+ '  Failed: ' + __ERROR_COUNTER__ + '/' + __ERROR_COUNTER_MAX__
			;
		tb.parent.fresh();
	},
	textWaiting : function(tb){
		tb.text = 'Please wait...';
		tb.parent.fresh();
	}
};

/*
 * 三个主题场景图片的坐标
 * 宽高默认 180 * 240,所以不做记录。
 */
var cardMaps = {
	cartoon : [
		[0, 0],	[180, 0], [360, 0], [540, 0], [720, 0],
		[0, 240], [180, 240], [360, 240], [540, 240], [720, 240],
		[0, 480], [180, 480], [360, 480], [540, 480], [720, 480],
		[0, 720], [180, 720], [360, 720], [540, 720], [720, 720],
		[0, 960], [180, 960], [360, 960], [540, 960], [720, 960],
		[0, 1200], [180, 1200], [360, 1200], [540, 1200], [720, 1200]
	],
	fruit : [
		[0, 0],	[180, 0], [360, 0], [540, 0], [720, 0],
		[0, 240], [180, 240], [360, 240], [540, 240], [720, 240],
		[0, 480], [180, 480], [360, 480], [540, 480], [720, 480],
		[0, 720], [180, 720], [360, 720], [540, 720], [720, 720],
		[0, 960], [180, 960]//, [360, 960], [540, 960], [720, 960],
		//[0, 1200], [180, 1200], [360, 1200], [540, 1200], [720, 1200]
	],
	letter : [
		[0, 0],	[180, 0], [360, 0], [540, 0], [720, 0],
		[0, 240], [180, 240], [360, 240], [540, 240],// [720, 240],
		[0, 480], [180, 480], [360, 480],// [540, 480], [720, 480],
		[0, 720], [180, 720], [360, 720], [540, 720], [720, 720],
		[0, 960], [180, 960], [360, 960], [540, 960],// [720, 960],
		[0, 1200], [180, 1200], [360, 1200], [540, 1200], [720, 1200]
	]
}

/*
 * 背景文本（记分）canvas 与 前景卡片交互canvas适配屏幕
 */
function fitCanvas(){
	var vs = T.view();
	cvs.size(vs.w, vs.h);
	doc.fresh();
	backCvs.size(vs.w, vs.h);
	textBar.args[2] = vs.w;
	backDoc.fresh();
}

T.evnt(window, 'resize', fitCanvas);
T.evnt(window, 'load', function(){
	document.body.appendChild(backCvs);
	document.body.appendChild(cvs);
})

function chaosArray(arr){
	var i = 0, len = arr.length;
	for(; i < len; i++){
		arr.push(arr.splice(Math.floor(len * Math.random()), 1)[0]);
	}
	for(; i < len; i++){
		arr.unshift(arr.splice(Math.floor(len * Math.random()), 1)[0]);
	}
}

function getMatrixH(c){
	var max = Math.ceil(Math.sqrt(c));
	while(max > 0 && c % max > 0){
		max--;
	}
	return Math.max(max, c / max);
}

function createBoxes(count){
	var arr = [];
	var h = getMatrixH(count * 2);

	if(!cardMaps[theme]){
		throw 'No such a key [' + theme + '] in cardMaps';
	}

	var maps = cardMaps[theme].slice(0);
	chaosArray(maps);
	while(maps.length < count){
		var _maps = cardMaps[theme].slice(0);
		chaosArray(_maps);
		maps = maps.concat(_maps);
	}

	for(var i = 0, len = count * 2; i < len; i++){
		var el = cvs.card(100, -T.view().h, 120, 90, 12);
		el.id = i % count;
		el.image = [ddp.cardImage, ddp.cardBack];
		el.imageCoord = [
			maps[el.id][0], maps[el.id][1], 180, 240
		]
		//el.text = el.id + 1;
		//el.fontColor = '#000'
		arr.push(el);
	}

	chaosArray(arr);
	return arr;
}

Tethys.animation.FPS = 60;
Tethys.animation.canvasdoc = doc;

var boxAnimation = [
	function(box, cx, cy, delay, callback){
		var c = box.center();
		var s = 30;//Math.ceil(Math.min(Math.abs(cx - c.x), Math.abs(cy - c.y)) * .5);
		var x = (cx - c.x) / s;
		var y = (cy - c.y) / s;
		delay = delay || 0;
		var r = 0;
		var scaleX = box.scaleValue.x;
		var scaleY = box.scaleValue.y;
		setTimeout(function(){
			Tethys.animation.regist(function(split, interval, step){
				r = step / s;
				if(r >= 1){
					box.moveCenterTo(cx, cy);
					box.rotate(0);
					if(!box.over){
						box.scale(1, 1);
						box.globalAlpha = 1;
						box.fillStyle = 'rgba(255, 255, 255, 1)';
					} else {
						box.scale(0, 0);
						box.globalAlpha = 0;
						box.fillStyle = 'rgba(255, 255, 255, 0)';
					}
					
					if(typeof callback === 'function'){
						callback(this);
					}
					return true;
				} else {
					c = box.center();
					c.x += x;
					c.y += y;
					box.moveCenterTo(c.x, c.y);
					box.rotate(r * 360);
					if(!box.over){
						box.scale(r * scaleX, r * scaleY);
						box.globalAlpha = r;
						box.fillStyle = 'rgba(255, 255, 255, ' + Math.min(1, r) + ')';
					} else {
						r = 1 - r;
						box.scale(r * scaleX, r * scaleY);
						box.globalAlpha = r;
						box.fillStyle = 'rgba(255, 255, 255, ' + Math.max(0, r) + ')';
					}
				}
			});
		}, delay);
	},
	function(box, cx, cy, delay, callback){
		var c = box.center();
		var s = 30;//Math.ceil(Math.min(Math.abs(cx - c.x), Math.abs(cy - c.y)) * .5);
		var x = (cx - c.x) / s;
		var y = (cy - c.y) / s;
		delay = delay || 0;
		var r = 0;
		var scaleX = box.scaleValue.x;
		var scaleY = box.scaleValue.y;
		setTimeout(function(){
			Tethys.animation.regist(function(split, interval, step){
				r = step / s;
				if(r >= 1){
					box.moveCenterTo(cx, cy);
					if(!box.over){
						box.scale(1, 1);
						box.globalAlpha = 1;
						box.fillStyle = 'rgba(255, 255, 255, 1)';
					} else {
						box.scale(0, 0);
						box.globalAlpha = 0;
						box.fillStyle = 'rgba(255, 255, 255, 0)';
					}	
					if(typeof callback === 'function'){
						callback(this);
					}
					return true;
				} else {
					c = box.center();
					c.x += x;
					c.y += y;
					box.moveCenterTo(c.x, c.y);
					if(!box.over){
						box.scale(Math.cos(r * Math.PI * 4), r);
						box.globalAlpha = r;
						box.fillStyle = 'rgba(255, 255, 255, ' + Math.min(1, r) + ')';
					} else {
						box.scale(Math.cos(r * Math.PI * 4), 1 - r);
						box.globalAlpha = 1 - r;
						box.fillStyle = 'rgba(255, 255, 255, ' + Math.max(0, 1 - r) + ')';
					}
				}
			});
		}, delay);
	}
]

function boxIn(boxes, callback){
	var len = boxes.length;
	var h = getMatrixH(len);

	var v = len / h;
	var _h = textBar.args[3];

	var size = T.view();
	var hh = size.h - _h; 
	size.h = hh * 1;
	var _top = hh - size.h;
	var height = Math.ceil(Math.min(size.w / h, size.h / v));
	height *= .85;
	var width = height * .75;
	var totalWidth = width * h;
	var totalHeight = height * v;
	var offsetY = height * .5 + (size.h - totalHeight) * .5 + _h * .85;
	var offsetX = width * .5 + (size.w - totalWidth) * .5;
	//offsetY *= .85;
	var counter = 0;

	ddp.textWaiting(textBar);

	for(var i = 0; i < len; i++){
		boxes[i].args[2] = width * .95;
		boxes[i].args[3] = height * .95;
		boxes[i].args[4] = height * .05;
		doc.add(boxes[i]);
		(function(n){
			setTimeout(function(){
				boxAnimation[1](boxes[n]
					, (width) * (n % h) + offsetX
					, (height) * Math.floor(n / h) + offsetY
					, 100 * n
					, function(b){
						counter += 1;
						if(counter >= len && typeof callback === 'function'){
							ddp.textStartWait(textBar);

							setTimeout(function(){
								ddp.textStartGame(textBar);
								callback(boxes);
							}, __WAIT_TIME__)
						}
					}
					);
				//moveBox(boxes[n], 160 * n + 100, 200);
			}, 100 * n)
		})(i)
	}
}

function boxTurnAround(box, callback){
	var c = 10;
	Tethys.animation.regist(function(split, interval, step){
		var r = step / c;
		box.scale(Math.cos(r * Math.PI * .5), 1);
		if(step >= c){
			box.image.unshift(box.image.pop());
			if(!!box.imageCoord){
				box._imageCoord = box.imageCoord;
				box.imageCoord = null;
			} else if(!!box._imageCoord && !box.imageCoord){
				box.imageCoord = box._imageCoord;
				box._imageCoord = null;
			}
			Tethys.animation.regist(function(s, i, step){
				var r = step / c;
				box.scale(Math.sin(r * Math.PI * .5), 1);
				if(step >= c){
					ddp.textShowScore(textBar);
					if(typeof callback === 'function'){
						callback(box);
					}
					return true;
				}
			});
			return true;
		}
	});
}

function boxHide(boxes, callback){
	chaosArray(boxes)
	var len = boxes.length;
	var c = 20;
	var counter = 0;

	for(var i = 0; i < len; i++){
		(function(n){
			setTimeout(function(){
				boxTurnAround(boxes[n], function(box){
					counter += 1;
					if(counter >= len && typeof callback === 'function'){
						callback(boxes);
					}
				})
			}, 100 * n)
		})(i)
	}
}

function boxHide2(boxes, callback){
	chaosArray(boxes)
	var len = boxes.length;
	var c = 20;
	var counter = 0;
	

	setTimeout(function(){
		boxScaleLittle2(boxes, function(bb){
			for(var i = 0; i < len; i++){
				(function(n){
					setTimeout(function(){
						boxTurnAround(boxes[n], function(box){
							counter += 1;
							if(counter >= len && typeof callback === 'function'){
								callback(boxes);
							}
						})
					}, 100 * n)
				})(i)
			}
		});
		return;
		
	}, 500);
	return;
}

function boxScaleLittle(boxes, callback){
	var len = boxes.length;
	var c = 3;
	var sub = 0.1;
	var counter = 0;
	for(var i = 0; i < len; i++){
		(function(n){
			Tethys.animation.regist(function(s, interval, step){
				var scale = 1 - step / c * sub;
				boxes[n].scale(scale, scale);
				if(step >= c){
					counter++
					if(counter >= len && typeof callback === 'function'){
						callback(boxes);
					}
					return true;
				}
				return false;
			})
		})(i)
	}
}

function boxScaleLittle2(boxes, callback){
	var len = boxes.length;
	var c = 3;
	var sub = 0.1;
	var counter = 0;
	for(var i = 0; i < len; i++){
		(function(n){
			Tethys.animation.regist(function(s, interval, step){
				var scale = 1 - step / c * sub;
				boxes[n].scale(scale, scale);
				boxes[n].extFillStyle = 'rgba(255, 0, 0, ' + (step / c * .4) + ')'
				if(step >= c){
					setTimeout(function(){
						var sx = boxes[n].scaleValue.x, sy = boxes[n].scaleValue.y;
						Tethys.animation.regist(function(s, interval, step){
							boxes[n].scale(sx + step / c * sub, sy + step / c * sub);
							boxes[n].extFillStyle = 'rgba(255, 0, 0, ' + ((1 - step / c) * .4) + ')';
							if(step >= c){
								counter++;
								boxes[n].extFillStyle = null;
								boxes[n].scale(1, 1);
								if(counter >= len && typeof callback === 'function'){
									callback(boxes);
								}
								return true
							}
						})

					}, 1000);
					return true;
				}
				return false;
			})
		})(i)
	}
}

function boxOutA(boxes, callback){
	var len = boxes.length;
	var c = 20;
	var counter = 0;
	
	setTimeout(function(){
		boxScaleLittle(boxes, function(boxes){
			setTimeout(function(){
				for(var i = 0; i < len; i++){
					boxes[i].over = true;
					boxAnimation[0](boxes[i]
						, 200
						, -10 - boxes[i].args[3]
						, 200 * i
						, function(b){
							counter += 1;
							if(counter >= len && typeof callback === 'function'){
								callback(boxes);
							}
						}
						);
				}
			}, 500)
			
		});
	}, 500)
}

function boxOutB(boxes, callback){
	var len = boxes.length;
	var c = 3;
	var sub = 0.1;
	var counter = 0;
	for(var i = 0; i < len; i++){
		(function(n){
			Tethys.animation.regist(function(s, interval, step){
				var scale = 1 - step / c * sub;
				boxes[n].scale(scale, scale);
				boxes[n].extFillStyle = 'rgba(255, 0, 0, ' + (step / c * .4) + ')'
				if(step >= c){
					var cc = 0;
					setTimeout(function(){
						for(var i = 0; i < len; i++){
							if(boxes[i].over){
								counter++;
								continue;
							}
							boxes[i].over = true;
							boxes[i].extFillStyle = 'rgba(255, 0, 0, .5)';
							boxAnimation[0](boxes[i]
								, boxes[i].center().x
								, T.view().h + boxes[i].args[3] + 10
								, 100 * i
								, function(b){
									cc += 1;
									if(cc >= len && typeof callback === 'function'){
										callback(boxes);
									}
								}
								);
						}
					}, 500)
					return true;
				}
				return false;
			})
		})(i)
	}
	return;
}

function JUDGE(boxes){
	if(__COMPARE_GROUP__[0].id === __COMPARE_GROUP__[1].id){
		__SCORE__ += __SCORE_ADDER__;
		__SCORE_ADDER__ += 1;
		boxOutA(__COMPARE_GROUP__, function(){
			if(ALLDONE(boxes)){
				if(typeof ddp.alldone === 'function'){
					ddp.alldone();
				}
			} else {
				__COMPARE_GROUP__.splice(0, __COMPARE_GROUP__.length);
				__COUNTER__ = 0;
			}
		})
		__ERROR_COUNTER__ = Math.max(0, __ERROR_COUNTER__ - 1);
	} else {
		__ERROR_COUNTER__ += 1;
		if(__ERROR_COUNTER__ < __ERROR_COUNTER_MAX__){
			boxHide2(__COMPARE_GROUP__, function(boxes){
				__COMPARE_GROUP__[0].running = __COMPARE_GROUP__[1].running = 0;
				__COMPARE_GROUP__.splice(0, __COMPARE_GROUP__.length);
				__COUNTER__ = 0;
				__SCORE_ADDER__ = 1;
			})
		} else {
			boxOutB(boxes, function(){
				if(typeof ddp.failed === 'function'){
					ddp.failed();
				}
			})
		}
		
	}
	ddp.textShowScore(textBar);
}

function ALLDONE(boxes){
	for(var i = 0, len = boxes.length; i < len; i++){
		if(!boxes[i].over) return false;
	}
	return true;
}

function boxActive(boxes){
	for(var i = 0, len = boxes.length; i < len; i++){
		boxes[i].mouseclick(function(){
			if(__COMPARE_GROUP__.length >= 2 || this.running) return;
			this.running = 1;
			__COMPARE_GROUP__.push(this);
			boxTurnAround(this, function(box){
				this.running = 2;
				__COUNTER__ += 1;
				if(__COUNTER__ >= 2){
					JUDGE(boxes);
				}
			});

		})
	}

}

function init(){
	__COMPARE_GROUP__.splice(0, __COMPARE_GROUP__.length);
	__COUNTER__ = 0;
	__ERROR_COUNTER__ = 0;
}
function start(){
	init();
	var boxes = createBoxes(__START_COUNT__);
	boxIn(boxes, function(boxes){
		boxHide(boxes, function(boxes){
			boxActive(boxes)
		});
	})
}

ddp.start = start;
ddp.fitCanvas = fitCanvas;

w.ddp = ddp;

})(window)

