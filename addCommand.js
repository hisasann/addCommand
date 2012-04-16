(function() {
/*
 * addCommand jQuery Plugin version 0.3
 * http://lab.hisasann.com/addCommand/
 *
 * Copyright (c) 2009 hisasann http://hisasann.com/
 * Dual licensed under the MIT and GPL licenses.
　*
 * addCommandはProgression（http://progression.jp/ja/）のaddCommandに影響を受けて制作しました。
 * 複数のアニメーションを逐次実行したい場合は、jQueryのanimateではネストが深くなる場合があります。
 * addCommandにDoTweenerクラスを渡すことにより、1つずつanimationが実行されるので、簡潔に記述が可能になります。
 * ストーリーやシーンの制作に役立てていただけたら幸いです。
 */
/* Usage
*/
/* Propでcssを指定してからDoTweenerで1つずつanimation
 * 
 *	$.addCommand.define();
 *	addCommand(
 *		Prop($("#hoge"), { top: "0px" }),
 *		Wait(1),
 *		DoTweener($("#hoge"), {
 *				top: "100px"
 *			}, 1000, "easeInOutCirc", function() {
 *			}, 100
 *		),
 *		Wait(1),
 *		DoTweener($("#hoge"), {
 *				top: "200px"
 *			}, 1000, "easeInOutCirc", function() {
 *			}, 100
 *		)
 *	);
 */
/* 一気に2つのanimationを実行して終わったらalert表示
 * 
 *	$.addCommand.define();
 *	addCommand(
 *		[
 *			DoTweener($("#hoge1"), {
 *					top: "100px"
 *				}, 1000, "easeInOutCirc", function() {
 *				}, 100
 *			),
 *			DoTweener($("#hoge2"), {
 *					top: "200px"
 *				}, 1000, "easeInOutCirc", function() {
 *				}, 100
 *			)
 *		],
 *		function () {
 *			alert("Done!!");
 *		}
 *	);
 */

$.addCommand = function() {
	new addCommand(arguments);
	
	return this;
}

function addCommand(queue) {
	var _this = this;

	this.queue = [];
	$.each(queue, function(index, obj) {
		_this.queue.push(obj);
	});
	this.init(queue);
};
addCommand.prototype = {
	queue: [],
	isDone: false,
	arg: null,
	init: function(queue) {
		var _this = this;

		var i = 0,
			len = this.queue.length,
			com;
		this.isDone = true;

		(function() {
			if (i >= len) { return }

			var wait = 0;
			if (_this.isDone) {
				_this.isDone = false;
				com = _this.queue[i++];
				wait = _this.doCommand(com);
			}

			setTimeout(arguments.callee, wait || 10);
		})();
	},
	doCommand: function(com) {
		var _this = this;

		if (com instanceof Wait) {
			this.isDone = true;
			return com.timer * 1000;
		} else if (com instanceof Prop) {
			this.isDone = true;
			$(com.selector).css(com.prop);
		} else if (com instanceof DoTweener) {
			setTimeout(function() {
				$(com.selector).animate(com.prop, com.duration, com.easing, function() {
					_this.isDone = true;
					(com.callback || function() {}).apply(this, arguments);
				});
			}, com.delay || 0);
		} else if(com instanceof Function) {
			this.isDone = true;
			this.arg = com(this.arg);
		} else if (com instanceof Array) {
			this.doCommandWith(com);
		}
	},
	doCommandWith: function(array) {
		var i = 0,
			len = array.length,
			com = [],
			allcount = len,
			targetcount = 0,
			_this = this;

		(function() {
			if (i >= len) { return }
			com = array[i++];
			if (com instanceof Prop) {
				targetcount++;
				$(com.selector).css(com.prop);
			} else if (com instanceof DoTweener) {
				setTimeout(function() {
					$(com.selector).animate(com.prop, com.duration, com.easing, function() {
						targetcount++;
						(com.callback || function() {}).apply(this, arguments);
					});
				}, com.delay || 0);
			} else if (com instanceof Function) {
				targetcount++;
				this.arg = com(this.arg);
			}

			setTimeout(arguments.callee, 10);
		})();

		var interval = setInterval(function (){
			if(allcount <= targetcount){
				clearInterval(interval);
				_this.isDone = true;
			}
		}, 100);
	}
}

$.addCommand.Wait = function(timer) {
	return new Wait(timer);
}
var Wait = function(timer) {
	this.timer = timer;
}
Wait.prototype = {
	timer: null
}

$.addCommand.Prop = function(selector, prop) {
	return new Prop(selector, prop);
}
var Prop = function(selector, prop) {
	this.selector = selector;
	this.prop = prop;
}
Prop.prototype = {
	selector: null,
	prop: null
}

$.addCommand.DoTweener = function(selector, prop, duration, easing, callback, delay) {
	return new DoTweener(selector, prop, duration, easing, callback, delay);
}
var DoTweener = function(selector, prop, duration, easing, callback, delay) {
	this.selector = selector;
	this.prop = prop;
	this.duration = duration;
	this.easing = easing;
	this.callback = callback;
	this.delay = delay;
};
DoTweener.prototype = {
	selector: null,
	prop: null,
	duration: null,
	easing: null,
	callback: null,
	delay: null
}

$.addCommand.define = function() {
	if (window.addCommand) { return; }

	window.addCommand = $.addCommand;
	window.Wait = $.addCommand.Wait;
	window.Prop = $.addCommand.Prop;
	window.DoTweener = $.addCommand.DoTweener;
}
})(jQuery);