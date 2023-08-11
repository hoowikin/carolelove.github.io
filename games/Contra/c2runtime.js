var cr = {};
cr.plugins_ = {};
cr.behaviors = {};
if (typeof Object.getPrototypeOf !== "function") {
	if (typeof "test".__proto__ === "object") {
		Object.getPrototypeOf = function(object) {
			return object.__proto__
		}
	} else {
		Object.getPrototypeOf = function(object) {
			return object.constructor.prototype
		}
	}
}(function() {
	cr.logexport = function(msg) {
		if (window.console && window.console.log) window.console.log(msg)
	};
	cr.logerror = function(msg) {
		if (window.console && window.console.error) window.console.error(msg)
	};
	cr.seal = function(x) {
		return x
	};
	cr.freeze = function(x) {
		return x
	};
	cr.is_undefined = function(x) {
		return typeof x === "undefined"
	};
	cr.is_number = function(x) {
		return typeof x === "number"
	};
	cr.is_string = function(x) {
		return typeof x === "string"
	};
	cr.isPOT = function(x) {
		return x > 0 && (x - 1 & x) === 0
	};
	cr.nextHighestPowerOfTwo = function(x) {
		--x;
		for (var i = 1; i < 32; i <<= 1) {
			x = x | x >> i
		}
		return x + 1
	};
	cr.abs = function(x) {
		return x < 0 ? -x : x
	};
	cr.max = function(a, b) {
		return a > b ? a : b
	};
	cr.min = function(a, b) {
		return a < b ? a : b
	};
	cr.PI = Math.PI;
	cr.round = function(x) {
		return x + .5 | 0
	};
	cr.floor = function(x) {
		if (x >= 0) return x | 0;
		else return (x | 0) - 1
	};
	cr.ceil = function(x) {
		var f = x | 0;
		return f === x ? f : f + 1
	};

	function Vector2(x, y) {
		this.x = x;
		this.y = y;
		cr.seal(this)
	}
	Vector2.prototype.offset = function(px, py) {
		this.x += px;
		this.y += py;
		return this
	};
	Vector2.prototype.mul = function(px, py) {
		this.x *= px;
		this.y *= py;
		return this
	};
	cr.vector2 = Vector2;
	cr.segments_intersect = function(a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y) {
		var max_ax, min_ax, max_ay, min_ay, max_bx, min_bx, max_by, min_by;
		if (a1x < a2x) {
			min_ax = a1x;
			max_ax = a2x
		} else {
			min_ax = a2x;
			max_ax = a1x
		}
		if (b1x < b2x) {
			min_bx = b1x;
			max_bx = b2x
		} else {
			min_bx = b2x;
			max_bx = b1x
		}
		if (max_ax < min_bx || min_ax > max_bx) return false;
		if (a1y < a2y) {
			min_ay = a1y;
			max_ay = a2y
		} else {
			min_ay = a2y;
			max_ay = a1y
		}
		if (b1y < b2y) {
			min_by = b1y;
			max_by = b2y
		} else {
			min_by = b2y;
			max_by = b1y
		}
		if (max_ay < min_by || min_ay > max_by) return false;
		var dpx = b1x - a1x + b2x - a2x;
		var dpy = b1y - a1y + b2y - a2y;
		var qax = a2x - a1x;
		var qay = a2y - a1y;
		var qbx = b2x - b1x;
		var qby = b2y - b1y;
		var d = cr.abs(qay * qbx - qby * qax);
		var la = qbx * dpy - qby * dpx;
		if (cr.abs(la) > d) return false;
		var lb = qax * dpy - qay * dpx;
		return cr.abs(lb) <= d
	};

	function Rect(left, top, right, bottom) {
		this.set(left, top, right, bottom);
		cr.seal(this)
	}
	Rect.prototype.set = function(left, top, right, bottom) {
		this.left = left;
		this.top = top;
		this.right = right;
		this.bottom = bottom
	};
	Rect.prototype.copy = function(r) {
		this.left = r.left;
		this.top = r.top;
		this.right = r.right;
		this.bottom = r.bottom
	};
	Rect.prototype.width = function() {
		return this.right - this.left
	};
	Rect.prototype.height = function() {
		return this.bottom - this.top
	};
	Rect.prototype.offset = function(px, py) {
		this.left += px;
		this.top += py;
		this.right += px;
		this.bottom += py;
		return this
	};
	Rect.prototype.normalize = function() {
		var temp = 0;
		if (this.left > this.right) {
			temp = this.left;
			this.left = this.right;
			this.right = temp
		}
		if (this.top > this.bottom) {
			temp = this.top;
			this.top = this.bottom;
			this.bottom = temp
		}
	};
	Rect.prototype.intersects_rect = function(rc) {
		return !(rc.right < this.left || rc.bottom < this.top || rc.left > this.right || rc.top > this.bottom)
	};
	Rect.prototype.intersects_rect_off = function(rc, ox, oy) {
		return !(rc.right + ox < this.left || rc.bottom + oy < this.top || rc.left + ox > this.right || rc.top + oy > this.bottom)
	};
	Rect.prototype.contains_pt = function(x, y) {
		return x >= this.left && x <= this.right && (y >= this.top && y <= this.bottom)
	};
	Rect.prototype.equals = function(r) {
		return this.left === r.left && this.top === r.top && this.right === r.right && this.bottom === r.bottom
	};
	cr.rect = Rect;

	function Quad() {
		this.tlx = 0;
		this.tly = 0;
		this.trx = 0;
		this.try_ = 0;
		this.brx = 0;
		this.bry = 0;
		this.blx = 0;
		this.bly = 0;
		cr.seal(this)
	}
	Quad.prototype.set_from_rect = function(rc) {
		this.tlx = rc.left;
		this.tly = rc.top;
		this.trx = rc.right;
		this.try_ = rc.top;
		this.brx = rc.right;
		this.bry = rc.bottom;
		this.blx = rc.left;
		this.bly = rc.bottom
	};
	Quad.prototype.set_from_rotated_rect = function(rc, a) {
		if (a === 0) {
			this.set_from_rect(rc)
		} else {
			var sin_a = Math.sin(a);
			var cos_a = Math.cos(a);
			var left_sin_a = rc.left * sin_a;
			var top_sin_a = rc.top * sin_a;
			var right_sin_a = rc.right * sin_a;
			var bottom_sin_a = rc.bottom * sin_a;
			var left_cos_a = rc.left * cos_a;
			var top_cos_a = rc.top * cos_a;
			var right_cos_a = rc.right * cos_a;
			var bottom_cos_a = rc.bottom * cos_a;
			this.tlx = left_cos_a - top_sin_a;
			this.tly = top_cos_a + left_sin_a;
			this.trx = right_cos_a - top_sin_a;
			this.try_ = top_cos_a + right_sin_a;
			this.brx = right_cos_a - bottom_sin_a;
			this.bry = bottom_cos_a + right_sin_a;
			this.blx = left_cos_a - bottom_sin_a;
			this.bly = bottom_cos_a + left_sin_a
		}
	};
	Quad.prototype.offset = function(px, py) {
		this.tlx += px;
		this.tly += py;
		this.trx += px;
		this.try_ += py;
		this.brx += px;
		this.bry += py;
		this.blx += px;
		this.bly += py;
		return this
	};
	var minresult = 0;
	var maxresult = 0;

	function minmax4(a, b, c, d) {
		if (a < b) {
			if (c < d) {
				if (a < c) minresult = a;
				else minresult = c;
				if (b > d) maxresult = b;
				else maxresult = d
			} else {
				if (a < d) minresult = a;
				else minresult = d;
				if (b > c) maxresult = b;
				else maxresult = c
			}
		} else {
			if (c < d) {
				if (b < c) minresult = b;
				else minresult = c;
				if (a > d) maxresult = a;
				else maxresult = d
			} else {
				if (b < d) minresult = b;
				else minresult = d;
				if (a > c) maxresult = a;
				else maxresult = c
			}
		}
	}
	Quad.prototype.bounding_box = function(rc) {
		minmax4(this.tlx, this.trx, this.brx, this.blx);
		rc.left = minresult;
		rc.right = maxresult;
		minmax4(this.tly, this.try_, this.bry, this.bly);
		rc.top = minresult;
		rc.bottom = maxresult
	};
	Quad.prototype.contains_pt = function(x, y) {
		var tlx = this.tlx;
		var tly = this.tly;
		var v0x = this.trx - tlx;
		var v0y = this.try_ - tly;
		var v1x = this.brx - tlx;
		var v1y = this.bry - tly;
		var v2x = x - tlx;
		var v2y = y - tly;
		var dot00 = v0x * v0x + v0y * v0y;
		var dot01 = v0x * v1x + v0y * v1y;
		var dot02 = v0x * v2x + v0y * v2y;
		var dot11 = v1x * v1x + v1y * v1y;
		var dot12 = v1x * v2x + v1y * v2y;
		var invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
		var u = (dot11 * dot02 - dot01 * dot12) * invDenom;
		var v = (dot00 * dot12 - dot01 * dot02) * invDenom;
		if (u >= 0 && v > 0 && u + v < 1) return true;
		v0x = this.blx - tlx;
		v0y = this.bly - tly;
		var dot00 = v0x * v0x + v0y * v0y;
		var dot01 = v0x * v1x + v0y * v1y;
		var dot02 = v0x * v2x + v0y * v2y;
		invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
		u = (dot11 * dot02 - dot01 * dot12) * invDenom;
		v = (dot00 * dot12 - dot01 * dot02) * invDenom;
		return u >= 0 && v > 0 && u + v < 1
	};
	Quad.prototype.at = function(i, xory) {
		if (xory) {
			switch (i) {
			case 0:
				return this.tlx;
			case 1:
				return this.trx;
			case 2:
				return this.brx;
			case 3:
				return this.blx;
			case 4:
				return this.tlx;
			default:
				return this.tlx
			}
		} else {
			switch (i) {
			case 0:
				return this.tly;
			case 1:
				return this.try_;
			case 2:
				return this.bry;
			case 3:
				return this.bly;
			case 4:
				return this.tly;
			default:
				return this.tly
			}
		}
	};
	Quad.prototype.midX = function() {
		return (this.tlx + this.trx + this.brx + this.blx) / 4
	};
	Quad.prototype.midY = function() {
		return (this.tly + this.try_ + this.bry + this.bly) / 4
	};
	Quad.prototype.intersects_segment = function(x1, y1, x2, y2) {
		if (this.contains_pt(x1, y1) || this.contains_pt(x2, y2)) return true;
		var a1x, a1y, a2x, a2y;
		var i;
		for (i = 0; i < 4; i++) {
			a1x = this.at(i, true);
			a1y = this.at(i, false);
			a2x = this.at(i + 1, true);
			a2y = this.at(i + 1, false);
			if (cr.segments_intersect(x1, y1, x2, y2, a1x, a1y, a2x, a2y)) return true
		}
		return false
	};
	Quad.prototype.intersects_quad = function(rhs) {
		var midx = rhs.midX();
		var midy = rhs.midY();
		if (this.contains_pt(midx, midy)) return true;
		midx = this.midX();
		midy = this.midY();
		if (rhs.contains_pt(midx, midy)) return true;
		var a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y;
		var i, j;
		for (i = 0; i < 4; i++) {
			for (j = 0; j < 4; j++) {
				a1x = this.at(i, true);
				a1y = this.at(i, false);
				a2x = this.at(i + 1, true);
				a2y = this.at(i + 1, false);
				b1x = rhs.at(j, true);
				b1y = rhs.at(j, false);
				b2x = rhs.at(j + 1, true);
				b2y = rhs.at(j + 1, false);
				if (cr.segments_intersect(a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y)) return true
			}
		}
		return false
	};
	cr.quad = Quad;
	cr.RGB = function(red, green, blue) {
		return Math.max(Math.min(red, 255), 0) | Math.max(Math.min(green, 255), 0) << 8 | Math.max(Math.min(blue, 255), 0) << 16
	};
	cr.GetRValue = function(rgb) {
		return rgb & 255
	};
	cr.GetGValue = function(rgb) {
		return (rgb & 65280) >> 8
	};
	cr.GetBValue = function(rgb) {
		return (rgb & 16711680) >> 16
	};
	cr.shallowCopy = function(a, b, allowOverwrite) {
		var attr;
		for (attr in b) {
			if (b.hasOwnProperty(attr)) {
				a[attr] = b[attr]
			}
		}
		return a
	};
	cr.arrayRemove = function(arr, index) {
		var i, len;
		index = cr.floor(index);
		if (index < 0 || index >= arr.length) return;
		for (i = index, len = arr.length - 1; i < len; i++) arr[i] = arr[i + 1];
		cr.truncateArray(arr, len)
	};
	cr.truncateArray = function(arr, index) {
		arr.length = index
	};
	cr.clearArray = function(arr) {
		cr.truncateArray(arr, 0)
	};
	cr.shallowAssignArray = function(dest, src) {
		cr.clearArray(dest);
		var i, len;
		for (i = 0, len = src.length; i < len; ++i) dest[i] = src[i]
	};
	cr.appendArray = function(a, b) {
		a.push.apply(a, b)
	};
	cr.fastIndexOf = function(arr, item) {
		var i, len;
		for (i = 0, len = arr.length; i < len; ++i) {
			if (arr[i] === item) return i
		}
		return -1
	};
	cr.arrayFindRemove = function(arr, item) {
		var index = cr.fastIndexOf(arr, item);
		if (index !== -1) cr.arrayRemove(arr, index)
	};
	cr.clamp = function(x, a, b) {
		if (x < a) return a;
		else if (x > b) return b;
		else return x
	};
	cr.to_radians = function(x) {
		return x / (180 / cr.PI)
	};
	cr.to_degrees = function(x) {
		return x * (180 / cr.PI)
	};
	cr.clamp_angle_degrees = function(a) {
		a %= 360;
		if (a < 0) a += 360;
		return a
	};
	cr.clamp_angle = function(a) {
		a %= 2 * cr.PI;
		if (a < 0) a += 2 * cr.PI;
		return a
	};
	cr.to_clamped_degrees = function(x) {
		return cr.clamp_angle_degrees(cr.to_degrees(x))
	};
	cr.to_clamped_radians = function(x) {
		return cr.clamp_angle(cr.to_radians(x))
	};
	cr.angleTo = function(x1, y1, x2, y2) {
		var dx = x2 - x1;
		var dy = y2 - y1;
		return Math.atan2(dy, dx)
	};
	cr.angleDiff = function(a1, a2) {
		if (a1 === a2) return 0;
		var s1 = Math.sin(a1);
		var c1 = Math.cos(a1);
		var s2 = Math.sin(a2);
		var c2 = Math.cos(a2);
		var n = s1 * s2 + c1 * c2;
		if (n >= 1) return 0;
		if (n <= -1) return cr.PI;
		return Math.acos(n)
	};
	cr.angleRotate = function(start, end, step) {
		var ss = Math.sin(start);
		var cs = Math.cos(start);
		var se = Math.sin(end);
		var ce = Math.cos(end);
		if (Math.acos(ss * se + cs * ce) > step) {
			if (cs * se - ss * ce > 0) return cr.clamp_angle(start + step);
			else return cr.clamp_angle(start - step)
		} else return cr.clamp_angle(end)
	};
	cr.angleClockwise = function(a1, a2) {
		var s1 = Math.sin(a1);
		var c1 = Math.cos(a1);
		var s2 = Math.sin(a2);
		var c2 = Math.cos(a2);
		return c1 * s2 - s1 * c2 <= 0
	};
	cr.rotatePtAround = function(px, py, a, ox, oy, getx) {
		if (a === 0) return getx ? px : py;
		var sin_a = Math.sin(a);
		var cos_a = Math.cos(a);
		px -= ox;
		py -= oy;
		var left_sin_a = px * sin_a;
		var top_sin_a = py * sin_a;
		var left_cos_a = px * cos_a;
		var top_cos_a = py * cos_a;
		px = left_cos_a - top_sin_a;
		py = top_cos_a + left_sin_a;
		px += ox;
		py += oy;
		return getx ? px : py
	};
	cr.distanceTo = function(x1, y1, x2, y2) {
		var dx = x2 - x1;
		var dy = y2 - y1;
		return Math.sqrt(dx * dx + dy * dy)
	};
	cr.xor = function(x, y) {
		return !x !== !y
	};
	cr.lerp = function(a, b, x) {
		return a + (b - a) * x
	};
	cr.unlerp = function(a, b, c) {
		if (a === b) return 0;
		return (c - a) / (b - a)
	};
	cr.anglelerp = function(a, b, x) {
		var diff = cr.angleDiff(a, b);
		if (cr.angleClockwise(b, a)) {
			return a + diff * x
		} else {
			return a - diff * x
		}
	};
	cr.qarp = function(a, b, c, x) {
		return cr.lerp(cr.lerp(a, b, x), cr.lerp(b, c, x), x)
	};
	cr.cubic = function(a, b, c, d, x) {
		return cr.lerp(cr.qarp(a, b, c, x), cr.qarp(b, c, d, x), x)
	};
	cr.cosp = function(a, b, x) {
		return (a + b + (a - b) * Math.cos(x * Math.PI)) / 2
	};
	cr.hasAnyOwnProperty = function(o) {
		var p;
		for (p in o) {
			if (o.hasOwnProperty(p)) return true
		}
		return false
	};
	cr.wipe = function(obj) {
		var p;
		for (p in obj) {
			if (obj.hasOwnProperty(p)) delete obj[p]
		}
	};
	var startup_time = +new Date;
	cr.performance_now = function() {
		if (typeof window["performance"] !== "undefined") {
			var winperf = window["performance"];
			if (typeof winperf.now !== "undefined") return winperf.now();
			else if (typeof winperf["webkitNow"] !== "undefined") return winperf["webkitNow"]();
			else if (typeof winperf["mozNow"] !== "undefined") return winperf["mozNow"]();
			else if (typeof winperf["msNow"] !== "undefined") return winperf["msNow"]()
		}
		return Date.now() - startup_time
	};
	var isChrome = false;
	var isSafari = false;
	var isiOS = false;
	var isEjecta = false;
	if (typeof window !== "undefined") {
		isChrome = /chrome/i.test(navigator.userAgent) || /chromium/i.test(navigator.userAgent);
		isSafari = !isChrome && /safari/i.test(navigator.userAgent);
		isiOS = /(iphone|ipod|ipad)/i.test(navigator.userAgent);
		isEjecta = window["c2ejecta"]
	}
	var supports_set = !isSafari && !isEjecta && !isiOS && (typeof Set !== "undefined" && typeof Set.prototype["forEach"] !== "undefined");

	function ObjectSet_() {
		this.s = null;
		this.items = null;
		this.item_count = 0;
		if (supports_set) {
			this.s = new Set
		}
		this.values_cache = [];
		this.cache_valid = true;
		cr.seal(this)
	}
	ObjectSet_.prototype.contains = function(x) {
		if (this.isEmpty()) return false;
		if (supports_set) return this.s["has"](x);
		else return this.items && this.items.hasOwnProperty(x)
	};
	ObjectSet_.prototype.add = function(x) {
		if (supports_set) {
			if (!this.s["has"](x)) {
				this.s["add"](x);
				this.cache_valid = false
			}
		} else {
			var str = x.toString();
			var items = this.items;
			if (!items) {
				this.items = {};
				this.items[str] = x;
				this.item_count = 1;
				this.cache_valid = false
			} else if (!items.hasOwnProperty(str)) {
				items[str] = x;
				this.item_count++;
				this.cache_valid = false
			}
		}
	};
	ObjectSet_.prototype.remove = function(x) {
		if (this.isEmpty()) return;
		if (supports_set) {
			if (this.s["has"](x)) {
				this.s["delete"](x);
				this.cache_valid = false
			}
		} else if (this.items) {
			var str = x.toString();
			var items = this.items;
			if (items.hasOwnProperty(str)) {
				delete items[str];
				this.item_count--;
				this.cache_valid = false
			}
		}
	};
	ObjectSet_.prototype.clear = function() {
		if (this.isEmpty()) return;
		if (supports_set) {
			this.s["clear"]()
		} else {
			this.items = null;
			this.item_count = 0
		}
		cr.clearArray(this.values_cache);
		this.cache_valid = true
	};
	ObjectSet_.prototype.isEmpty = function() {
		return this.count() === 0
	};
	ObjectSet_.prototype.count = function() {
		if (supports_set) return this.s["size"];
		else return this.item_count
	};
	var current_arr = null;
	var current_index = 0;

	function set_append_to_arr(x) {
		current_arr[current_index++] = x
	}
	ObjectSet_.prototype.update_cache = function() {
		if (this.cache_valid) return;
		if (supports_set) {
			cr.clearArray(this.values_cache);
			current_arr = this.values_cache;
			current_index = 0;
			this.s["forEach"](set_append_to_arr);
			current_arr = null;
			current_index = 0
		} else {
			var values_cache = this.values_cache;
			cr.clearArray(values_cache);
			var p, n = 0,
				items = this.items;
			if (items) {
				for (p in items) {
					if (items.hasOwnProperty(p)) values_cache[n++] = items[p]
				}
			}
		}
		this.cache_valid = true
	};
	ObjectSet_.prototype.valuesRef = function() {
		this.update_cache();
		return this.values_cache
	};
	cr.ObjectSet = ObjectSet_;
	var tmpSet = new cr.ObjectSet;
	cr.removeArrayDuplicates = function(arr) {
		var i, len;
		for (i = 0, len = arr.length; i < len; ++i) {
			tmpSet.add(arr[i])
		}
		cr.shallowAssignArray(arr, tmpSet.valuesRef());
		tmpSet.clear()
	};
	cr.arrayRemoveAllFromObjectSet = function(arr, remset) {
		if (supports_set) cr.arrayRemoveAll_set(arr, remset.s);
		else cr.arrayRemoveAll_arr(arr, remset.valuesRef())
	};
	cr.arrayRemoveAll_set = function(arr, s) {
		var i, j, len, item;
		for (i = 0, j = 0, len = arr.length; i < len; ++i) {
			item = arr[i];
			if (!s["has"](item)) arr[j++] = item
		}
		cr.truncateArray(arr, j)
	};
	cr.arrayRemoveAll_arr = function(arr, rem) {
		var i, j, len, item;
		for (i = 0, j = 0, len = arr.length; i < len; ++i) {
			item = arr[i];
			if (cr.fastIndexOf(rem, item) === -1) arr[j++] = item
		}
		cr.truncateArray(arr, j)
	};

	function KahanAdder_() {
		this.c = 0;
		this.y = 0;
		this.t = 0;
		this.sum = 0;
		cr.seal(this)
	}
	KahanAdder_.prototype.add = function(v) {
		this.y = v - this.c;
		this.t = this.sum + this.y;
		this.c = this.t - this.sum - this.y;
		this.sum = this.t
	};
	KahanAdder_.prototype.reset = function() {
		this.c = 0;
		this.y = 0;
		this.t = 0;
		this.sum = 0
	};
	cr.KahanAdder = KahanAdder_;
	cr.regexp_escape = function(text) {
		return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
	};

	function CollisionPoly_(pts_array_) {
		this.pts_cache = [];
		this.bboxLeft = 0;
		this.bboxTop = 0;
		this.bboxRight = 0;
		this.bboxBottom = 0;
		this.convexpolys = null;
		this.set_pts(pts_array_);
		cr.seal(this)
	}
	CollisionPoly_.prototype.set_pts = function(pts_array_) {
		this.pts_array = pts_array_;
		this.pts_count = pts_array_.length / 2;
		this.pts_cache.length = pts_array_.length;
		this.cache_width = -1;
		this.cache_height = -1;
		this.cache_angle = 0
	};
	CollisionPoly_.prototype.is_empty = function() {
		return !this.pts_array.length
	};
	CollisionPoly_.prototype.update_bbox = function() {
		var myptscache = this.pts_cache;
		var bboxLeft_ = myptscache[0];
		var bboxRight_ = bboxLeft_;
		var bboxTop_ = myptscache[1];
		var bboxBottom_ = bboxTop_;
		var x, y, i = 1,
			i2, len = this.pts_count;
		for (; i < len; ++i) {
			i2 = i * 2;
			x = myptscache[i2];
			y = myptscache[i2 + 1];
			if (x < bboxLeft_) bboxLeft_ = x;
			if (x > bboxRight_) bboxRight_ = x;
			if (y < bboxTop_) bboxTop_ = y;
			if (y > bboxBottom_) bboxBottom_ = y
		}
		this.bboxLeft = bboxLeft_;
		this.bboxRight = bboxRight_;
		this.bboxTop = bboxTop_;
		this.bboxBottom = bboxBottom_
	};
	CollisionPoly_.prototype.set_from_rect = function(rc, offx, offy) {
		this.pts_cache.length = 8;
		this.pts_count = 4;
		var myptscache = this.pts_cache;
		myptscache[0] = rc.left - offx;
		myptscache[1] = rc.top - offy;
		myptscache[2] = rc.right - offx;
		myptscache[3] = rc.top - offy;
		myptscache[4] = rc.right - offx;
		myptscache[5] = rc.bottom - offy;
		myptscache[6] = rc.left - offx;
		myptscache[7] = rc.bottom - offy;
		this.cache_width = rc.right - rc.left;
		this.cache_height = rc.bottom - rc.top;
		this.update_bbox()
	};
	CollisionPoly_.prototype.set_from_quad = function(q, offx, offy, w, h) {
		this.pts_cache.length = 8;
		this.pts_count = 4;
		var myptscache = this.pts_cache;
		myptscache[0] = q.tlx - offx;
		myptscache[1] = q.tly - offy;
		myptscache[2] = q.trx - offx;
		myptscache[3] = q.try_ - offy;
		myptscache[4] = q.brx - offx;
		myptscache[5] = q.bry - offy;
		myptscache[6] = q.blx - offx;
		myptscache[7] = q.bly - offy;
		this.cache_width = w;
		this.cache_height = h;
		this.update_bbox()
	};
	CollisionPoly_.prototype.set_from_poly = function(r) {
		this.pts_count = r.pts_count;
		cr.shallowAssignArray(this.pts_cache, r.pts_cache);
		this.bboxLeft = r.bboxLeft;
		this.bboxTop - r.bboxTop;
		this.bboxRight = r.bboxRight;
		this.bboxBottom = r.bboxBottom
	};
	CollisionPoly_.prototype.cache_poly = function(w, h, a) {
		if (this.cache_width === w && this.cache_height === h && this.cache_angle === a) return;
		this.cache_width = w;
		this.cache_height = h;
		this.cache_angle = a;
		var i, i2, i21, len, x, y;
		var sina = 0;
		var cosa = 1;
		var myptsarray = this.pts_array;
		var myptscache = this.pts_cache;
		if (a !== 0) {
			sina = Math.sin(a);
			cosa = Math.cos(a)
		}
		for (i = 0, len = this.pts_count; i < len; i++) {
			i2 = i * 2;
			i21 = i2 + 1;
			x = myptsarray[i2] * w;
			y = myptsarray[i21] * h;
			myptscache[i2] = x * cosa - y * sina;
			myptscache[i21] = y * cosa + x * sina
		}
		this.update_bbox()
	};
	CollisionPoly_.prototype.contains_pt = function(a2x, a2y) {
		var myptscache = this.pts_cache;
		if (a2x === myptscache[0] && a2y === myptscache[1]) return true;
		var i, i2, imod, len = this.pts_count;
		var a1x = this.bboxLeft - 110;
		var a1y = this.bboxTop - 101;
		var a3x = this.bboxRight + 131;
		var a3y = this.bboxBottom + 120;
		var b1x, b1y, b2x, b2y;
		var count1 = 0,
			count2 = 0;
		for (i = 0; i < len; i++) {
			i2 = i * 2;
			imod = (i + 1) % len * 2;
			b1x = myptscache[i2];
			b1y = myptscache[i2 + 1];
			b2x = myptscache[imod];
			b2y = myptscache[imod + 1];
			if (cr.segments_intersect(a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y)) count1++;
			if (cr.segments_intersect(a3x, a3y, a2x, a2y, b1x, b1y, b2x, b2y)) count2++
		}
		return count1 % 2 === 1 || count2 % 2 === 1
	};
	CollisionPoly_.prototype.intersects_poly = function(rhs, offx, offy) {
		var rhspts = rhs.pts_cache;
		var mypts = this.pts_cache;
		if (this.contains_pt(rhspts[0] + offx, rhspts[1] + offy)) return true;
		if (rhs.contains_pt(mypts[0] - offx, mypts[1] - offy)) return true;
		var i, i2, imod, leni, j, j2, jmod, lenj;
		var a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y;
		for (i = 0, leni = this.pts_count; i < leni; i++) {
			i2 = i * 2;
			imod = (i + 1) % leni * 2;
			a1x = mypts[i2];
			a1y = mypts[i2 + 1];
			a2x = mypts[imod];
			a2y = mypts[imod + 1];
			for (j = 0, lenj = rhs.pts_count; j < lenj; j++) {
				j2 = j * 2;
				jmod = (j + 1) % lenj * 2;
				b1x = rhspts[j2] + offx;
				b1y = rhspts[j2 + 1] + offy;
				b2x = rhspts[jmod] + offx;
				b2y = rhspts[jmod + 1] + offy;
				if (cr.segments_intersect(a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y)) return true
			}
		}
		return false
	};
	CollisionPoly_.prototype.intersects_segment = function(offx, offy, x1, y1, x2, y2) {
		var mypts = this.pts_cache;
		if (this.contains_pt(x1 - offx, y1 - offy)) return true;
		var i, leni, i2, imod;
		var a1x, a1y, a2x, a2y;
		for (i = 0, leni = this.pts_count; i < leni; i++) {
			i2 = i * 2;
			imod = (i + 1) % leni * 2;
			a1x = mypts[i2] + offx;
			a1y = mypts[i2 + 1] + offy;
			a2x = mypts[imod] + offx;
			a2y = mypts[imod + 1] + offy;
			if (cr.segments_intersect(x1, y1, x2, y2, a1x, a1y, a2x, a2y)) return true
		}
		return false
	};
	CollisionPoly_.prototype.mirror = function(px) {
		var i, leni, i2;
		for (i = 0, leni = this.pts_count; i < leni; ++i) {
			i2 = i * 2;
			this.pts_cache[i2] = px * 2 - this.pts_cache[i2]
		}
	};
	CollisionPoly_.prototype.flip = function(py) {
		var i, leni, i21;
		for (i = 0, leni = this.pts_count; i < leni; ++i) {
			i21 = i * 2 + 1;
			this.pts_cache[i21] = py * 2 - this.pts_cache[i21]
		}
	};
	CollisionPoly_.prototype.diag = function() {
		var i, leni, i2, i21, temp;
		for (i = 0, leni = this.pts_count; i < leni; ++i) {
			i2 = i * 2;
			i21 = i2 + 1;
			temp = this.pts_cache[i2];
			this.pts_cache[i2] = this.pts_cache[i21];
			this.pts_cache[i21] = temp
		}
	};
	cr.CollisionPoly = CollisionPoly_;

	function SparseGrid_(cellwidth_, cellheight_) {
		this.cellwidth = cellwidth_;
		this.cellheight = cellheight_;
		this.cells = {}
	}
	SparseGrid_.prototype.totalCellCount = 0;
	SparseGrid_.prototype.getCell = function(x_, y_, create_if_missing) {
		var ret;
		var col = this.cells[x_];
		if (!col) {
			if (create_if_missing) {
				ret = allocGridCell(this, x_, y_);
				this.cells[x_] = {};
				this.cells[x_][y_] = ret;
				return ret
			} else return null
		}
		ret = col[y_];
		if (ret) return ret;
		else if (create_if_missing) {
			ret = allocGridCell(this, x_, y_);
			this.cells[x_][y_] = ret;
			return ret
		} else return null
	};
	SparseGrid_.prototype.XToCell = function(x_) {
		return cr.floor(x_ / this.cellwidth)
	};
	SparseGrid_.prototype.YToCell = function(y_) {
		return cr.floor(y_ / this.cellheight)
	};
	SparseGrid_.prototype.update = function(inst, oldrange, newrange) {
		var x, lenx, y, leny, cell;
		if (oldrange) {
			for (x = oldrange.left, lenx = oldrange.right; x <= lenx; ++x) {
				for (y = oldrange.top, leny = oldrange.bottom; y <= leny; ++y) {
					if (newrange && newrange.contains_pt(x, y)) continue;
					cell = this.getCell(x, y, false);
					if (!cell) continue;
					cell.remove(inst);
					if (cell.isEmpty()) {
						freeGridCell(cell);
						this.cells[x][y] = null
					}
				}
			}
		}
		if (newrange) {
			for (x = newrange.left, lenx = newrange.right; x <= lenx; ++x) {
				for (y = newrange.top, leny = newrange.bottom; y <= leny; ++y) {
					if (oldrange && oldrange.contains_pt(x, y)) continue;
					this.getCell(x, y, true).insert(inst)
				}
			}
		}
	};
	SparseGrid_.prototype.queryRange = function(rc, result) {
		var x, lenx, ystart, y, leny, cell;
		x = this.XToCell(rc.left);
		ystart = this.YToCell(rc.top);
		lenx = this.XToCell(rc.right);
		leny = this.YToCell(rc.bottom);
		for (; x <= lenx; ++x) {
			for (y = ystart; y <= leny; ++y) {
				cell = this.getCell(x, y, false);
				if (!cell) continue;
				cell.dump(result)
			}
		}
	};
	cr.SparseGrid = SparseGrid_;

	function RenderGrid_(cellwidth_, cellheight_) {
		this.cellwidth = cellwidth_;
		this.cellheight = cellheight_;
		this.cells = {}
	}
	RenderGrid_.prototype.totalCellCount = 0;
	RenderGrid_.prototype.getCell = function(x_, y_, create_if_missing) {
		var ret;
		var col = this.cells[x_];
		if (!col) {
			if (create_if_missing) {
				ret = allocRenderCell(this, x_, y_);
				this.cells[x_] = {};
				this.cells[x_][y_] = ret;
				return ret
			} else return null
		}
		ret = col[y_];
		if (ret) return ret;
		else if (create_if_missing) {
			ret = allocRenderCell(this, x_, y_);
			this.cells[x_][y_] = ret;
			return ret
		} else return null
	};
	RenderGrid_.prototype.XToCell = function(x_) {
		return cr.floor(x_ / this.cellwidth)
	};
	RenderGrid_.prototype.YToCell = function(y_) {
		return cr.floor(y_ / this.cellheight)
	};
	RenderGrid_.prototype.update = function(inst, oldrange, newrange) {
		var x, lenx, y, leny, cell;
		if (oldrange) {
			for (x = oldrange.left, lenx = oldrange.right; x <= lenx; ++x) {
				for (y = oldrange.top, leny = oldrange.bottom; y <= leny; ++y) {
					if (newrange && newrange.contains_pt(x, y)) continue;
					cell = this.getCell(x, y, false);
					if (!cell) continue;
					cell.remove(inst);
					if (cell.isEmpty()) {
						freeRenderCell(cell);
						this.cells[x][y] = null
					}
				}
			}
		}
		if (newrange) {
			for (x = newrange.left, lenx = newrange.right; x <= lenx; ++x) {
				for (y = newrange.top, leny = newrange.bottom; y <= leny; ++y) {
					if (oldrange && oldrange.contains_pt(x, y)) continue;
					this.getCell(x, y, true).insert(inst)
				}
			}
		}
	};
	RenderGrid_.prototype.queryRange = function(left, top, right, bottom, result) {
		var x, lenx, ystart, y, leny, cell;
		x = this.XToCell(left);
		ystart = this.YToCell(top);
		lenx = this.XToCell(right);
		leny = this.YToCell(bottom);
		for (; x <= lenx; ++x) {
			for (y = ystart; y <= leny; ++y) {
				cell = this.getCell(x, y, false);
				if (!cell) continue;
				cell.dump(result)
			}
		}
	};
	RenderGrid_.prototype.markRangeChanged = function(rc) {
		var x, lenx, ystart, y, leny, cell;
		x = rc.left;
		ystart = rc.top;
		lenx = rc.right;
		leny = rc.bottom;
		for (; x <= lenx; ++x) {
			for (y = ystart; y <= leny; ++y) {
				cell = this.getCell(x, y, false);
				if (!cell) continue;
				cell.is_sorted = false
			}
		}
	};
	cr.RenderGrid = RenderGrid_;
	var gridcellcache = [];

	function allocGridCell(grid_, x_, y_) {
		var ret;
		SparseGrid_.prototype.totalCellCount++;
		if (gridcellcache.length) {
			ret = gridcellcache.pop();
			ret.grid = grid_;
			ret.x = x_;
			ret.y = y_;
			return ret
		} else return new cr.GridCell(grid_, x_, y_)
	}
	function freeGridCell(c) {
		SparseGrid_.prototype.totalCellCount--;
		c.objects.clear();
		if (gridcellcache.length < 1e3) gridcellcache.push(c)
	}
	function GridCell_(grid_, x_, y_) {
		this.grid = grid_;
		this.x = x_;
		this.y = y_;
		this.objects = new cr.ObjectSet
	}
	GridCell_.prototype.isEmpty = function() {
		return this.objects.isEmpty()
	};
	GridCell_.prototype.insert = function(inst) {
		this.objects.add(inst)
	};
	GridCell_.prototype.remove = function(inst) {
		this.objects.remove(inst)
	};
	GridCell_.prototype.dump = function(result) {
		cr.appendArray(result, this.objects.valuesRef())
	};
	cr.GridCell = GridCell_;
	var rendercellcache = [];

	function allocRenderCell(grid_, x_, y_) {
		var ret;
		RenderGrid_.prototype.totalCellCount++;
		if (rendercellcache.length) {
			ret = rendercellcache.pop();
			ret.grid = grid_;
			ret.x = x_;
			ret.y = y_;
			return ret
		} else return new cr.RenderCell(grid_, x_, y_)
	}
	function freeRenderCell(c) {
		RenderGrid_.prototype.totalCellCount--;
		c.reset();
		if (rendercellcache.length < 1e3) rendercellcache.push(c)
	}
	function RenderCell_(grid_, x_, y_) {
		this.grid = grid_;
		this.x = x_;
		this.y = y_;
		this.objects = [];
		this.is_sorted = true;
		this.pending_removal = new cr.ObjectSet;
		this.any_pending_removal = false
	}
	RenderCell_.prototype.isEmpty = function() {
		if (!this.objects.length) {
			return true
		}
		if (this.objects.length > this.pending_removal.count()) return false;
		this.flush_pending();
		return true
	};
	RenderCell_.prototype.insert = function(inst) {
		if (this.pending_removal.contains(inst)) {
			this.pending_removal.remove(inst);
			if (this.pending_removal.isEmpty()) this.any_pending_removal = false;
			return
		}
		if (this.objects.length) {
			var top = this.objects[this.objects.length - 1];
			if (top.get_zindex() > inst.get_zindex()) this.is_sorted = false;
			this.objects.push(inst)
		} else {
			this.objects.push(inst);
			this.is_sorted = true
		}
	};
	RenderCell_.prototype.remove = function(inst) {
		this.pending_removal.add(inst);
		this.any_pending_removal = true;
		if (this.pending_removal.count() >= 30) this.flush_pending()
	};
	RenderCell_.prototype.flush_pending = function() {
		if (!this.any_pending_removal) return;
		if (this.pending_removal.count() === this.objects.length) {
			this.reset();
			return
		}
		cr.arrayRemoveAllFromObjectSet(this.objects, this.pending_removal);
		this.pending_removal.clear();
		this.any_pending_removal = false
	};

	function sortByInstanceZIndex(a, b) {
		return a.zindex - b.zindex
	}
	RenderCell_.prototype.ensure_sorted = function() {
		if (this.is_sorted) return;
		this.objects.sort(sortByInstanceZIndex);
		this.is_sorted = true
	};
	RenderCell_.prototype.reset = function() {
		cr.clearArray(this.objects);
		this.is_sorted = true;
		this.pending_removal.clear();
		this.any_pending_removal = false
	};
	RenderCell_.prototype.dump = function(result) {
		this.flush_pending();
		this.ensure_sorted();
		if (this.objects.length) result.push(this.objects)
	};
	cr.RenderCell = RenderCell_;
	var fxNames = ["lighter", "xor", "copy", "destination-over", "source-in", "destination-in", "source-out", "destination-out", "source-atop", "destination-atop"];
	cr.effectToCompositeOp = function(effect) {
		if (effect <= 0 || effect >= 11) return "source-over";
		return fxNames[effect - 1]
	};
	cr.setGLBlend = function(this_, effect, gl) {
		if (!gl) return;
		this_.srcBlend = gl.ONE;
		this_.destBlend = gl.ONE_MINUS_SRC_ALPHA;
		switch (effect) {
		case 1:
			this_.srcBlend = gl.ONE;
			this_.destBlend = gl.ONE;
			break;
		case 2:
			break;
		case 3:
			this_.srcBlend = gl.ONE;
			this_.destBlend = gl.ZERO;
			break;
		case 4:
			this_.srcBlend = gl.ONE_MINUS_DST_ALPHA;
			this_.destBlend = gl.ONE;
			break;
		case 5:
			this_.srcBlend = gl.DST_ALPHA;
			this_.destBlend = gl.ZERO;
			break;
		case 6:
			this_.srcBlend = gl.ZERO;
			this_.destBlend = gl.SRC_ALPHA;
			break;
		case 7:
			this_.srcBlend = gl.ONE_MINUS_DST_ALPHA;
			this_.destBlend = gl.ZERO;
			break;
		case 8:
			this_.srcBlend = gl.ZERO;
			this_.destBlend = gl.ONE_MINUS_SRC_ALPHA;
			break;
		case 9:
			this_.srcBlend = gl.DST_ALPHA;
			this_.destBlend = gl.ONE_MINUS_SRC_ALPHA;
			break;
		case 10:
			this_.srcBlend = gl.ONE_MINUS_DST_ALPHA;
			this_.destBlend = gl.SRC_ALPHA;
			break
		}
	};
	cr.round6dp = function(x) {
		return Math.round(x * 1e6) / 1e6
	};
	cr.equals_nocase = function(a, b) {
		if (typeof a !== "string" || typeof b !== "string") return false;
		if (a.length !== b.length) return false;
		if (a === b) return true;
		return a.toLowerCase() === b.toLowerCase()
	};
	cr.isCanvasInputEvent = function(e) {
		var target = e.target;
		if (!target) return true;
		if (target === document || target === window) return true;
		if (document && document.body && target === document.body) return true;
		if (cr.equals_nocase(target.tagName, "canvas")) return true;
		return false
	}
})();
var MatrixArray = typeof Float32Array !== "undefined" ? Float32Array : Array,
	glMatrixArrayType = MatrixArray,
	vec3 = {},
	mat3 = {},
	mat4 = {},
	quat4 = {};
vec3.create = function(a) {
	var b = new MatrixArray(3);
	a && (b[0] = a[0], b[1] = a[1], b[2] = a[2]);
	return b
};
vec3.set = function(a, b) {
	b[0] = a[0];
	b[1] = a[1];
	b[2] = a[2];
	return b
};
vec3.add = function(a, b, c) {
	if (!c || a === c) return a[0] += b[0], a[1] += b[1], a[2] += b[2], a;
	c[0] = a[0] + b[0];
	c[1] = a[1] + b[1];
	c[2] = a[2] + b[2];
	return c
};
vec3.subtract = function(a, b, c) {
	if (!c || a === c) return a[0] -= b[0], a[1] -= b[1], a[2] -= b[2], a;
	c[0] = a[0] - b[0];
	c[1] = a[1] - b[1];
	c[2] = a[2] - b[2];
	return c
};
vec3.negate = function(a, b) {
	b || (b = a);
	b[0] = -a[0];
	b[1] = -a[1];
	b[2] = -a[2];
	return b
};
vec3.scale = function(a, b, c) {
	if (!c || a === c) return a[0] *= b, a[1] *= b, a[2] *= b, a;
	c[0] = a[0] * b;
	c[1] = a[1] * b;
	c[2] = a[2] * b;
	return c
};
vec3.normalize = function(a, b) {
	b || (b = a);
	var c = a[0],
		d = a[1],
		e = a[2],
		g = Math.sqrt(c * c + d * d + e * e);
	if (g) {
		if (g === 1) return b[0] = c, b[1] = d, b[2] = e, b
	} else return b[0] = 0, b[1] = 0, b[2] = 0, b;
	g = 1 / g;
	b[0] = c * g;
	b[1] = d * g;
	b[2] = e * g;
	return b
};
vec3.cross = function(a, b, c) {
	c || (c = a);
	var d = a[0],
		e = a[1],
		a = a[2],
		g = b[0],
		f = b[1],
		b = b[2];
	c[0] = e * b - a * f;
	c[1] = a * g - d * b;
	c[2] = d * f - e * g;
	return c
};
vec3.length = function(a) {
	var b = a[0],
		c = a[1],
		a = a[2];
	return Math.sqrt(b * b + c * c + a * a)
};
vec3.dot = function(a, b) {
	return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
};
vec3.direction = function(a, b, c) {
	c || (c = a);
	var d = a[0] - b[0],
		e = a[1] - b[1],
		a = a[2] - b[2],
		b = Math.sqrt(d * d + e * e + a * a);
	if (!b) return c[0] = 0, c[1] = 0, c[2] = 0, c;
	b = 1 / b;
	c[0] = d * b;
	c[1] = e * b;
	c[2] = a * b;
	return c
};
vec3.lerp = function(a, b, c, d) {
	d || (d = a);
	d[0] = a[0] + c * (b[0] - a[0]);
	d[1] = a[1] + c * (b[1] - a[1]);
	d[2] = a[2] + c * (b[2] - a[2]);
	return d
};
vec3.str = function(a) {
	return "[" + a[0] + ", " + a[1] + ", " + a[2] + "]"
};
mat3.create = function(a) {
	var b = new MatrixArray(9);
	a && (b[0] = a[0], b[1] = a[1], b[2] = a[2], b[3] = a[3], b[4] = a[4], b[5] = a[5], b[6] = a[6], b[7] = a[7], b[8] = a[8]);
	return b
};
mat3.set = function(a, b) {
	b[0] = a[0];
	b[1] = a[1];
	b[2] = a[2];
	b[3] = a[3];
	b[4] = a[4];
	b[5] = a[5];
	b[6] = a[6];
	b[7] = a[7];
	b[8] = a[8];
	return b
};
mat3.identity = function(a) {
	a[0] = 1;
	a[1] = 0;
	a[2] = 0;
	a[3] = 0;
	a[4] = 1;
	a[5] = 0;
	a[6] = 0;
	a[7] = 0;
	a[8] = 1;
	return a
};
mat3.transpose = function(a, b) {
	if (!b || a === b) {
		var c = a[1],
			d = a[2],
			e = a[5];
		a[1] = a[3];
		a[2] = a[6];
		a[3] = c;
		a[5] = a[7];
		a[6] = d;
		a[7] = e;
		return a
	}
	b[0] = a[0];
	b[1] = a[3];
	b[2] = a[6];
	b[3] = a[1];
	b[4] = a[4];
	b[5] = a[7];
	b[6] = a[2];
	b[7] = a[5];
	b[8] = a[8];
	return b
};
mat3.toMat4 = function(a, b) {
	b || (b = mat4.create());
	b[15] = 1;
	b[14] = 0;
	b[13] = 0;
	b[12] = 0;
	b[11] = 0;
	b[10] = a[8];
	b[9] = a[7];
	b[8] = a[6];
	b[7] = 0;
	b[6] = a[5];
	b[5] = a[4];
	b[4] = a[3];
	b[3] = 0;
	b[2] = a[2];
	b[1] = a[1];
	b[0] = a[0];
	return b
};
mat3.str = function(a) {
	return "[" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ", " + a[4] + ", " + a[5] + ", " + a[6] + ", " + a[7] + ", " + a[8] + "]"
};
mat4.create = function(a) {
	var b = new MatrixArray(16);
	a && (b[0] = a[0], b[1] = a[1], b[2] = a[2], b[3] = a[3], b[4] = a[4], b[5] = a[5], b[6] = a[6], b[7] = a[7], b[8] = a[8], b[9] = a[9], b[10] = a[10], b[11] = a[11], b[12] = a[12], b[13] = a[13], b[14] = a[14], b[15] = a[15]);
	return b
};
mat4.set = function(a, b) {
	b[0] = a[0];
	b[1] = a[1];
	b[2] = a[2];
	b[3] = a[3];
	b[4] = a[4];
	b[5] = a[5];
	b[6] = a[6];
	b[7] = a[7];
	b[8] = a[8];
	b[9] = a[9];
	b[10] = a[10];
	b[11] = a[11];
	b[12] = a[12];
	b[13] = a[13];
	b[14] = a[14];
	b[15] = a[15];
	return b
};
mat4.identity = function(a) {
	a[0] = 1;
	a[1] = 0;
	a[2] = 0;
	a[3] = 0;
	a[4] = 0;
	a[5] = 1;
	a[6] = 0;
	a[7] = 0;
	a[8] = 0;
	a[9] = 0;
	a[10] = 1;
	a[11] = 0;
	a[12] = 0;
	a[13] = 0;
	a[14] = 0;
	a[15] = 1;
	return a
};
mat4.transpose = function(a, b) {
	if (!b || a === b) {
		var c = a[1],
			d = a[2],
			e = a[3],
			g = a[6],
			f = a[7],
			h = a[11];
		a[1] = a[4];
		a[2] = a[8];
		a[3] = a[12];
		a[4] = c;
		a[6] = a[9];
		a[7] = a[13];
		a[8] = d;
		a[9] = g;
		a[11] = a[14];
		a[12] = e;
		a[13] = f;
		a[14] = h;
		return a
	}
	b[0] = a[0];
	b[1] = a[4];
	b[2] = a[8];
	b[3] = a[12];
	b[4] = a[1];
	b[5] = a[5];
	b[6] = a[9];
	b[7] = a[13];
	b[8] = a[2];
	b[9] = a[6];
	b[10] = a[10];
	b[11] = a[14];
	b[12] = a[3];
	b[13] = a[7];
	b[14] = a[11];
	b[15] = a[15];
	return b
};
mat4.determinant = function(a) {
	var b = a[0],
		c = a[1],
		d = a[2],
		e = a[3],
		g = a[4],
		f = a[5],
		h = a[6],
		i = a[7],
		j = a[8],
		k = a[9],
		l = a[10],
		n = a[11],
		o = a[12],
		m = a[13],
		p = a[14],
		a = a[15];
	return o * k * h * e - j * m * h * e - o * f * l * e + g * m * l * e + j * f * p * e - g * k * p * e - o * k * d * i + j * m * d * i + o * c * l * i - b * m * l * i - j * c * p * i + b * k * p * i + o * f * d * n - g * m * d * n - o * c * h * n + b * m * h * n + g * c * p * n - b * f * p * n - j * f * d * a + g * k * d * a + j * c * h * a - b * k * h * a - g * c * l * a + b * f * l * a
};
mat4.inverse = function(a, b) {
	b || (b = a);
	var c = a[0],
		d = a[1],
		e = a[2],
		g = a[3],
		f = a[4],
		h = a[5],
		i = a[6],
		j = a[7],
		k = a[8],
		l = a[9],
		n = a[10],
		o = a[11],
		m = a[12],
		p = a[13],
		r = a[14],
		s = a[15],
		A = c * h - d * f,
		B = c * i - e * f,
		t = c * j - g * f,
		u = d * i - e * h,
		v = d * j - g * h,
		w = e * j - g * i,
		x = k * p - l * m,
		y = k * r - n * m,
		z = k * s - o * m,
		C = l * r - n * p,
		D = l * s - o * p,
		E = n * s - o * r,
		q = 1 / (A * E - B * D + t * C + u * z - v * y + w * x);
	b[0] = (h * E - i * D + j * C) * q;
	b[1] = (-d * E + e * D - g * C) * q;
	b[2] = (p * w - r * v + s * u) * q;
	b[3] = (-l * w + n * v - o * u) * q;
	b[4] = (-f * E + i * z - j * y) * q;
	b[5] = (c * E - e * z + g * y) * q;
	b[6] = (-m * w + r * t - s * B) * q;
	b[7] = (k * w - n * t + o * B) * q;
	b[8] = (f * D - h * z + j * x) * q;
	b[9] = (-c * D + d * z - g * x) * q;
	b[10] = (m * v - p * t + s * A) * q;
	b[11] = (-k * v + l * t - o * A) * q;
	b[12] = (-f * C + h * y - i * x) * q;
	b[13] = (c * C - d * y + e * x) * q;
	b[14] = (-m * u + p * B - r * A) * q;
	b[15] = (k * u - l * B + n * A) * q;
	return b
};
mat4.toRotationMat = function(a, b) {
	b || (b = mat4.create());
	b[0] = a[0];
	b[1] = a[1];
	b[2] = a[2];
	b[3] = a[3];
	b[4] = a[4];
	b[5] = a[5];
	b[6] = a[6];
	b[7] = a[7];
	b[8] = a[8];
	b[9] = a[9];
	b[10] = a[10];
	b[11] = a[11];
	b[12] = 0;
	b[13] = 0;
	b[14] = 0;
	b[15] = 1;
	return b
};
mat4.toMat3 = function(a, b) {
	b || (b = mat3.create());
	b[0] = a[0];
	b[1] = a[1];
	b[2] = a[2];
	b[3] = a[4];
	b[4] = a[5];
	b[5] = a[6];
	b[6] = a[8];
	b[7] = a[9];
	b[8] = a[10];
	return b
};
mat4.toInverseMat3 = function(a, b) {
	var c = a[0],
		d = a[1],
		e = a[2],
		g = a[4],
		f = a[5],
		h = a[6],
		i = a[8],
		j = a[9],
		k = a[10],
		l = k * f - h * j,
		n = -k * g + h * i,
		o = j * g - f * i,
		m = c * l + d * n + e * o;

	if (!m) return null;
	m = 1 / m;
	b || (b = mat3.create());
	b[0] = l * m;
	b[1] = (-k * d + e * j) * m;
	b[2] = (h * d - e * f) * m;
	b[3] = n * m;
	b[4] = (k * c - e * i) * m;
	b[5] = (-h * c + e * g) * m;
	b[6] = o * m;
	b[7] = (-j * c + d * i) * m;
	b[8] = (f * c - d * g) * m;
	return b
};
mat4.multiply = function(a, b, c) {
	c || (c = a);
	var d = a[0],
		e = a[1],
		g = a[2],
		f = a[3],
		h = a[4],
		i = a[5],
		j = a[6],
		k = a[7],
		l = a[8],
		n = a[9],
		o = a[10],
		m = a[11],
		p = a[12],
		r = a[13],
		s = a[14],
		a = a[15],
		A = b[0],
		B = b[1],
		t = b[2],
		u = b[3],
		v = b[4],
		w = b[5],
		x = b[6],
		y = b[7],
		z = b[8],
		C = b[9],
		D = b[10],
		E = b[11],
		q = b[12],
		F = b[13],
		G = b[14],
		b = b[15];
	c[0] = A * d + B * h + t * l + u * p;
	c[1] = A * e + B * i + t * n + u * r;
	c[2] = A * g + B * j + t * o + u * s;
	c[3] = A * f + B * k + t * m + u * a;
	c[4] = v * d + w * h + x * l + y * p;
	c[5] = v * e + w * i + x * n + y * r;
	c[6] = v * g + w * j + x * o + y * s;
	c[7] = v * f + w * k + x * m + y * a;
	c[8] = z * d + C * h + D * l + E * p;
	c[9] = z * e + C * i + D * n + E * r;
	c[10] = z * g + C * j + D * o + E * s;
	c[11] = z * f + C * k + D * m + E * a;
	c[12] = q * d + F * h + G * l + b * p;
	c[13] = q * e + F * i + G * n + b * r;
	c[14] = q * g + F * j + G * o + b * s;
	c[15] = q * f + F * k + G * m + b * a;
	return c
};
mat4.multiplyVec3 = function(a, b, c) {
	c || (c = b);
	var d = b[0],
		e = b[1],
		b = b[2];
	c[0] = a[0] * d + a[4] * e + a[8] * b + a[12];
	c[1] = a[1] * d + a[5] * e + a[9] * b + a[13];
	c[2] = a[2] * d + a[6] * e + a[10] * b + a[14];
	return c
};
mat4.multiplyVec4 = function(a, b, c) {
	c || (c = b);
	var d = b[0],
		e = b[1],
		g = b[2],
		b = b[3];
	c[0] = a[0] * d + a[4] * e + a[8] * g + a[12] * b;
	c[1] = a[1] * d + a[5] * e + a[9] * g + a[13] * b;
	c[2] = a[2] * d + a[6] * e + a[10] * g + a[14] * b;
	c[3] = a[3] * d + a[7] * e + a[11] * g + a[15] * b;
	return c
};
mat4.translate = function(a, b, c) {
	var d = b[0],
		e = b[1],
		b = b[2],
		g, f, h, i, j, k, l, n, o, m, p, r;
	if (!c || a === c) return a[12] = a[0] * d + a[4] * e + a[8] * b + a[12], a[13] = a[1] * d + a[5] * e + a[9] * b + a[13], a[14] = a[2] * d + a[6] * e + a[10] * b + a[14], a[15] = a[3] * d + a[7] * e + a[11] * b + a[15], a;
	g = a[0];
	f = a[1];
	h = a[2];
	i = a[3];
	j = a[4];
	k = a[5];
	l = a[6];
	n = a[7];
	o = a[8];
	m = a[9];
	p = a[10];
	r = a[11];
	c[0] = g;
	c[1] = f;
	c[2] = h;
	c[3] = i;
	c[4] = j;
	c[5] = k;
	c[6] = l;
	c[7] = n;
	c[8] = o;
	c[9] = m;
	c[10] = p;
	c[11] = r;
	c[12] = g * d + j * e + o * b + a[12];
	c[13] = f * d + k * e + m * b + a[13];
	c[14] = h * d + l * e + p * b + a[14];
	c[15] = i * d + n * e + r * b + a[15];
	return c
};
mat4.scale = function(a, b, c) {
	var d = b[0],
		e = b[1],
		b = b[2];
	if (!c || a === c) return a[0] *= d, a[1] *= d, a[2] *= d, a[3] *= d, a[4] *= e, a[5] *= e, a[6] *= e, a[7] *= e, a[8] *= b, a[9] *= b, a[10] *= b, a[11] *= b, a;
	c[0] = a[0] * d;
	c[1] = a[1] * d;
	c[2] = a[2] * d;
	c[3] = a[3] * d;
	c[4] = a[4] * e;
	c[5] = a[5] * e;
	c[6] = a[6] * e;
	c[7] = a[7] * e;
	c[8] = a[8] * b;
	c[9] = a[9] * b;
	c[10] = a[10] * b;
	c[11] = a[11] * b;
	c[12] = a[12];
	c[13] = a[13];
	c[14] = a[14];
	c[15] = a[15];
	return c
};
mat4.rotate = function(a, b, c, d) {
	var e = c[0],
		g = c[1],
		c = c[2],
		f = Math.sqrt(e * e + g * g + c * c),
		h, i, j, k, l, n, o, m, p, r, s, A, B, t, u, v, w, x, y, z;
	if (!f) return null;
	f !== 1 && (f = 1 / f, e *= f, g *= f, c *= f);
	h = Math.sin(b);
	i = Math.cos(b);
	j = 1 - i;
	b = a[0];
	f = a[1];
	k = a[2];
	l = a[3];
	n = a[4];
	o = a[5];
	m = a[6];
	p = a[7];
	r = a[8];
	s = a[9];
	A = a[10];
	B = a[11];
	t = e * e * j + i;
	u = g * e * j + c * h;
	v = c * e * j - g * h;
	w = e * g * j - c * h;
	x = g * g * j + i;
	y = c * g * j + e * h;
	z = e * c * j + g * h;
	e = g * c * j - e * h;
	g = c * c * j + i;
	d ? a !== d && (d[12] = a[12], d[13] = a[13], d[14] = a[14], d[15] = a[15]) : d = a;
	d[0] = b * t + n * u + r * v;
	d[1] = f * t + o * u + s * v;
	d[2] = k * t + m * u + A * v;
	d[3] = l * t + p * u + B * v;
	d[4] = b * w + n * x + r * y;
	d[5] = f * w + o * x + s * y;
	d[6] = k * w + m * x + A * y;
	d[7] = l * w + p * x + B * y;
	d[8] = b * z + n * e + r * g;
	d[9] = f * z + o * e + s * g;
	d[10] = k * z + m * e + A * g;
	d[11] = l * z + p * e + B * g;
	return d
};
mat4.rotateX = function(a, b, c) {
	var d = Math.sin(b),
		b = Math.cos(b),
		e = a[4],
		g = a[5],
		f = a[6],
		h = a[7],
		i = a[8],
		j = a[9],
		k = a[10],
		l = a[11];
	c ? a !== c && (c[0] = a[0], c[1] = a[1], c[2] = a[2], c[3] = a[3], c[12] = a[12], c[13] = a[13], c[14] = a[14], c[15] = a[15]) : c = a;
	c[4] = e * b + i * d;
	c[5] = g * b + j * d;
	c[6] = f * b + k * d;
	c[7] = h * b + l * d;
	c[8] = e * -d + i * b;
	c[9] = g * -d + j * b;
	c[10] = f * -d + k * b;
	c[11] = h * -d + l * b;
	return c
};
mat4.rotateY = function(a, b, c) {
	var d = Math.sin(b),
		b = Math.cos(b),
		e = a[0],
		g = a[1],
		f = a[2],
		h = a[3],
		i = a[8],
		j = a[9],
		k = a[10],
		l = a[11];
	c ? a !== c && (c[4] = a[4], c[5] = a[5], c[6] = a[6], c[7] = a[7], c[12] = a[12], c[13] = a[13], c[14] = a[14], c[15] = a[15]) : c = a;
	c[0] = e * b + i * -d;
	c[1] = g * b + j * -d;
	c[2] = f * b + k * -d;
	c[3] = h * b + l * -d;
	c[8] = e * d + i * b;
	c[9] = g * d + j * b;
	c[10] = f * d + k * b;
	c[11] = h * d + l * b;
	return c
};
mat4.rotateZ = function(a, b, c) {
	var d = Math.sin(b),
		b = Math.cos(b),
		e = a[0],
		g = a[1],
		f = a[2],
		h = a[3],
		i = a[4],
		j = a[5],
		k = a[6],
		l = a[7];
	c ? a !== c && (c[8] = a[8], c[9] = a[9], c[10] = a[10], c[11] = a[11], c[12] = a[12], c[13] = a[13], c[14] = a[14], c[15] = a[15]) : c = a;
	c[0] = e * b + i * d;
	c[1] = g * b + j * d;
	c[2] = f * b + k * d;
	c[3] = h * b + l * d;
	c[4] = e * -d + i * b;
	c[5] = g * -d + j * b;
	c[6] = f * -d + k * b;
	c[7] = h * -d + l * b;
	return c
};
mat4.frustum = function(a, b, c, d, e, g, f) {
	f || (f = mat4.create());
	var h = b - a,
		i = d - c,
		j = g - e;
	f[0] = e * 2 / h;
	f[1] = 0;
	f[2] = 0;
	f[3] = 0;
	f[4] = 0;
	f[5] = e * 2 / i;
	f[6] = 0;
	f[7] = 0;
	f[8] = (b + a) / h;
	f[9] = (d + c) / i;
	f[10] = -(g + e) / j;
	f[11] = -1;
	f[12] = 0;
	f[13] = 0;
	f[14] = -(g * e * 2) / j;
	f[15] = 0;
	return f
};
mat4.perspective = function(a, b, c, d, e) {
	a = c * Math.tan(a * Math.PI / 360);
	b *= a;
	return mat4.frustum(-b, b, -a, a, c, d, e)
};
mat4.ortho = function(a, b, c, d, e, g, f) {
	f || (f = mat4.create());
	var h = b - a,
		i = d - c,
		j = g - e;
	f[0] = 2 / h;
	f[1] = 0;
	f[2] = 0;
	f[3] = 0;
	f[4] = 0;
	f[5] = 2 / i;
	f[6] = 0;
	f[7] = 0;
	f[8] = 0;
	f[9] = 0;
	f[10] = -2 / j;
	f[11] = 0;
	f[12] = -(a + b) / h;
	f[13] = -(d + c) / i;
	f[14] = -(g + e) / j;
	f[15] = 1;
	return f
};
mat4.lookAt = function(a, b, c, d) {
	d || (d = mat4.create());
	var e, g, f, h, i, j, k, l, n = a[0],
		o = a[1],
		a = a[2];
	g = c[0];
	f = c[1];
	e = c[2];
	c = b[1];
	j = b[2];
	if (n === b[0] && o === c && a === j) return mat4.identity(d);
	c = n - b[0];
	j = o - b[1];
	k = a - b[2];
	l = 1 / Math.sqrt(c * c + j * j + k * k);
	c *= l;
	j *= l;
	k *= l;
	b = f * k - e * j;
	e = e * c - g * k;
	g = g * j - f * c;
	(l = Math.sqrt(b * b + e * e + g * g)) ? (l = 1 / l, b *= l, e *= l, g *= l) : g = e = b = 0;
	f = j * g - k * e;
	h = k * b - c * g;
	i = c * e - j * b;
	(l = Math.sqrt(f * f + h * h + i * i)) ? (l = 1 / l, f *= l, h *= l, i *= l) : i = h = f = 0;
	d[0] = b;
	d[1] = f;
	d[2] = c;
	d[3] = 0;
	d[4] = e;
	d[5] = h;
	d[6] = j;
	d[7] = 0;
	d[8] = g;
	d[9] = i;
	d[10] = k;
	d[11] = 0;
	d[12] = -(b * n + e * o + g * a);
	d[13] = -(f * n + h * o + i * a);
	d[14] = -(c * n + j * o + k * a);
	d[15] = 1;
	return d
};
mat4.fromRotationTranslation = function(a, b, c) {
	c || (c = mat4.create());
	var d = a[0],
		e = a[1],
		g = a[2],
		f = a[3],
		h = d + d,
		i = e + e,
		j = g + g,
		a = d * h,
		k = d * i;
	d *= j;
	var l = e * i;
	e *= j;
	g *= j;
	h *= f;
	i *= f;
	f *= j;
	c[0] = 1 - (l + g);
	c[1] = k + f;
	c[2] = d - i;
	c[3] = 0;
	c[4] = k - f;
	c[5] = 1 - (a + g);
	c[6] = e + h;
	c[7] = 0;
	c[8] = d + i;
	c[9] = e - h;
	c[10] = 1 - (a + l);
	c[11] = 0;
	c[12] = b[0];
	c[13] = b[1];
	c[14] = b[2];
	c[15] = 1;
	return c
};
mat4.str = function(a) {
	return "[" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ", " + a[4] + ", " + a[5] + ", " + a[6] + ", " + a[7] + ", " + a[8] + ", " + a[9] + ", " + a[10] + ", " + a[11] + ", " + a[12] + ", " + a[13] + ", " + a[14] + ", " + a[15] + "]"
};
quat4.create = function(a) {
	var b = new MatrixArray(4);
	a && (b[0] = a[0], b[1] = a[1], b[2] = a[2], b[3] = a[3]);
	return b
};
quat4.set = function(a, b) {
	b[0] = a[0];
	b[1] = a[1];
	b[2] = a[2];
	b[3] = a[3];
	return b
};
quat4.calculateW = function(a, b) {
	var c = a[0],
		d = a[1],
		e = a[2];
	if (!b || a === b) return a[3] = -Math.sqrt(Math.abs(1 - c * c - d * d - e * e)), a;
	b[0] = c;
	b[1] = d;
	b[2] = e;
	b[3] = -Math.sqrt(Math.abs(1 - c * c - d * d - e * e));
	return b
};
quat4.inverse = function(a, b) {
	if (!b || a === b) return a[0] *= -1, a[1] *= -1, a[2] *= -1, a;
	b[0] = -a[0];
	b[1] = -a[1];
	b[2] = -a[2];
	b[3] = a[3];
	return b
};
quat4.length = function(a) {
	var b = a[0],
		c = a[1],
		d = a[2],
		a = a[3];
	return Math.sqrt(b * b + c * c + d * d + a * a)
};
quat4.normalize = function(a, b) {
	b || (b = a);
	var c = a[0],
		d = a[1],
		e = a[2],
		g = a[3],
		f = Math.sqrt(c * c + d * d + e * e + g * g);
	if (f === 0) return b[0] = 0, b[1] = 0, b[2] = 0, b[3] = 0, b;
	f = 1 / f;
	b[0] = c * f;
	b[1] = d * f;
	b[2] = e * f;
	b[3] = g * f;
	return b
};
quat4.multiply = function(a, b, c) {
	c || (c = a);
	var d = a[0],
		e = a[1],
		g = a[2],
		a = a[3],
		f = b[0],
		h = b[1],
		i = b[2],
		b = b[3];
	c[0] = d * b + a * f + e * i - g * h;
	c[1] = e * b + a * h + g * f - d * i;
	c[2] = g * b + a * i + d * h - e * f;
	c[3] = a * b - d * f - e * h - g * i;
	return c
};
quat4.multiplyVec3 = function(a, b, c) {
	c || (c = b);
	var d = b[0],
		e = b[1],
		g = b[2],
		b = a[0],
		f = a[1],
		h = a[2],
		a = a[3],
		i = a * d + f * g - h * e,
		j = a * e + h * d - b * g,
		k = a * g + b * e - f * d,
		d = -b * d - f * e - h * g;
	c[0] = i * a + d * -b + j * -h - k * -f;
	c[1] = j * a + d * -f + k * -b - i * -h;
	c[2] = k * a + d * -h + i * -f - j * -b;
	return c
};
quat4.toMat3 = function(a, b) {
	b || (b = mat3.create());
	var c = a[0],
		d = a[1],
		e = a[2],
		g = a[3],
		f = c + c,
		h = d + d,
		i = e + e,
		j = c * f,
		k = c * h;
	c *= i;
	var l = d * h;
	d *= i;
	e *= i;
	f *= g;
	h *= g;
	g *= i;
	b[0] = 1 - (l + e);
	b[1] = k + g;
	b[2] = c - h;
	b[3] = k - g;
	b[4] = 1 - (j + e);
	b[5] = d + f;
	b[6] = c + h;
	b[7] = d - f;
	b[8] = 1 - (j + l);
	return b
};
quat4.toMat4 = function(a, b) {
	b || (b = mat4.create());
	var c = a[0],
		d = a[1],
		e = a[2],
		g = a[3],
		f = c + c,
		h = d + d,
		i = e + e,
		j = c * f,
		k = c * h;
	c *= i;
	var l = d * h;
	d *= i;
	e *= i;
	f *= g;
	h *= g;
	g *= i;
	b[0] = 1 - (l + e);
	b[1] = k + g;
	b[2] = c - h;
	b[3] = 0;
	b[4] = k - g;
	b[5] = 1 - (j + e);
	b[6] = d + f;
	b[7] = 0;
	b[8] = c + h;
	b[9] = d - f;
	b[10] = 1 - (j + l);
	b[11] = 0;
	b[12] = 0;
	b[13] = 0;
	b[14] = 0;
	b[15] = 1;
	return b
};
quat4.slerp = function(a, b, c, d) {
	d || (d = a);
	var e = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3],
		g, f;
	if (Math.abs(e) >= 1) return d !== a && (d[0] = a[0], d[1] = a[1], d[2] = a[2], d[3] = a[3]), d;
	g = Math.acos(e);
	f = Math.sqrt(1 - e * e);
	if (Math.abs(f) < .001) return d[0] = a[0] * .5 + b[0] * .5, d[1] = a[1] * .5 + b[1] * .5, d[2] = a[2] * .5 + b[2] * .5, d[3] = a[3] * .5 + b[3] * .5, d;
	e = Math.sin((1 - c) * g) / f;
	c = Math.sin(c * g) / f;
	d[0] = a[0] * e + b[0] * c;
	d[1] = a[1] * e + b[1] * c;
	d[2] = a[2] * e + b[2] * c;
	d[3] = a[3] * e + b[3] * c;
	return d
};
quat4.str = function(a) {
	return "[" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + "]"
};
(function() {
	var MAX_VERTICES = 8e3;
	var MAX_INDICES = MAX_VERTICES / 2 * 3;
	var MAX_POINTS = 8e3;
	var MULTI_BUFFERS = 4;
	var BATCH_NULL = 0;
	var BATCH_QUAD = 1;
	var BATCH_SETTEXTURE = 2;
	var BATCH_SETOPACITY = 3;
	var BATCH_SETBLEND = 4;
	var BATCH_UPDATEMODELVIEW = 5;
	var BATCH_RENDERTOTEXTURE = 6;
	var BATCH_CLEAR = 7;
	var BATCH_POINTS = 8;
	var BATCH_SETPROGRAM = 9;
	var BATCH_SETPROGRAMPARAMETERS = 10;
	var BATCH_SETTEXTURE1 = 11;
	var BATCH_SETCOLOR = 12;
	var BATCH_SETDEPTHTEST = 13;
	var BATCH_SETEARLYZMODE = 14;
	var tempMat4 = mat4.create();

	function GLWrap_(gl, isMobile, enableFrontToBack) {
		this.isIE = /msie/i.test(navigator.userAgent) || /trident/i.test(navigator.userAgent);
		this.width = 0;
		this.height = 0;
		this.enableFrontToBack = !! enableFrontToBack;
		this.isEarlyZPass = false;
		this.isBatchInEarlyZPass = false;
		this.currentZ = 0;
		this.zNear = 1;
		this.zFar = 1e3;
		this.zIncrement = (this.zFar - this.zNear) / 32768;
		this.zA = this.zFar / (this.zFar - this.zNear);
		this.zB = this.zFar * this.zNear / (this.zNear - this.zFar);
		this.kzA = 65536 * this.zA;
		this.kzB = 65536 * this.zB;
		this.cam = vec3.create([0, 0, 100]);
		this.look = vec3.create([0, 0, 0]);
		this.up = vec3.create([0, 1, 0]);
		this.worldScale = vec3.create([1, 1, 1]);
		this.enable_mipmaps = true;
		this.matP = mat4.create();
		this.matMV = mat4.create();
		this.lastMV = mat4.create();
		this.currentMV = mat4.create();
		this.gl = gl;
		this.initState()
	}
	GLWrap_.prototype.initState = function() {
		var gl = this.gl;
		var i, len;
		this.lastOpacity = 1;
		this.lastTexture0 = null;
		this.lastTexture1 = null;
		this.currentOpacity = 1;
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
		gl.disable(gl.CULL_FACE);
		gl.disable(gl.STENCIL_TEST);
		gl.disable(gl.DITHER);
		if (this.enableFrontToBack) {
			gl.enable(gl.DEPTH_TEST);
			gl.depthFunc(gl.LEQUAL)
		} else {
			gl.disable(gl.DEPTH_TEST)
		}
		this.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
		this.lastSrcBlend = gl.ONE;
		this.lastDestBlend = gl.ONE_MINUS_SRC_ALPHA;
		this.vertexData = new Float32Array(MAX_VERTICES * (this.enableFrontToBack ? 3 : 2));
		this.texcoordData = new Float32Array(MAX_VERTICES * 2);
		this.pointData = new Float32Array(MAX_POINTS * 4);
		this.pointBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.pointBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.pointData.byteLength, gl.DYNAMIC_DRAW);
		this.vertexBuffers = new Array(MULTI_BUFFERS);
		this.texcoordBuffers = new Array(MULTI_BUFFERS);
		for (i = 0; i < MULTI_BUFFERS; i++) {
			this.vertexBuffers[i] = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffers[i]);
			gl.bufferData(gl.ARRAY_BUFFER, this.vertexData.byteLength, gl.DYNAMIC_DRAW);
			this.texcoordBuffers[i] = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffers[i]);
			gl.bufferData(gl.ARRAY_BUFFER, this.texcoordData.byteLength, gl.DYNAMIC_DRAW)
		}
		this.curBuffer = 0;
		this.indexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		var indexData = new Uint16Array(MAX_INDICES);
		i = 0, len = MAX_INDICES;
		var fv = 0;
		while (i < len) {
			indexData[i++] = fv;
			indexData[i++] = fv + 1;
			indexData[i++] = fv + 2;
			indexData[i++] = fv;
			indexData[i++] = fv + 2;
			indexData[i++] = fv + 3;
			fv += 4
		}
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexData, gl.STATIC_DRAW);
		this.vertexPtr = 0;
		this.texPtr = 0;
		this.pointPtr = 0;
		var fsSource, vsSource;
		this.shaderPrograms = [];
		fsSource = ["varying mediump vec2 vTex;", "uniform lowp float opacity;", "uniform lowp sampler2D samplerFront;", "void main(void) {", "	gl_FragColor = texture2D(samplerFront, vTex);", "	gl_FragColor *= opacity;", "}"].join("\n");
		if (this.enableFrontToBack) {
			vsSource = ["attribute highp vec3 aPos;", "attribute mediump vec2 aTex;", "varying mediump vec2 vTex;", "uniform highp mat4 matP;", "uniform highp mat4 matMV;", "void main(void) {", "	gl_Position = matP * matMV * vec4(aPos.x, aPos.y, aPos.z, 1.0);", "	vTex = aTex;", "}"].join("\n")
		} else {
			vsSource = ["attribute highp vec2 aPos;", "attribute mediump vec2 aTex;", "varying mediump vec2 vTex;", "uniform highp mat4 matP;", "uniform highp mat4 matMV;", "void main(void) {", "	gl_Position = matP * matMV * vec4(aPos.x, aPos.y, 0.0, 1.0);", "	vTex = aTex;", "}"].join("\n")
		}
		var shaderProg = this.createShaderProgram({
			src: fsSource
		}, vsSource, "<default>");
		this.shaderPrograms.push(shaderProg);
		fsSource = ["uniform mediump sampler2D samplerFront;", "varying lowp float opacity;", "void main(void) {", "	gl_FragColor = texture2D(samplerFront, gl_PointCoord);", "	gl_FragColor *= opacity;", "}"].join("\n");
		var pointVsSource = ["attribute vec4 aPos;", "varying float opacity;", "uniform mat4 matP;", "uniform mat4 matMV;", "void main(void) {", "	gl_Position = matP * matMV * vec4(aPos.x, aPos.y, 0.0, 1.0);", "	gl_PointSize = aPos.z;", "	opacity = aPos.w;", "}"].join("\n");
		shaderProg = this.createShaderProgram({
			src: fsSource
		}, pointVsSource, "<point>");
		this.shaderPrograms.push(shaderProg);
		fsSource = ["varying mediump vec2 vTex;", "uniform lowp sampler2D samplerFront;", "void main(void) {", "	if (texture2D(samplerFront, vTex).a < 1.0)", "		discard;", "}"].join("\n");
		var shaderProg = this.createShaderProgram({
			src: fsSource
		}, vsSource, "<earlyz>");
		this.shaderPrograms.push(shaderProg);
		fsSource = ["uniform lowp vec4 colorFill;", "void main(void) {", "	gl_FragColor = colorFill;", "}"].join("\n");
		var shaderProg = this.createShaderProgram({
			src: fsSource
		}, vsSource, "<fill>");
		this.shaderPrograms.push(shaderProg);
		for (var shader_name in cr.shaders) {
			if (cr.shaders.hasOwnProperty(shader_name)) this.shaderPrograms.push(this.createShaderProgram(cr.shaders[shader_name], vsSource, shader_name))
		}
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, null);
		this.batch = [];
		this.batchPtr = 0;
		this.hasQuadBatchTop = false;
		this.hasPointBatchTop = false;
		this.lastProgram = -1;
		this.currentProgram = -1;
		this.currentShader = null;
		this.fbo = gl.createFramebuffer();
		this.renderToTex = null;
		this.depthBuffer = null;
		this.attachedDepthBuffer = false;
		if (this.enableFrontToBack) {
			this.depthBuffer = gl.createRenderbuffer()
		}
		this.tmpVec3 = vec3.create([0, 0, 0]);
		var pointsizes = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE);
		this.minPointSize = pointsizes[0];
		this.maxPointSize = pointsizes[1];
		if (this.maxPointSize > 2048) this.maxPointSize = 2048;
		this.switchProgram(0);
		cr.seal(this)
	};

	function GLShaderProgram(gl, shaderProgram, name) {
		this.gl = gl;
		this.shaderProgram = shaderProgram;
		this.name = name;
		this.locAPos = gl.getAttribLocation(shaderProgram, "aPos");
		this.locATex = gl.getAttribLocation(shaderProgram, "aTex");
		this.locMatP = gl.getUniformLocation(shaderProgram, "matP");
		this.locMatMV = gl.getUniformLocation(shaderProgram, "matMV");
		this.locOpacity = gl.getUniformLocation(shaderProgram, "opacity");
		this.locColorFill = gl.getUniformLocation(shaderProgram, "colorFill");
		this.locSamplerFront = gl.getUniformLocation(shaderProgram, "samplerFront");
		this.locSamplerBack = gl.getUniformLocation(shaderProgram, "samplerBack");
		this.locDestStart = gl.getUniformLocation(shaderProgram, "destStart");
		this.locDestEnd = gl.getUniformLocation(shaderProgram, "destEnd");
		this.locSeconds = gl.getUniformLocation(shaderProgram, "seconds");
		this.locPixelWidth = gl.getUniformLocation(shaderProgram, "pixelWidth");
		this.locPixelHeight = gl.getUniformLocation(shaderProgram, "pixelHeight");
		this.locLayerScale = gl.getUniformLocation(shaderProgram, "layerScale");
		this.locLayerAngle = gl.getUniformLocation(shaderProgram, "layerAngle");
		this.locViewOrigin = gl.getUniformLocation(shaderProgram, "viewOrigin");
		this.locScrollPos = gl.getUniformLocation(shaderProgram, "scrollPos");
		this.hasAnyOptionalUniforms = !! (this.locPixelWidth || this.locPixelHeight || this.locSeconds || this.locSamplerBack || this.locDestStart || this.locDestEnd || this.locLayerScale || this.locLayerAngle || this.locViewOrigin || this.locScrollPos);
		this.lpPixelWidth = -999;
		this.lpPixelHeight = -999;
		this.lpOpacity = 1;
		this.lpDestStartX = 0;
		this.lpDestStartY = 0;
		this.lpDestEndX = 1;
		this.lpDestEndY = 1;
		this.lpLayerScale = 1;
		this.lpLayerAngle = 0;
		this.lpViewOriginX = 0;
		this.lpViewOriginY = 0;
		this.lpScrollPosX = 0;
		this.lpScrollPosY = 0;
		this.lpSeconds = 0;
		this.lastCustomParams = [];
		this.lpMatMV = mat4.create();
		if (this.locOpacity) gl.uniform1f(this.locOpacity, 1);
		if (this.locColorFill) gl.uniform4f(this.locColorFill, 1, 1, 1, 1);
		if (this.locSamplerFront) gl.uniform1i(this.locSamplerFront, 0);
		if (this.locSamplerBack) gl.uniform1i(this.locSamplerBack, 1);
		if (this.locDestStart) gl.uniform2f(this.locDestStart, 0, 0);
		if (this.locDestEnd) gl.uniform2f(this.locDestEnd, 1, 1);
		if (this.locLayerScale) gl.uniform1f(this.locLayerScale, 1);
		if (this.locLayerAngle) gl.uniform1f(this.locLayerAngle, 0);
		if (this.locViewOrigin) gl.uniform2f(this.locViewOrigin, 0, 0);
		if (this.locScrollPos) gl.uniform2f(this.locScrollPos, 0, 0);
		if (this.locSeconds) gl.uniform1f(this.locSeconds, 0);
		this.hasCurrentMatMV = false
	}
	function areMat4sEqual(a, b) {
		return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5] && a[6] === b[6] && a[7] === b[7] && a[8] === b[8] && a[9] === b[9] && a[10] === b[10] && a[11] === b[11] && a[12] === b[12] && a[13] === b[13] && a[14] === b[14] && a[15] === b[15]
	}
	GLShaderProgram.prototype.updateMatMV = function(mv) {
		if (areMat4sEqual(this.lpMatMV, mv)) return;
		mat4.set(mv, this.lpMatMV);
		this.gl.uniformMatrix4fv(this.locMatMV, false, mv)
	};
	GLWrap_.prototype.createShaderProgram = function(shaderEntry, vsSource, name) {
		var gl = this.gl;
		var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(fragmentShader, shaderEntry.src);
		gl.compileShader(fragmentShader);
		if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
			gl.deleteShader(fragmentShader);
			return null
		}
		var vertexShader = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(vertexShader, vsSource);
		gl.compileShader(vertexShader);
		if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
			gl.deleteShader(fragmentShader);
			gl.deleteShader(vertexShader);
			return null
		}
		var shaderProgram = gl.createProgram();
		gl.attachShader(shaderProgram, fragmentShader);
		gl.attachShader(shaderProgram, vertexShader);
		gl.linkProgram(shaderProgram);
		if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
			gl.deleteShader(fragmentShader);
			gl.deleteShader(vertexShader);
			gl.deleteProgram(shaderProgram);
			return null
		}
		gl.useProgram(shaderProgram);
		gl.deleteShader(fragmentShader);
		gl.deleteShader(vertexShader);
		var ret = new GLShaderProgram(gl, shaderProgram, name);
		ret.extendBoxHorizontal = shaderEntry.extendBoxHorizontal || 0;
		ret.extendBoxVertical = shaderEntry.extendBoxVertical || 0;
		ret.crossSampling = !! shaderEntry.crossSampling;
		ret.preservesOpaqueness = !! shaderEntry.preservesOpaqueness;
		ret.animated = !! shaderEntry.animated;
		ret.parameters = shaderEntry.parameters || [];
		var i, len;
		for (i = 0, len = ret.parameters.length; i < len; i++) {
			ret.parameters[i][1] = gl.getUniformLocation(shaderProgram, ret.parameters[i][0]);
			ret.lastCustomParams.push(0);
			gl.uniform1f(ret.parameters[i][1], 0)
		}
		cr.seal(ret);
		return ret
	};
	GLWrap_.prototype.getShaderIndex = function(name_) {
		var i, len;
		for (i = 0, len = this.shaderPrograms.length; i < len; i++) {
			if (this.shaderPrograms[i].name === name_) return i
		}
		return -1
	};
	GLWrap_.prototype.project = function(x, y, out) {
		var mv = this.matMV;
		var proj = this.matP;
		var fTempo = [0, 0, 0, 0, 0, 0, 0, 0];
		fTempo[0] = mv[0] * x + mv[4] * y + mv[12];
		fTempo[1] = mv[1] * x + mv[5] * y + mv[13];
		fTempo[2] = mv[2] * x + mv[6] * y + mv[14];
		fTempo[3] = mv[3] * x + mv[7] * y + mv[15];
		fTempo[4] = proj[0] * fTempo[0] + proj[4] * fTempo[1] + proj[8] * fTempo[2] + proj[12] * fTempo[3];
		fTempo[5] = proj[1] * fTempo[0] + proj[5] * fTempo[1] + proj[9] * fTempo[2] + proj[13] * fTempo[3];
		fTempo[6] = proj[2] * fTempo[0] + proj[6] * fTempo[1] + proj[10] * fTempo[2] + proj[14] * fTempo[3];
		fTempo[7] = -fTempo[2];
		if (fTempo[7] === 0) return;
		fTempo[7] = 1 / fTempo[7];
		fTempo[4] *= fTempo[7];
		fTempo[5] *= fTempo[7];
		fTempo[6] *= fTempo[7];
		out[0] = (fTempo[4] * .5 + .5) * this.width;
		out[1] = (fTempo[5] * .5 + .5) * this.height
	};
	GLWrap_.prototype.setSize = function(w, h, force) {
		if (this.width === w && this.height === h && !force) return;
		this.endBatch();
		var gl = this.gl;
		this.width = w;
		this.height = h;
		gl.viewport(0, 0, w, h);
		mat4.lookAt(this.cam, this.look, this.up, this.matMV);
		if (this.enableFrontToBack) {
			mat4.ortho(-w / 2, w / 2, h / 2, -h / 2, this.zNear, this.zFar, this.matP);
			this.worldScale[0] = 1;
			this.worldScale[1] = 1
		} else {
			mat4.perspective(45, w / h, this.zNear, this.zFar, this.matP);
			var tl = [0, 0];
			var br = [0, 0];
			this.project(0, 0, tl);
			this.project(1, 1, br);
			this.worldScale[0] = 1 / (br[0] - tl[0]);
			this.worldScale[1] = -1 / (br[1] - tl[1])
		}
		var i, len, s;
		for (i = 0, len = this.shaderPrograms.length; i < len; i++) {
			s = this.shaderPrograms[i];
			s.hasCurrentMatMV = false;
			if (s.locMatP) {
				gl.useProgram(s.shaderProgram);
				gl.uniformMatrix4fv(s.locMatP, false, this.matP)
			}
		}
		gl.useProgram(this.shaderPrograms[this.lastProgram].shaderProgram);
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.activeTexture(gl.TEXTURE0);
		this.lastTexture0 = null;
		this.lastTexture1 = null;
		if (this.depthBuffer) {
			gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
			gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthBuffer);
			gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.height);
			if (!this.attachedDepthBuffer) {
				gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depthBuffer);
				this.attachedDepthBuffer = true
			}
			gl.bindRenderbuffer(gl.RENDERBUFFER, null);
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			this.renderToTex = null
		}
	};
	GLWrap_.prototype.resetModelView = function() {
		mat4.lookAt(this.cam, this.look, this.up, this.matMV);
		mat4.scale(this.matMV, this.worldScale)
	};
	GLWrap_.prototype.translate = function(x, y) {
		if (x === 0 && y === 0) return;
		this.tmpVec3[0] = x;
		this.tmpVec3[1] = y;
		this.tmpVec3[2] = 0;
		mat4.translate(this.matMV, this.tmpVec3)
	};
	GLWrap_.prototype.scale = function(x, y) {
		if (x === 1 && y === 1) return;
		this.tmpVec3[0] = x;
		this.tmpVec3[1] = y;
		this.tmpVec3[2] = 1;
		mat4.scale(this.matMV, this.tmpVec3)
	};
	GLWrap_.prototype.rotateZ = function(a) {
		if (a === 0) return;
		mat4.rotateZ(this.matMV, a)
	};
	GLWrap_.prototype.updateModelView = function() {
		if (areMat4sEqual(this.lastMV, this.matMV)) return;
		var b = this.pushBatch();
		b.type = BATCH_UPDATEMODELVIEW;
		if (b.mat4param) mat4.set(this.matMV, b.mat4param);
		else b.mat4param = mat4.create(this.matMV);
		mat4.set(this.matMV, this.lastMV);
		this.hasQuadBatchTop = false;
		this.hasPointBatchTop = false
	};
	GLWrap_.prototype.setEarlyZIndex = function(i) {
		if (!this.enableFrontToBack) return;
		if (i > 32760) i = 32760;
		this.currentZ = this.cam[2] - this.zNear - i * this.zIncrement
	};

	function GLBatchJob(type_, glwrap_) {
		this.type = type_;
		this.glwrap = glwrap_;
		this.gl = glwrap_.gl;
		this.opacityParam = 0;
		this.startIndex = 0;
		this.indexCount = 0;
		this.texParam = null;
		this.mat4param = null;
		this.shaderParams = [];
		cr.seal(this)
	}
	GLBatchJob.prototype.doSetEarlyZPass = function() {
		var gl = this.gl;
		var glwrap = this.glwrap;
		if (this.startIndex !== 0) {
			gl.depthMask(true);
			gl.colorMask(false, false, false, false);
			gl.disable(gl.BLEND);
			gl.bindFramebuffer(gl.FRAMEBUFFER, glwrap.fbo);
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, null, 0);
			gl.clear(gl.DEPTH_BUFFER_BIT);
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			glwrap.isBatchInEarlyZPass = true
		} else {
			gl.depthMask(false);
			gl.colorMask(true, true, true, true);
			gl.enable(gl.BLEND);
			glwrap.isBatchInEarlyZPass = false
		}
	};
	GLBatchJob.prototype.doSetTexture = function() {
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.texParam)
	};
	GLBatchJob.prototype.doSetTexture1 = function() {
		var gl = this.gl;
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, this.texParam);
		gl.activeTexture(gl.TEXTURE0)
	};
	GLBatchJob.prototype.doSetOpacity = function() {
		var o = this.opacityParam;
		var glwrap = this.glwrap;
		glwrap.currentOpacity = o;
		var curProg = glwrap.currentShader;
		if (curProg.locOpacity && curProg.lpOpacity !== o) {
			curProg.lpOpacity = o;
			this.gl.uniform1f(curProg.locOpacity, o)
		}
	};
	GLBatchJob.prototype.doQuad = function() {
		this.gl.drawElements(this.gl.TRIANGLES, this.indexCount, this.gl.UNSIGNED_SHORT, this.startIndex)
	};
	GLBatchJob.prototype.doSetBlend = function() {
		this.gl.blendFunc(this.startIndex, this.indexCount)
	};
	GLBatchJob.prototype.doUpdateModelView = function() {
		var i, len, s, shaderPrograms = this.glwrap.shaderPrograms,
			currentProgram = this.glwrap.currentProgram;
		for (i = 0, len = shaderPrograms.length; i < len; i++) {
			s = shaderPrograms[i];
			if (i === currentProgram && s.locMatMV) {
				s.updateMatMV(this.mat4param);
				s.hasCurrentMatMV = true
			} else s.hasCurrentMatMV = false
		}
		mat4.set(this.mat4param, this.glwrap.currentMV)
	};
	GLBatchJob.prototype.doRenderToTexture = function() {
		var gl = this.gl;
		var glwrap = this.glwrap;
		if (this.texParam) {
			if (glwrap.lastTexture1 === this.texParam) {
				gl.activeTexture(gl.TEXTURE1);
				gl.bindTexture(gl.TEXTURE_2D, null);
				glwrap.lastTexture1 = null;
				gl.activeTexture(gl.TEXTURE0)
			}
			gl.bindFramebuffer(gl.FRAMEBUFFER, glwrap.fbo);
			if (!glwrap.isBatchInEarlyZPass) {
				gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texParam, 0)
			}
		} else {
			if (!glwrap.enableFrontToBack) {
				gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, null, 0)
			}
			gl.bindFramebuffer(gl.FRAMEBUFFER, null)
		}
	};
	GLBatchJob.prototype.doClear = function() {
		var gl = this.gl;
		var mode = this.startIndex;
		if (mode === 0) {
			gl.clearColor(this.mat4param[0], this.mat4param[1], this.mat4param[2], this.mat4param[3]);
			gl.clear(gl.COLOR_BUFFER_BIT)
		} else if (mode === 1) {
			gl.enable(gl.SCISSOR_TEST);
			gl.scissor(this.mat4param[0], this.mat4param[1], this.mat4param[2], this.mat4param[3]);
			gl.clearColor(0, 0, 0, 0);
			gl.clear(gl.COLOR_BUFFER_BIT);
			gl.disable(gl.SCISSOR_TEST)
		} else {
			gl.clear(gl.DEPTH_BUFFER_BIT)
		}
	};
	GLBatchJob.prototype.doSetDepthTestEnabled = function() {
		var gl = this.gl;
		var enable = this.startIndex;
		if (enable !== 0) {
			gl.enable(gl.DEPTH_TEST)
		} else {
			gl.disable(gl.DEPTH_TEST)
		}
	};
	GLBatchJob.prototype.doPoints = function() {
		var gl = this.gl;
		var glwrap = this.glwrap;
		if (glwrap.enableFrontToBack) gl.disable(gl.DEPTH_TEST);
		var s = glwrap.shaderPrograms[1];
		gl.useProgram(s.shaderProgram);
		if (!s.hasCurrentMatMV && s.locMatMV) {
			s.updateMatMV(glwrap.currentMV);
			s.hasCurrentMatMV = true
		}
		gl.enableVertexAttribArray(s.locAPos);
		gl.bindBuffer(gl.ARRAY_BUFFER, glwrap.pointBuffer);
		gl.vertexAttribPointer(s.locAPos, 4, gl.FLOAT, false, 0, 0);
		gl.drawArrays(gl.POINTS, this.startIndex / 4, this.indexCount);
		s = glwrap.currentShader;
		gl.useProgram(s.shaderProgram);
		if (s.locAPos >= 0) {
			gl.enableVertexAttribArray(s.locAPos);
			gl.bindBuffer(gl.ARRAY_BUFFER, glwrap.vertexBuffers[glwrap.curBuffer]);
			gl.vertexAttribPointer(s.locAPos, glwrap.enableFrontToBack ? 3 : 2, gl.FLOAT, false, 0, 0)
		}
		if (s.locATex >= 0) {
			gl.enableVertexAttribArray(s.locATex);
			gl.bindBuffer(gl.ARRAY_BUFFER, glwrap.texcoordBuffers[glwrap.curBuffer]);
			gl.vertexAttribPointer(s.locATex, 2, gl.FLOAT, false, 0, 0)
		}
		if (glwrap.enableFrontToBack) gl.enable(gl.DEPTH_TEST)
	};
	GLBatchJob.prototype.doSetProgram = function() {
		var gl = this.gl;
		var glwrap = this.glwrap;
		var s = glwrap.shaderPrograms[this.startIndex];
		glwrap.currentProgram = this.startIndex;
		glwrap.currentShader = s;
		gl.useProgram(s.shaderProgram);
		if (!s.hasCurrentMatMV && s.locMatMV) {
			s.updateMatMV(glwrap.currentMV);
			s.hasCurrentMatMV = true
		}
		if (s.locOpacity && s.lpOpacity !== glwrap.currentOpacity) {
			s.lpOpacity = glwrap.currentOpacity;
			gl.uniform1f(s.locOpacity, glwrap.currentOpacity)
		}
		if (s.locAPos >= 0) {
			gl.enableVertexAttribArray(s.locAPos);
			gl.bindBuffer(gl.ARRAY_BUFFER, glwrap.vertexBuffers[glwrap.curBuffer]);
			gl.vertexAttribPointer(s.locAPos, glwrap.enableFrontToBack ? 3 : 2, gl.FLOAT, false, 0, 0)
		}
		if (s.locATex >= 0) {
			gl.enableVertexAttribArray(s.locATex);
			gl.bindBuffer(gl.ARRAY_BUFFER, glwrap.texcoordBuffers[glwrap.curBuffer]);
			gl.vertexAttribPointer(s.locATex, 2, gl.FLOAT, false, 0, 0)
		}
	};
	GLBatchJob.prototype.doSetColor = function() {
		var s = this.glwrap.currentShader;
		var mat4param = this.mat4param;
		this.gl.uniform4f(s.locColorFill, mat4param[0], mat4param[1], mat4param[2], mat4param[3])
	};
	GLBatchJob.prototype.doSetProgramParameters = function() {
		var i, len, s = this.glwrap.currentShader;
		var gl = this.gl;
		var mat4param = this.mat4param;
		if (s.locSamplerBack && this.glwrap.lastTexture1 !== this.texParam) {
			gl.activeTexture(gl.TEXTURE1);
			gl.bindTexture(gl.TEXTURE_2D, this.texParam);
			this.glwrap.lastTexture1 = this.texParam;
			gl.activeTexture(gl.TEXTURE0)
		}
		var v = mat4param[0];
		var v2;
		if (s.locPixelWidth && v !== s.lpPixelWidth) {
			s.lpPixelWidth = v;
			gl.uniform1f(s.locPixelWidth, v)
		}
		v = mat4param[1];
		if (s.locPixelHeight && v !== s.lpPixelHeight) {
			s.lpPixelHeight = v;
			gl.uniform1f(s.locPixelHeight, v)
		}
		v = mat4param[2];
		v2 = mat4param[3];
		if (s.locDestStart && (v !== s.lpDestStartX || v2 !== s.lpDestStartY)) {
			s.lpDestStartX = v;
			s.lpDestStartY = v2;
			gl.uniform2f(s.locDestStart, v, v2)
		}
		v = mat4param[4];
		v2 = mat4param[5];
		if (s.locDestEnd && (v !== s.lpDestEndX || v2 !== s.lpDestEndY)) {
			s.lpDestEndX = v;
			s.lpDestEndY = v;
			gl.uniform2f(s.locDestEnd, v, v2)
		}
		v = mat4param[6];
		if (s.locLayerScale && v !== s.lpLayerScale) {
			s.lpLayerScale = v;
			gl.uniform1f(s.locLayerScale, v)
		}
		v = mat4param[7];
		if (s.locLayerAngle && v !== s.lpLayerAngle) {
			s.lpLayerAngle = v;
			gl.uniform1f(s.locLayerAngle, v)
		}
		v = mat4param[8];
		v2 = mat4param[9];
		if (s.locViewOrigin && (v !== s.lpViewOriginX || v2 !== s.lpViewOriginY)) {
			s.lpViewOriginX = v;
			s.lpViewOriginY = v2;
			gl.uniform2f(s.locViewOrigin, v, v2)
		}
		v = mat4param[10];
		v2 = mat4param[11];
		if (s.locScrollPos && (v !== s.lpScrollPosX || v2 !== s.lpScrollPosY)) {
			s.lpScrollPosX = v;
			s.lpScrollPosY = v2;
			gl.uniform2f(s.locScrollPos, v, v2)
		}
		v = mat4param[12];
		if (s.locSeconds && v !== s.lpSeconds) {
			s.lpSeconds = v;
			gl.uniform1f(s.locSeconds, v)
		}
		if (s.parameters.length) {
			for (i = 0, len = s.parameters.length; i < len; i++) {
				v = this.shaderParams[i];
				if (v !== s.lastCustomParams[i]) {
					s.lastCustomParams[i] = v;
					gl.uniform1f(s.parameters[i][1], v)
				}
			}
		}
	};
	GLWrap_.prototype.pushBatch = function() {
		if (this.batchPtr === this.batch.length) this.batch.push(new GLBatchJob(BATCH_NULL, this));
		return this.batch[this.batchPtr++]
	};
	GLWrap_.prototype.endBatch = function() {
		if (this.batchPtr === 0) return;
		if (this.gl.isContextLost()) return;
		var gl = this.gl;
		if (this.pointPtr > 0) {
			gl.bindBuffer(gl.ARRAY_BUFFER, this.pointBuffer);
			gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.pointData.subarray(0, this.pointPtr));
			if (s && s.locAPos >= 0 && s.name === "<point>") gl.vertexAttribPointer(s.locAPos, 4, gl.FLOAT, false, 0, 0)
		}
		if (this.vertexPtr > 0) {
			var s = this.currentShader;
			gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffers[this.curBuffer]);
			gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertexData.subarray(0, this.vertexPtr));
			if (s && s.locAPos >= 0 && s.name !== "<point>") gl.vertexAttribPointer(s.locAPos, this.enableFrontToBack ? 3 : 2, gl.FLOAT, false, 0, 0);
			gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffers[this.curBuffer]);
			gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.texcoordData.subarray(0, this.texPtr));
			if (s && s.locATex >= 0 && s.name !== "<point>") gl.vertexAttribPointer(s.locATex, 2, gl.FLOAT, false, 0, 0)
		}
		var i, len, b;
		for (i = 0, len = this.batchPtr; i < len; i++) {
			b = this.batch[i];
			switch (b.type) {
			case 1:
				b.doQuad();
				break;
			case 2:
				b.doSetTexture();
				break;
			case 3:
				b.doSetOpacity();
				break;
			case 4:
				b.doSetBlend();
				break;
			case 5:
				b.doUpdateModelView();
				break;
			case 6:
				b.doRenderToTexture();
				break;
			case 7:
				b.doClear();
				break;
			case 8:
				b.doPoints();
				break;
			case 9:
				b.doSetProgram();
				break;
			case 10:
				b.doSetProgramParameters();
				break;
			case 11:
				b.doSetTexture1();
				break;
			case 12:
				b.doSetColor();
				break;
			case 13:
				b.doSetDepthTestEnabled();
				break;
			case 14:
				b.doSetEarlyZPass();
				break
			}
		}
		this.batchPtr = 0;
		this.vertexPtr = 0;
		this.texPtr = 0;
		this.pointPtr = 0;
		this.hasQuadBatchTop = false;
		this.hasPointBatchTop = false;
		this.isBatchInEarlyZPass = false;
		this.curBuffer++;
		if (this.curBuffer >= MULTI_BUFFERS) this.curBuffer = 0
	};
	GLWrap_.prototype.setOpacity = function(op) {
		if (op === this.lastOpacity) return;
		if (this.isEarlyZPass) return;
		var b = this.pushBatch();
		b.type = BATCH_SETOPACITY;
		b.opacityParam = op;
		this.lastOpacity = op;
		this.hasQuadBatchTop = false;
		this.hasPointBatchTop = false
	};
	GLWrap_.prototype.setTexture = function(tex) {
		if (tex === this.lastTexture0) return;
		var b = this.pushBatch();
		b.type = BATCH_SETTEXTURE;
		b.texParam = tex;
		this.lastTexture0 = tex;
		this.hasQuadBatchTop = false;
		this.hasPointBatchTop = false
	};
	GLWrap_.prototype.setBlend = function(s, d) {
		if (s === this.lastSrcBlend && d === this.lastDestBlend) return;
		if (this.isEarlyZPass) return;
		var b = this.pushBatch();
		b.type = BATCH_SETBLEND;
		b.startIndex = s;
		b.indexCount = d;
		this.lastSrcBlend = s;
		this.lastDestBlend = d;
		this.hasQuadBatchTop = false;
		this.hasPointBatchTop = false
	};
	GLWrap_.prototype.isPremultipliedAlphaBlend = function() {
		return this.lastSrcBlend === this.gl.ONE && this.lastDestBlend === this.gl.ONE_MINUS_SRC_ALPHA
	};
	GLWrap_.prototype.setAlphaBlend = function() {
		this.setBlend(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA)
	};
	GLWrap_.prototype.setNoPremultiplyAlphaBlend = function() {
		this.setBlend(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA)
	};
	var LAST_VERTEX = MAX_VERTICES * 2 - 8;
	GLWrap_.prototype.quad = function(tlx, tly, trx, try_, brx, bry, blx, bly) {
		if (this.vertexPtr >= LAST_VERTEX) this.endBatch();
		var v = this.vertexPtr;
		var t = this.texPtr;
		var vd = this.vertexData;
		var td = this.texcoordData;
		var currentZ = this.currentZ;
		if (this.hasQuadBatchTop) {
			this.batch[this.batchPtr - 1].indexCount += 6
		} else {
			var b = this.pushBatch();
			b.type = BATCH_QUAD;
			b.startIndex = this.enableFrontToBack ? v : v / 2 * 3;
			b.indexCount = 6;
			this.hasQuadBatchTop = true;
			this.hasPointBatchTop = false
		}
		if (this.enableFrontToBack) {
			vd[v++] = tlx;
			vd[v++] = tly;
			vd[v++] = currentZ;
			vd[v++] = trx;
			vd[v++] = try_;
			vd[v++] = currentZ;
			vd[v++] = brx;
			vd[v++] = bry;
			vd[v++] = currentZ;
			vd[v++] = blx;
			vd[v++] = bly;
			vd[v++] = currentZ
		} else {
			vd[v++] = tlx;
			vd[v++] = tly;
			vd[v++] = trx;
			vd[v++] = try_;
			vd[v++] = brx;
			vd[v++] = bry;
			vd[v++] = blx;
			vd[v++] = bly
		}
		td[t++] = 0;
		td[t++] = 0;
		td[t++] = 1;
		td[t++] = 0;
		td[t++] = 1;
		td[t++] = 1;
		td[t++] = 0;
		td[t++] = 1;
		this.vertexPtr = v;
		this.texPtr = t
	};
	GLWrap_.prototype.quadTex = function(tlx, tly, trx, try_, brx, bry, blx, bly, rcTex) {
		if (this.vertexPtr >= LAST_VERTEX) this.endBatch();
		var v = this.vertexPtr;
		var t = this.texPtr;
		var vd = this.vertexData;
		var td = this.texcoordData;
		var currentZ = this.currentZ;
		if (this.hasQuadBatchTop) {
			this.batch[this.batchPtr - 1].indexCount += 6
		} else {
			var b = this.pushBatch();
			b.type = BATCH_QUAD;
			b.startIndex = this.enableFrontToBack ? v : v / 2 * 3;
			b.indexCount = 6;
			this.hasQuadBatchTop = true;
			this.hasPointBatchTop = false
		}
		var rc_left = rcTex.left;
		var rc_top = rcTex.top;
		var rc_right = rcTex.right;
		var rc_bottom = rcTex.bottom;
		if (this.enableFrontToBack) {
			vd[v++] = tlx;
			vd[v++] = tly;
			vd[v++] = currentZ;
			vd[v++] = trx;
			vd[v++] = try_;
			vd[v++] = currentZ;
			vd[v++] = brx;
			vd[v++] = bry;
			vd[v++] = currentZ;
			vd[v++] = blx;
			vd[v++] = bly;
			vd[v++] = currentZ
		} else {
			vd[v++] = tlx;
			vd[v++] = tly;
			vd[v++] = trx;
			vd[v++] = try_;
			vd[v++] = brx;
			vd[v++] = bry;
			vd[v++] = blx;
			vd[v++] = bly
		}
		td[t++] = rc_left;
		td[t++] = rc_top;
		td[t++] = rc_right;
		td[t++] = rc_top;
		td[t++] = rc_right;
		td[t++] = rc_bottom;
		td[t++] = rc_left;
		td[t++] = rc_bottom;
		this.vertexPtr = v;
		this.texPtr = t
	};
	GLWrap_.prototype.quadTexUV = function(tlx, tly, trx, try_, brx, bry, blx, bly, tlu, tlv, tru, trv, bru, brv, blu, blv) {
		if (this.vertexPtr >= LAST_VERTEX) this.endBatch();
		var v = this.vertexPtr;
		var t = this.texPtr;
		var vd = this.vertexData;
		var td = this.texcoordData;
		var currentZ = this.currentZ;
		if (this.hasQuadBatchTop) {
			this.batch[this.batchPtr - 1].indexCount += 6
		} else {
			var b = this.pushBatch();
			b.type = BATCH_QUAD;
			b.startIndex = this.enableFrontToBack ? v : v / 2 * 3;
			b.indexCount = 6;
			this.hasQuadBatchTop = true;
			this.hasPointBatchTop = false
		}
		if (this.enableFrontToBack) {
			vd[v++] = tlx;
			vd[v++] = tly;
			vd[v++] = currentZ;
			vd[v++] = trx;
			vd[v++] = try_;
			vd[v++] = currentZ;
			vd[v++] = brx;
			vd[v++] = bry;
			vd[v++] = currentZ;
			vd[v++] = blx;
			vd[v++] = bly;
			vd[v++] = currentZ
		} else {
			vd[v++] = tlx;
			vd[v++] = tly;
			vd[v++] = trx;
			vd[v++] = try_;
			vd[v++] = brx;
			vd[v++] = bry;
			vd[v++] = blx;
			vd[v++] = bly
		}
		td[t++] = tlu;
		td[t++] = tlv;
		td[t++] = tru;
		td[t++] = trv;
		td[t++] = bru;
		td[t++] = brv;
		td[t++] = blu;
		td[t++] = blv;
		this.vertexPtr = v;
		this.texPtr = t
	};
	GLWrap_.prototype.convexPoly = function(pts) {
		var pts_count = pts.length / 2;
		var tris = pts_count - 2;
		var last_tri = tris - 1;
		var p0x = pts[0];
		var p0y = pts[1];
		var i, i2, p1x, p1y, p2x, p2y, p3x, p3y;
		for (i = 0; i < tris; i += 2) {
			i2 = i * 2;
			p1x = pts[i2 + 2];
			p1y = pts[i2 + 3];
			p2x = pts[i2 + 4];
			p2y = pts[i2 + 5];
			if (i === last_tri) {
				this.quad(p0x, p0y, p1x, p1y, p2x, p2y, p2x, p2y)
			} else {
				p3x = pts[i2 + 6];
				p3y = pts[i2 + 7];
				this.quad(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y)
			}
		}
	};
	var LAST_POINT = MAX_POINTS - 4;
	GLWrap_.prototype.point = function(x_, y_, size_, opacity_) {
		if (this.pointPtr >= LAST_POINT) this.endBatch();
		var p = this.pointPtr;
		var pd = this.pointData;
		if (this.hasPointBatchTop) {
			this.batch[this.batchPtr - 1].indexCount++
		} else {
			var b = this.pushBatch();
			b.type = BATCH_POINTS;
			b.startIndex = p;
			b.indexCount = 1;
			this.hasPointBatchTop = true;
			this.hasQuadBatchTop = false
		}
		pd[p++] = x_;
		pd[p++] = y_;
		pd[p++] = size_;
		pd[p++] = opacity_;
		this.pointPtr = p
	};
	GLWrap_.prototype.switchProgram = function(progIndex) {
		if (this.lastProgram === progIndex) return;
		var shaderProg = this.shaderPrograms[progIndex];
		if (!shaderProg) {
			if (this.lastProgram === 0) return;
			progIndex = 0;
			shaderProg = this.shaderPrograms[0]
		}
		var b = this.pushBatch();
		b.type = BATCH_SETPROGRAM;
		b.startIndex = progIndex;
		this.lastProgram = progIndex;
		this.hasQuadBatchTop = false;
		this.hasPointBatchTop = false
	};
	GLWrap_.prototype.programUsesDest = function(progIndex) {
		var s = this.shaderPrograms[progIndex];
		return !!(s.locDestStart || s.locDestEnd)
	};
	GLWrap_.prototype.programUsesCrossSampling = function(progIndex) {
		var s = this.shaderPrograms[progIndex];
		return !!(s.locDestStart || s.locDestEnd || s.crossSampling)
	};
	GLWrap_.prototype.programPreservesOpaqueness = function(progIndex) {
		return this.shaderPrograms[progIndex].preservesOpaqueness
	};
	GLWrap_.prototype.programExtendsBox = function(progIndex) {
		var s = this.shaderPrograms[progIndex];
		return s.extendBoxHorizontal !== 0 || s.extendBoxVertical !== 0
	};
	GLWrap_.prototype.getProgramBoxExtendHorizontal = function(progIndex) {
		return this.shaderPrograms[progIndex].extendBoxHorizontal
	};
	GLWrap_.prototype.getProgramBoxExtendVertical = function(progIndex) {
		return this.shaderPrograms[progIndex].extendBoxVertical
	};
	GLWrap_.prototype.getProgramParameterType = function(progIndex, paramIndex) {
		return this.shaderPrograms[progIndex].parameters[paramIndex][2]
	};
	GLWrap_.prototype.programIsAnimated = function(progIndex) {
		return this.shaderPrograms[progIndex].animated
	};
	GLWrap_.prototype.setProgramParameters = function(backTex, pixelWidth, pixelHeight, destStartX, destStartY, destEndX, destEndY, layerScale, layerAngle, viewOriginLeft, viewOriginTop, scrollPosX, scrollPosY, seconds, params) {
		var i, len;
		var s = this.shaderPrograms[this.lastProgram];
		var b, mat4param, shaderParams;
		if (s.hasAnyOptionalUniforms || params.length) {
			b = this.pushBatch();
			b.type = BATCH_SETPROGRAMPARAMETERS;
			if (b.mat4param) mat4.set(this.matMV, b.mat4param);
			else b.mat4param = mat4.create();
			mat4param = b.mat4param;
			mat4param[0] = pixelWidth;
			mat4param[1] = pixelHeight;
			mat4param[2] = destStartX;
			mat4param[3] = destStartY;
			mat4param[4] = destEndX;
			mat4param[5] = destEndY;
			mat4param[6] = layerScale;
			mat4param[7] = layerAngle;
			mat4param[8] = viewOriginLeft;
			mat4param[9] = viewOriginTop;
			mat4param[10] = scrollPosX;
			mat4param[11] = scrollPosY;
			mat4param[12] = seconds;
			if (s.locSamplerBack) {
				b.texParam = backTex
			} else b.texParam = null;
			if (params.length) {
				shaderParams = b.shaderParams;
				shaderParams.length = params.length;
				for (i = 0, len = params.length; i < len; i++) shaderParams[i] = params[i]
			}
			this.hasQuadBatchTop = false;
			this.hasPointBatchTop = false
		}
	};
	GLWrap_.prototype.clear = function(r, g, b_, a) {
		var b = this.pushBatch();
		b.type = BATCH_CLEAR;
		b.startIndex = 0;
		if (!b.mat4param) b.mat4param = mat4.create();
		b.mat4param[0] = r;
		b.mat4param[1] = g;
		b.mat4param[2] = b_;
		b.mat4param[3] = a;
		this.hasQuadBatchTop = false;
		this.hasPointBatchTop = false
	};
	GLWrap_.prototype.clearRect = function(x, y, w, h) {
		if (w < 0 || h < 0) return;
		var b = this.pushBatch();
		b.type = BATCH_CLEAR;
		b.startIndex = 1;
		if (!b.mat4param) b.mat4param = mat4.create();
		b.mat4param[0] = x;
		b.mat4param[1] = y;
		b.mat4param[2] = w;
		b.mat4param[3] = h;
		this.hasQuadBatchTop = false;
		this.hasPointBatchTop = false
	};
	GLWrap_.prototype.clearDepth = function() {
		var b = this.pushBatch();
		b.type = BATCH_CLEAR;
		b.startIndex = 2;
		this.hasQuadBatchTop = false;
		this.hasPointBatchTop = false
	};
	GLWrap_.prototype.setEarlyZPass = function(e) {
		if (!this.enableFrontToBack) return;
		e = !! e;
		if (this.isEarlyZPass === e) return;
		var b = this.pushBatch();
		b.type = BATCH_SETEARLYZMODE;
		b.startIndex = e ? 1 : 0;
		this.hasQuadBatchTop = false;
		this.hasPointBatchTop = false;
		this.isEarlyZPass = e;
		this.renderToTex = null;
		if (this.isEarlyZPass) {
			this.switchProgram(2)
		} else {
			this.switchProgram(0)
		}
	};
	GLWrap_.prototype.setDepthTestEnabled = function(e) {
		if (!this.enableFrontToBack) return;
		var b = this.pushBatch();
		b.type = BATCH_SETDEPTHTEST;
		b.startIndex = e ? 1 : 0;
		this.hasQuadBatchTop = false;
		this.hasPointBatchTop = false
	};
	GLWrap_.prototype.fullscreenQuad = function() {
		mat4.set(this.lastMV, tempMat4);
		this.resetModelView();
		this.updateModelView();
		var halfw = this.width / 2;
		var halfh = this.height / 2;
		this.quad(-halfw, halfh, halfw, halfh, halfw, -halfh, -halfw, -halfh);
		mat4.set(tempMat4, this.matMV);
		this.updateModelView()
	};
	GLWrap_.prototype.setColorFillMode = function(r_, g_, b_, a_) {
		this.switchProgram(3);
		var b = this.pushBatch();
		b.type = BATCH_SETCOLOR;
		if (!b.mat4param) b.mat4param = mat4.create();
		b.mat4param[0] = r_;
		b.mat4param[1] = g_;
		b.mat4param[2] = b_;
		b.mat4param[3] = a_;
		this.hasQuadBatchTop = false;
		this.hasPointBatchTop = false
	};
	GLWrap_.prototype.setTextureFillMode = function() {
		this.switchProgram(0)
	};
	GLWrap_.prototype.restoreEarlyZMode = function() {
		this.switchProgram(2)
	};
	GLWrap_.prototype.present = function() {
		this.endBatch();
		this.gl.flush()
	};

	function nextHighestPowerOfTwo(x) {
		--x;
		for (var i = 1; i < 32; i <<= 1) {
			x = x | x >> i
		}
		return x + 1
	}
	var all_textures = [];
	var textures_by_src = {};
	GLWrap_.prototype.contextLost = function() {
		cr.clearArray(all_textures);
		textures_by_src = {}
	};
	var BF_RGBA8 = 0;
	var BF_RGB8 = 1;
	var BF_RGBA4 = 2;
	var BF_RGB5_A1 = 3;
	var BF_RGB565 = 4;
	GLWrap_.prototype.loadTexture = function(img, tiling, linearsampling, pixelformat, tiletype, nomip) {
		tiling = !! tiling;
		linearsampling = !! linearsampling;
		var tex_key = img.src + "," + tiling + "," + linearsampling + (tiling ? "," + tiletype : "");
		var webGL_texture = null;
		if (typeof img.src !== "undefined" && textures_by_src.hasOwnProperty(tex_key)) {
			webGL_texture = textures_by_src[tex_key];
			webGL_texture.c2refcount++;
			return webGL_texture
		}
		this.endBatch();
		var gl = this.gl;
		var isPOT = cr.isPOT(img.width) && cr.isPOT(img.height);
		webGL_texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, webGL_texture);
		gl.pixelStorei(gl["UNPACK_PREMULTIPLY_ALPHA_WEBGL"], true);
		var internalformat = gl.RGBA;
		var format = gl.RGBA;
		var type = gl.UNSIGNED_BYTE;
		if (pixelformat && !this.isIE) {
			switch (pixelformat) {
			case BF_RGB8:
				internalformat = gl.RGB;
				format = gl.RGB;
				break;
			case BF_RGBA4:
				type = gl.UNSIGNED_SHORT_4_4_4_4;
				break;
			case BF_RGB5_A1:
				type = gl.UNSIGNED_SHORT_5_5_5_1;
				break;
			case BF_RGB565:
				internalformat = gl.RGB;
				format = gl.RGB;
				type = gl.UNSIGNED_SHORT_5_6_5;
				break
			}
		}
		if (!isPOT && tiling) {
			var canvas = document.createElement("canvas");
			canvas.width = cr.nextHighestPowerOfTwo(img.width);
			canvas.height = cr.nextHighestPowerOfTwo(img.height);
			var ctx = canvas.getContext("2d");
			ctx["webkitImageSmoothingEnabled"] = linearsampling;
			ctx["mozImageSmoothingEnabled"] = linearsampling;
			ctx["msImageSmoothingEnabled"] = linearsampling;
			ctx["imageSmoothingEnabled"] = linearsampling;
			ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
			gl.texImage2D(gl.TEXTURE_2D, 0, internalformat, format, type, canvas)
		} else gl.texImage2D(gl.TEXTURE_2D, 0, internalformat, format, type, img);
		if (tiling) {
			if (tiletype === "repeat-x") {
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
			} else if (tiletype === "repeat-y") {
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)
			} else {
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)
			}
		} else {
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
		}
		if (linearsampling) {
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			if (isPOT && this.enable_mipmaps && !nomip) {
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
				gl.generateMipmap(gl.TEXTURE_2D)
			} else gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
		} else {
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
		}
		gl.bindTexture(gl.TEXTURE_2D, null);
		this.lastTexture0 = null;
		webGL_texture.c2width = img.width;
		webGL_texture.c2height = img.height;
		webGL_texture.c2refcount = 1;
		webGL_texture.c2texkey = tex_key;
		all_textures.push(webGL_texture);
		textures_by_src[tex_key] = webGL_texture;
		return webGL_texture
	};
	GLWrap_.prototype.createEmptyTexture = function(w, h, linearsampling, _16bit, tiling) {
		this.endBatch();
		var gl = this.gl;
		if (this.isIE) _16bit = false;
		var webGL_texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, webGL_texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, _16bit ? gl.UNSIGNED_SHORT_4_4_4_4 : gl.UNSIGNED_BYTE, null);
		if (tiling) {
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)
		} else {
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
		}
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, linearsampling ? gl.LINEAR : gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, linearsampling ? gl.LINEAR : gl.NEAREST);
		gl.bindTexture(gl.TEXTURE_2D, null);
		this.lastTexture0 = null;
		webGL_texture.c2width = w;
		webGL_texture.c2height = h;
		all_textures.push(webGL_texture);
		return webGL_texture
	};
	GLWrap_.prototype.videoToTexture = function(video_, texture_, _16bit) {
		this.endBatch();
		var gl = this.gl;
		if (this.isIE) _16bit = false;
		gl.bindTexture(gl.TEXTURE_2D, texture_);
		gl.pixelStorei(gl["UNPACK_PREMULTIPLY_ALPHA_WEBGL"], true);
		try {
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, _16bit ? gl.UNSIGNED_SHORT_4_4_4_4 : gl.UNSIGNED_BYTE, video_)
		} catch (e) {
			if (console && console.error) console.error("Error updating WebGL texture: ", e)
		}
		gl.bindTexture(gl.TEXTURE_2D, null);
		this.lastTexture0 = null
	};
	GLWrap_.prototype.deleteTexture = function(tex) {
		if (!tex) return;
		if (typeof tex.c2refcount !== "undefined" && tex.c2refcount > 1) {
			tex.c2refcount--;
			return
		}
		this.endBatch();
		if (tex === this.lastTexture0) {
			this.gl.bindTexture(this.gl.TEXTURE_2D, null);
			this.lastTexture0 = null
		}
		if (tex === this.lastTexture1) {
			this.gl.activeTexture(this.gl.TEXTURE1);
			this.gl.bindTexture(this.gl.TEXTURE_2D, null);
			this.gl.activeTexture(this.gl.TEXTURE0);
			this.lastTexture1 = null
		}
		cr.arrayFindRemove(all_textures, tex);
		if (typeof tex.c2texkey !== "undefined") delete textures_by_src[tex.c2texkey];
		this.gl.deleteTexture(tex)
	};
	GLWrap_.prototype.estimateVRAM = function() {
		var total = this.width * this.height * 4 * 2;
		var i, len, t;
		for (i = 0, len = all_textures.length; i < len; i++) {
			t = all_textures[i];
			total += t.c2width * t.c2height * 4
		}
		return total
	};
	GLWrap_.prototype.textureCount = function() {
		return all_textures.length
	};
	GLWrap_.prototype.setRenderingToTexture = function(tex) {
		if (tex === this.renderToTex) return;
		var b = this.pushBatch();
		b.type = BATCH_RENDERTOTEXTURE;
		b.texParam = tex;
		this.renderToTex = tex;
		this.hasQuadBatchTop = false;
		this.hasPointBatchTop = false
	};
	cr.GLWrap = GLWrap_
})();
(function() {
	function window_innerWidth() {
		if (typeof jQuery !== "undefined") return jQuery(window).width();
		else return window.innerWidth
	}
	function window_innerHeight() {
		if (typeof jQuery !== "undefined") return jQuery(window).height();
		else return window.innerHeight
	}
	var raf = window["requestAnimationFrame"] || window["mozRequestAnimationFrame"] || window["webkitRequestAnimationFrame"] || window["msRequestAnimationFrame"] || window["oRequestAnimationFrame"];

	function Runtime(canvas) {
		if (!canvas || !canvas.getContext && !canvas["dc"]) return;
		if (canvas["c2runtime"]) return;
		else canvas["c2runtime"] = this;
		var self = this;
		this.isCrosswalk = /crosswalk/i.test(navigator.userAgent) || /xwalk/i.test(navigator.userAgent) || !! (typeof window["c2isCrosswalk"] !== "undefined" && window["c2isCrosswalk"]);
		this.isCordova = this.isCrosswalk || typeof window["device"] !== "undefined" && (typeof window["device"]["cordova"] !== "undefined" || typeof window["device"]["phonegap"] !== "undefined") || typeof window["c2iscordova"] !== "undefined" && window["c2iscordova"];
		this.isPhoneGap = this.isCordova;
		this.isDirectCanvas = !! canvas["dc"];
		this.isAppMobi = typeof window["AppMobi"] !== "undefined" || this.isDirectCanvas;
		this.isCocoonJs = !! window["c2cocoonjs"];
		this.isEjecta = !! window["c2ejecta"];
		if (this.isCocoonJs) {
			CocoonJS["App"]["onSuspended"].addEventListener(function() {
				self["setSuspended"](true)
			});
			CocoonJS["App"]["onActivated"].addEventListener(function() {
				self["setSuspended"](false)
			})
		}
		if (this.isEjecta) {
			document.addEventListener("pagehide", function() {
				self["setSuspended"](true)
			});
			document.addEventListener("pageshow", function() {
				self["setSuspended"](false)
			});
			document.addEventListener("resize", function() {
				self["setSize"](window.innerWidth, window.innerHeight)
			})
		}
		this.isDomFree = this.isDirectCanvas || this.isCocoonJs || this.isEjecta;
		this.isMicrosoftEdge = /edge\//i.test(navigator.userAgent);
		this.isIE = (/msie/i.test(navigator.userAgent) || /trident/i.test(navigator.userAgent) || /iemobile/i.test(navigator.userAgent)) && !this.isMicrosoftEdge;
		this.isTizen = /tizen/i.test(navigator.userAgent);
		this.isAndroid = /android/i.test(navigator.userAgent) && !this.isTizen && !this.isIE && !this.isMicrosoftEdge;
		this.isiPhone = (/iphone/i.test(navigator.userAgent) || /ipod/i.test(navigator.userAgent)) && !this.isIE && !this.isMicrosoftEdge;
		this.isiPad = /ipad/i.test(navigator.userAgent);
		this.isiOS = this.isiPhone || this.isiPad || this.isEjecta;
		this.isiPhoneiOS6 = this.isiPhone && /os\s6/i.test(navigator.userAgent);
		this.isChrome = (/chrome/i.test(navigator.userAgent) || /chromium/i.test(navigator.userAgent)) && !this.isIE && !this.isMicrosoftEdge;
		this.isAmazonWebApp = /amazonwebappplatform/i.test(navigator.userAgent);
		this.isFirefox = /firefox/i.test(navigator.userAgent);
		this.isSafari = /safari/i.test(navigator.userAgent) && !this.isChrome && !this.isIE && !this.isMicrosoftEdge;
		this.isWindows = /windows/i.test(navigator.userAgent);
		this.isNWjs = typeof window["c2nodewebkit"] !== "undefined" || typeof window["c2nwjs"] !== "undefined" || /nodewebkit/i.test(navigator.userAgent) || /nwjs/i.test(navigator.userAgent);
		this.isNodeWebkit = this.isNWjs;
		this.isArcade = typeof window["is_scirra_arcade"] !== "undefined";
		this.isWindows8App = !! (typeof window["c2isWindows8"] !== "undefined" && window["c2isWindows8"]);
		this.isWindows8Capable = !! (typeof window["c2isWindows8Capable"] !== "undefined" && window["c2isWindows8Capable"]);
		this.isWindowsPhone8 = !! (typeof window["c2isWindowsPhone8"] !== "undefined" && window["c2isWindowsPhone8"]);
		this.isWindowsPhone81 = !! (typeof window["c2isWindowsPhone81"] !== "undefined" && window["c2isWindowsPhone81"]);
		this.isWindows10 = !! window["cr_windows10"];
		this.isWinJS = this.isWindows8App || this.isWindows8Capable || this.isWindowsPhone81 || this.isWindows10;
		this.isBlackberry10 = !! (typeof window["c2isBlackberry10"] !== "undefined" && window["c2isBlackberry10"]);
		this.isAndroidStockBrowser = this.isAndroid && !this.isChrome && !this.isCrosswalk && !this.isFirefox && !this.isAmazonWebApp && !this.isDomFree;
		this.devicePixelRatio = 1;
		this.isMobile = this.isCordova || this.isCrosswalk || this.isAppMobi || this.isCocoonJs || this.isAndroid || this.isiOS || this.isWindowsPhone8 || this.isWindowsPhone81 || this.isBlackberry10 || this.isTizen || this.isEjecta;
		if (!this.isMobile) {
			this.isMobile = /(blackberry|bb10|playbook|palm|symbian|nokia|windows\s+ce|phone|mobile|tablet|kindle|silk)/i.test(navigator.userAgent)
		}
		if (typeof cr_is_preview !== "undefined" && !this.isNWjs && (window.location.search === "?nw" || /nodewebkit/i.test(navigator.userAgent) || /nwjs/i.test(navigator.userAgent))) {
			this.isNWjs = true
		}
		this.isDebug = typeof cr_is_preview !== "undefined" && window.location.search.indexOf("debug") > -1;
		this.canvas = canvas;
		this.canvasdiv = document.getElementById("c2canvasdiv");
		this.gl = null;
		this.glwrap = null;
		this.glUnmaskedRenderer = "(unavailable)";
		this.enableFrontToBack = false;
		this.earlyz_index = 0;
		this.ctx = null;
		this.fullscreenOldMarginCss = "";
		this.firstInFullscreen = false;
		this.oldWidth = 0;
		this.oldHeight = 0;
		this.canvas.oncontextmenu = function(e) {
			if (e.preventDefault) e.preventDefault();
			return false
		};
		this.canvas.onselectstart = function(e) {
			if (e.preventDefault) e.preventDefault();
			return false
		};
		if (this.isDirectCanvas) window["c2runtime"] = this;
		if (this.isNWjs) {
			window["ondragover"] = function(e) {
				e.preventDefault();
				return false
			};
			window["ondrop"] = function(e) {
				e.preventDefault();
				return false
			};
			require("nw.gui")["App"]["clearCache"]()
		}
		if (this.isAndroidStockBrowser && typeof jQuery !== "undefined") {
			jQuery("canvas").parents("*").css("overflow", "visible")
		}
		this.width = canvas.width;
		this.height = canvas.height;
		this.draw_width = this.width;
		this.draw_height = this.height;
		this.cssWidth = this.width;
		this.cssHeight = this.height;
		this.lastWindowWidth = window.innerWidth;
		this.lastWindowHeight = window.innerHeight;
		this.forceCanvasAlpha = false;
		this.redraw = true;
		this.isSuspended = false;
		if (!Date.now) {
			Date.now = function now() {
				return +new Date
			}
		}
		this.plugins = [];
		this.types = {};
		this.types_by_index = [];
		this.behaviors = [];
		this.layouts = {};
		this.layouts_by_index = [];
		this.eventsheets = {};
		this.eventsheets_by_index = [];
		this.wait_for_textures = [];
		this.triggers_to_postinit = [];
		this.all_global_vars = [];
		this.all_local_vars = [];
		this.solidBehavior = null;
		this.jumpthruBehavior = null;
		this.shadowcasterBehavior = null;
		this.deathRow = {};
		this.hasPendingInstances = false;
		this.isInClearDeathRow = false;
		this.isInOnDestroy = 0;
		this.isRunningEvents = false;
		this.isEndingLayout = false;
		this.createRow = [];
		this.isLoadingState = false;
		this.saveToSlot = "";
		this.loadFromSlot = "";
		this.loadFromJson = "";
		this.lastSaveJson = "";
		this.signalledContinuousPreview = false;
		this.suspendDrawing = false;
		this.dt = 0;
		this.dt1 = 0;
		this.minimumFramerate = 30;
		this.logictime = 0;
		this.cpuutilisation = 0;
		this.timescale = 1;
		this.kahanTime = new cr.KahanAdder;
		this.wallTime = new cr.KahanAdder;
		this.last_tick_time = 0;
		this.fps = 0;
		this.last_fps_time = 0;
		this.tickcount = 0;
		this.execcount = 0;
		this.framecount = 0;
		this.objectcount = 0;
		this.changelayout = null;
		this.destroycallbacks = [];
		this.event_stack = [];
		this.event_stack_index = -1;
		this.localvar_stack = [
			[]
		];
		this.localvar_stack_index = 0;
		this.trigger_depth = 0;
		this.pushEventStack(null);
		this.loop_stack = [];
		this.loop_stack_index = -1;
		this.next_uid = 0;
		this.next_puid = 0;
		this.layout_first_tick = true;
		this.family_count = 0;
		this.suspend_events = [];
		this.raf_id = -1;
		this.timeout_id = -1;
		this.isloading = true;
		this.loadingprogress = 0;
		this.isNodeFullscreen = false;
		this.stackLocalCount = 0;
		this.audioInstance = null;
		this.had_a_click = false;
		this.isInUserInputEvent = false;
		this.objects_to_pretick = new cr.ObjectSet;
		this.objects_to_tick = new cr.ObjectSet;
		this.objects_to_tick2 = new cr.ObjectSet;
		this.registered_collisions = [];
		this.temp_poly = new cr.CollisionPoly([]);
		this.temp_poly2 = new cr.CollisionPoly([]);
		this.allGroups = [];
		this.groups_by_name = {};
		this.cndsBySid = {};
		this.actsBySid = {};
		this.varsBySid = {};
		this.blocksBySid = {};
		this.running_layout = null;
		this.layer_canvas = null;
		this.layer_ctx = null;
		this.layer_tex = null;
		this.layout_tex = null;
		this.layout_canvas = null;
		this.layout_ctx = null;
		this.is_WebGL_context_lost = false;
		this.uses_background_blending = false;
		this.fx_tex = [null, null];
		this.fullscreen_scaling = 0;
		this.files_subfolder = "";
		this.objectsByUid = {};
		this.loaderlogos = null;
		this.snapshotCanvas = null;
		this.snapshotData = "";
		this.objectRefTable = [];
		this.requestProjectData()
	}
	Runtime.prototype.requestProjectData = function() {
		var self = this;
		var xhr;
		if (this.isWindowsPhone8) xhr = new ActiveXObject("Microsoft.XMLHTTP");
		else xhr = new XMLHttpRequest;
		var datajs_filename = "data.js";
		if (this.isWindows8App || this.isWindowsPhone8 || this.isWindowsPhone81 || this.isWindows10) datajs_filename = "data.json";
		xhr.open("GET", datajs_filename, true);
		var supportsJsonResponse = false;
		if (!this.isDomFree && "response" in xhr && "responseType" in xhr) {
			try {
				xhr["responseType"] = "json";
				supportsJsonResponse = xhr["responseType"] === "json"
			} catch (e) {
				supportsJsonResponse = false
			}
		}
		if (!supportsJsonResponse && "responseType" in xhr) {
			try {
				xhr["responseType"] = "text"
			} catch (e) {}
		}
		if ("overrideMimeType" in xhr) {
			try {
				xhr["overrideMimeType"]("application/json; charset=utf-8")
			} catch (e) {}
		}
		if (this.isWindowsPhone8) {
			xhr.onreadystatechange = function() {
				if (xhr.readyState !== 4) return;
				self.loadProject(JSON.parse(xhr["responseText"]))
			}
		} else {
			xhr.onload = function() {
				if (supportsJsonResponse) {
					self.loadProject(xhr["response"])
				} else {
					if (self.isEjecta) {
						var str = xhr["responseText"];
						str = str.substr(str.indexOf("{"));
						self.loadProject(JSON.parse(str))
					} else {
						self.loadProject(JSON.parse(xhr["responseText"]))
					}
				}
			};
			xhr.onerror = function(e) {
				cr.logerror("Error requesting " + datajs_filename + ":");
				cr.logerror(e)
			}
		}
		xhr.send()
	};
	Runtime.prototype.initRendererAndLoader = function() {
		var self = this;
		var i, len, j, lenj, k, lenk, t, s, l, y;
		this.isRetina = (!this.isDomFree || this.isEjecta || this.isCordova) && this.useHighDpi && !this.isAndroidStockBrowser;
		if (this.fullscreen_mode === 0 && this.isiOS) this.isRetina = false;
		this.devicePixelRatio = this.isRetina ? window["devicePixelRatio"] || window["webkitDevicePixelRatio"] || window["mozDevicePixelRatio"] || window["msDevicePixelRatio"] || 1 : 1;
		this.ClearDeathRow();
		var attribs;
		var alpha_canvas = !! (this.forceCanvasAlpha || this.alphaBackground && !(this.isNWjs || this.isWinJS || this.isWindowsPhone8 || this.isCrosswalk || this.isCordova || this.isAmazonWebApp));
		if (this.fullscreen_mode > 0) this["setSize"](window_innerWidth(), window_innerHeight(), true);
		try {
			if (this.enableWebGL && (this.isCocoonJs || this.isEjecta || !this.isDomFree)) {
				attribs = {
					alpha: alpha_canvas,
					depth: false,
					antialias: false,
					failIfMajorPerformanceCaveat: true
				};
				this.gl = this.canvas.getContext("webgl", attribs) || this.canvas.getContext("experimental-webgl", attribs)
			}
		} catch (e) {}
		if (this.gl) {
			var debug_ext = this.gl.getExtension("WEBGL_debug_renderer_info");
			if (debug_ext) {
				var unmasked_vendor = this.gl.getParameter(debug_ext.UNMASKED_VENDOR_WEBGL);
				var unmasked_renderer = this.gl.getParameter(debug_ext.UNMASKED_RENDERER_WEBGL);
				this.glUnmaskedRenderer = unmasked_renderer + " [" + unmasked_vendor + "]"
			}
			if (this.enableFrontToBack) this.glUnmaskedRenderer += " [front-to-back enabled]";
			if (!this.isDomFree) {
				this.overlay_canvas = document.createElement("canvas");
				jQuery(this.overlay_canvas).appendTo(this.canvas.parentNode);
				this.overlay_canvas.oncontextmenu = function(e) {
					return false
				};
				this.overlay_canvas.onselectstart = function(e) {
					return false
				};
				this.overlay_canvas.width = Math.round(this.cssWidth * this.devicePixelRatio);
				this.overlay_canvas.height = Math.round(this.cssHeight * this.devicePixelRatio);
				jQuery(this.overlay_canvas).css({
					width: this.cssWidth + "px",
					height: this.cssHeight + "px"
				});
				this.positionOverlayCanvas();
				this.overlay_ctx = this.overlay_canvas.getContext("2d")
			}
			this.glwrap = new cr.GLWrap(this.gl, this.isMobile, this.enableFrontToBack);
			this.glwrap.setSize(this.canvas.width, this.canvas.height);
			this.glwrap.enable_mipmaps = this.downscalingQuality !== 0;
			this.ctx = null;
			this.canvas.addEventListener("webglcontextlost", function(ev) {
				ev.preventDefault();
				self.onContextLost();
				cr.logexport("[Construct 2] WebGL context lost");
				window["cr_setSuspended"](true)
			}, false);
			this.canvas.addEventListener("webglcontextrestored", function(ev) {
				self.glwrap.initState();
				self.glwrap.setSize(self.glwrap.width, self.glwrap.height, true);
				self.layer_tex = null;
				self.layout_tex = null;
				self.fx_tex[0] = null;
				self.fx_tex[1] = null;
				self.onContextRestored();
				self.redraw = true;
				cr.logexport("[Construct 2] WebGL context restored");
				window["cr_setSuspended"](false)
			}, false);
			for (i = 0, len = this.types_by_index.length; i < len; i++) {
				t = this.types_by_index[i];
				for (j = 0, lenj = t.effect_types.length; j < lenj; j++) {
					s = t.effect_types[j];
					s.shaderindex = this.glwrap.getShaderIndex(s.id);
					s.preservesOpaqueness = this.glwrap.programPreservesOpaqueness(s.shaderindex);
					this.uses_background_blending = this.uses_background_blending || this.glwrap.programUsesDest(s.shaderindex)
				}
			}
			for (i = 0, len = this.layouts_by_index.length; i < len; i++) {
				l = this.layouts_by_index[i];
				for (j = 0, lenj = l.effect_types.length; j < lenj; j++) {
					s = l.effect_types[j];
					s.shaderindex = this.glwrap.getShaderIndex(s.id);
					s.preservesOpaqueness = this.glwrap.programPreservesOpaqueness(s.shaderindex)
				}
				l.updateActiveEffects();
				for (j = 0, lenj = l.layers.length; j < lenj; j++) {
					y = l.layers[j];
					for (k = 0, lenk = y.effect_types.length; k < lenk; k++) {
						s = y.effect_types[k];
						s.shaderindex = this.glwrap.getShaderIndex(s.id);
						s.preservesOpaqueness = this.glwrap.programPreservesOpaqueness(s.shaderindex);
						this.uses_background_blending = this.uses_background_blending || this.glwrap.programUsesDest(s.shaderindex)
					}
					y.updateActiveEffects()
				}
			}
		} else {
			if (this.fullscreen_mode > 0 && this.isDirectCanvas) {
				this.canvas = null;
				document.oncontextmenu = function(e) {
					return false
				};
				document.onselectstart = function(e) {
					return false
				};
				this.ctx = AppMobi["canvas"]["getContext"]("2d");
				try {
					this.ctx["samplingMode"] = this.linearSampling ? "smooth" : "sharp";
					this.ctx["globalScale"] = 1;
					this.ctx["HTML5CompatibilityMode"] = true;
					this.ctx["imageSmoothingEnabled"] = this.linearSampling
				} catch (e) {}
				if (this.width !== 0 && this.height !== 0) {
					this.ctx.width = this.width;
					this.ctx.height = this.height
				}
			}
			if (!this.ctx) {
				if (this.isCocoonJs) {
					attribs = {
						antialias: !! this.linearSampling,
						alpha: alpha_canvas
					};
					this.ctx = this.canvas.getContext("2d", attribs)
				} else {
					attribs = {
						alpha: alpha_canvas
					};
					this.ctx = this.canvas.getContext("2d", attribs)
				}
				this.ctx["webkitImageSmoothingEnabled"] = this.linearSampling;
				this.ctx["mozImageSmoothingEnabled"] = this.linearSampling;
				this.ctx["msImageSmoothingEnabled"] = this.linearSampling;
				this.ctx["imageSmoothingEnabled"] = this.linearSampling
			}
			this.overlay_canvas = null;
			this.overlay_ctx = null
		}
		this.tickFunc = function(timestamp) {
			self.tick(false, timestamp)
		};
		if (window != window.top && !this.isDomFree && !this.isWinJS && !this.isWindowsPhone8) {
			document.addEventListener("mousedown", function() {
				window.focus()
			}, true);
			document.addEventListener("touchstart", function() {
				window.focus()
			}, true)
		}
		if (typeof cr_is_preview !== "undefined") {
			if (this.isCocoonJs) console.log("[Construct 2] In preview-over-wifi via CocoonJS mode");
			if (window.location.search.indexOf("continuous") > -1) {
				cr.logexport("Reloading for continuous preview");
				this.loadFromSlot = "__c2_continuouspreview";
				this.suspendDrawing = true
			}
			if (this.pauseOnBlur && !this.isMobile) {
				jQuery(window).focus(function() {
					self["setSuspended"](false)
				});
				jQuery(window).blur(function() {
					self["setSuspended"](true)
				})
			}
		}
		window.addEventListener("blur", function() {
			self.onWindowBlur()
		});
		if (!this.isDomFree) {
			var unfocusFormControlFunc = function(e) {
					if (cr.isCanvasInputEvent(e) && document["activeElement"] && document["activeElement"] !== document.getElementsByTagName("body")[0] && document["activeElement"].blur) {
						try {
							document["activeElement"].blur()
						} catch (e) {}
					}
				};
			if (window.navigator["pointerEnabled"]) {
				document.addEventListener("pointerdown", unfocusFormControlFunc)
			} else if (window.navigator["msPointerEnabled"]) {
				document.addEventListener("MSPointerDown", unfocusFormControlFunc)
			} else {
				document.addEventListener("touchstart", unfocusFormControlFunc)
			}
			document.addEventListener("mousedown", unfocusFormControlFunc)
		}
		if (this.fullscreen_mode === 0 && this.isRetina && this.devicePixelRatio > 1) {
			this["setSize"](this.original_width, this.original_height, true)
		}
		this.tryLockOrientation();
		this.getready();
		this.go();
		this.extra = {};
		cr.seal(this)
	};
	var webkitRepaintFlag = false;
	Runtime.prototype["setSize"] = function(w, h, force) {
		var offx = 0,
			offy = 0;
		var neww = 0,
			newh = 0,
			intscale = 0;
		var tryHideAddressBar = this.isiPhoneiOS6 && this.isSafari && !navigator["standalone"] && !this.isDomFree && !this.isCordova;
		if (tryHideAddressBar) h += 60;
		if (this.lastWindowWidth === w && this.lastWindowHeight === h && !force) return;
		this.lastWindowWidth = w;
		this.lastWindowHeight = h;
		var mode = this.fullscreen_mode;
		var orig_aspect, cur_aspect;
		var isfullscreen = (document["mozFullScreen"] || document["webkitIsFullScreen"] || !! document["msFullscreenElement"] || document["fullScreen"] || this.isNodeFullscreen) && !this.isCordova;
		if (!isfullscreen && this.fullscreen_mode === 0 && !force) return;
		if (isfullscreen && this.fullscreen_scaling > 0) mode = this.fullscreen_scaling;
		var dpr = this.devicePixelRatio;
		if (mode >= 4) {
			orig_aspect = this.original_width / this.original_height;
			cur_aspect = w / h;
			if (cur_aspect > orig_aspect) {
				neww = h * orig_aspect;
				if (mode === 5) {
					intscale = neww * dpr / this.original_width;
					if (intscale > 1) intscale = Math.floor(intscale);
					else if (intscale < 1) intscale = 1 / Math.ceil(1 / intscale);
					neww = this.original_width * intscale / dpr;
					newh = this.original_height * intscale / dpr;
					offx = (w - neww) / 2;
					offy = (h - newh) / 2;
					w = neww;
					h = newh
				} else {
					offx = (w - neww) / 2;
					w = neww
				}
			} else {
				newh = w / orig_aspect;
				if (mode === 5) {
					intscale = newh * dpr / this.original_height;
					if (intscale > 1) intscale = Math.floor(intscale);
					else if (intscale < 1) intscale = 1 / Math.ceil(1 / intscale);
					neww = this.original_width * intscale / dpr;
					newh = this.original_height * intscale / dpr;
					offx = (w - neww) / 2;
					offy = (h - newh) / 2;
					w = neww;
					h = newh
				} else {
					offy = (h - newh) / 2;
					h = newh
				}
			}
			if (isfullscreen && !this.isNWjs) {
				offx = 0;
				offy = 0
			}
		} else if (this.isNWjs && this.isNodeFullscreen && this.fullscreen_mode_set === 0) {
			offx = Math.floor((w - this.original_width) / 2);
			offy = Math.floor((h - this.original_height) / 2);
			w = this.original_width;
			h = this.original_height
		}
		if (mode < 2) this.aspect_scale = dpr;
		if (this.isRetina && this.isiPad && dpr > 1) {
			if (w >= 1024) w = 1023;
			if (h >= 1024) h = 1023
		}
		this.cssWidth = Math.round(w);
		this.cssHeight = Math.round(h);
		this.width = Math.round(w * dpr);
		this.height = Math.round(h * dpr);
		this.redraw = true;
		if (this.wantFullscreenScalingQuality) {
			this.draw_width = this.width;
			this.draw_height = this.height;
			this.fullscreenScalingQuality = true
		} else {
			if (this.width < this.original_width && this.height < this.original_height || mode === 1) {
				this.draw_width = this.width;
				this.draw_height = this.height;
				this.fullscreenScalingQuality = true
			} else {
				this.draw_width = this.original_width;
				this.draw_height = this.original_height;
				this.fullscreenScalingQuality = false;
				if (mode === 2) {
					orig_aspect = this.original_width / this.original_height;
					cur_aspect = this.lastWindowWidth / this.lastWindowHeight;
					if (cur_aspect < orig_aspect) this.draw_width = this.draw_height * cur_aspect;
					else if (cur_aspect > orig_aspect) this.draw_height = this.draw_width / cur_aspect
				} else if (mode === 3) {
					orig_aspect = this.original_width / this.original_height;
					cur_aspect = this.lastWindowWidth / this.lastWindowHeight;
					if (cur_aspect > orig_aspect) this.draw_width = this.draw_height * cur_aspect;
					else if (cur_aspect < orig_aspect) this.draw_height = this.draw_width / cur_aspect
				}
			}
		}
		if (this.canvasdiv && !this.isDomFree) {
			jQuery(this.canvasdiv).css({
				width: Math.round(w) + "px",
				height: Math.round(h) + "px",
				"margin-left": Math.floor(offx) + "px",
				"margin-top": Math.floor(offy) + "px"
			});
			if (typeof cr_is_preview !== "undefined") {
				jQuery("#borderwrap").css({
					width: Math.round(w) + "px",
					height: Math.round(h) + "px"
				})
			}
		}
		if (this.canvas) {
			this.canvas.width = Math.round(w * dpr);
			this.canvas.height = Math.round(h * dpr);

			if (this.isEjecta) {
				this.canvas.style.left = Math.floor(offx) + "px";
				this.canvas.style.top = Math.floor(offy) + "px";
				this.canvas.style.width = Math.round(w) + "px";
				this.canvas.style.height = Math.round(h) + "px"
			} else if (this.isRetina && !this.isDomFree) {
				this.canvas.style.width = Math.round(w) + "px";
				this.canvas.style.height = Math.round(h) + "px"
			}
		}
		if (this.overlay_canvas) {
			this.overlay_canvas.width = Math.round(w * dpr);
			this.overlay_canvas.height = Math.round(h * dpr);
			this.overlay_canvas.style.width = this.cssWidth + "px";
			this.overlay_canvas.style.height = this.cssHeight + "px"
		}
		if (this.glwrap) {
			this.glwrap.setSize(Math.round(w * dpr), Math.round(h * dpr))
		}
		if (this.isDirectCanvas && this.ctx) {
			this.ctx.width = Math.round(w);
			this.ctx.height = Math.round(h)
		}
		if (this.ctx) {
			this.ctx["webkitImageSmoothingEnabled"] = this.linearSampling;
			this.ctx["mozImageSmoothingEnabled"] = this.linearSampling;
			this.ctx["msImageSmoothingEnabled"] = this.linearSampling;
			this.ctx["imageSmoothingEnabled"] = this.linearSampling
		}
		this.tryLockOrientation();
		if (!this.isDomFree && (tryHideAddressBar || this.isiPhone)) {
			window.setTimeout(function() {
				window.scrollTo(0, 1)
			}, 100)
		}
	};
	Runtime.prototype.tryLockOrientation = function() {
		if (!this.autoLockOrientation || this.orientations === 0) return;
		var orientation = "portrait";
		if (this.orientations === 2) orientation = "landscape";
		try {
			if (screen["orientation"] && screen["orientation"]["lock"]) screen["orientation"]["lock"](orientation);
			else if (screen["lockOrientation"]) screen["lockOrientation"](orientation);
			else if (screen["webkitLockOrientation"]) screen["webkitLockOrientation"](orientation);
			else if (screen["mozLockOrientation"]) screen["mozLockOrientation"](orientation);
			else if (screen["msLockOrientation"]) screen["msLockOrientation"](orientation)
		} catch (e) {
			if (console && console.warn) console.warn("Failed to lock orientation: ", e)
		}
	};
	Runtime.prototype.onContextLost = function() {
		this.glwrap.contextLost();
		this.is_WebGL_context_lost = true;
		var i, len, t;
		for (i = 0, len = this.types_by_index.length; i < len; i++) {
			t = this.types_by_index[i];
			if (t.onLostWebGLContext) t.onLostWebGLContext()
		}
	};
	Runtime.prototype.onContextRestored = function() {
		this.is_WebGL_context_lost = false;
		var i, len, t;
		for (i = 0, len = this.types_by_index.length; i < len; i++) {
			t = this.types_by_index[i];
			if (t.onRestoreWebGLContext) t.onRestoreWebGLContext()
		}
	};
	Runtime.prototype.positionOverlayCanvas = function() {
		if (this.isDomFree) return;
		var isfullscreen = (document["mozFullScreen"] || document["webkitIsFullScreen"] || document["fullScreen"] || !! document["msFullscreenElement"] || this.isNodeFullscreen) && !this.isCordova;
		var overlay_position = isfullscreen ? jQuery(this.canvas).offset() : jQuery(this.canvas).position();
		overlay_position.position = "absolute";
		jQuery(this.overlay_canvas).css(overlay_position)
	};
	var caf = window["cancelAnimationFrame"] || window["mozCancelAnimationFrame"] || window["webkitCancelAnimationFrame"] || window["msCancelAnimationFrame"] || window["oCancelAnimationFrame"];
	Runtime.prototype["setSuspended"] = function(s) {
		var i, len;
		if (s && !this.isSuspended) {
			cr.logexport("[Construct 2] Suspending");
			this.isSuspended = true;
			if (this.raf_id !== -1 && caf) caf(this.raf_id);
			if (this.timeout_id !== -1) clearTimeout(this.timeout_id);
			for (i = 0, len = this.suspend_events.length; i < len; i++) this.suspend_events[i](true)
		} else if (!s && this.isSuspended) {
			cr.logexport("[Construct 2] Resuming");
			this.isSuspended = false;
			this.last_tick_time = cr.performance_now();
			this.last_fps_time = cr.performance_now();
			this.framecount = 0;
			this.logictime = 0;
			for (i = 0, len = this.suspend_events.length; i < len; i++) this.suspend_events[i](false);
			this.tick(false)
		}
	};
	Runtime.prototype.addSuspendCallback = function(f) {
		this.suspend_events.push(f)
	};
	Runtime.prototype.GetObjectReference = function(i) {
		return this.objectRefTable[i]
	};
	Runtime.prototype.loadProject = function(data_response) {
		if (!data_response || !data_response["project"]) cr.logerror("Project model unavailable");
		var pm = data_response["project"];
		this.name = pm[0];
		this.first_layout = pm[1];
		this.fullscreen_mode = pm[12];
		this.fullscreen_mode_set = pm[12];
		this.original_width = pm[10];
		this.original_height = pm[11];
		this.parallax_x_origin = this.original_width / 2;
		this.parallax_y_origin = this.original_height / 2;
		if (this.isDomFree && !this.isEjecta && (pm[12] >= 4 || pm[12] === 0)) {
			cr.logexport("[Construct 2] Letterbox scale fullscreen modes are not supported on this platform - falling back to 'Scale outer'");
			this.fullscreen_mode = 3;
			this.fullscreen_mode_set = 3
		}
		this.uses_loader_layout = pm[18];
		this.loaderstyle = pm[19];
		if (this.loaderstyle === 0) {
			var loaderImage = new Image;
			loaderImage.crossOrigin = "anonymous";
			loaderImage.src = "loading-logo.png";
			this.loaderlogos = {
				logo: loaderImage
			}
		} else if (this.loaderstyle === 4) {
			var loaderC2logo_1024 = new Image;
			loaderC2logo_1024.src = "";
			var loaderC2logo_512 = new Image;
			loaderC2logo_512.src = "";
			var loaderC2logo_256 = new Image;
			loaderC2logo_256.src = "";
			var loaderC2logo_128 = new Image;
			loaderC2logo_128.src = "";
			var loaderPowered_1024 = new Image;
			loaderPowered_1024.src = "";
			var loaderPowered_512 = new Image;
			loaderPowered_512.src = "";
			var loaderPowered_256 = new Image;
			loaderPowered_256.src = "";
			var loaderPowered_128 = new Image;
			loaderPowered_128.src = "";
			var loaderWebsite_1024 = new Image;
			loaderWebsite_1024.src = "";
			var loaderWebsite_512 = new Image;
			loaderWebsite_512.src = "";
			var loaderWebsite_256 = new Image;
			loaderWebsite_256.src = "";
			var loaderWebsite_128 = new Image;
			loaderWebsite_128.src = "";
			this.loaderlogos = {
				logo: [loaderC2logo_1024, loaderC2logo_512, loaderC2logo_256, loaderC2logo_128],
				powered: [loaderPowered_1024, loaderPowered_512, loaderPowered_256, loaderPowered_128],
				website: [loaderWebsite_1024, loaderWebsite_512, loaderWebsite_256, loaderWebsite_128]
			}
		}
		this.next_uid = pm[21];
		this.objectRefTable = cr.getObjectRefTable();
		this.system = new cr.system_object(this);
		var i, len, j, lenj, k, lenk, idstr, m, b, t, f, p;
		var plugin, plugin_ctor;
		for (i = 0, len = pm[2].length; i < len; i++) {
			m = pm[2][i];
			p = this.GetObjectReference(m[0]);
			cr.add_common_aces(m, p.prototype);
			plugin = new p(this);
			plugin.singleglobal = m[1];
			plugin.is_world = m[2];
			plugin.must_predraw = m[9];
			if (plugin.onCreate) plugin.onCreate();
			cr.seal(plugin);
			this.plugins.push(plugin)
		}
		this.objectRefTable = cr.getObjectRefTable();
		for (i = 0, len = pm[3].length; i < len; i++) {
			m = pm[3][i];
			plugin_ctor = this.GetObjectReference(m[1]);
			plugin = null;
			for (j = 0, lenj = this.plugins.length; j < lenj; j++) {
				if (this.plugins[j] instanceof plugin_ctor) {
					plugin = this.plugins[j];
					break
				}
			}
			var type_inst = new plugin.Type(plugin);
			type_inst.name = m[0];
			type_inst.is_family = m[2];
			type_inst.instvar_sids = m[3].slice(0);
			type_inst.vars_count = m[3].length;
			type_inst.behs_count = m[4];
			type_inst.fx_count = m[5];
			type_inst.sid = m[11];
			if (type_inst.is_family) {
				type_inst.members = [];
				type_inst.family_index = this.family_count++;
				type_inst.families = null
			} else {
				type_inst.members = null;
				type_inst.family_index = -1;
				type_inst.families = []
			}
			type_inst.family_var_map = null;
			type_inst.family_beh_map = null;
			type_inst.family_fx_map = null;
			type_inst.is_contained = false;
			type_inst.container = null;
			if (m[6]) {
				type_inst.texture_file = m[6][0];
				type_inst.texture_filesize = m[6][1];
				type_inst.texture_pixelformat = m[6][2]
			} else {
				type_inst.texture_file = null;
				type_inst.texture_filesize = 0;
				type_inst.texture_pixelformat = 0
			}
			if (m[7]) {
				type_inst.animations = m[7]
			} else {
				type_inst.animations = null
			}
			type_inst.index = i;
			type_inst.instances = [];
			type_inst.deadCache = [];
			type_inst.solstack = [new cr.selection(type_inst)];
			type_inst.cur_sol = 0;
			type_inst.default_instance = null;
			type_inst.default_layerindex = 0;
			type_inst.stale_iids = true;
			type_inst.updateIIDs = cr.type_updateIIDs;
			type_inst.getFirstPicked = cr.type_getFirstPicked;
			type_inst.getPairedInstance = cr.type_getPairedInstance;
			type_inst.getCurrentSol = cr.type_getCurrentSol;
			type_inst.pushCleanSol = cr.type_pushCleanSol;
			type_inst.pushCopySol = cr.type_pushCopySol;
			type_inst.popSol = cr.type_popSol;
			type_inst.getBehaviorByName = cr.type_getBehaviorByName;
			type_inst.getBehaviorIndexByName = cr.type_getBehaviorIndexByName;
			type_inst.getEffectIndexByName = cr.type_getEffectIndexByName;
			type_inst.applySolToContainer = cr.type_applySolToContainer;
			type_inst.getInstanceByIID = cr.type_getInstanceByIID;
			type_inst.collision_grid = new cr.SparseGrid(this.original_width, this.original_height);
			type_inst.any_cell_changed = true;
			type_inst.any_instance_parallaxed = false;
			type_inst.extra = {};
			type_inst.toString = cr.type_toString;
			type_inst.behaviors = [];
			for (j = 0, lenj = m[8].length; j < lenj; j++) {
				b = m[8][j];
				var behavior_ctor = this.GetObjectReference(b[1]);
				var behavior_plugin = null;
				for (k = 0, lenk = this.behaviors.length; k < lenk; k++) {
					if (this.behaviors[k] instanceof behavior_ctor) {
						behavior_plugin = this.behaviors[k];
						break
					}
				}
				if (!behavior_plugin) {
					behavior_plugin = new behavior_ctor(this);
					behavior_plugin.my_types = [];
					behavior_plugin.my_instances = new cr.ObjectSet;
					if (behavior_plugin.onCreate) behavior_plugin.onCreate();
					cr.seal(behavior_plugin);
					this.behaviors.push(behavior_plugin);
					if (cr.behaviors.solid && behavior_plugin instanceof cr.behaviors.solid) this.solidBehavior = behavior_plugin;
					if (cr.behaviors.jumpthru && behavior_plugin instanceof cr.behaviors.jumpthru) this.jumpthruBehavior = behavior_plugin;
					if (cr.behaviors.shadowcaster && behavior_plugin instanceof cr.behaviors.shadowcaster) this.shadowcasterBehavior = behavior_plugin
				}
				if (behavior_plugin.my_types.indexOf(type_inst) === -1) behavior_plugin.my_types.push(type_inst);
				var behavior_type = new behavior_plugin.Type(behavior_plugin, type_inst);
				behavior_type.name = b[0];
				behavior_type.sid = b[2];
				behavior_type.onCreate();
				cr.seal(behavior_type);
				type_inst.behaviors.push(behavior_type)
			}
			type_inst.global = m[9];
			type_inst.isOnLoaderLayout = m[10];
			type_inst.effect_types = [];
			for (j = 0, lenj = m[12].length; j < lenj; j++) {
				type_inst.effect_types.push({
					id: m[12][j][0],
					name: m[12][j][1],
					shaderindex: -1,
					preservesOpaqueness: false,
					active: true,
					index: j
				})
			}
			type_inst.tile_poly_data = m[13];
			if (!this.uses_loader_layout || type_inst.is_family || type_inst.isOnLoaderLayout || !plugin.is_world) {
				type_inst.onCreate();
				cr.seal(type_inst)
			}
			if (type_inst.name) this.types[type_inst.name] = type_inst;
			this.types_by_index.push(type_inst);
			if (plugin.singleglobal) {
				var instance = new plugin.Instance(type_inst);
				instance.uid = this.next_uid++;
				instance.puid = this.next_puid++;
				instance.iid = 0;
				instance.get_iid = cr.inst_get_iid;
				instance.toString = cr.inst_toString;
				instance.properties = m[14];
				instance.onCreate();
				cr.seal(instance);
				type_inst.instances.push(instance);
				this.objectsByUid[instance.uid.toString()] = instance
			}
		}
		for (i = 0, len = pm[4].length; i < len; i++) {
			var familydata = pm[4][i];
			var familytype = this.types_by_index[familydata[0]];
			var familymember;
			for (j = 1, lenj = familydata.length; j < lenj; j++) {
				familymember = this.types_by_index[familydata[j]];
				familymember.families.push(familytype);
				familytype.members.push(familymember)
			}
		}
		for (i = 0, len = pm[28].length; i < len; i++) {
			var containerdata = pm[28][i];
			var containertypes = [];
			for (j = 0, lenj = containerdata.length; j < lenj; j++) containertypes.push(this.types_by_index[containerdata[j]]);
			for (j = 0, lenj = containertypes.length; j < lenj; j++) {
				containertypes[j].is_contained = true;
				containertypes[j].container = containertypes
			}
		}
		if (this.family_count > 0) {
			for (i = 0, len = this.types_by_index.length; i < len; i++) {
				t = this.types_by_index[i];
				if (t.is_family || !t.families.length) continue;
				t.family_var_map = new Array(this.family_count);
				t.family_beh_map = new Array(this.family_count);
				t.family_fx_map = new Array(this.family_count);
				var all_fx = [];
				var varsum = 0;
				var behsum = 0;
				var fxsum = 0;
				for (j = 0, lenj = t.families.length; j < lenj; j++) {
					f = t.families[j];
					t.family_var_map[f.family_index] = varsum;
					varsum += f.vars_count;
					t.family_beh_map[f.family_index] = behsum;
					behsum += f.behs_count;
					t.family_fx_map[f.family_index] = fxsum;
					fxsum += f.fx_count;
					for (k = 0, lenk = f.effect_types.length; k < lenk; k++) all_fx.push(cr.shallowCopy({}, f.effect_types[k]))
				}
				t.effect_types = all_fx.concat(t.effect_types);
				for (j = 0, lenj = t.effect_types.length; j < lenj; j++) t.effect_types[j].index = j
			}
		}
		for (i = 0, len = pm[5].length; i < len; i++) {
			m = pm[5][i];
			var layout = new cr.layout(this, m);
			cr.seal(layout);
			this.layouts[layout.name] = layout;
			this.layouts_by_index.push(layout)
		}
		for (i = 0, len = pm[6].length; i < len; i++) {
			m = pm[6][i];
			var sheet = new cr.eventsheet(this, m);
			cr.seal(sheet);
			this.eventsheets[sheet.name] = sheet;
			this.eventsheets_by_index.push(sheet)
		}
		for (i = 0, len = this.eventsheets_by_index.length; i < len; i++) this.eventsheets_by_index[i].postInit();
		for (i = 0, len = this.eventsheets_by_index.length; i < len; i++) this.eventsheets_by_index[i].updateDeepIncludes();
		for (i = 0, len = this.triggers_to_postinit.length; i < len; i++) this.triggers_to_postinit[i].postInit();
		cr.clearArray(this.triggers_to_postinit);
		this.audio_to_preload = pm[7];
		this.files_subfolder = pm[8];
		this.pixel_rounding = pm[9];
		this.aspect_scale = 1;
		this.enableWebGL = pm[13];
		this.linearSampling = pm[14];
		this.alphaBackground = pm[15];
		this.versionstr = pm[16];
		this.useHighDpi = pm[17];
		this.orientations = pm[20];
		this.autoLockOrientation = this.orientations > 0;
		this.pauseOnBlur = pm[22];
		this.wantFullscreenScalingQuality = pm[23];
		this.fullscreenScalingQuality = this.wantFullscreenScalingQuality;
		this.downscalingQuality = pm[24];
		this.preloadSounds = pm[25];
		this.projectName = pm[26];
		this.enableFrontToBack = pm[27] && !this.isIE;
		this.start_time = Date.now();
		cr.clearArray(this.objectRefTable);
		this.initRendererAndLoader()
	};
	var anyImageHadError = false;
	Runtime.prototype.waitForImageLoad = function(img_, src_) {
		img_["cocoonLazyLoad"] = true;
		img_.onerror = function(e) {
			img_.c2error = true;
			anyImageHadError = true;
			if (console && console.error) console.error("Error loading image '" + img_.src + "': ", e)
		};
		if (this.isEjecta) {
			img_.src = src_
		} else if (!img_.src) {
			if (typeof XAPKReader !== "undefined") {
				XAPKReader.get(src_, function(expanded_url) {
					img_.src = expanded_url
				}, function(e) {
					img_.c2error = true;
					anyImageHadError = true;
					if (console && console.error) console.error("Error extracting image '" + src_ + "' from expansion file: ", e)
				})
			} else {
				img_.crossOrigin = "anonymous";
				img_.src = src_
			}
		}
		this.wait_for_textures.push(img_)
	};
	Runtime.prototype.findWaitingTexture = function(src_) {
		var i, len;
		for (i = 0, len = this.wait_for_textures.length; i < len; i++) {
			if (this.wait_for_textures[i].cr_src === src_) return this.wait_for_textures[i]
		}
		return null
	};
	var audio_preload_totalsize = 0;
	var audio_preload_started = false;
	Runtime.prototype.getready = function() {
		if (!this.audioInstance) return;
		audio_preload_totalsize = this.audioInstance.setPreloadList(this.audio_to_preload)
	};
	Runtime.prototype.areAllTexturesAndSoundsLoaded = function() {
		var totalsize = audio_preload_totalsize;
		var completedsize = 0;
		var audiocompletedsize = 0;
		var ret = true;
		var i, len, img;
		for (i = 0, len = this.wait_for_textures.length; i < len; i++) {
			img = this.wait_for_textures[i];
			var filesize = img.cr_filesize;
			if (!filesize || filesize <= 0) filesize = 5e4;
			totalsize += filesize;
			if ( !! img.src && (img.complete || img["loaded"]) && !img.c2error) completedsize += filesize;
			else ret = false
		}
		if (ret && this.preloadSounds && this.audioInstance) {
			if (!audio_preload_started) {
				this.audioInstance.startPreloads();
				audio_preload_started = true
			}
			audiocompletedsize = this.audioInstance.getPreloadedSize();
			completedsize += audiocompletedsize;
			if (audiocompletedsize < audio_preload_totalsize) ret = false
		}
		if (totalsize == 0) this.progress = 1;
		else this.progress = completedsize / totalsize;
		return ret
	};
	var isC2SplashDone = false;
	Runtime.prototype.go = function() {
		if (!this.ctx && !this.glwrap) return;
		var ctx = this.ctx || this.overlay_ctx;
		if (this.overlay_canvas) this.positionOverlayCanvas();
		this.progress = 0;
		this.last_progress = -1;
		var self = this;
		if (this.areAllTexturesAndSoundsLoaded() && (this.loaderstyle !== 4 || isC2SplashDone)) {
			this.go_loading_finished()
		} else {
			var ms_elapsed = Date.now() - this.start_time;
			if (ctx) {
				var overlay_width = this.width;
				var overlay_height = this.height;
				var dpr = this.devicePixelRatio;
				if (this.loaderstyle < 3 && (this.isCocoonJs || ms_elapsed >= 500 && this.last_progress != this.progress)) {
					ctx.clearRect(0, 0, overlay_width, overlay_height);
					var mx = overlay_width / 2;
					var my = overlay_height / 2;
					var haslogo = this.loaderstyle === 0 && this.loaderlogos.logo.complete;
					var hlw = 40 * dpr;
					var hlh = 0;
					var logowidth = 80 * dpr;
					var logoheight;
					if (haslogo) {
						var loaderLogoImage = this.loaderlogos.logo;
						logowidth = loaderLogoImage.width * dpr;
						logoheight = loaderLogoImage.height * dpr;
						hlw = logowidth / 2;
						hlh = logoheight / 2;
						ctx.drawImage(loaderLogoImage, cr.floor(mx - hlw), cr.floor(my - hlh), logowidth, logoheight)
					}
					if (this.loaderstyle <= 1) {
						my += hlh + (haslogo ? 12 * dpr : 0);
						mx -= hlw;
						mx = cr.floor(mx) + .5;
						my = cr.floor(my) + .5;
						ctx.fillStyle = anyImageHadError ? "red" : "DodgerBlue";
						ctx.fillRect(mx, my, Math.floor(logowidth * this.progress), 6 * dpr);
						ctx.strokeStyle = "black";
						ctx.strokeRect(mx, my, logowidth, 6 * dpr);
						ctx.strokeStyle = "white";
						ctx.strokeRect(mx - 1 * dpr, my - 1 * dpr, logowidth + 2 * dpr, 8 * dpr)
					} else if (this.loaderstyle === 2) {
						ctx.font = this.isEjecta ? "12pt ArialMT" : "12pt Arial";
						ctx.fillStyle = anyImageHadError ? "#f00" : "#999";
						ctx.textBaseLine = "middle";
						var percent_text = Math.round(this.progress * 100) + "%";
						var text_dim = ctx.measureText ? ctx.measureText(percent_text) : null;
						var text_width = text_dim ? text_dim.width : 0;
						ctx.fillText(percent_text, mx - text_width / 2, my)
					}
					this.last_progress = this.progress
				} else if (this.loaderstyle === 4) {
					this.draw_c2_splash_loader(ctx);
					if (raf) raf(function() {
						self.go()
					});
					else setTimeout(function() {
						self.go()
					}, 16);
					return
				}
			}
			setTimeout(function() {
				self.go()
			}, this.isCocoonJs ? 10 : 100)
		}
	};
	var splashStartTime = -1;
	var splashFadeInDuration = 300;
	var splashFadeOutDuration = 300;
	var splashAfterFadeOutWait = typeof cr_is_preview === "undefined" ? 200 : 0;
	var splashIsFadeIn = true;
	var splashIsFadeOut = false;
	var splashFadeInFinish = 0;
	var splashFadeOutStart = 0;
	var splashMinDisplayTime = typeof cr_is_preview === "undefined" ? 3e3 : 0;
	var renderViaCanvas = null;
	var renderViaCtx = null;
	var splashFrameNumber = 0;

	function maybeCreateRenderViaCanvas(w, h) {
		if (!renderViaCanvas || renderViaCanvas.width !== w || renderViaCanvas.height !== h) {
			renderViaCanvas = document.createElement("canvas");
			renderViaCanvas.width = w;
			renderViaCanvas.height = h;
			renderViaCtx = renderViaCanvas.getContext("2d")
		}
	}
	function mipImage(arr, size) {
		if (size <= 128) return arr[3];
		else if (size <= 256) return arr[2];
		else if (size <= 512) return arr[1];
		else return arr[0]
	}
	Runtime.prototype.draw_c2_splash_loader = function(ctx) {
		if (isC2SplashDone) return;
		var w = Math.ceil(this.width);
		var h = Math.ceil(this.height);
		var dpr = this.devicePixelRatio;
		var logoimages = this.loaderlogos.logo;
		var poweredimages = this.loaderlogos.powered;
		var websiteimages = this.loaderlogos.website;
		for (var i = 0; i < 4; ++i) {
			if (!logoimages[i].complete || !poweredimages[i].complete || !websiteimages[i].complete) return
		}
		if (splashFrameNumber === 0) splashStartTime = Date.now();
		var nowTime = Date.now();
		var isRenderingVia = false;
		var renderToCtx = ctx;
		var drawW, drawH;
		if (splashIsFadeIn || splashIsFadeOut) {
			ctx.clearRect(0, 0, w, h);
			maybeCreateRenderViaCanvas(w, h);
			renderToCtx = renderViaCtx;
			isRenderingVia = true;
			if (splashIsFadeIn && splashFrameNumber === 1) splashStartTime = Date.now()
		} else {
			ctx.globalAlpha = 1
		}
		renderToCtx.fillStyle = "#333333";
		renderToCtx.fillRect(0, 0, w, h);
		if (this.cssHeight > 256) {
			drawW = cr.clamp(h * .22, 105, w * .6);
			drawH = drawW * .25;
			renderToCtx.drawImage(mipImage(poweredimages, drawW), w * .5 - drawW / 2, h * .2 - drawH / 2, drawW, drawH);
			drawW = Math.min(h * .395, w * .95);
			drawH = drawW;
			renderToCtx.drawImage(mipImage(logoimages, drawW), w * .5 - drawW / 2, h * .485 - drawH / 2, drawW, drawH);
			drawW = cr.clamp(h * .22, 105, w * .6);
			drawH = drawW * .25;
			renderToCtx.drawImage(mipImage(websiteimages, drawW), w * .5 - drawW / 2, h * .868 - drawH / 2, drawW, drawH);
			renderToCtx.fillStyle = "#3C3C3C";
			drawW = w;
			drawH = Math.max(h * .005, 2);
			renderToCtx.fillRect(0, h * .8 - drawH / 2, drawW, drawH);
			renderToCtx.fillStyle = anyImageHadError ? "red" : "#E0FF65";
			drawW = w * this.progress;
			renderToCtx.fillRect(w * .5 - drawW / 2, h * .8 - drawH / 2, drawW, drawH)
		} else {
			drawW = h * .55;
			drawH = drawW;
			renderToCtx.drawImage(mipImage(logoimages, drawW), w * .5 - drawW / 2, h * .45 - drawH / 2, drawW, drawH);
			renderToCtx.fillStyle = "#3C3C3C";
			drawW = w;
			drawH = Math.max(h * .005, 2);
			renderToCtx.fillRect(0, h * .85 - drawH / 2, drawW, drawH);
			renderToCtx.fillStyle = anyImageHadError ? "red" : "#E0FF65";
			drawW = w * this.progress;
			renderToCtx.fillRect(w * .5 - drawW / 2, h * .85 - drawH / 2, drawW, drawH)
		}
		if (isRenderingVia) {
			if (splashIsFadeIn) {
				if (splashFrameNumber === 0) ctx.globalAlpha = 0;
				else ctx.globalAlpha = Math.min((nowTime - splashStartTime) / splashFadeInDuration, 1)
			} else if (splashIsFadeOut) {
				ctx.globalAlpha = Math.max(1 - (nowTime - splashFadeOutStart) / splashFadeOutDuration, 0)
			}
			ctx.drawImage(renderViaCanvas, 0, 0, w, h)
		}
		if (splashIsFadeIn && nowTime - splashStartTime >= splashFadeInDuration && splashFrameNumber >= 2) {
			splashIsFadeIn = false;
			splashFadeInFinish = nowTime
		}
		if (!splashIsFadeIn && nowTime - splashFadeInFinish >= splashMinDisplayTime && !splashIsFadeOut && this.progress >= 1) {
			splashIsFadeOut = true;
			splashFadeOutStart = nowTime
		}
		if (splashIsFadeOut && nowTime - splashFadeOutStart >= splashFadeOutDuration + splashAfterFadeOutWait || typeof cr_is_preview !== "undefined" && this.progress >= 1 && Date.now() - splashStartTime < 500) {
			isC2SplashDone = true;
			splashIsFadeIn = false;
			splashIsFadeOut = false;
			renderViaCanvas = null;
			renderViaCtx = null;
			this.loaderlogos = null
		}++splashFrameNumber
	};
	Runtime.prototype.go_loading_finished = function() {
		if (this.overlay_canvas) {
			this.canvas.parentNode.removeChild(this.overlay_canvas);
			this.overlay_ctx = null;
			this.overlay_canvas = null
		}
		this.start_time = Date.now();
		this.last_fps_time = cr.performance_now();
		var i, len, t;
		if (this.uses_loader_layout) {
			for (i = 0, len = this.types_by_index.length; i < len; i++) {
				t = this.types_by_index[i];
				if (!t.is_family && !t.isOnLoaderLayout && t.plugin.is_world) {
					t.onCreate();
					cr.seal(t)
				}
			}
		} else this.isloading = false;
		for (i = 0, len = this.layouts_by_index.length; i < len; i++) {
			this.layouts_by_index[i].createGlobalNonWorlds()
		}
		if (this.fullscreen_mode >= 2) {
			var orig_aspect = this.original_width / this.original_height;
			var cur_aspect = this.width / this.height;
			if (this.fullscreen_mode !== 2 && cur_aspect > orig_aspect || this.fullscreen_mode === 2 && cur_aspect < orig_aspect) this.aspect_scale = this.height / this.original_height;
			else this.aspect_scale = this.width / this.original_width
		}
		if (this.first_layout) this.layouts[this.first_layout].startRunning();
		else this.layouts_by_index[0].startRunning();
		if (!this.uses_loader_layout) {
			this.loadingprogress = 1;
			this.trigger(cr.system_object.prototype.cnds.OnLoadFinished, null)
		}
		if (navigator["splashscreen"] && navigator["splashscreen"]["hide"]) navigator["splashscreen"]["hide"]();
		for (i = 0, len = this.types_by_index.length; i < len; i++) {
			t = this.types_by_index[i];
			if (t.onAppBegin) t.onAppBegin()
		}
		if (document["hidden"] || document["webkitHidden"] || document["mozHidden"] || document["msHidden"]) {
			window["cr_setSuspended"](true)
		} else {
			this.tick(false)
		}
		if (this.isDirectCanvas) AppMobi["webview"]["execute"]("onGameReady();")
	};
	Runtime.prototype.tick = function(background_wake, timestamp, debug_step) {
		if (!this.running_layout) return;
		var nowtime = cr.performance_now();
		var logic_start = nowtime;
		if (!debug_step && this.isSuspended && !background_wake) return;
		if (!background_wake) {
			if (raf) this.raf_id = raf(this.tickFunc);
			else {
				this.timeout_id = setTimeout(this.tickFunc, this.isMobile ? 1 : 16)
			}
		}
		var raf_time = timestamp || nowtime;
		var fsmode = this.fullscreen_mode;
		var isfullscreen = (document["mozFullScreen"] || document["webkitIsFullScreen"] || document["fullScreen"] || !! document["msFullscreenElement"]) && !this.isCordova;
		if ((isfullscreen || this.isNodeFullscreen) && this.fullscreen_scaling > 0) fsmode = this.fullscreen_scaling;
		if (fsmode > 0 && (!this.isiOS || window.self !== window.top)) {
			var curwidth = window.innerWidth;
			var curheight = window.innerHeight;
			if (this.lastWindowWidth !== curwidth || this.lastWindowHeight !== curheight) {
				this["setSize"](window_innerWidth(), window_innerHeight())
			}
		}
		if (!this.isDomFree) {
			if (isfullscreen) {
				if (!this.firstInFullscreen) {
					this.fullscreenOldMarginCss = jQuery(this.canvas).css("margin") || "0";
					this.firstInFullscreen = true
				}
				if (!this.isChrome && !this.isNWjs) {
					jQuery(this.canvas).css({
						"margin-left": "" + Math.floor((screen.width - this.width / this.devicePixelRatio) / 2) + "px",
						"margin-top": "" + Math.floor((screen.height - this.height / this.devicePixelRatio) / 2) + "px"
					})
				}
			} else {
				if (this.firstInFullscreen) {
					if (!this.isChrome && !this.isNWjs) {
						jQuery(this.canvas).css("margin", this.fullscreenOldMarginCss)
					}
					this.fullscreenOldMarginCss = "";
					this.firstInFullscreen = false;
					if (this.fullscreen_mode === 0) {
						this["setSize"](Math.round(this.oldWidth / this.devicePixelRatio), Math.round(this.oldHeight / this.devicePixelRatio), true)
					}
				} else {
					this.oldWidth = this.width;
					this.oldHeight = this.height
				}
			}
		}
		if (this.isloading) {
			var done = this.areAllTexturesAndSoundsLoaded();
			this.loadingprogress = this.progress;
			if (done) {
				this.isloading = false;
				this.progress = 1;
				this.trigger(cr.system_object.prototype.cnds.OnLoadFinished, null)
			}
		}
		this.logic(raf_time);
		if ((this.redraw || this.isCocoonJs) && !this.is_WebGL_context_lost && !this.suspendDrawing && !background_wake) {
			this.redraw = false;
			if (this.glwrap) this.drawGL();
			else this.draw();
			if (this.snapshotCanvas) {
				if (this.canvas && this.canvas.toDataURL) {
					this.snapshotData = this.canvas.toDataURL(this.snapshotCanvas[0], this.snapshotCanvas[1]);
					if (window["cr_onSnapshot"]) window["cr_onSnapshot"](this.snapshotData);
					this.trigger(cr.system_object.prototype.cnds.OnCanvasSnapshot, null)
				}
				this.snapshotCanvas = null
			}
		}
		if (!this.hit_breakpoint) {
			this.tickcount++;
			this.execcount++;
			this.framecount++
		}
		this.logictime += cr.performance_now() - logic_start
	};
	Runtime.prototype.logic = function(cur_time) {
		var i, leni, j, lenj, k, lenk, type, inst, binst;
		if (cur_time - this.last_fps_time >= 1e3) {
			this.last_fps_time += 1e3;
			if (cur_time - this.last_fps_time >= 1e3) this.last_fps_time = cur_time;
			this.fps = this.framecount;
			this.framecount = 0;
			this.cpuutilisation = this.logictime;
			this.logictime = 0
		}
		if (this.last_tick_time !== 0) {
			var ms_diff = cur_time - this.last_tick_time;
			if (ms_diff < 0) ms_diff = 0;
			this.dt1 = ms_diff / 1e3;
			if (this.dt1 > .5) this.dt1 = 0;
			else if (this.dt1 > 1 / this.minimumFramerate) this.dt1 = 1 / this.minimumFramerate
		}
		this.last_tick_time = cur_time;
		this.dt = this.dt1 * this.timescale;
		this.kahanTime.add(this.dt);
		this.wallTime.add(this.dt1);
		var isfullscreen = (document["mozFullScreen"] || document["webkitIsFullScreen"] || document["fullScreen"] || !! document["msFullscreenElement"] || this.isNodeFullscreen) && !this.isCordova;
		if (this.fullscreen_mode >= 2 || isfullscreen && this.fullscreen_scaling > 0) {
			var orig_aspect = this.original_width / this.original_height;
			var cur_aspect = this.width / this.height;
			var mode = this.fullscreen_mode;
			if (isfullscreen && this.fullscreen_scaling > 0) mode = this.fullscreen_scaling;
			if (mode !== 2 && cur_aspect > orig_aspect || mode === 2 && cur_aspect < orig_aspect) {
				this.aspect_scale = this.height / this.original_height
			} else {
				this.aspect_scale = this.width / this.original_width
			}
			if (this.running_layout) {
				this.running_layout.scrollToX(this.running_layout.scrollX);
				this.running_layout.scrollToY(this.running_layout.scrollY)
			}
		} else this.aspect_scale = this.isRetina ? this.devicePixelRatio : 1;
		this.ClearDeathRow();
		this.isInOnDestroy++;
		this.system.runWaits();
		this.isInOnDestroy--;
		this.ClearDeathRow();
		this.isInOnDestroy++;
		var tickarr = this.objects_to_pretick.valuesRef();
		for (i = 0, leni = tickarr.length; i < leni; i++) tickarr[i].pretick();
		for (i = 0, leni = this.types_by_index.length; i < leni; i++) {
			type = this.types_by_index[i];
			if (type.is_family || !type.behaviors.length && !type.families.length) continue;
			for (j = 0, lenj = type.instances.length; j < lenj; j++) {
				inst = type.instances[j];
				for (k = 0, lenk = inst.behavior_insts.length; k < lenk; k++) {
					inst.behavior_insts[k].tick()
				}
			}
		}
		for (i = 0, leni = this.types_by_index.length; i < leni; i++) {
			type = this.types_by_index[i];
			if (type.is_family || !type.behaviors.length && !type.families.length) continue;
			for (j = 0, lenj = type.instances.length; j < lenj; j++) {
				inst = type.instances[j];
				for (k = 0, lenk = inst.behavior_insts.length; k < lenk; k++) {
					binst = inst.behavior_insts[k];
					if (binst.posttick) binst.posttick()
				}
			}
		}
		tickarr = this.objects_to_tick.valuesRef();
		for (i = 0, leni = tickarr.length; i < leni; i++) tickarr[i].tick();
		this.isInOnDestroy--;
		this.handleSaveLoad();
		i = 0;
		while (this.changelayout && i++ < 10) {
			this.doChangeLayout(this.changelayout)
		}
		for (i = 0, leni = this.eventsheets_by_index.length; i < leni; i++) this.eventsheets_by_index[i].hasRun = false;
		if (this.running_layout.event_sheet) this.running_layout.event_sheet.run();
		cr.clearArray(this.registered_collisions);
		this.layout_first_tick = false;
		this.isInOnDestroy++;
		for (i = 0, leni = this.types_by_index.length; i < leni; i++) {
			type = this.types_by_index[i];
			if (type.is_family || !type.behaviors.length && !type.families.length) continue;
			for (j = 0, lenj = type.instances.length; j < lenj; j++) {
				var inst = type.instances[j];
				for (k = 0, lenk = inst.behavior_insts.length; k < lenk; k++) {
					binst = inst.behavior_insts[k];
					if (binst.tick2) binst.tick2()
				}
			}
		}
		tickarr = this.objects_to_tick2.valuesRef();
		for (i = 0, leni = tickarr.length; i < leni; i++) tickarr[i].tick2();
		this.isInOnDestroy--
	};
	Runtime.prototype.onWindowBlur = function() {
		var i, leni, j, lenj, k, lenk, type, inst, binst;
		for (i = 0, leni = this.types_by_index.length; i < leni; i++) {
			type = this.types_by_index[i];
			if (type.is_family) continue;
			for (j = 0, lenj = type.instances.length; j < lenj; j++) {
				inst = type.instances[j];
				if (inst.onWindowBlur) inst.onWindowBlur();
				if (!inst.behavior_insts) continue;
				for (k = 0, lenk = inst.behavior_insts.length; k < lenk; k++) {
					binst = inst.behavior_insts[k];
					if (binst.onWindowBlur) binst.onWindowBlur()
				}
			}
		}
	};
	Runtime.prototype.doChangeLayout = function(changeToLayout) {
		var prev_layout = this.running_layout;
		this.running_layout.stopRunning();
		var i, len, j, lenj, k, lenk, type, inst, binst;
		if (this.glwrap) {
			for (i = 0, len = this.types_by_index.length; i < len; i++) {
				type = this.types_by_index[i];
				if (type.is_family) continue;
				if (type.unloadTextures && (!type.global || type.instances.length === 0) && changeToLayout.initial_types.indexOf(type) === -1) {
					type.unloadTextures()
				}
			}
		}
		if (prev_layout == changeToLayout) cr.clearArray(this.system.waits);
		cr.clearArray(this.registered_collisions);
		changeToLayout.startRunning();
		for (i = 0, len = this.types_by_index.length; i < len; i++) {
			type = this.types_by_index[i];
			if (!type.global && !type.plugin.singleglobal) continue;
			for (j = 0, lenj = type.instances.length; j < lenj; j++) {
				inst = type.instances[j];
				if (inst.onLayoutChange) inst.onLayoutChange();
				if (inst.behavior_insts) {
					for (k = 0, lenk = inst.behavior_insts.length; k < lenk; k++) {
						binst = inst.behavior_insts[k];
						if (binst.onLayoutChange) binst.onLayoutChange()
					}
				}
			}
		}
		this.redraw = true;
		this.layout_first_tick = true;
		this.ClearDeathRow()
	};
	Runtime.prototype.pretickMe = function(inst) {
		this.objects_to_pretick.add(inst)
	};
	Runtime.prototype.unpretickMe = function(inst) {
		this.objects_to_pretick.remove(inst)
	};
	Runtime.prototype.tickMe = function(inst) {
		this.objects_to_tick.add(inst)
	};
	Runtime.prototype.untickMe = function(inst) {
		this.objects_to_tick.remove(inst)
	};
	Runtime.prototype.tick2Me = function(inst) {
		this.objects_to_tick2.add(inst)
	};
	Runtime.prototype.untick2Me = function(inst) {
		this.objects_to_tick2.remove(inst)
	};
	Runtime.prototype.getDt = function(inst) {
		if (!inst || inst.my_timescale === -1) return this.dt;
		return this.dt1 * inst.my_timescale
	};
	Runtime.prototype.draw = function() {
		this.running_layout.draw(this.ctx);
		if (this.isDirectCanvas) this.ctx["present"]()
	};
	Runtime.prototype.drawGL = function() {
		if (this.enableFrontToBack) {
			this.earlyz_index = 1;
			this.running_layout.drawGL_earlyZPass(this.glwrap)
		}
		this.running_layout.drawGL(this.glwrap);
		this.glwrap.present()
	};
	Runtime.prototype.addDestroyCallback = function(f) {
		if (f) this.destroycallbacks.push(f)
	};
	Runtime.prototype.removeDestroyCallback = function(f) {
		cr.arrayFindRemove(this.destroycallbacks, f)
	};
	Runtime.prototype.getObjectByUID = function(uid_) {
		var uidstr = uid_.toString();
		if (this.objectsByUid.hasOwnProperty(uidstr)) return this.objectsByUid[uidstr];
		else return null
	};
	var objectset_cache = [];

	function alloc_objectset() {
		if (objectset_cache.length) return objectset_cache.pop();
		else return new cr.ObjectSet
	}
	function free_objectset(s) {
		s.clear();
		objectset_cache.push(s)
	}
	Runtime.prototype.DestroyInstance = function(inst) {
		var i, len;
		var type = inst.type;
		var typename = type.name;
		var has_typename = this.deathRow.hasOwnProperty(typename);
		var obj_set = null;
		if (has_typename) {
			obj_set = this.deathRow[typename];
			if (obj_set.contains(inst)) return
		} else {
			obj_set = alloc_objectset();
			this.deathRow[typename] = obj_set
		}
		obj_set.add(inst);
		this.hasPendingInstances = true;
		if (inst.is_contained) {
			for (i = 0, len = inst.siblings.length; i < len; i++) {
				this.DestroyInstance(inst.siblings[i])
			}
		}
		if (this.isInClearDeathRow) obj_set.values_cache.push(inst);
		if (!this.isEndingLayout) {
			this.isInOnDestroy++;
			this.trigger(Object.getPrototypeOf(inst.type.plugin).cnds.OnDestroyed, inst);
			this.isInOnDestroy--
		}
	};
	Runtime.prototype.ClearDeathRow = function() {
		if (!this.hasPendingInstances) return;
		var inst, type, instances;
		var i, j, leni, lenj, obj_set;
		this.isInClearDeathRow = true;
		for (i = 0, leni = this.createRow.length; i < leni; ++i) {
			inst = this.createRow[i];
			type = inst.type;
			type.instances.push(inst);
			for (j = 0, lenj = type.families.length; j < lenj; ++j) {
				type.families[j].instances.push(inst);
				type.families[j].stale_iids = true
			}
		}
		cr.clearArray(this.createRow);
		this.IterateDeathRow();
		cr.wipe(this.deathRow);
		this.isInClearDeathRow = false;
		this.hasPendingInstances = false
	};
	Runtime.prototype.IterateDeathRow = function() {
		for (var p in this.deathRow) {
			if (this.deathRow.hasOwnProperty(p)) {
				this.ClearDeathRowForType(this.deathRow[p])
			}
		}
	};
	Runtime.prototype.ClearDeathRowForType = function(obj_set) {
		var arr = obj_set.valuesRef();
		var type = arr[0].type;
		var i, len, j, lenj, w, f, layer_instances, inst;

		cr.arrayRemoveAllFromObjectSet(type.instances, obj_set);
		type.stale_iids = true;
		if (type.instances.length === 0) type.any_instance_parallaxed = false;
		for (i = 0, len = type.families.length; i < len; ++i) {
			f = type.families[i];
			cr.arrayRemoveAllFromObjectSet(f.instances, obj_set);
			f.stale_iids = true
		}
		for (i = 0, len = this.system.waits.length; i < len; ++i) {
			w = this.system.waits[i];
			if (w.sols.hasOwnProperty(type.index)) cr.arrayRemoveAllFromObjectSet(w.sols[type.index].insts, obj_set);
			if (!type.is_family) {
				for (j = 0, lenj = type.families.length; j < lenj; ++j) {
					f = type.families[j];
					if (w.sols.hasOwnProperty(f.index)) cr.arrayRemoveAllFromObjectSet(w.sols[f.index].insts, obj_set)
				}
			}
		}
		var first_layer = arr[0].layer;
		if (first_layer) {
			if (first_layer.useRenderCells) {
				layer_instances = first_layer.instances;
				for (i = 0, len = layer_instances.length; i < len; ++i) {
					inst = layer_instances[i];
					if (!obj_set.contains(inst)) continue;
					inst.update_bbox();
					first_layer.render_grid.update(inst, inst.rendercells, null);
					inst.rendercells.set(0, 0, -1, -1)
				}
			}
			cr.arrayRemoveAllFromObjectSet(first_layer.instances, obj_set);
			first_layer.setZIndicesStaleFrom(0)
		}
		for (i = 0; i < arr.length; ++i) {
			this.ClearDeathRowForSingleInstance(arr[i], type)
		}
		free_objectset(obj_set);
		this.redraw = true
	};
	Runtime.prototype.ClearDeathRowForSingleInstance = function(inst, type) {
		var i, len, binst;
		for (i = 0, len = this.destroycallbacks.length; i < len; ++i) this.destroycallbacks[i](inst);
		if (inst.collcells) {
			type.collision_grid.update(inst, inst.collcells, null)
		}
		var layer = inst.layer;
		if (layer) {
			layer.removeFromInstanceList(inst, true)
		}
		if (inst.behavior_insts) {
			for (i = 0, len = inst.behavior_insts.length; i < len; ++i) {
				binst = inst.behavior_insts[i];
				if (binst.onDestroy) binst.onDestroy();
				binst.behavior.my_instances.remove(inst)
			}
		}
		this.objects_to_pretick.remove(inst);
		this.objects_to_tick.remove(inst);
		this.objects_to_tick2.remove(inst);
		if (inst.onDestroy) inst.onDestroy();
		if (this.objectsByUid.hasOwnProperty(inst.uid.toString())) delete this.objectsByUid[inst.uid.toString()];
		this.objectcount--;
		if (type.deadCache.length < 100) type.deadCache.push(inst)
	};
	Runtime.prototype.createInstance = function(type, layer, sx, sy) {
		if (type.is_family) {
			var i = cr.floor(Math.random() * type.members.length);
			return this.createInstance(type.members[i], layer, sx, sy)
		}
		if (!type.default_instance) {
			return null
		}
		return this.createInstanceFromInit(type.default_instance, layer, false, sx, sy, false)
	};
	var all_behaviors = [];
	Runtime.prototype.createInstanceFromInit = function(initial_inst, layer, is_startup_instance, sx, sy, skip_siblings) {
		var i, len, j, lenj, p, effect_fallback, x, y;
		if (!initial_inst) return null;
		var type = this.types_by_index[initial_inst[1]];
		var is_world = type.plugin.is_world;
		if (this.isloading && is_world && !type.isOnLoaderLayout) return null;
		if (is_world && !this.glwrap && initial_inst[0][11] === 11) return null;
		var original_layer = layer;
		if (!is_world) layer = null;
		var inst;
		if (type.deadCache.length) {
			inst = type.deadCache.pop();
			inst.recycled = true;
			type.plugin.Instance.call(inst, type)
		} else {
			inst = new type.plugin.Instance(type);
			inst.recycled = false
		}
		if (is_startup_instance && !skip_siblings && !this.objectsByUid.hasOwnProperty(initial_inst[2].toString())) inst.uid = initial_inst[2];
		else inst.uid = this.next_uid++;
		this.objectsByUid[inst.uid.toString()] = inst;
		inst.puid = this.next_puid++;
		inst.iid = type.instances.length;
		for (i = 0, len = this.createRow.length; i < len; ++i) {
			if (this.createRow[i].type === type) inst.iid++
		}
		inst.get_iid = cr.inst_get_iid;
		inst.toString = cr.inst_toString;
		var initial_vars = initial_inst[3];
		if (inst.recycled) {
			cr.wipe(inst.extra)
		} else {
			inst.extra = {};
			if (typeof cr_is_preview !== "undefined") {
				inst.instance_var_names = [];
				inst.instance_var_names.length = initial_vars.length;
				for (i = 0, len = initial_vars.length; i < len; i++) inst.instance_var_names[i] = initial_vars[i][1]
			}
			inst.instance_vars = [];
			inst.instance_vars.length = initial_vars.length
		}
		for (i = 0, len = initial_vars.length; i < len; i++) inst.instance_vars[i] = initial_vars[i][0];
		if (is_world) {
			var wm = initial_inst[0];
			inst.x = cr.is_undefined(sx) ? wm[0] : sx;
			inst.y = cr.is_undefined(sy) ? wm[1] : sy;
			inst.z = wm[2];
			inst.width = wm[3];
			inst.height = wm[4];
			inst.depth = wm[5];
			inst.angle = wm[6];
			inst.opacity = wm[7];
			inst.hotspotX = wm[8];
			inst.hotspotY = wm[9];
			inst.blend_mode = wm[10];
			effect_fallback = wm[11];
			if (!this.glwrap && type.effect_types.length) inst.blend_mode = effect_fallback;
			inst.compositeOp = cr.effectToCompositeOp(inst.blend_mode);
			if (this.gl) cr.setGLBlend(inst, inst.blend_mode, this.gl);
			if (inst.recycled) {
				for (i = 0, len = wm[12].length; i < len; i++) {
					for (j = 0, lenj = wm[12][i].length; j < lenj; j++) inst.effect_params[i][j] = wm[12][i][j]
				}
				inst.bbox.set(0, 0, 0, 0);
				inst.collcells.set(0, 0, -1, -1);
				inst.rendercells.set(0, 0, -1, -1);
				inst.bquad.set_from_rect(inst.bbox);
				cr.clearArray(inst.bbox_changed_callbacks)
			} else {
				inst.effect_params = wm[12].slice(0);
				for (i = 0, len = inst.effect_params.length; i < len; i++) inst.effect_params[i] = wm[12][i].slice(0);
				inst.active_effect_types = [];
				inst.active_effect_flags = [];
				inst.active_effect_flags.length = type.effect_types.length;
				inst.bbox = new cr.rect(0, 0, 0, 0);
				inst.collcells = new cr.rect(0, 0, -1, -1);
				inst.rendercells = new cr.rect(0, 0, -1, -1);
				inst.bquad = new cr.quad;
				inst.bbox_changed_callbacks = [];
				inst.set_bbox_changed = cr.set_bbox_changed;
				inst.add_bbox_changed_callback = cr.add_bbox_changed_callback;
				inst.contains_pt = cr.inst_contains_pt;
				inst.update_bbox = cr.update_bbox;
				inst.update_render_cell = cr.update_render_cell;
				inst.update_collision_cell = cr.update_collision_cell;
				inst.get_zindex = cr.inst_get_zindex
			}
			inst.tilemap_exists = false;
			inst.tilemap_width = 0;
			inst.tilemap_height = 0;
			inst.tilemap_data = null;
			if (wm.length === 14) {
				inst.tilemap_exists = true;
				inst.tilemap_width = wm[13][0];
				inst.tilemap_height = wm[13][1];
				inst.tilemap_data = wm[13][2]
			}
			for (i = 0, len = type.effect_types.length; i < len; i++) inst.active_effect_flags[i] = true;
			inst.shaders_preserve_opaqueness = true;
			inst.updateActiveEffects = cr.inst_updateActiveEffects;
			inst.updateActiveEffects();
			inst.uses_shaders = !! inst.active_effect_types.length;
			inst.bbox_changed = true;
			inst.cell_changed = true;
			type.any_cell_changed = true;
			inst.visible = true;
			inst.my_timescale = -1;
			inst.layer = layer;
			inst.zindex = layer.instances.length;
			inst.earlyz_index = 0;
			if (typeof inst.collision_poly === "undefined") inst.collision_poly = null;
			inst.collisionsEnabled = true;
			this.redraw = true
		}
		var initial_props, binst;
		cr.clearArray(all_behaviors);
		for (i = 0, len = type.families.length; i < len; i++) {
			all_behaviors.push.apply(all_behaviors, type.families[i].behaviors)
		}
		all_behaviors.push.apply(all_behaviors, type.behaviors);
		if (inst.recycled) {
			for (i = 0, len = all_behaviors.length; i < len; i++) {
				var btype = all_behaviors[i];
				binst = inst.behavior_insts[i];
				binst.recycled = true;
				btype.behavior.Instance.call(binst, btype, inst);
				initial_props = initial_inst[4][i];
				for (j = 0, lenj = initial_props.length; j < lenj; j++) binst.properties[j] = initial_props[j];
				binst.onCreate();
				btype.behavior.my_instances.add(inst)
			}
		} else {
			inst.behavior_insts = [];
			for (i = 0, len = all_behaviors.length; i < len; i++) {
				var btype = all_behaviors[i];
				var binst = new btype.behavior.Instance(btype, inst);
				binst.recycled = false;
				binst.properties = initial_inst[4][i].slice(0);
				binst.onCreate();
				cr.seal(binst);
				inst.behavior_insts.push(binst);
				btype.behavior.my_instances.add(inst)
			}
		}
		initial_props = initial_inst[5];
		if (inst.recycled) {
			for (i = 0, len = initial_props.length; i < len; i++) inst.properties[i] = initial_props[i]
		} else inst.properties = initial_props.slice(0);
		this.createRow.push(inst);
		this.hasPendingInstances = true;
		if (layer) {
			layer.appendToInstanceList(inst, true);
			if (layer.parallaxX !== 1 || layer.parallaxY !== 1) type.any_instance_parallaxed = true
		}
		this.objectcount++;
		if (type.is_contained) {
			inst.is_contained = true;
			if (inst.recycled) cr.clearArray(inst.siblings);
			else inst.siblings = [];
			if (!is_startup_instance && !skip_siblings) {
				for (i = 0, len = type.container.length; i < len; i++) {
					if (type.container[i] === type) continue;
					if (!type.container[i].default_instance) {
						return null
					}
					inst.siblings.push(this.createInstanceFromInit(type.container[i].default_instance, original_layer, false, is_world ? inst.x : sx, is_world ? inst.y : sy, true))
				}
				for (i = 0, len = inst.siblings.length; i < len; i++) {
					inst.siblings[i].siblings.push(inst);
					for (j = 0; j < len; j++) {
						if (i !== j) inst.siblings[i].siblings.push(inst.siblings[j])
					}
				}
			}
		} else {
			inst.is_contained = false;
			inst.siblings = null
		}
		inst.onCreate();
		if (!inst.recycled) cr.seal(inst);
		for (i = 0, len = inst.behavior_insts.length; i < len; i++) {
			if (inst.behavior_insts[i].postCreate) inst.behavior_insts[i].postCreate()
		}
		return inst
	};
	Runtime.prototype.getLayerByName = function(layer_name) {
		var i, len;
		for (i = 0, len = this.running_layout.layers.length; i < len; i++) {
			var layer = this.running_layout.layers[i];
			if (cr.equals_nocase(layer.name, layer_name)) return layer
		}
		return null
	};
	Runtime.prototype.getLayerByNumber = function(index) {
		index = cr.floor(index);
		if (index < 0) index = 0;
		if (index >= this.running_layout.layers.length) index = this.running_layout.layers.length - 1;
		return this.running_layout.layers[index]
	};
	Runtime.prototype.getLayer = function(l) {
		if (cr.is_number(l)) return this.getLayerByNumber(l);
		else return this.getLayerByName(l.toString())
	};
	Runtime.prototype.clearSol = function(solModifiers) {
		var i, len;
		for (i = 0, len = solModifiers.length; i < len; i++) {
			solModifiers[i].getCurrentSol().select_all = true
		}
	};
	Runtime.prototype.pushCleanSol = function(solModifiers) {
		var i, len;
		for (i = 0, len = solModifiers.length; i < len; i++) {
			solModifiers[i].pushCleanSol()
		}
	};
	Runtime.prototype.pushCopySol = function(solModifiers) {
		var i, len;
		for (i = 0, len = solModifiers.length; i < len; i++) {
			solModifiers[i].pushCopySol()
		}
	};
	Runtime.prototype.popSol = function(solModifiers) {
		var i, len;
		for (i = 0, len = solModifiers.length; i < len; i++) {
			solModifiers[i].popSol()
		}
	};
	Runtime.prototype.updateAllCells = function(type) {
		if (!type.any_cell_changed) return;
		var i, len, instances = type.instances;
		for (i = 0, len = instances.length; i < len; ++i) {
			instances[i].update_collision_cell()
		}
		var createRow = this.createRow;
		for (i = 0, len = createRow.length; i < len; ++i) {
			if (createRow[i].type === type) createRow[i].update_collision_cell()
		}
		type.any_cell_changed = false
	};
	Runtime.prototype.getCollisionCandidates = function(layer, rtype, bbox, candidates) {
		var i, len, t;
		var is_parallaxed = layer ? layer.parallaxX !== 1 || layer.parallaxY !== 1 : false;
		if (rtype.is_family) {
			for (i = 0, len = rtype.members.length; i < len; ++i) {
				t = rtype.members[i];
				if (is_parallaxed || t.any_instance_parallaxed) {
					cr.appendArray(candidates, t.instances)
				} else {
					this.updateAllCells(t);
					t.collision_grid.queryRange(bbox, candidates)
				}
			}
		} else {
			if (is_parallaxed || rtype.any_instance_parallaxed) {
				cr.appendArray(candidates, rtype.instances)
			} else {
				this.updateAllCells(rtype);
				rtype.collision_grid.queryRange(bbox, candidates)
			}
		}
	};
	Runtime.prototype.getTypesCollisionCandidates = function(layer, types, bbox, candidates) {
		var i, len;
		for (i = 0, len = types.length; i < len; ++i) {
			this.getCollisionCandidates(layer, types[i], bbox, candidates)
		}
	};
	Runtime.prototype.getSolidCollisionCandidates = function(layer, bbox, candidates) {
		var solid = this.getSolidBehavior();
		if (!solid) return null;
		this.getTypesCollisionCandidates(layer, solid.my_types, bbox, candidates)
	};
	Runtime.prototype.getJumpthruCollisionCandidates = function(layer, bbox, candidates) {
		var jumpthru = this.getJumpthruBehavior();
		if (!jumpthru) return null;
		this.getTypesCollisionCandidates(layer, jumpthru.my_types, bbox, candidates)
	};
	Runtime.prototype.testAndSelectCanvasPointOverlap = function(type, ptx, pty, inverted) {
		var sol = type.getCurrentSol();
		var i, j, inst, len;
		var lx, ly;
		if (sol.select_all) {
			if (!inverted) {
				sol.select_all = false;
				cr.clearArray(sol.instances)
			}
			for (i = 0, len = type.instances.length; i < len; i++) {
				inst = type.instances[i];
				inst.update_bbox();
				lx = inst.layer.canvasToLayer(ptx, pty, true);
				ly = inst.layer.canvasToLayer(ptx, pty, false);
				if (inst.contains_pt(lx, ly)) {
					if (inverted) return false;
					else sol.instances.push(inst)
				}
			}
		} else {
			j = 0;
			for (i = 0, len = sol.instances.length; i < len; i++) {
				inst = sol.instances[i];
				inst.update_bbox();
				lx = inst.layer.canvasToLayer(ptx, pty, true);
				ly = inst.layer.canvasToLayer(ptx, pty, false);
				if (inst.contains_pt(lx, ly)) {
					if (inverted) return false;
					else {
						sol.instances[j] = sol.instances[i];
						j++
					}
				}
			}
			if (!inverted) sol.instances.length = j
		}
		type.applySolToContainer();
		if (inverted) return true;
		else return sol.hasObjects()
	};
	Runtime.prototype.testOverlap = function(a, b) {
		if (!a || !b || a === b || !a.collisionsEnabled || !b.collisionsEnabled) return false;
		a.update_bbox();
		b.update_bbox();
		var layera = a.layer;
		var layerb = b.layer;
		var different_layers = layera !== layerb && (layera.parallaxX !== layerb.parallaxX || layerb.parallaxY !== layerb.parallaxY || layera.scale !== layerb.scale || layera.angle !== layerb.angle || layera.zoomRate !== layerb.zoomRate);
		var i, len, i2, i21, x, y, haspolya, haspolyb, polya, polyb;
		if (!different_layers) {
			if (!a.bbox.intersects_rect(b.bbox)) return false;
			if (!a.bquad.intersects_quad(b.bquad)) return false;
			if (a.tilemap_exists && b.tilemap_exists) return false;
			if (a.tilemap_exists) return this.testTilemapOverlap(a, b);
			if (b.tilemap_exists) return this.testTilemapOverlap(b, a);
			haspolya = a.collision_poly && !a.collision_poly.is_empty();
			haspolyb = b.collision_poly && !b.collision_poly.is_empty();
			if (!haspolya && !haspolyb) return true;
			if (haspolya) {
				a.collision_poly.cache_poly(a.width, a.height, a.angle);
				polya = a.collision_poly
			} else {
				this.temp_poly.set_from_quad(a.bquad, a.x, a.y, a.width, a.height);
				polya = this.temp_poly
			}
			if (haspolyb) {
				b.collision_poly.cache_poly(b.width, b.height, b.angle);
				polyb = b.collision_poly
			} else {
				this.temp_poly.set_from_quad(b.bquad, b.x, b.y, b.width, b.height);
				polyb = this.temp_poly
			}
			return polya.intersects_poly(polyb, b.x - a.x, b.y - a.y)
		} else {
			haspolya = a.collision_poly && !a.collision_poly.is_empty();
			haspolyb = b.collision_poly && !b.collision_poly.is_empty();
			if (haspolya) {
				a.collision_poly.cache_poly(a.width, a.height, a.angle);
				this.temp_poly.set_from_poly(a.collision_poly)
			} else {
				this.temp_poly.set_from_quad(a.bquad, a.x, a.y, a.width, a.height)
			}
			polya = this.temp_poly;
			if (haspolyb) {
				b.collision_poly.cache_poly(b.width, b.height, b.angle);
				this.temp_poly2.set_from_poly(b.collision_poly)
			} else {
				this.temp_poly2.set_from_quad(b.bquad, b.x, b.y, b.width, b.height)
			}
			polyb = this.temp_poly2;
			for (i = 0, len = polya.pts_count; i < len; i++) {
				i2 = i * 2;
				i21 = i2 + 1;
				x = polya.pts_cache[i2];
				y = polya.pts_cache[i21];
				polya.pts_cache[i2] = layera.layerToCanvas(x + a.x, y + a.y, true);
				polya.pts_cache[i21] = layera.layerToCanvas(x + a.x, y + a.y, false)
			}
			polya.update_bbox();
			for (i = 0, len = polyb.pts_count; i < len; i++) {
				i2 = i * 2;
				i21 = i2 + 1;
				x = polyb.pts_cache[i2];
				y = polyb.pts_cache[i21];
				polyb.pts_cache[i2] = layerb.layerToCanvas(x + b.x, y + b.y, true);
				polyb.pts_cache[i21] = layerb.layerToCanvas(x + b.x, y + b.y, false)
			}
			polyb.update_bbox();
			return polya.intersects_poly(polyb, 0, 0)
		}
	};
	var tmpQuad = new cr.quad;
	var tmpRect = new cr.rect(0, 0, 0, 0);
	var collrect_candidates = [];
	Runtime.prototype.testTilemapOverlap = function(tm, a) {
		var i, len, c, rc;
		var bbox = a.bbox;
		var tmx = tm.x;
		var tmy = tm.y;
		tm.getCollisionRectCandidates(bbox, collrect_candidates);
		var collrects = collrect_candidates;
		var haspolya = a.collision_poly && !a.collision_poly.is_empty();
		for (i = 0, len = collrects.length; i < len; ++i) {
			c = collrects[i];
			rc = c.rc;
			if (bbox.intersects_rect_off(rc, tmx, tmy)) {
				tmpQuad.set_from_rect(rc);
				tmpQuad.offset(tmx, tmy);
				if (tmpQuad.intersects_quad(a.bquad)) {
					if (haspolya) {
						a.collision_poly.cache_poly(a.width, a.height, a.angle);
						if (c.poly) {
							if (c.poly.intersects_poly(a.collision_poly, a.x - (tmx + rc.left), a.y - (tmy + rc.top))) {
								cr.clearArray(collrect_candidates);
								return true
							}
						} else {
							this.temp_poly.set_from_quad(tmpQuad, 0, 0, rc.right - rc.left, rc.bottom - rc.top);
							if (this.temp_poly.intersects_poly(a.collision_poly, a.x, a.y)) {
								cr.clearArray(collrect_candidates);
								return true
							}
						}
					} else {
						if (c.poly) {
							this.temp_poly.set_from_quad(a.bquad, 0, 0, a.width, a.height);
							if (c.poly.intersects_poly(this.temp_poly, -(tmx + rc.left), -(tmy + rc.top))) {
								cr.clearArray(collrect_candidates);
								return true
							}
						} else {
							cr.clearArray(collrect_candidates);
							return true
						}
					}
				}
			}
		}
		cr.clearArray(collrect_candidates);
		return false
	};
	Runtime.prototype.testRectOverlap = function(r, b) {
		if (!b || !b.collisionsEnabled) return false;
		b.update_bbox();
		var layerb = b.layer;
		var haspolyb, polyb;
		if (!b.bbox.intersects_rect(r)) return false;
		if (b.tilemap_exists) {
			b.getCollisionRectCandidates(r, collrect_candidates);
			var collrects = collrect_candidates;
			var i, len, c, tilerc;
			var tmx = b.x;
			var tmy = b.y;
			for (i = 0, len = collrects.length; i < len; ++i) {
				c = collrects[i];
				tilerc = c.rc;
				if (r.intersects_rect_off(tilerc, tmx, tmy)) {
					if (c.poly) {
						this.temp_poly.set_from_rect(r, 0, 0);
						if (c.poly.intersects_poly(this.temp_poly, -(tmx + tilerc.left), -(tmy + tilerc.top))) {
							cr.clearArray(collrect_candidates);
							return true
						}
					} else {
						cr.clearArray(collrect_candidates);
						return true
					}
				}
			}
			cr.clearArray(collrect_candidates);
			return false
		} else {
			tmpQuad.set_from_rect(r);
			if (!b.bquad.intersects_quad(tmpQuad)) return false;
			haspolyb = b.collision_poly && !b.collision_poly.is_empty();
			if (!haspolyb) return true;
			b.collision_poly.cache_poly(b.width, b.height, b.angle);
			tmpQuad.offset(-r.left, -r.top);
			this.temp_poly.set_from_quad(tmpQuad, 0, 0, 1, 1);
			return b.collision_poly.intersects_poly(this.temp_poly, r.left - b.x, r.top - b.y)
		}
	};
	Runtime.prototype.testSegmentOverlap = function(x1, y1, x2, y2, b) {
		if (!b || !b.collisionsEnabled) return false;
		b.update_bbox();
		var layerb = b.layer;
		var haspolyb, polyb;
		tmpRect.set(cr.min(x1, x2), cr.min(y1, y2), cr.max(x1, x2), cr.max(y1, y2));
		if (!b.bbox.intersects_rect(tmpRect)) return false;
		if (b.tilemap_exists) {
			b.getCollisionRectCandidates(tmpRect, collrect_candidates);
			var collrects = collrect_candidates;
			var i, len, c, tilerc;
			var tmx = b.x;
			var tmy = b.y;
			for (i = 0, len = collrects.length; i < len; ++i) {
				c = collrects[i];
				tilerc = c.rc;
				if (tmpRect.intersects_rect_off(tilerc, tmx, tmy)) {
					tmpQuad.set_from_rect(tilerc);
					tmpQuad.offset(tmx, tmy);
					if (tmpQuad.intersects_segment(x1, y1, x2, y2)) {
						if (c.poly) {
							if (c.poly.intersects_segment(tmx + tilerc.left, tmy + tilerc.top, x1, y1, x2, y2)) {
								cr.clearArray(collrect_candidates);
								return true
							}
						} else {
							cr.clearArray(collrect_candidates);
							return true
						}
					}
				}
			}
			cr.clearArray(collrect_candidates);
			return false
		} else {
			if (!b.bquad.intersects_segment(x1, y1, x2, y2)) return false;
			haspolyb = b.collision_poly && !b.collision_poly.is_empty();
			if (!haspolyb) return true;
			b.collision_poly.cache_poly(b.width, b.height, b.angle);
			return b.collision_poly.intersects_segment(b.x, b.y, x1, y1, x2, y2)
		}
	};
	Runtime.prototype.typeHasBehavior = function(t, b) {
		if (!b) return false;
		var i, len, j, lenj, f;
		for (i = 0, len = t.behaviors.length; i < len; i++) {
			if (t.behaviors[i].behavior instanceof b) return true
		}
		if (!t.is_family) {
			for (i = 0, len = t.families.length; i < len; i++) {
				f = t.families[i];
				for (j = 0, lenj = f.behaviors.length; j < lenj; j++) {
					if (f.behaviors[j].behavior instanceof b) return true
				}
			}
		}
		return false
	};
	Runtime.prototype.typeHasNoSaveBehavior = function(t) {
		return this.typeHasBehavior(t, cr.behaviors.NoSave)
	};
	Runtime.prototype.typeHasPersistBehavior = function(t) {
		return this.typeHasBehavior(t, cr.behaviors.Persist)
	};
	Runtime.prototype.getSolidBehavior = function() {
		return this.solidBehavior
	};
	Runtime.prototype.getJumpthruBehavior = function() {
		return this.jumpthruBehavior
	};
	var candidates = [];
	Runtime.prototype.testOverlapSolid = function(inst) {
		var i, len, s;
		inst.update_bbox();
		this.getSolidCollisionCandidates(inst.layer, inst.bbox, candidates);
		for (i = 0, len = candidates.length; i < len; ++i) {
			s = candidates[i];
			if (!s.extra["solidEnabled"]) continue;
			if (this.testOverlap(inst, s)) {
				cr.clearArray(candidates);
				return s
			}
		}
		cr.clearArray(candidates);
		return null
	};
	Runtime.prototype.testRectOverlapSolid = function(r) {
		var i, len, s;
		this.getSolidCollisionCandidates(null, r, candidates);
		for (i = 0, len = candidates.length; i < len; ++i) {
			s = candidates[i];
			if (!s.extra["solidEnabled"]) continue;
			if (this.testRectOverlap(r, s)) {
				cr.clearArray(candidates);
				return s
			}
		}
		cr.clearArray(candidates);
		return null
	};
	var jumpthru_array_ret = [];
	Runtime.prototype.testOverlapJumpThru = function(inst, all) {
		var ret = null;
		if (all) {
			ret = jumpthru_array_ret;
			cr.clearArray(ret)
		}
		inst.update_bbox();
		this.getJumpthruCollisionCandidates(inst.layer, inst.bbox, candidates);
		var i, len, j;
		for (i = 0, len = candidates.length; i < len; ++i) {
			j = candidates[i];
			if (!j.extra["jumpthruEnabled"]) continue;
			if (this.testOverlap(inst, j)) {
				if (all) ret.push(j);
				else {
					cr.clearArray(candidates);
					return j
				}
			}
		}
		cr.clearArray(candidates);
		return ret
	};
	Runtime.prototype.pushOutSolid = function(inst, xdir, ydir, dist, include_jumpthrus, specific_jumpthru) {
		var push_dist = dist || 50;
		var oldx = inst.x;
		var oldy = inst.y;
		var i;
		var last_overlapped = null,
			secondlast_overlapped = null;
		for (i = 0; i < push_dist; i++) {
			inst.x = oldx + xdir * i;
			inst.y = oldy + ydir * i;
			inst.set_bbox_changed();
			if (!this.testOverlap(inst, last_overlapped)) {
				last_overlapped = this.testOverlapSolid(inst);
				if (last_overlapped) secondlast_overlapped = last_overlapped;
				if (!last_overlapped) {
					if (include_jumpthrus) {
						if (specific_jumpthru) last_overlapped = this.testOverlap(inst, specific_jumpthru) ? specific_jumpthru : null;
						else last_overlapped = this.testOverlapJumpThru(inst);
						if (last_overlapped) secondlast_overlapped = last_overlapped
					}
					if (!last_overlapped) {
						if (secondlast_overlapped) this.pushInFractional(inst, xdir, ydir, secondlast_overlapped, 16);
						return true
					}
				}
			}
		}
		inst.x = oldx;
		inst.y = oldy;
		inst.set_bbox_changed();
		return false
	};
	Runtime.prototype.pushOut = function(inst, xdir, ydir, dist, otherinst) {
		var push_dist = dist || 50;
		var oldx = inst.x;
		var oldy = inst.y;
		var i;
		for (i = 0; i < push_dist; i++) {
			inst.x = oldx + xdir * i;
			inst.y = oldy + ydir * i;
			inst.set_bbox_changed();
			if (!this.testOverlap(inst, otherinst)) return true
		}
		inst.x = oldx;
		inst.y = oldy;
		inst.set_bbox_changed();
		return false
	};
	Runtime.prototype.pushInFractional = function(inst, xdir, ydir, obj, limit) {
		var divisor = 2;
		var frac;
		var forward = false;
		var overlapping = false;
		var bestx = inst.x;
		var besty = inst.y;
		while (divisor <= limit) {
			frac = 1 / divisor;
			divisor *= 2;
			inst.x += xdir * frac * (forward ? 1 : -1);
			inst.y += ydir * frac * (forward ? 1 : -1);
			inst.set_bbox_changed();
			if (this.testOverlap(inst, obj)) {
				forward = true;
				overlapping = true
			} else {
				forward = false;
				overlapping = false;
				bestx = inst.x;
				besty = inst.y
			}
		}
		if (overlapping) {
			inst.x = bestx;
			inst.y = besty;
			inst.set_bbox_changed()
		}
	};
	Runtime.prototype.pushOutSolidNearest = function(inst, max_dist_) {
		var max_dist = cr.is_undefined(max_dist_) ? 100 : max_dist_;
		var dist = 0;
		var oldx = inst.x;
		var oldy = inst.y;
		var dir = 0;
		var dx = 0,
			dy = 0;
		var last_overlapped = this.testOverlapSolid(inst);
		if (!last_overlapped) return true;
		while (dist <= max_dist) {
			switch (dir) {
			case 0:
				dx = 0;
				dy = -1;
				dist++;
				break;
			case 1:
				dx = 1;
				dy = -1;
				break;
			case 2:
				dx = 1;
				dy = 0;
				break;
			case 3:
				dx = 1;
				dy = 1;
				break;
			case 4:
				dx = 0;
				dy = 1;
				break;
			case 5:
				dx = -1;
				dy = 1;
				break;
			case 6:
				dx = -1;
				dy = 0;
				break;
			case 7:
				dx = -1;
				dy = -1;
				break
			}
			dir = (dir + 1) % 8;
			inst.x = cr.floor(oldx + dx * dist);
			inst.y = cr.floor(oldy + dy * dist);
			inst.set_bbox_changed();
			if (!this.testOverlap(inst, last_overlapped)) {
				last_overlapped = this.testOverlapSolid(inst);
				if (!last_overlapped) return true
			}
		}
		inst.x = oldx;
		inst.y = oldy;
		inst.set_bbox_changed();
		return false
	};
	Runtime.prototype.registerCollision = function(a, b) {
		if (!a.collisionsEnabled || !b.collisionsEnabled) return;
		this.registered_collisions.push([a, b])
	};
	Runtime.prototype.checkRegisteredCollision = function(a, b) {
		var i, len, x;
		for (i = 0, len = this.registered_collisions.length; i < len; i++) {
			x = this.registered_collisions[i];
			if (x[0] == a && x[1] == b || x[0] == b && x[1] == a) return true
		}
		return false
	};
	Runtime.prototype.calculateSolidBounceAngle = function(inst, startx, starty, obj) {
		var objx = inst.x;
		var objy = inst.y;
		var radius = cr.max(10, cr.distanceTo(startx, starty, objx, objy));
		var startangle = cr.angleTo(startx, starty, objx, objy);
		var firstsolid = obj || this.testOverlapSolid(inst);
		if (!firstsolid) return cr.clamp_angle(startangle + cr.PI);
		var cursolid = firstsolid;
		var i, curangle, anticlockwise_free_angle, clockwise_free_angle;
		var increment = cr.to_radians(5);
		for (i = 1; i < 36; i++) {
			curangle = startangle - i * increment;
			inst.x = startx + Math.cos(curangle) * radius;
			inst.y = starty + Math.sin(curangle) * radius;
			inst.set_bbox_changed();
			if (!this.testOverlap(inst, cursolid)) {
				cursolid = obj ? null : this.testOverlapSolid(inst);
				if (!cursolid) {
					anticlockwise_free_angle = curangle;
					break
				}
			}
		}
		if (i === 36) anticlockwise_free_angle = cr.clamp_angle(startangle + cr.PI);
		var cursolid = firstsolid;
		for (i = 1; i < 36; i++) {
			curangle = startangle + i * increment;
			inst.x = startx + Math.cos(curangle) * radius;
			inst.y = starty + Math.sin(curangle) * radius;
			inst.set_bbox_changed();
			if (!this.testOverlap(inst, cursolid)) {
				cursolid = obj ? null : this.testOverlapSolid(inst);
				if (!cursolid) {
					clockwise_free_angle = curangle;
					break
				}
			}
		}
		if (i === 36) clockwise_free_angle = cr.clamp_angle(startangle + cr.PI);
		inst.x = objx;
		inst.y = objy;
		inst.set_bbox_changed();
		if (clockwise_free_angle === anticlockwise_free_angle) return clockwise_free_angle;
		var half_diff = cr.angleDiff(clockwise_free_angle, anticlockwise_free_angle) / 2;
		var normal;
		if (cr.angleClockwise(clockwise_free_angle, anticlockwise_free_angle)) {
			normal = cr.clamp_angle(anticlockwise_free_angle + half_diff + cr.PI)
		} else {
			normal = cr.clamp_angle(clockwise_free_angle + half_diff)
		}
		var vx = Math.cos(startangle);
		var vy = Math.sin(startangle);
		var nx = Math.cos(normal);
		var ny = Math.sin(normal);
		var v_dot_n = vx * nx + vy * ny;
		var rx = vx - 2 * v_dot_n * nx;
		var ry = vy - 2 * v_dot_n * ny;
		return cr.angleTo(0, 0, rx, ry)
	};
	var triggerSheetIndex = -1;
	Runtime.prototype.trigger = function(method, inst, value) {
		if (!this.running_layout) return false;
		var sheet = this.running_layout.event_sheet;
		if (!sheet) return false;
		var ret = false;
		var r, i, len;
		triggerSheetIndex++;
		var deep_includes = sheet.deep_includes;
		for (i = 0, len = deep_includes.length; i < len; ++i) {
			r = this.triggerOnSheet(method, inst, deep_includes[i], value);
			ret = ret || r
		}
		r = this.triggerOnSheet(method, inst, sheet, value);
		ret = ret || r;
		triggerSheetIndex--;
		return ret
	};
	Runtime.prototype.triggerOnSheet = function(method, inst, sheet, value) {
		var ret = false;
		var i, leni, r, families;
		if (!inst) {
			r = this.triggerOnSheetForTypeName(method, inst, "system", sheet, value);
			ret = ret || r
		} else {
			r = this.triggerOnSheetForTypeName(method, inst, inst.type.name, sheet, value);
			ret = ret || r;
			families = inst.type.families;
			for (i = 0, leni = families.length; i < leni; ++i) {
				r = this.triggerOnSheetForTypeName(method, inst, families[i].name, sheet, value);
				ret = ret || r
			}
		}
		return ret
	};
	Runtime.prototype.triggerOnSheetForTypeName = function(method, inst, type_name, sheet, value) {
		var i, leni;
		var ret = false,
			ret2 = false;
		var trig, index;
		var fasttrigger = typeof value !== "undefined";
		var triggers = fasttrigger ? sheet.fasttriggers : sheet.triggers;
		var obj_entry = triggers[type_name];
		if (!obj_entry) return ret;
		var triggers_list = null;
		for (i = 0, leni = obj_entry.length; i < leni; ++i) {
			if (obj_entry[i].method == method) {
				triggers_list = obj_entry[i].evs;
				break
			}
		}
		if (!triggers_list) return ret;
		var triggers_to_fire;
		if (fasttrigger) {
			triggers_to_fire = triggers_list[value]
		} else {
			triggers_to_fire = triggers_list
		}
		if (!triggers_to_fire) return null;
		for (i = 0, leni = triggers_to_fire.length; i < leni; i++) {
			trig = triggers_to_fire[i][0];
			index = triggers_to_fire[i][1];
			ret2 = this.executeSingleTrigger(inst, type_name, trig, index);
			ret = ret || ret2
		}
		return ret
	};
	Runtime.prototype.executeSingleTrigger = function(inst, type_name, trig, index) {
		var i, leni;
		var ret = false;
		this.trigger_depth++;
		var current_event = this.getCurrentEventStack().current_event;
		if (current_event) this.pushCleanSol(current_event.solModifiersIncludingParents);
		var isrecursive = this.trigger_depth > 1;
		this.pushCleanSol(trig.solModifiersIncludingParents);
		if (isrecursive) this.pushLocalVarStack();
		var event_stack = this.pushEventStack(trig);
		event_stack.current_event = trig;
		if (inst) {
			var sol = this.types[type_name].getCurrentSol();
			sol.select_all = false;
			cr.clearArray(sol.instances);
			sol.instances[0] = inst;
			this.types[type_name].applySolToContainer()
		}
		var ok_to_run = true;
		if (trig.parent) {
			var temp_parents_arr = event_stack.temp_parents_arr;
			var cur_parent = trig.parent;
			while (cur_parent) {
				temp_parents_arr.push(cur_parent);
				cur_parent = cur_parent.parent
			}
			temp_parents_arr.reverse();
			for (i = 0, leni = temp_parents_arr.length; i < leni; i++) {
				if (!temp_parents_arr[i].run_pretrigger()) {
					ok_to_run = false;
					break
				}
			}
		}
		if (ok_to_run) {
			this.execcount++;
			if (trig.orblock) trig.run_orblocktrigger(index);
			else trig.run();
			ret = ret || event_stack.last_event_true
		}
		this.popEventStack();
		if (isrecursive) this.popLocalVarStack();
		this.popSol(trig.solModifiersIncludingParents);
		if (current_event) this.popSol(current_event.solModifiersIncludingParents);
		if (this.hasPendingInstances && this.isInOnDestroy === 0 && triggerSheetIndex === 0 && !this.isRunningEvents) {
			this.ClearDeathRow()
		}
		this.trigger_depth--;
		return ret
	};
	Runtime.prototype.getCurrentCondition = function() {
		var evinfo = this.getCurrentEventStack();
		return evinfo.current_event.conditions[evinfo.cndindex]
	};
	Runtime.prototype.getCurrentAction = function() {
		var evinfo = this.getCurrentEventStack();
		return evinfo.current_event.actions[evinfo.actindex]
	};
	Runtime.prototype.pushLocalVarStack = function() {
		this.localvar_stack_index++;
		if (this.localvar_stack_index >= this.localvar_stack.length) this.localvar_stack.push([])
	};
	Runtime.prototype.popLocalVarStack = function() {
		this.localvar_stack_index--
	};
	Runtime.prototype.getCurrentLocalVarStack = function() {
		return this.localvar_stack[this.localvar_stack_index]
	};
	Runtime.prototype.pushEventStack = function(cur_event) {
		this.event_stack_index++;
		if (this.event_stack_index >= this.event_stack.length) this.event_stack.push(new cr.eventStackFrame);
		var ret = this.getCurrentEventStack();
		ret.reset(cur_event);
		return ret
	};
	Runtime.prototype.popEventStack = function() {
		this.event_stack_index--
	};
	Runtime.prototype.getCurrentEventStack = function() {
		return this.event_stack[this.event_stack_index]
	};
	Runtime.prototype.pushLoopStack = function(name_) {
		this.loop_stack_index++;
		if (this.loop_stack_index >= this.loop_stack.length) {
			this.loop_stack.push(cr.seal({
				name: name_,
				index: 0,
				stopped: false
			}))
		}
		var ret = this.getCurrentLoop();
		ret.name = name_;
		ret.index = 0;
		ret.stopped = false;
		return ret
	};
	Runtime.prototype.popLoopStack = function() {
		this.loop_stack_index--
	};
	Runtime.prototype.getCurrentLoop = function() {
		return this.loop_stack[this.loop_stack_index]
	};
	Runtime.prototype.getEventVariableByName = function(name, scope) {
		var i, leni, j, lenj, sheet, e;
		while (scope) {
			for (i = 0, leni = scope.subevents.length; i < leni; i++) {
				e = scope.subevents[i];
				if (e instanceof cr.eventvariable && cr.equals_nocase(name, e.name)) return e
			}
			scope = scope.parent
		}
		for (i = 0, leni = this.eventsheets_by_index.length; i < leni; i++) {
			sheet = this.eventsheets_by_index[i];
			for (j = 0, lenj = sheet.events.length; j < lenj; j++) {
				e = sheet.events[j];
				if (e instanceof cr.eventvariable && cr.equals_nocase(name, e.name)) return e
			}
		}
		return null
	};
	Runtime.prototype.getLayoutBySid = function(sid_) {
		var i, len;
		for (i = 0, len = this.layouts_by_index.length; i < len; i++) {
			if (this.layouts_by_index[i].sid === sid_) return this.layouts_by_index[i]
		}
		return null
	};
	Runtime.prototype.getObjectTypeBySid = function(sid_) {
		var i, len;
		for (i = 0, len = this.types_by_index.length; i < len; i++) {
			if (this.types_by_index[i].sid === sid_) return this.types_by_index[i]
		}
		return null
	};
	Runtime.prototype.getGroupBySid = function(sid_) {
		var i, len;
		for (i = 0, len = this.allGroups.length; i < len; i++) {
			if (this.allGroups[i].sid === sid_) return this.allGroups[i]
		}
		return null
	};
	Runtime.prototype.doCanvasSnapshot = function(format_, quality_) {
		this.snapshotCanvas = [format_, quality_];
		this.redraw = true
	};

	function makeSaveDb(e) {
		var db = e.target.result;
		db.createObjectStore("saves", {
			keyPath: "slot"
		})
	}
	function IndexedDB_WriteSlot(slot_, data_, oncomplete_, onerror_) {
		var request = indexedDB.open("_C2SaveStates");
		request.onupgradeneeded = makeSaveDb;
		request.onerror = onerror_;
		request.onsuccess = function(e) {
			var db = e.target.result;
			db.onerror = onerror_;
			var transaction = db.transaction(["saves"], "readwrite");
			var objectStore = transaction.objectStore("saves");
			var putReq = objectStore.put({
				slot: slot_,
				data: data_
			});
			putReq.onsuccess = oncomplete_
		}
	}
	function IndexedDB_ReadSlot(slot_, oncomplete_, onerror_) {
		var request = indexedDB.open("_C2SaveStates");
		request.onupgradeneeded = makeSaveDb;
		request.onerror = onerror_;
		request.onsuccess = function(e) {
			var db = e.target.result;
			db.onerror = onerror_;
			var transaction = db.transaction(["saves"]);
			var objectStore = transaction.objectStore("saves");
			var readReq = objectStore.get(slot_);
			readReq.onsuccess = function(e) {
				if (readReq.result) oncomplete_(readReq.result["data"]);
				else oncomplete_(null)
			}
		}
	}
	Runtime.prototype.signalContinuousPreview = function() {
		this.signalledContinuousPreview = true
	};

	function doContinuousPreviewReload() {
		cr.logexport("Reloading for continuous preview");
		if ( !! window["c2cocoonjs"]) {
			CocoonJS["App"]["reload"]()
		} else {
			if (window.location.search.indexOf("continuous") > -1) window.location.reload(true);
			else window.location = window.location + "?continuous"
		}
	}
	Runtime.prototype.handleSaveLoad = function() {
		var self = this;
		var savingToSlot = this.saveToSlot;
		var savingJson = this.lastSaveJson;
		var loadingFromSlot = this.loadFromSlot;
		var continuous = false;
		if (this.signalledContinuousPreview) {
			continuous = true;
			savingToSlot = "__c2_continuouspreview";
			this.signalledContinuousPreview = false
		}
		if (savingToSlot.length) {
			this.ClearDeathRow();
			savingJson = this.saveToJSONString();
			if (window.indexedDB && !this.isCocoonJs) {
				IndexedDB_WriteSlot(savingToSlot, savingJson, function() {
					cr.logexport("Saved state to IndexedDB storage (" + savingJson.length + " bytes)");
					self.lastSaveJson = savingJson;
					self.trigger(cr.system_object.prototype.cnds.OnSaveComplete, null);
					self.lastSaveJson = "";
					if (continuous) doContinuousPreviewReload()
				}, function(e) {
					try {
						localStorage.setItem("__c2save_" + savingToSlot, savingJson);
						cr.logexport("Saved state to WebStorage (" + savingJson.length + " bytes)");

						self.lastSaveJson = savingJson;
						self.trigger(cr.system_object.prototype.cnds.OnSaveComplete, null);
						self.lastSaveJson = "";
						if (continuous) doContinuousPreviewReload()
					} catch (f) {
						cr.logexport("Failed to save game state: " + e + "; " + f)
					}
				})
			} else {
				try {
					localStorage.setItem("__c2save_" + savingToSlot, savingJson);
					cr.logexport("Saved state to WebStorage (" + savingJson.length + " bytes)");
					self.lastSaveJson = savingJson;
					this.trigger(cr.system_object.prototype.cnds.OnSaveComplete, null);
					self.lastSaveJson = "";
					if (continuous) doContinuousPreviewReload()
				} catch (e) {
					cr.logexport("Error saving to WebStorage: " + e)
				}
			}
			this.saveToSlot = "";
			this.loadFromSlot = "";
			this.loadFromJson = ""
		}
		if (loadingFromSlot.length) {
			if (window.indexedDB && !this.isCocoonJs) {
				IndexedDB_ReadSlot(loadingFromSlot, function(result_) {
					if (result_) {
						self.loadFromJson = result_;
						cr.logexport("Loaded state from IndexedDB storage (" + self.loadFromJson.length + " bytes)")
					} else {
						self.loadFromJson = localStorage.getItem("__c2save_" + loadingFromSlot) || "";
						cr.logexport("Loaded state from WebStorage (" + self.loadFromJson.length + " bytes)")
					}
					self.suspendDrawing = false;
					if (!self.loadFromJson.length) self.trigger(cr.system_object.prototype.cnds.OnLoadFailed, null)
				}, function(e) {
					self.loadFromJson = localStorage.getItem("__c2save_" + loadingFromSlot) || "";
					cr.logexport("Loaded state from WebStorage (" + self.loadFromJson.length + " bytes)");
					self.suspendDrawing = false;
					if (!self.loadFromJson.length) self.trigger(cr.system_object.prototype.cnds.OnLoadFailed, null)
				})
			} else {
				try {
					this.loadFromJson = localStorage.getItem("__c2save_" + loadingFromSlot) || "";
					cr.logexport("Loaded state from WebStorage (" + this.loadFromJson.length + " bytes)")
				} catch (e) {
					this.loadFromJson = ""
				}
				this.suspendDrawing = false;
				if (!self.loadFromJson.length) self.trigger(cr.system_object.prototype.cnds.OnLoadFailed, null)
			}
			this.loadFromSlot = "";
			this.saveToSlot = ""
		}
		if (this.loadFromJson.length) {
			this.ClearDeathRow();
			this.loadFromJSONString(this.loadFromJson);
			this.lastSaveJson = this.loadFromJson;
			this.trigger(cr.system_object.prototype.cnds.OnLoadComplete, null);
			this.lastSaveJson = "";
			this.loadFromJson = ""
		}
	};

	function CopyExtraObject(extra) {
		var p, ret = {};
		for (p in extra) {
			if (extra.hasOwnProperty(p)) {
				if (extra[p] instanceof cr.ObjectSet) continue;
				if (extra[p] && typeof extra[p].c2userdata !== "undefined") continue;
				if (p === "spriteCreatedDestroyCallback") continue;
				ret[p] = extra[p]
			}
		}
		return ret
	}
	Runtime.prototype.saveToJSONString = function() {
		var i, len, j, lenj, type, layout, typeobj, g, c, a, v, p;
		var o = {
			c2save: true,
			version: 1,
			rt: {
				time: this.kahanTime.sum,
				walltime: this.wallTime.sum,
				timescale: this.timescale,
				tickcount: this.tickcount,
				execcount: this.execcount,
				next_uid: this.next_uid,
				running_layout: this.running_layout.sid,
				start_time_offset: Date.now() - this.start_time
			},
			types: {},
			layouts: {},
			events: {
				groups: {},
				cnds: {},
				acts: {},
				vars: {}
			}
		};
		for (i = 0, len = this.types_by_index.length; i < len; i++) {
			type = this.types_by_index[i];
			if (type.is_family || this.typeHasNoSaveBehavior(type)) continue;
			typeobj = {
				instances: []
			};
			if (cr.hasAnyOwnProperty(type.extra)) typeobj["ex"] = CopyExtraObject(type.extra);
			for (j = 0, lenj = type.instances.length; j < lenj; j++) {
				typeobj["instances"].push(this.saveInstanceToJSON(type.instances[j]))
			}
			o["types"][type.sid.toString()] = typeobj
		}
		for (i = 0, len = this.layouts_by_index.length; i < len; i++) {
			layout = this.layouts_by_index[i];
			o["layouts"][layout.sid.toString()] = layout.saveToJSON()
		}
		var ogroups = o["events"]["groups"];
		for (i = 0, len = this.allGroups.length; i < len; i++) {
			g = this.allGroups[i];
			ogroups[g.sid.toString()] = this.groups_by_name[g.group_name].group_active
		}
		var ocnds = o["events"]["cnds"];
		for (p in this.cndsBySid) {
			if (this.cndsBySid.hasOwnProperty(p)) {
				c = this.cndsBySid[p];
				if (cr.hasAnyOwnProperty(c.extra)) ocnds[p] = {
					ex: CopyExtraObject(c.extra)
				}
			}
		}
		var oacts = o["events"]["acts"];
		for (p in this.actsBySid) {
			if (this.actsBySid.hasOwnProperty(p)) {
				a = this.actsBySid[p];
				if (cr.hasAnyOwnProperty(a.extra)) oacts[p] = {
					ex: a.extra
				}
			}
		}
		var ovars = o["events"]["vars"];
		for (p in this.varsBySid) {
			if (this.varsBySid.hasOwnProperty(p)) {
				v = this.varsBySid[p];
				if (!v.is_constant && (!v.parent || v.is_static)) ovars[p] = v.data
			}
		}
		o["system"] = this.system.saveToJSON();
		return JSON.stringify(o)
	};
	Runtime.prototype.refreshUidMap = function() {
		var i, len, type, j, lenj, inst;
		this.objectsByUid = {};
		for (i = 0, len = this.types_by_index.length; i < len; i++) {
			type = this.types_by_index[i];
			if (type.is_family) continue;
			for (j = 0, lenj = type.instances.length; j < lenj; j++) {
				inst = type.instances[j];
				this.objectsByUid[inst.uid.toString()] = inst
			}
		}
	};
	Runtime.prototype.loadFromJSONString = function(str) {
		var o = JSON.parse(str);
		if (!o["c2save"]) return;
		if (o["version"] > 1) return;
		this.isLoadingState = true;
		var rt = o["rt"];
		this.kahanTime.reset();
		this.kahanTime.sum = rt["time"];
		this.wallTime.reset();
		this.wallTime.sum = rt["walltime"] || 0;
		this.timescale = rt["timescale"];
		this.tickcount = rt["tickcount"];
		this.execcount = rt["execcount"];
		this.start_time = Date.now() - rt["start_time_offset"];
		var layout_sid = rt["running_layout"];
		if (layout_sid !== this.running_layout.sid) {
			var changeToLayout = this.getLayoutBySid(layout_sid);
			if (changeToLayout) this.doChangeLayout(changeToLayout);
			else return
		}
		var i, len, j, lenj, k, lenk, p, type, existing_insts, load_insts, inst, binst, layout, layer, g, iid, t;
		var otypes = o["types"];
		for (p in otypes) {
			if (otypes.hasOwnProperty(p)) {
				type = this.getObjectTypeBySid(parseInt(p, 10));
				if (!type || type.is_family || this.typeHasNoSaveBehavior(type)) continue;
				if (otypes[p]["ex"]) type.extra = otypes[p]["ex"];
				else cr.wipe(type.extra);
				existing_insts = type.instances;
				load_insts = otypes[p]["instances"];
				for (i = 0, len = cr.min(existing_insts.length, load_insts.length); i < len; i++) {
					this.loadInstanceFromJSON(existing_insts[i], load_insts[i])
				}
				for (i = load_insts.length, len = existing_insts.length; i < len; i++) this.DestroyInstance(existing_insts[i]);
				for (i = existing_insts.length, len = load_insts.length; i < len; i++) {
					layer = null;
					if (type.plugin.is_world) {
						layer = this.running_layout.getLayerBySid(load_insts[i]["w"]["l"]);
						if (!layer) continue
					}
					inst = this.createInstanceFromInit(type.default_instance, layer, false, 0, 0, true);
					this.loadInstanceFromJSON(inst, load_insts[i])
				}
				type.stale_iids = true
			}
		}
		this.ClearDeathRow();
		this.refreshUidMap();
		var olayouts = o["layouts"];
		for (p in olayouts) {
			if (olayouts.hasOwnProperty(p)) {
				layout = this.getLayoutBySid(parseInt(p, 10));
				if (!layout) continue;
				layout.loadFromJSON(olayouts[p])
			}
		}
		var ogroups = o["events"]["groups"];
		for (p in ogroups) {
			if (ogroups.hasOwnProperty(p)) {
				g = this.getGroupBySid(parseInt(p, 10));
				if (g && this.groups_by_name[g.group_name]) this.groups_by_name[g.group_name].setGroupActive(ogroups[p])
			}
		}
		var ocnds = o["events"]["cnds"];
		for (p in ocnds) {
			if (ocnds.hasOwnProperty(p) && this.cndsBySid.hasOwnProperty(p)) {
				this.cndsBySid[p].extra = ocnds[p]["ex"]
			}
		}
		var oacts = o["events"]["acts"];
		for (p in oacts) {
			if (oacts.hasOwnProperty(p) && this.actsBySid.hasOwnProperty(p)) {
				this.actsBySid[p].extra = oacts[p]["ex"]
			}
		}
		var ovars = o["events"]["vars"];
		for (p in ovars) {
			if (ovars.hasOwnProperty(p) && this.varsBySid.hasOwnProperty(p)) {
				this.varsBySid[p].data = ovars[p]
			}
		}
		this.next_uid = rt["next_uid"];
		this.isLoadingState = false;
		this.system.loadFromJSON(o["system"]);
		for (i = 0, len = this.types_by_index.length; i < len; i++) {
			type = this.types_by_index[i];
			if (type.is_family || this.typeHasNoSaveBehavior(type)) continue;
			for (j = 0, lenj = type.instances.length; j < lenj; j++) {
				inst = type.instances[j];
				if (type.is_contained) {
					iid = inst.get_iid();
					cr.clearArray(inst.siblings);
					for (k = 0, lenk = type.container.length; k < lenk; k++) {
						t = type.container[k];
						if (type === t) continue;
						inst.siblings.push(t.instances[iid])
					}
				}
				if (inst.afterLoad) inst.afterLoad();
				if (inst.behavior_insts) {
					for (k = 0, lenk = inst.behavior_insts.length; k < lenk; k++) {
						binst = inst.behavior_insts[k];
						if (binst.afterLoad) binst.afterLoad()
					}
				}
			}
		}
		this.redraw = true
	};
	Runtime.prototype.saveInstanceToJSON = function(inst, state_only) {
		var i, len, world, behinst, et;
		var type = inst.type;
		var plugin = type.plugin;
		var o = {};
		if (state_only) o["c2"] = true;
		else o["uid"] = inst.uid;
		if (cr.hasAnyOwnProperty(inst.extra)) o["ex"] = CopyExtraObject(inst.extra);
		if (inst.instance_vars && inst.instance_vars.length) {
			o["ivs"] = {};
			for (i = 0, len = inst.instance_vars.length; i < len; i++) {
				o["ivs"][inst.type.instvar_sids[i].toString()] = inst.instance_vars[i]
			}
		}
		if (plugin.is_world) {
			world = {
				x: inst.x,
				y: inst.y,
				w: inst.width,
				h: inst.height,
				l: inst.layer.sid,
				zi: inst.get_zindex()
			};
			if (inst.angle !== 0) world["a"] = inst.angle;
			if (inst.opacity !== 1) world["o"] = inst.opacity;
			if (inst.hotspotX !== .5) world["hX"] = inst.hotspotX;
			if (inst.hotspotY !== .5) world["hY"] = inst.hotspotY;
			if (inst.blend_mode !== 0) world["bm"] = inst.blend_mode;
			if (!inst.visible) world["v"] = inst.visible;
			if (!inst.collisionsEnabled) world["ce"] = inst.collisionsEnabled;
			if (inst.my_timescale !== -1) world["mts"] = inst.my_timescale;
			if (type.effect_types.length) {
				world["fx"] = [];
				for (i = 0, len = type.effect_types.length; i < len; i++) {
					et = type.effect_types[i];
					world["fx"].push({
						name: et.name,
						active: inst.active_effect_flags[et.index],
						params: inst.effect_params[et.index]
					})
				}
			}
			o["w"] = world
		}
		if (inst.behavior_insts && inst.behavior_insts.length) {
			o["behs"] = {};
			for (i = 0, len = inst.behavior_insts.length; i < len; i++) {
				behinst = inst.behavior_insts[i];
				if (behinst.saveToJSON) o["behs"][behinst.type.sid.toString()] = behinst.saveToJSON()
			}
		}
		if (inst.saveToJSON) o["data"] = inst.saveToJSON();
		return o
	};
	Runtime.prototype.getInstanceVarIndexBySid = function(type, sid_) {
		var i, len;
		for (i = 0, len = type.instvar_sids.length; i < len; i++) {
			if (type.instvar_sids[i] === sid_) return i
		}
		return -1
	};
	Runtime.prototype.getBehaviorIndexBySid = function(inst, sid_) {
		var i, len;
		for (i = 0, len = inst.behavior_insts.length; i < len; i++) {
			if (inst.behavior_insts[i].type.sid === sid_) return i
		}
		return -1
	};
	Runtime.prototype.loadInstanceFromJSON = function(inst, o, state_only) {
		var p, i, len, iv, oivs, world, fxindex, obehs, behindex;
		var oldlayer;
		var type = inst.type;
		var plugin = type.plugin;
		if (state_only) {
			if (!o["c2"]) return
		} else inst.uid = o["uid"];
		if (o["ex"]) inst.extra = o["ex"];
		else cr.wipe(inst.extra);
		oivs = o["ivs"];
		if (oivs) {
			for (p in oivs) {
				if (oivs.hasOwnProperty(p)) {
					iv = this.getInstanceVarIndexBySid(type, parseInt(p, 10));
					if (iv < 0 || iv >= inst.instance_vars.length) continue;
					inst.instance_vars[iv] = oivs[p]
				}
			}
		}
		if (plugin.is_world) {
			world = o["w"];
			if (inst.layer.sid !== world["l"]) {
				oldlayer = inst.layer;
				inst.layer = this.running_layout.getLayerBySid(world["l"]);
				if (inst.layer) {
					oldlayer.removeFromInstanceList(inst, true);
					inst.layer.appendToInstanceList(inst, true);
					inst.set_bbox_changed();
					inst.layer.setZIndicesStaleFrom(0)
				} else {
					inst.layer = oldlayer;
					if (!state_only) this.DestroyInstance(inst)
				}
			}
			inst.x = world["x"];
			inst.y = world["y"];
			inst.width = world["w"];
			inst.height = world["h"];
			inst.zindex = world["zi"];
			inst.angle = world.hasOwnProperty("a") ? world["a"] : 0;
			inst.opacity = world.hasOwnProperty("o") ? world["o"] : 1;
			inst.hotspotX = world.hasOwnProperty("hX") ? world["hX"] : .5;
			inst.hotspotY = world.hasOwnProperty("hY") ? world["hY"] : .5;
			inst.visible = world.hasOwnProperty("v") ? world["v"] : true;
			inst.collisionsEnabled = world.hasOwnProperty("ce") ? world["ce"] : true;
			inst.my_timescale = world.hasOwnProperty("mts") ? world["mts"] : -1;
			inst.blend_mode = world.hasOwnProperty("bm") ? world["bm"] : 0;
			inst.compositeOp = cr.effectToCompositeOp(inst.blend_mode);
			if (this.gl) cr.setGLBlend(inst, inst.blend_mode, this.gl);
			inst.set_bbox_changed();
			if (world.hasOwnProperty("fx")) {
				for (i = 0, len = world["fx"].length; i < len; i++) {
					fxindex = type.getEffectIndexByName(world["fx"][i]["name"]);
					if (fxindex < 0) continue;
					inst.active_effect_flags[fxindex] = world["fx"][i]["active"];
					inst.effect_params[fxindex] = world["fx"][i]["params"]
				}
			}
			inst.updateActiveEffects()
		}
		obehs = o["behs"];
		if (obehs) {
			for (p in obehs) {
				if (obehs.hasOwnProperty(p)) {
					behindex = this.getBehaviorIndexBySid(inst, parseInt(p, 10));
					if (behindex < 0) continue;
					inst.behavior_insts[behindex].loadFromJSON(obehs[p])
				}
			}
		}
		if (o["data"]) inst.loadFromJSON(o["data"])
	};
	cr.runtime = Runtime;
	cr.createRuntime = function(canvasid) {
		return new Runtime(document.getElementById(canvasid))
	};
	cr.createDCRuntime = function(w, h) {
		return new Runtime({
			dc: true,
			width: w,
			height: h
		})
	};
	window["cr_createRuntime"] = cr.createRuntime;
	window["cr_createDCRuntime"] = cr.createDCRuntime;
	window["createCocoonJSRuntime"] = function() {
		window["c2cocoonjs"] = true;
		var canvas = document.createElement("screencanvas") || document.createElement("canvas");
		canvas.screencanvas = true;
		document.body.appendChild(canvas);
		var rt = new Runtime(canvas);
		window["c2runtime"] = rt;
		window.addEventListener("orientationchange", function() {
			window["c2runtime"]["setSize"](window.innerWidth, window.innerHeight)
		});
		window["c2runtime"]["setSize"](window.innerWidth, window.innerHeight);
		return rt
	};
	window["createEjectaRuntime"] = function() {
		var canvas = document.getElementById("canvas");
		var rt = new Runtime(canvas);
		window["c2runtime"] = rt;
		window["c2runtime"]["setSize"](window.innerWidth, window.innerHeight);
		return rt
	}
})();
window["cr_getC2Runtime"] = function() {
	var canvas = document.getElementById("c2canvas");
	if (canvas) return canvas["c2runtime"];
	else if (window["c2runtime"]) return window["c2runtime"];
	else return null
};
window["cr_getSnapshot"] = function(format_, quality_) {
	var runtime = window["cr_getC2Runtime"]();
	if (runtime) runtime.doCanvasSnapshot(format_, quality_)
};
window["cr_sizeCanvas"] = function(w, h) {
	if (w === 0 || h === 0) return;
	var runtime = window["cr_getC2Runtime"]();
	if (runtime) runtime["setSize"](w, h)
};
window["cr_setSuspended"] = function(s) {
	var runtime = window["cr_getC2Runtime"]();
	if (runtime) runtime["setSuspended"](s)
};
(function() {
	function Layout(runtime, m) {
		this.runtime = runtime;
		this.event_sheet = null;
		this.scrollX = this.runtime.original_width / 2;
		this.scrollY = this.runtime.original_height / 2;
		this.scale = 1;
		this.angle = 0;
		this.first_visit = true;
		this.name = m[0];
		this.width = m[1];
		this.height = m[2];
		this.unbounded_scrolling = m[3];
		this.sheetname = m[4];
		this.sid = m[5];
		var lm = m[6];
		var i, len;
		this.layers = [];
		this.initial_types = [];
		for (i = 0, len = lm.length; i < len; i++) {
			var layer = new cr.layer(this, lm[i]);
			layer.number = i;
			cr.seal(layer);
			this.layers.push(layer)
		}
		var im = m[7];
		this.initial_nonworld = [];
		for (i = 0, len = im.length; i < len; i++) {
			var inst = im[i];
			var type = this.runtime.types_by_index[inst[1]];
			if (!type.default_instance) type.default_instance = inst;
			this.initial_nonworld.push(inst);
			if (this.initial_types.indexOf(type) === -1) this.initial_types.push(type)
		}
		this.effect_types = [];
		this.active_effect_types = [];
		this.shaders_preserve_opaqueness = true;
		this.effect_params = [];
		for (i = 0, len = m[8].length; i < len; i++) {
			this.effect_types.push({
				id: m[8][i][0],
				name: m[8][i][1],
				shaderindex: -1,
				preservesOpaqueness: false,
				active: true,
				index: i
			});
			this.effect_params.push(m[8][i][2].slice(0))
		}
		this.updateActiveEffects();
		this.rcTex = new cr.rect(0, 0, 1, 1);
		this.rcTex2 = new cr.rect(0, 0, 1, 1);
		this.persist_data = {}
	}
	Layout.prototype.saveObjectToPersist = function(inst) {
		var sidStr = inst.type.sid.toString();
		if (!this.persist_data.hasOwnProperty(sidStr)) this.persist_data[sidStr] = [];
		var type_persist = this.persist_data[sidStr];
		type_persist.push(this.runtime.saveInstanceToJSON(inst))
	};
	Layout.prototype.hasOpaqueBottomLayer = function() {
		var layer = this.layers[0];
		return !layer.transparent && layer.opacity === 1 && !layer.forceOwnTexture && layer.visible
	};
	Layout.prototype.updateActiveEffects = function() {
		cr.clearArray(this.active_effect_types);
		this.shaders_preserve_opaqueness = true;
		var i, len, et;
		for (i = 0, len = this.effect_types.length; i < len; i++) {
			et = this.effect_types[i];
			if (et.active) {
				this.active_effect_types.push(et);
				if (!et.preservesOpaqueness) this.shaders_preserve_opaqueness = false
			}
		}
	};
	Layout.prototype.getEffectByName = function(name_) {
		var i, len, et;
		for (i = 0, len = this.effect_types.length; i < len; i++) {
			et = this.effect_types[i];
			if (et.name === name_) return et
		}
		return null
	};
	var created_instances = [];

	function sort_by_zindex(a, b) {
		return a.zindex - b.zindex
	}
	var first_layout = true;
	Layout.prototype.startRunning = function() {
		if (this.sheetname) {
			this.event_sheet = this.runtime.eventsheets[this.sheetname];
			this.event_sheet.updateDeepIncludes()
		}
		this.runtime.running_layout = this;
		this.scrollX = this.runtime.original_width / 2;
		this.scrollY = this.runtime.original_height / 2;
		var i, k, len, lenk, type, type_instances, inst, iid, t, s, p, q, type_data, layer;
		for (i = 0, len = this.runtime.types_by_index.length; i < len; i++) {
			type = this.runtime.types_by_index[i];
			if (type.is_family) continue;
			type_instances = type.instances;
			for (k = 0, lenk = type_instances.length; k < lenk; k++) {
				inst = type_instances[k];
				if (inst.layer) {
					var num = inst.layer.number;
					if (num >= this.layers.length) num = this.layers.length - 1;
					inst.layer = this.layers[num];
					if (inst.layer.instances.indexOf(inst) === -1) inst.layer.instances.push(inst);
					inst.layer.zindices_stale = true
				}
			}
		}
		if (!first_layout) {
			for (i = 0, len = this.layers.length; i < len; ++i) {
				this.layers[i].instances.sort(sort_by_zindex)
			}
		}
		var layer;
		cr.clearArray(created_instances);
		this.boundScrolling();
		for (i = 0, len = this.layers.length; i < len; i++) {
			layer = this.layers[i];
			layer.createInitialInstances();
			layer.updateViewport(null)
		}
		var uids_changed = false;
		if (!this.first_visit) {
			for (p in this.persist_data) {
				if (this.persist_data.hasOwnProperty(p)) {
					type = this.runtime.getObjectTypeBySid(parseInt(p, 10));
					if (!type || type.is_family || !this.runtime.typeHasPersistBehavior(type)) continue;
					type_data = this.persist_data[p];
					for (i = 0, len = type_data.length; i < len; i++) {
						layer = null;
						if (type.plugin.is_world) {
							layer = this.getLayerBySid(type_data[i]["w"]["l"]);
							if (!layer) continue
						}
						inst = this.runtime.createInstanceFromInit(type.default_instance, layer, false, 0, 0, true);
						this.runtime.loadInstanceFromJSON(inst, type_data[i]);
						uids_changed = true;
						created_instances.push(inst)
					}
					cr.clearArray(type_data)
				}
			}
			for (i = 0, len = this.layers.length; i < len; i++) {
				this.layers[i].instances.sort(sort_by_zindex);
				this.layers[i].zindices_stale = true
			}
		}
		if (uids_changed) {
			this.runtime.ClearDeathRow();
			this.runtime.refreshUidMap()
		}
		for (i = 0; i < created_instances.length; i++) {
			inst = created_instances[i];
			if (!inst.type.is_contained) continue;
			iid = inst.get_iid();
			for (k = 0, lenk = inst.type.container.length; k < lenk; k++) {
				t = inst.type.container[k];
				if (inst.type === t) continue;
				if (t.instances.length > iid) inst.siblings.push(t.instances[iid]);
				else {
					if (!t.default_instance) {} else {
						s = this.runtime.createInstanceFromInit(t.default_instance, inst.layer, true, inst.x, inst.y, true);
						this.runtime.ClearDeathRow();
						t.updateIIDs();
						inst.siblings.push(s);
						created_instances.push(s)
					}
				}
			}
		}
		for (i = 0, len = this.initial_nonworld.length; i < len; i++) {
			inst = this.runtime.createInstanceFromInit(this.initial_nonworld[i], null, true)
		}
		this.runtime.changelayout = null;
		this.runtime.ClearDeathRow();
		if (this.runtime.ctx && !this.runtime.isDomFree) {
			for (i = 0, len = this.runtime.types_by_index.length; i < len; i++) {
				t = this.runtime.types_by_index[i];
				if (t.is_family || !t.instances.length || !t.preloadCanvas2D) continue;
				t.preloadCanvas2D(this.runtime.ctx)
			}
		}
		for (i = 0, len = created_instances.length; i < len; i++) {
			inst = created_instances[i];
			this.runtime.trigger(Object.getPrototypeOf(inst.type.plugin).cnds.OnCreated, inst)
		}
		cr.clearArray(created_instances);
		if (!this.runtime.isLoadingState) {
			this.runtime.trigger(cr.system_object.prototype.cnds.OnLayoutStart, null)
		}
		this.first_visit = false
	};
	Layout.prototype.createGlobalNonWorlds = function() {
		var i, k, len, initial_inst, inst, type;
		for (i = 0, k = 0, len = this.initial_nonworld.length; i < len; i++) {
			initial_inst = this.initial_nonworld[i];
			type = this.runtime.types_by_index[initial_inst[1]];
			if (type.global) {
				if (!type.is_contained) {
					inst = this.runtime.createInstanceFromInit(initial_inst, null, true)
				}
			} else {
				this.initial_nonworld[k] = initial_inst;
				k++
			}
		}
		cr.truncateArray(this.initial_nonworld, k)
	};
	Layout.prototype.stopRunning = function() {
		if (!this.runtime.isLoadingState) {
			this.runtime.trigger(cr.system_object.prototype.cnds.OnLayoutEnd, null)
		}
		this.runtime.isEndingLayout = true;
		cr.clearArray(this.runtime.system.waits);
		var i, leni, j, lenj;
		var layer_instances, inst, type;
		if (!this.first_visit) {
			for (i = 0, leni = this.layers.length; i < leni; i++) {
				this.layers[i].updateZIndices();
				layer_instances = this.layers[i].instances;
				for (j = 0, lenj = layer_instances.length; j < lenj; j++) {
					inst = layer_instances[j];
					if (!inst.type.global) {
						if (this.runtime.typeHasPersistBehavior(inst.type)) this.saveObjectToPersist(inst)
					}
				}
			}
		}
		for (i = 0, leni = this.layers.length; i < leni; i++) {
			layer_instances = this.layers[i].instances;
			for (j = 0, lenj = layer_instances.length; j < lenj; j++) {
				inst = layer_instances[j];
				if (!inst.type.global) {
					this.runtime.DestroyInstance(inst)
				}
			}
			this.runtime.ClearDeathRow();
			cr.clearArray(layer_instances);
			this.layers[i].zindices_stale = true
		}
		for (i = 0, leni = this.runtime.types_by_index.length; i < leni; i++) {
			type = this.runtime.types_by_index[i];
			if (type.global || type.plugin.is_world || type.plugin.singleglobal || type.is_family) continue;
			for (j = 0, lenj = type.instances.length; j < lenj; j++) this.runtime.DestroyInstance(type.instances[j]);
			this.runtime.ClearDeathRow()
		}
		first_layout = false;
		this.runtime.isEndingLayout = false
	};
	var temp_rect = new cr.rect(0, 0, 0, 0);
	Layout.prototype.recreateInitialObjects = function(type, x1, y1, x2, y2) {
		temp_rect.set(x1, y1, x2, y2);
		var i, len;
		for (i = 0, len = this.layers.length; i < len; i++) {
			this.layers[i].recreateInitialObjects(type, temp_rect)
		}
	};
	Layout.prototype.draw = function(ctx) {
		var layout_canvas;
		var layout_ctx = ctx;
		var ctx_changed = false;
		var render_offscreen = !this.runtime.fullscreenScalingQuality;
		if (render_offscreen) {
			if (!this.runtime.layout_canvas) {
				this.runtime.layout_canvas = document.createElement("canvas");
				layout_canvas = this.runtime.layout_canvas;
				layout_canvas.width = this.runtime.draw_width;
				layout_canvas.height = this.runtime.draw_height;
				this.runtime.layout_ctx = layout_canvas.getContext("2d");
				ctx_changed = true
			}
			layout_canvas = this.runtime.layout_canvas;
			layout_ctx = this.runtime.layout_ctx;
			if (layout_canvas.width !== this.runtime.draw_width) {
				layout_canvas.width = this.runtime.draw_width;
				ctx_changed = true
			}
			if (layout_canvas.height !== this.runtime.draw_height) {
				layout_canvas.height = this.runtime.draw_height;
				ctx_changed = true
			}
			if (ctx_changed) {
				layout_ctx["webkitImageSmoothingEnabled"] = this.runtime.linearSampling;
				layout_ctx["mozImageSmoothingEnabled"] = this.runtime.linearSampling;
				layout_ctx["msImageSmoothingEnabled"] = this.runtime.linearSampling;
				layout_ctx["imageSmoothingEnabled"] = this.runtime.linearSampling
			}
		}
		layout_ctx.globalAlpha = 1;
		layout_ctx.globalCompositeOperation = "source-over";
		if (this.runtime.alphaBackground && !this.hasOpaqueBottomLayer()) layout_ctx.clearRect(0, 0, this.runtime.draw_width, this.runtime.draw_height);
		var i, len, l;
		for (i = 0, len = this.layers.length; i < len; i++) {
			l = this.layers[i];
			if (l.visible && l.opacity > 0 && l.blend_mode !== 11 && (l.instances.length || !l.transparent)) l.draw(layout_ctx);
			else l.updateViewport(null)
		}
		if (render_offscreen) {
			ctx.drawImage(layout_canvas, 0, 0, this.runtime.width, this.runtime.height)
		}
	};
	Layout.prototype.drawGL_earlyZPass = function(glw) {
		glw.setEarlyZPass(true);
		if (!this.runtime.layout_tex) {
			this.runtime.layout_tex = glw.createEmptyTexture(this.runtime.draw_width, this.runtime.draw_height, this.runtime.linearSampling)
		}
		if (this.runtime.layout_tex.c2width !== this.runtime.draw_width || this.runtime.layout_tex.c2height !== this.runtime.draw_height) {
			glw.deleteTexture(this.runtime.layout_tex);
			this.runtime.layout_tex = glw.createEmptyTexture(this.runtime.draw_width, this.runtime.draw_height, this.runtime.linearSampling)
		}
		glw.setRenderingToTexture(this.runtime.layout_tex);
		if (!this.runtime.fullscreenScalingQuality) {
			glw.setSize(this.runtime.draw_width, this.runtime.draw_height)
		}
		var i, l;
		for (i = this.layers.length - 1; i >= 0; --i) {
			l = this.layers[i];
			if (l.visible && l.opacity === 1 && l.shaders_preserve_opaqueness && l.blend_mode === 0 && (l.instances.length || !l.transparent)) {
				l.drawGL_earlyZPass(glw)
			} else {
				l.updateViewport(null)
			}
		}
		glw.setEarlyZPass(false)
	};
	Layout.prototype.drawGL = function(glw) {
		var render_to_texture = this.active_effect_types.length > 0 || this.runtime.uses_background_blending || !this.runtime.fullscreenScalingQuality || this.runtime.enableFrontToBack;
		if (render_to_texture) {
			if (!this.runtime.layout_tex) {
				this.runtime.layout_tex = glw.createEmptyTexture(this.runtime.draw_width, this.runtime.draw_height, this.runtime.linearSampling)
			}
			if (this.runtime.layout_tex.c2width !== this.runtime.draw_width || this.runtime.layout_tex.c2height !== this.runtime.draw_height) {
				glw.deleteTexture(this.runtime.layout_tex);
				this.runtime.layout_tex = glw.createEmptyTexture(this.runtime.draw_width, this.runtime.draw_height, this.runtime.linearSampling)
			}
			glw.setRenderingToTexture(this.runtime.layout_tex);
			if (!this.runtime.fullscreenScalingQuality) {
				glw.setSize(this.runtime.draw_width, this.runtime.draw_height)
			}
		} else {
			if (this.runtime.layout_tex) {
				glw.setRenderingToTexture(null);
				glw.deleteTexture(this.runtime.layout_tex);
				this.runtime.layout_tex = null
			}
		}
		if (this.runtime.alphaBackground && !this.hasOpaqueBottomLayer()) glw.clear(0, 0, 0, 0);
		var i, len, l;
		for (i = 0, len = this.layers.length; i < len; i++) {
			l = this.layers[i];
			if (l.visible && l.opacity > 0 && (l.instances.length || !l.transparent)) l.drawGL(glw);
			else l.updateViewport(null)
		}
		if (render_to_texture) {
			if (this.active_effect_types.length === 0 || this.active_effect_types.length === 1 && this.runtime.fullscreenScalingQuality) {
				if (this.active_effect_types.length === 1) {
					var etindex = this.active_effect_types[0].index;
					glw.switchProgram(this.active_effect_types[0].shaderindex);
					glw.setProgramParameters(null, 1 / this.runtime.draw_width, 1 / this.runtime.draw_height, 0, 0, 1, 1, this.scale, this.angle, 0, 0, this.runtime.draw_width / 2, this.runtime.draw_height / 2, this.runtime.kahanTime.sum, this.effect_params[etindex]);
					if (glw.programIsAnimated(this.active_effect_types[0].shaderindex)) this.runtime.redraw = true
				} else glw.switchProgram(0);
				if (!this.runtime.fullscreenScalingQuality) {
					glw.setSize(this.runtime.width, this.runtime.height)
				}
				glw.setRenderingToTexture(null);
				glw.setDepthTestEnabled(false);
				glw.setOpacity(1);
				glw.setTexture(this.runtime.layout_tex);
				glw.setAlphaBlend();
				glw.resetModelView();
				glw.updateModelView();
				var halfw = this.runtime.width / 2;
				var halfh = this.runtime.height / 2;
				glw.quad(-halfw, halfh, halfw, halfh, halfw, -halfh, -halfw, -halfh);
				glw.setTexture(null);
				glw.setDepthTestEnabled(true)
			} else {
				this.renderEffectChain(glw, null, null, null)
			}
		}
	};
	Layout.prototype.getRenderTarget = function() {
		if (this.active_effect_types.length > 0 || this.runtime.uses_background_blending || !this.runtime.fullscreenScalingQuality || this.runtime.enableFrontToBack) {
			return this.runtime.layout_tex
		} else {
			return null
		}
	};
	Layout.prototype.getMinLayerScale = function() {
		var m = this.layers[0].getScale();
		var i, len, l;
		for (i = 1, len = this.layers.length; i < len; i++) {
			l = this.layers[i];
			if (l.parallaxX === 0 && l.parallaxY === 0) continue;
			if (l.getScale() < m) m = l.getScale()
		}
		return m
	};
	Layout.prototype.scrollToX = function(x) {
		if (!this.unbounded_scrolling) {
			var widthBoundary = this.runtime.draw_width * (1 / this.getMinLayerScale()) / 2;
			if (x > this.width - widthBoundary) x = this.width - widthBoundary;
			if (x < widthBoundary) x = widthBoundary
		}
		if (this.scrollX !== x) {
			this.scrollX = x;
			this.runtime.redraw = true
		}
	};
	Layout.prototype.scrollToY = function(y) {
		if (!this.unbounded_scrolling) {
			var heightBoundary = this.runtime.draw_height * (1 / this.getMinLayerScale()) / 2;
			if (y > this.height - heightBoundary) y = this.height - heightBoundary;
			if (y < heightBoundary) y = heightBoundary
		}
		if (this.scrollY !== y) {
			this.scrollY = y;
			this.runtime.redraw = true
		}
	};
	Layout.prototype.boundScrolling = function() {
		this.scrollToX(this.scrollX);
		this.scrollToY(this.scrollY)
	};
	Layout.prototype.renderEffectChain = function(glw, layer, inst, rendertarget) {
		var active_effect_types = inst ? inst.active_effect_types : layer ? layer.active_effect_types : this.active_effect_types;
		var layerScale = 1,
			layerAngle = 0,
			viewOriginLeft = 0,
			viewOriginTop = 0,
			viewOriginRight = this.runtime.draw_width,
			viewOriginBottom = this.runtime.draw_height;
		if (inst) {
			layerScale = inst.layer.getScale();
			layerAngle = inst.layer.getAngle();
			viewOriginLeft = inst.layer.viewLeft;
			viewOriginTop = inst.layer.viewTop;
			viewOriginRight = inst.layer.viewRight;
			viewOriginBottom = inst.layer.viewBottom
		} else if (layer) {
			layerScale = layer.getScale();
			layerAngle = layer.getAngle();
			viewOriginLeft = layer.viewLeft;
			viewOriginTop = layer.viewTop;
			viewOriginRight = layer.viewRight;
			viewOriginBottom = layer.viewBottom
		}
		var fx_tex = this.runtime.fx_tex;
		var i, len, last, temp, fx_index = 0,
			other_fx_index = 1;
		var y, h;
		var windowWidth = this.runtime.draw_width;
		var windowHeight = this.runtime.draw_height;
		var halfw = windowWidth / 2;
		var halfh = windowHeight / 2;
		var rcTex = layer ? layer.rcTex : this.rcTex;
		var rcTex2 = layer ? layer.rcTex2 : this.rcTex2;
		var screenleft = 0,
			clearleft = 0;
		var screentop = 0,
			cleartop = 0;
		var screenright = windowWidth,
			clearright = windowWidth;
		var screenbottom = windowHeight,
			clearbottom = windowHeight;
		var boxExtendHorizontal = 0;
		var boxExtendVertical = 0;
		var inst_layer_angle = inst ? inst.layer.getAngle() : 0;
		if (inst) {
			for (i = 0, len = active_effect_types.length; i < len; i++) {
				boxExtendHorizontal += glw.getProgramBoxExtendHorizontal(active_effect_types[i].shaderindex);
				boxExtendVertical += glw.getProgramBoxExtendVertical(active_effect_types[i].shaderindex)
			}
			var bbox = inst.bbox;
			screenleft = layer.layerToCanvas(bbox.left, bbox.top, true, true);
			screentop = layer.layerToCanvas(bbox.left, bbox.top, false, true);
			screenright = layer.layerToCanvas(bbox.right, bbox.bottom, true, true);
			screenbottom = layer.layerToCanvas(bbox.right, bbox.bottom, false, true);
			if (inst_layer_angle !== 0) {
				var screentrx = layer.layerToCanvas(bbox.right, bbox.top, true, true);
				var screentry = layer.layerToCanvas(bbox.right, bbox.top, false, true);
				var screenblx = layer.layerToCanvas(bbox.left, bbox.bottom, true, true);
				var screenbly = layer.layerToCanvas(bbox.left, bbox.bottom, false, true);
				temp = Math.min(screenleft, screenright, screentrx, screenblx);
				screenright = Math.max(screenleft, screenright, screentrx, screenblx);
				screenleft = temp;
				temp = Math.min(screentop, screenbottom, screentry, screenbly);
				screenbottom = Math.max(screentop, screenbottom, screentry, screenbly);
				screentop = temp
			}
			screenleft -= boxExtendHorizontal;
			screentop -= boxExtendVertical;
			screenright += boxExtendHorizontal;
			screenbottom += boxExtendVertical;
			rcTex2.left = screenleft / windowWidth;
			rcTex2.top = 1 - screentop / windowHeight;
			rcTex2.right = screenright / windowWidth;
			rcTex2.bottom = 1 - screenbottom / windowHeight;
			clearleft = screenleft = cr.floor(screenleft);
			cleartop = screentop = cr.floor(screentop);
			clearright = screenright = cr.ceil(screenright);
			clearbottom = screenbottom = cr.ceil(screenbottom);
			clearleft -= boxExtendHorizontal;
			cleartop -= boxExtendVertical;
			clearright += boxExtendHorizontal;
			clearbottom += boxExtendVertical;
			if (screenleft < 0) screenleft = 0;
			if (screentop < 0) screentop = 0;
			if (screenright > windowWidth) screenright = windowWidth;
			if (screenbottom > windowHeight) screenbottom = windowHeight;
			if (clearleft < 0) clearleft = 0;
			if (cleartop < 0) cleartop = 0;
			if (clearright > windowWidth) clearright = windowWidth;
			if (clearbottom > windowHeight) clearbottom = windowHeight;
			rcTex.left = screenleft / windowWidth;
			rcTex.top = 1 - screentop / windowHeight;
			rcTex.right = screenright / windowWidth;
			rcTex.bottom = 1 - screenbottom / windowHeight
		} else {
			rcTex.left = rcTex2.left = 0;
			rcTex.top = rcTex2.top = 0;
			rcTex.right = rcTex2.right = 1;
			rcTex.bottom = rcTex2.bottom = 1
		}
		var pre_draw = inst && (glw.programUsesDest(active_effect_types[0].shaderindex) || boxExtendHorizontal !== 0 || boxExtendVertical !== 0 || inst.opacity !== 1 || inst.type.plugin.must_predraw) || layer && !inst && layer.opacity !== 1;
		glw.setAlphaBlend();
		if (pre_draw) {
			if (!fx_tex[fx_index]) {
				fx_tex[fx_index] = glw.createEmptyTexture(windowWidth, windowHeight, this.runtime.linearSampling)
			}
			if (fx_tex[fx_index].c2width !== windowWidth || fx_tex[fx_index].c2height !== windowHeight) {
				glw.deleteTexture(fx_tex[fx_index]);
				fx_tex[fx_index] = glw.createEmptyTexture(windowWidth, windowHeight, this.runtime.linearSampling)
			}
			glw.switchProgram(0);
			glw.setRenderingToTexture(fx_tex[fx_index]);
			h = clearbottom - cleartop;
			y = windowHeight - cleartop - h;
			glw.clearRect(clearleft, y, clearright - clearleft, h);
			if (inst) {
				inst.drawGL(glw)
			} else {
				glw.setTexture(this.runtime.layer_tex);
				glw.setOpacity(layer.opacity);
				glw.resetModelView();
				glw.translate(-halfw, -halfh);
				glw.updateModelView();
				glw.quadTex(screenleft, screenbottom, screenright, screenbottom, screenright, screentop, screenleft, screentop, rcTex)
			}
			rcTex2.left = rcTex2.top = 0;
			rcTex2.right = rcTex2.bottom = 1;
			if (inst) {
				temp = rcTex.top;
				rcTex.top = rcTex.bottom;
				rcTex.bottom = temp
			}
			fx_index = 1;
			other_fx_index = 0
		}
		glw.setOpacity(1);
		var last = active_effect_types.length - 1;
		var post_draw = glw.programUsesCrossSampling(active_effect_types[last].shaderindex) || !layer && !inst && !this.runtime.fullscreenScalingQuality;
		var etindex = 0;
		for (i = 0, len = active_effect_types.length; i < len; i++) {
			if (!fx_tex[fx_index]) {
				fx_tex[fx_index] = glw.createEmptyTexture(windowWidth, windowHeight, this.runtime.linearSampling)
			}
			if (fx_tex[fx_index].c2width !== windowWidth || fx_tex[fx_index].c2height !== windowHeight) {
				glw.deleteTexture(fx_tex[fx_index]);
				fx_tex[fx_index] = glw.createEmptyTexture(windowWidth, windowHeight, this.runtime.linearSampling)
			}
			glw.switchProgram(active_effect_types[i].shaderindex);
			etindex = active_effect_types[i].index;
			if (glw.programIsAnimated(active_effect_types[i].shaderindex)) this.runtime.redraw = true;
			if (i == 0 && !pre_draw) {
				glw.setRenderingToTexture(fx_tex[fx_index]);
				h = clearbottom - cleartop;
				y = windowHeight - cleartop - h;
				glw.clearRect(clearleft, y, clearright - clearleft, h);
				if (inst) {
					glw.setProgramParameters(rendertarget, 1 / inst.width, 1 / inst.height, rcTex2.left, rcTex2.top, rcTex2.right, rcTex2.bottom, layerScale, layerAngle, viewOriginLeft, viewOriginTop, (viewOriginLeft + viewOriginRight) / 2, (viewOriginTop + viewOriginBottom) / 2, this.runtime.kahanTime.sum, inst.effect_params[etindex]);

					inst.drawGL(glw)
				} else {
					glw.setProgramParameters(rendertarget, 1 / windowWidth, 1 / windowHeight, 0, 0, 1, 1, layerScale, layerAngle, viewOriginLeft, viewOriginTop, (viewOriginLeft + viewOriginRight) / 2, (viewOriginTop + viewOriginBottom) / 2, this.runtime.kahanTime.sum, layer ? layer.effect_params[etindex] : this.effect_params[etindex]);
					glw.setTexture(layer ? this.runtime.layer_tex : this.runtime.layout_tex);
					glw.resetModelView();
					glw.translate(-halfw, -halfh);
					glw.updateModelView();
					glw.quadTex(screenleft, screenbottom, screenright, screenbottom, screenright, screentop, screenleft, screentop, rcTex)
				}
				rcTex2.left = rcTex2.top = 0;
				rcTex2.right = rcTex2.bottom = 1;
				if (inst && !post_draw) {
					temp = screenbottom;
					screenbottom = screentop;
					screentop = temp
				}
			} else {
				glw.setProgramParameters(rendertarget, 1 / windowWidth, 1 / windowHeight, rcTex2.left, rcTex2.top, rcTex2.right, rcTex2.bottom, layerScale, layerAngle, viewOriginLeft, viewOriginTop, (viewOriginLeft + viewOriginRight) / 2, (viewOriginTop + viewOriginBottom) / 2, this.runtime.kahanTime.sum, inst ? inst.effect_params[etindex] : layer ? layer.effect_params[etindex] : this.effect_params[etindex]);
				glw.setTexture(null);
				if (i === last && !post_draw) {
					if (inst) glw.setBlend(inst.srcBlend, inst.destBlend);
					else if (layer) glw.setBlend(layer.srcBlend, layer.destBlend);
					glw.setRenderingToTexture(rendertarget)
				} else {
					glw.setRenderingToTexture(fx_tex[fx_index]);
					h = clearbottom - cleartop;
					y = windowHeight - cleartop - h;
					glw.clearRect(clearleft, y, clearright - clearleft, h)
				}
				glw.setTexture(fx_tex[other_fx_index]);
				glw.resetModelView();
				glw.translate(-halfw, -halfh);
				glw.updateModelView();
				glw.quadTex(screenleft, screenbottom, screenright, screenbottom, screenright, screentop, screenleft, screentop, rcTex);
				if (i === last && !post_draw) glw.setTexture(null)
			}
			fx_index = fx_index === 0 ? 1 : 0;
			other_fx_index = fx_index === 0 ? 1 : 0
		}
		if (post_draw) {
			glw.switchProgram(0);
			if (inst) glw.setBlend(inst.srcBlend, inst.destBlend);
			else if (layer) glw.setBlend(layer.srcBlend, layer.destBlend);
			else {
				if (!this.runtime.fullscreenScalingQuality) {
					glw.setSize(this.runtime.width, this.runtime.height);
					halfw = this.runtime.width / 2;
					halfh = this.runtime.height / 2;
					screenleft = 0;
					screentop = 0;
					screenright = this.runtime.width;
					screenbottom = this.runtime.height
				}
			}
			glw.setRenderingToTexture(rendertarget);
			glw.setTexture(fx_tex[other_fx_index]);
			glw.resetModelView();
			glw.translate(-halfw, -halfh);
			glw.updateModelView();
			if (inst && active_effect_types.length === 1 && !pre_draw) glw.quadTex(screenleft, screentop, screenright, screentop, screenright, screenbottom, screenleft, screenbottom, rcTex);
			else glw.quadTex(screenleft, screenbottom, screenright, screenbottom, screenright, screentop, screenleft, screentop, rcTex);
			glw.setTexture(null)
		}
	};
	Layout.prototype.getLayerBySid = function(sid_) {
		var i, len;
		for (i = 0, len = this.layers.length; i < len; i++) {
			if (this.layers[i].sid === sid_) return this.layers[i]
		}
		return null
	};
	Layout.prototype.saveToJSON = function() {
		var i, len, layer, et;
		var o = {
			sx: this.scrollX,
			sy: this.scrollY,
			s: this.scale,
			a: this.angle,
			w: this.width,
			h: this.height,
			fv: this.first_visit,
			persist: this.persist_data,
			fx: [],
			layers: {}
		};
		for (i = 0, len = this.effect_types.length; i < len; i++) {
			et = this.effect_types[i];
			o["fx"].push({
				name: et.name,
				active: et.active,
				params: this.effect_params[et.index]
			})
		}
		for (i = 0, len = this.layers.length; i < len; i++) {
			layer = this.layers[i];
			o["layers"][layer.sid.toString()] = layer.saveToJSON()
		}
		return o
	};
	Layout.prototype.loadFromJSON = function(o) {
		var i, j, len, fx, p, layer;
		this.scrollX = o["sx"];
		this.scrollY = o["sy"];
		this.scale = o["s"];
		this.angle = o["a"];
		this.width = o["w"];
		this.height = o["h"];
		this.persist_data = o["persist"];
		if (typeof o["fv"] !== "undefined") this.first_visit = o["fv"];
		var ofx = o["fx"];
		for (i = 0, len = ofx.length; i < len; i++) {
			fx = this.getEffectByName(ofx[i]["name"]);
			if (!fx) continue;
			fx.active = ofx[i]["active"];
			this.effect_params[fx.index] = ofx[i]["params"]
		}
		this.updateActiveEffects();
		var olayers = o["layers"];
		for (p in olayers) {
			if (olayers.hasOwnProperty(p)) {
				layer = this.getLayerBySid(parseInt(p, 10));
				if (!layer) continue;
				layer.loadFromJSON(olayers[p])
			}
		}
	};
	cr.layout = Layout;

	function Layer(layout, m) {
		this.layout = layout;
		this.runtime = layout.runtime;
		this.instances = [];
		this.scale = 1;
		this.angle = 0;
		this.disableAngle = false;
		this.tmprect = new cr.rect(0, 0, 0, 0);
		this.tmpquad = new cr.quad;
		this.viewLeft = 0;
		this.viewRight = 0;
		this.viewTop = 0;
		this.viewBottom = 0;
		this.zindices_stale = false;
		this.zindices_stale_from = -1;
		this.clear_earlyz_index = 0;
		this.name = m[0];
		this.index = m[1];
		this.sid = m[2];
		this.visible = m[3];
		this.background_color = m[4];
		this.transparent = m[5];
		this.parallaxX = m[6];
		this.parallaxY = m[7];
		this.opacity = m[8];
		this.forceOwnTexture = m[9];
		this.useRenderCells = m[10];
		this.zoomRate = m[11];
		this.blend_mode = m[12];
		this.effect_fallback = m[13];
		this.compositeOp = "source-over";
		this.srcBlend = 0;
		this.destBlend = 0;
		this.render_grid = null;
		this.last_render_list = alloc_arr();
		this.render_list_stale = true;
		this.last_render_cells = new cr.rect(0, 0, -1, -1);
		this.cur_render_cells = new cr.rect(0, 0, -1, -1);
		if (this.useRenderCells) {
			this.render_grid = new cr.RenderGrid(this.runtime.original_width, this.runtime.original_height)
		}
		this.render_offscreen = false;
		var im = m[14];
		var i, len;
		this.startup_initial_instances = [];
		this.initial_instances = [];
		this.created_globals = [];
		for (i = 0, len = im.length; i < len; i++) {
			var inst = im[i];
			var type = this.runtime.types_by_index[inst[1]];
			if (!type.default_instance) {
				type.default_instance = inst;
				type.default_layerindex = this.index
			}
			this.initial_instances.push(inst);
			if (this.layout.initial_types.indexOf(type) === -1) this.layout.initial_types.push(type)
		}
		cr.shallowAssignArray(this.startup_initial_instances, this.initial_instances);
		this.effect_types = [];
		this.active_effect_types = [];
		this.shaders_preserve_opaqueness = true;
		this.effect_params = [];
		for (i = 0, len = m[15].length; i < len; i++) {
			this.effect_types.push({
				id: m[15][i][0],
				name: m[15][i][1],
				shaderindex: -1,
				preservesOpaqueness: false,
				active: true,
				index: i
			});
			this.effect_params.push(m[15][i][2].slice(0))
		}
		this.updateActiveEffects();
		this.rcTex = new cr.rect(0, 0, 1, 1);
		this.rcTex2 = new cr.rect(0, 0, 1, 1)
	}
	Layer.prototype.updateActiveEffects = function() {
		cr.clearArray(this.active_effect_types);
		this.shaders_preserve_opaqueness = true;
		var i, len, et;
		for (i = 0, len = this.effect_types.length; i < len; i++) {
			et = this.effect_types[i];
			if (et.active) {
				this.active_effect_types.push(et);
				if (!et.preservesOpaqueness) this.shaders_preserve_opaqueness = false
			}
		}
	};
	Layer.prototype.getEffectByName = function(name_) {
		var i, len, et;
		for (i = 0, len = this.effect_types.length; i < len; i++) {
			et = this.effect_types[i];
			if (et.name === name_) return et
		}
		return null
	};
	Layer.prototype.createInitialInstances = function() {
		var i, k, len, inst, initial_inst, type, keep, hasPersistBehavior;
		for (i = 0, k = 0, len = this.initial_instances.length; i < len; i++) {
			initial_inst = this.initial_instances[i];
			type = this.runtime.types_by_index[initial_inst[1]];
			hasPersistBehavior = this.runtime.typeHasPersistBehavior(type);
			keep = true;
			if (!hasPersistBehavior || this.layout.first_visit) {
				inst = this.runtime.createInstanceFromInit(initial_inst, this, true);
				created_instances.push(inst);
				if (inst.type.global) {
					keep = false;
					this.created_globals.push(inst.uid)
				}
			}
			if (keep) {
				this.initial_instances[k] = this.initial_instances[i];
				k++
			}
		}
		this.initial_instances.length = k;
		this.runtime.ClearDeathRow();
		if (!this.runtime.glwrap && this.effect_types.length) this.blend_mode = this.effect_fallback;
		this.compositeOp = cr.effectToCompositeOp(this.blend_mode);
		if (this.runtime.gl) cr.setGLBlend(this, this.blend_mode, this.runtime.gl);
		this.render_list_stale = true
	};
	Layer.prototype.recreateInitialObjects = function(only_type, rc) {
		var i, len, initial_inst, type, wm, x, y, inst, j, lenj, s;
		var types_by_index = this.runtime.types_by_index;
		var only_type_is_family = only_type.is_family;
		var only_type_members = only_type.members;
		for (i = 0, len = this.initial_instances.length; i < len; ++i) {
			initial_inst = this.initial_instances[i];
			wm = initial_inst[0];
			x = wm[0];
			y = wm[1];
			if (!rc.contains_pt(x, y)) continue;
			type = types_by_index[initial_inst[1]];
			if (type !== only_type) {
				if (only_type_is_family) {
					if (only_type_members.indexOf(type) < 0) continue
				} else continue
			}
			inst = this.runtime.createInstanceFromInit(initial_inst, this, false);
			this.runtime.isInOnDestroy++;
			this.runtime.trigger(Object.getPrototypeOf(type.plugin).cnds.OnCreated, inst);
			if (inst.is_contained) {
				for (j = 0, lenj = inst.siblings.length; j < lenj; j++) {
					s = inst.siblings[i];
					this.runtime.trigger(Object.getPrototypeOf(s.type.plugin).cnds.OnCreated, s)
				}
			}
			this.runtime.isInOnDestroy--
		}
	};
	Layer.prototype.removeFromInstanceList = function(inst, remove_from_grid) {
		var index = cr.fastIndexOf(this.instances, inst);
		if (index < 0) return;
		if (remove_from_grid && this.useRenderCells && inst.rendercells && inst.rendercells.right >= inst.rendercells.left) {
			inst.update_bbox();
			this.render_grid.update(inst, inst.rendercells, null);
			inst.rendercells.set(0, 0, -1, -1)
		}
		if (index === this.instances.length - 1) this.instances.pop();
		else {
			cr.arrayRemove(this.instances, index);
			this.setZIndicesStaleFrom(index)
		}
		this.render_list_stale = true
	};
	Layer.prototype.appendToInstanceList = function(inst, add_to_grid) {
		inst.zindex = this.instances.length;
		this.instances.push(inst);
		if (add_to_grid && this.useRenderCells && inst.rendercells) {
			inst.set_bbox_changed()
		}
		this.render_list_stale = true
	};
	Layer.prototype.prependToInstanceList = function(inst, add_to_grid) {
		this.instances.unshift(inst);
		this.setZIndicesStaleFrom(0);
		if (add_to_grid && this.useRenderCells && inst.rendercells) {
			inst.set_bbox_changed()
		}
	};
	Layer.prototype.moveInstanceAdjacent = function(inst, other, isafter) {
		var myZ = inst.get_zindex();
		var insertZ = other.get_zindex();
		cr.arrayRemove(this.instances, myZ);
		if (myZ < insertZ) insertZ--;
		if (isafter) insertZ++;
		if (insertZ === this.instances.length) this.instances.push(inst);
		else this.instances.splice(insertZ, 0, inst);
		this.setZIndicesStaleFrom(myZ < insertZ ? myZ : insertZ)
	};
	Layer.prototype.setZIndicesStaleFrom = function(index) {
		if (this.zindices_stale_from === -1) this.zindices_stale_from = index;
		else if (index < this.zindices_stale_from) this.zindices_stale_from = index;
		this.zindices_stale = true;
		this.render_list_stale = true
	};
	Layer.prototype.updateZIndices = function() {
		if (!this.zindices_stale) return;
		if (this.zindices_stale_from === -1) this.zindices_stale_from = 0;
		var i, len, inst;
		if (this.useRenderCells) {
			for (i = this.zindices_stale_from, len = this.instances.length; i < len; ++i) {
				inst = this.instances[i];
				inst.zindex = i;
				this.render_grid.markRangeChanged(inst.rendercells)
			}
		} else {
			for (i = this.zindices_stale_from, len = this.instances.length; i < len; ++i) {
				this.instances[i].zindex = i
			}
		}
		this.zindices_stale = false;
		this.zindices_stale_from = -1
	};
	Layer.prototype.getScale = function(include_aspect) {
		return this.getNormalScale() * (this.runtime.fullscreenScalingQuality || include_aspect ? this.runtime.aspect_scale : 1)
	};
	Layer.prototype.getNormalScale = function() {
		return (this.scale * this.layout.scale - 1) * this.zoomRate + 1
	};
	Layer.prototype.getAngle = function() {
		if (this.disableAngle) return 0;
		return cr.clamp_angle(this.layout.angle + this.angle)
	};
	var arr_cache = [];

	function alloc_arr() {
		if (arr_cache.length) return arr_cache.pop();
		else return []
	}
	function free_arr(a) {
		cr.clearArray(a);
		arr_cache.push(a)
	}
	function mergeSortedZArrays(a, b, out) {
		var i = 0,
			j = 0,
			k = 0,
			lena = a.length,
			lenb = b.length,
			ai, bj;
		out.length = lena + lenb;
		for (; i < lena && j < lenb; ++k) {
			ai = a[i];
			bj = b[j];
			if (ai.zindex < bj.zindex) {
				out[k] = ai;
				++i
			} else {
				out[k] = bj;
				++j
			}
		}
		for (; i < lena; ++i, ++k) out[k] = a[i];
		for (; j < lenb; ++j, ++k) out[k] = b[j]
	}
	var next_arr = [];

	function mergeAllSortedZArrays_pass(arr, first_pass) {
		var i, len, arr1, arr2, out;
		for (i = 0, len = arr.length; i < len - 1; i += 2) {
			arr1 = arr[i];
			arr2 = arr[i + 1];
			out = alloc_arr();
			mergeSortedZArrays(arr1, arr2, out);
			if (!first_pass) {
				free_arr(arr1);
				free_arr(arr2)
			}
			next_arr.push(out)
		}
		if (len % 2 === 1) {
			if (first_pass) {
				arr1 = alloc_arr();
				cr.shallowAssignArray(arr1, arr[len - 1]);
				next_arr.push(arr1)
			} else {
				next_arr.push(arr[len - 1])
			}
		}
		cr.shallowAssignArray(arr, next_arr);
		cr.clearArray(next_arr)
	}
	function mergeAllSortedZArrays(arr) {
		var first_pass = true;
		while (arr.length > 1) {
			mergeAllSortedZArrays_pass(arr, first_pass);
			first_pass = false
		}
		return arr[0]
	}
	var render_arr = [];
	Layer.prototype.getRenderCellInstancesToDraw = function() {
		this.updateZIndices();
		this.render_grid.queryRange(this.viewLeft, this.viewTop, this.viewRight, this.viewBottom, render_arr);
		if (!render_arr.length) return alloc_arr();
		if (render_arr.length === 1) {
			var a = alloc_arr();
			cr.shallowAssignArray(a, render_arr[0]);
			cr.clearArray(render_arr);
			return a
		}
		var draw_list = mergeAllSortedZArrays(render_arr);
		cr.clearArray(render_arr);
		return draw_list
	};
	Layer.prototype.draw = function(ctx) {
		this.render_offscreen = this.forceOwnTexture || this.opacity !== 1 || this.blend_mode !== 0;
		var layer_canvas = this.runtime.canvas;
		var layer_ctx = ctx;
		var ctx_changed = false;
		if (this.render_offscreen) {
			if (!this.runtime.layer_canvas) {
				this.runtime.layer_canvas = document.createElement("canvas");
				layer_canvas = this.runtime.layer_canvas;
				layer_canvas.width = this.runtime.draw_width;
				layer_canvas.height = this.runtime.draw_height;
				this.runtime.layer_ctx = layer_canvas.getContext("2d");
				ctx_changed = true
			}
			layer_canvas = this.runtime.layer_canvas;
			layer_ctx = this.runtime.layer_ctx;
			if (layer_canvas.width !== this.runtime.draw_width) {
				layer_canvas.width = this.runtime.draw_width;
				ctx_changed = true
			}
			if (layer_canvas.height !== this.runtime.draw_height) {
				layer_canvas.height = this.runtime.draw_height;
				ctx_changed = true
			}
			if (ctx_changed) {
				layer_ctx["webkitImageSmoothingEnabled"] = this.runtime.linearSampling;
				layer_ctx["mozImageSmoothingEnabled"] = this.runtime.linearSampling;
				layer_ctx["msImageSmoothingEnabled"] = this.runtime.linearSampling;
				layer_ctx["imageSmoothingEnabled"] = this.runtime.linearSampling
			}
			if (this.transparent) layer_ctx.clearRect(0, 0, this.runtime.draw_width, this.runtime.draw_height)
		}
		layer_ctx.globalAlpha = 1;
		layer_ctx.globalCompositeOperation = "source-over";
		if (!this.transparent) {
			layer_ctx.fillStyle = "rgb(" + this.background_color[0] + "," + this.background_color[1] + "," + this.background_color[2] + ")";
			layer_ctx.fillRect(0, 0, this.runtime.draw_width, this.runtime.draw_height)
		}
		layer_ctx.save();
		this.disableAngle = true;
		var px = this.canvasToLayer(0, 0, true, true);
		var py = this.canvasToLayer(0, 0, false, true);
		this.disableAngle = false;
		if (this.runtime.pixel_rounding) {
			px = Math.round(px);
			py = Math.round(py)
		}
		this.rotateViewport(px, py, layer_ctx);
		var myscale = this.getScale();
		layer_ctx.scale(myscale, myscale);
		layer_ctx.translate(-px, -py);
		var instances_to_draw;
		if (this.useRenderCells) {
			this.cur_render_cells.left = this.render_grid.XToCell(this.viewLeft);
			this.cur_render_cells.top = this.render_grid.YToCell(this.viewTop);
			this.cur_render_cells.right = this.render_grid.XToCell(this.viewRight);
			this.cur_render_cells.bottom = this.render_grid.YToCell(this.viewBottom);
			if (this.render_list_stale || !this.cur_render_cells.equals(this.last_render_cells)) {
				free_arr(this.last_render_list);
				instances_to_draw = this.getRenderCellInstancesToDraw();
				this.render_list_stale = false;
				this.last_render_cells.copy(this.cur_render_cells)
			} else instances_to_draw = this.last_render_list
		} else instances_to_draw = this.instances;
		var i, len, inst, last_inst = null;
		for (i = 0, len = instances_to_draw.length; i < len; ++i) {
			inst = instances_to_draw[i];
			if (inst === last_inst) continue;
			this.drawInstance(inst, layer_ctx);
			last_inst = inst
		}
		if (this.useRenderCells) this.last_render_list = instances_to_draw;
		layer_ctx.restore();
		if (this.render_offscreen) {
			ctx.globalCompositeOperation = this.compositeOp;
			ctx.globalAlpha = this.opacity;
			ctx.drawImage(layer_canvas, 0, 0)
		}
	};
	Layer.prototype.drawInstance = function(inst, layer_ctx) {
		if (!inst.visible || inst.width === 0 || inst.height === 0) return;
		inst.update_bbox();
		var bbox = inst.bbox;
		if (bbox.right < this.viewLeft || bbox.bottom < this.viewTop || bbox.left > this.viewRight || bbox.top > this.viewBottom) return;
		layer_ctx.globalCompositeOperation = inst.compositeOp;
		inst.draw(layer_ctx)
	};
	Layer.prototype.updateViewport = function(ctx) {
		this.disableAngle = true;
		var px = this.canvasToLayer(0, 0, true, true);
		var py = this.canvasToLayer(0, 0, false, true);
		this.disableAngle = false;
		if (this.runtime.pixel_rounding) {
			px = Math.round(px);
			py = Math.round(py)
		}
		this.rotateViewport(px, py, ctx)
	};
	Layer.prototype.rotateViewport = function(px, py, ctx) {
		var myscale = this.getScale();
		this.viewLeft = px;
		this.viewTop = py;
		this.viewRight = px + this.runtime.draw_width * (1 / myscale);
		this.viewBottom = py + this.runtime.draw_height * (1 / myscale);
		var myAngle = this.getAngle();
		if (myAngle !== 0) {
			if (ctx) {
				ctx.translate(this.runtime.draw_width / 2, this.runtime.draw_height / 2);
				ctx.rotate(-myAngle);
				ctx.translate(this.runtime.draw_width / -2, this.runtime.draw_height / -2)
			}
			this.tmprect.set(this.viewLeft, this.viewTop, this.viewRight, this.viewBottom);
			this.tmprect.offset((this.viewLeft + this.viewRight) / -2, (this.viewTop + this.viewBottom) / -2);
			this.tmpquad.set_from_rotated_rect(this.tmprect, myAngle);
			this.tmpquad.bounding_box(this.tmprect);
			this.tmprect.offset((this.viewLeft + this.viewRight) / 2, (this.viewTop + this.viewBottom) / 2);
			this.viewLeft = this.tmprect.left;
			this.viewTop = this.tmprect.top;
			this.viewRight = this.tmprect.right;
			this.viewBottom = this.tmprect.bottom
		}
	};
	Layer.prototype.drawGL_earlyZPass = function(glw) {
		var windowWidth = this.runtime.draw_width;
		var windowHeight = this.runtime.draw_height;
		var shaderindex = 0;
		var etindex = 0;
		this.render_offscreen = this.forceOwnTexture;
		if (this.render_offscreen) {
			if (!this.runtime.layer_tex) {
				this.runtime.layer_tex = glw.createEmptyTexture(this.runtime.draw_width, this.runtime.draw_height, this.runtime.linearSampling)
			}
			if (this.runtime.layer_tex.c2width !== this.runtime.draw_width || this.runtime.layer_tex.c2height !== this.runtime.draw_height) {
				glw.deleteTexture(this.runtime.layer_tex);
				this.runtime.layer_tex = glw.createEmptyTexture(this.runtime.draw_width, this.runtime.draw_height, this.runtime.linearSampling)
			}
			glw.setRenderingToTexture(this.runtime.layer_tex)
		}
		this.disableAngle = true;
		var px = this.canvasToLayer(0, 0, true, true);
		var py = this.canvasToLayer(0, 0, false, true);
		this.disableAngle = false;
		if (this.runtime.pixel_rounding) {
			px = Math.round(px);
			py = Math.round(py)
		}
		this.rotateViewport(px, py, null);
		var myscale = this.getScale();
		glw.resetModelView();
		glw.scale(myscale, myscale);
		glw.rotateZ(-this.getAngle());
		glw.translate((this.viewLeft + this.viewRight) / -2, (this.viewTop + this.viewBottom) / -2);
		glw.updateModelView();
		var instances_to_draw;
		if (this.useRenderCells) {
			this.cur_render_cells.left = this.render_grid.XToCell(this.viewLeft);
			this.cur_render_cells.top = this.render_grid.YToCell(this.viewTop);
			this.cur_render_cells.right = this.render_grid.XToCell(this.viewRight);
			this.cur_render_cells.bottom = this.render_grid.YToCell(this.viewBottom);
			if (this.render_list_stale || !this.cur_render_cells.equals(this.last_render_cells)) {
				free_arr(this.last_render_list);
				instances_to_draw = this.getRenderCellInstancesToDraw();
				this.render_list_stale = false;
				this.last_render_cells.copy(this.cur_render_cells)
			} else instances_to_draw = this.last_render_list
		} else instances_to_draw = this.instances;
		var i, inst, last_inst = null;
		for (i = instances_to_draw.length - 1; i >= 0; --i) {
			inst = instances_to_draw[i];
			if (inst === last_inst) continue;
			this.drawInstanceGL_earlyZPass(instances_to_draw[i], glw);
			last_inst = inst
		}
		if (this.useRenderCells) this.last_render_list = instances_to_draw;
		if (!this.transparent) {
			this.clear_earlyz_index = this.runtime.earlyz_index++;
			glw.setEarlyZIndex(this.clear_earlyz_index);
			glw.setColorFillMode(1, 1, 1, 1);
			glw.fullscreenQuad();
			glw.restoreEarlyZMode()
		}
	};
	Layer.prototype.drawGL = function(glw) {
		var windowWidth = this.runtime.draw_width;
		var windowHeight = this.runtime.draw_height;
		var shaderindex = 0;
		var etindex = 0;
		this.render_offscreen = this.forceOwnTexture || this.opacity !== 1 || this.active_effect_types.length > 0 || this.blend_mode !== 0;
		if (this.render_offscreen) {
			if (!this.runtime.layer_tex) {
				this.runtime.layer_tex = glw.createEmptyTexture(this.runtime.draw_width, this.runtime.draw_height, this.runtime.linearSampling)
			}
			if (this.runtime.layer_tex.c2width !== this.runtime.draw_width || this.runtime.layer_tex.c2height !== this.runtime.draw_height) {
				glw.deleteTexture(this.runtime.layer_tex);
				this.runtime.layer_tex = glw.createEmptyTexture(this.runtime.draw_width, this.runtime.draw_height, this.runtime.linearSampling)
			}
			glw.setRenderingToTexture(this.runtime.layer_tex);
			if (this.transparent) glw.clear(0, 0, 0, 0)
		}
		if (!this.transparent) {
			if (this.runtime.enableFrontToBack) {
				glw.setEarlyZIndex(this.clear_earlyz_index);
				glw.setColorFillMode(this.background_color[0] / 255, this.background_color[1] / 255, this.background_color[2] / 255, 1);
				glw.fullscreenQuad();
				glw.setTextureFillMode()
			} else {
				glw.clear(this.background_color[0] / 255, this.background_color[1] / 255, this.background_color[2] / 255, 1)
			}
		}
		this.disableAngle = true;
		var px = this.canvasToLayer(0, 0, true, true);
		var py = this.canvasToLayer(0, 0, false, true);
		this.disableAngle = false;
		if (this.runtime.pixel_rounding) {
			px = Math.round(px);
			py = Math.round(py)
		}
		this.rotateViewport(px, py, null);
		var myscale = this.getScale();
		glw.resetModelView();
		glw.scale(myscale, myscale);
		glw.rotateZ(-this.getAngle());
		glw.translate((this.viewLeft + this.viewRight) / -2, (this.viewTop + this.viewBottom) / -2);
		glw.updateModelView();
		var instances_to_draw;
		if (this.useRenderCells) {
			this.cur_render_cells.left = this.render_grid.XToCell(this.viewLeft);
			this.cur_render_cells.top = this.render_grid.YToCell(this.viewTop);
			this.cur_render_cells.right = this.render_grid.XToCell(this.viewRight);
			this.cur_render_cells.bottom = this.render_grid.YToCell(this.viewBottom);
			if (this.render_list_stale || !this.cur_render_cells.equals(this.last_render_cells)) {
				free_arr(this.last_render_list);
				instances_to_draw = this.getRenderCellInstancesToDraw();
				this.render_list_stale = false;
				this.last_render_cells.copy(this.cur_render_cells)
			} else instances_to_draw = this.last_render_list
		} else instances_to_draw = this.instances;
		var i, len, inst, last_inst = null;
		for (i = 0, len = instances_to_draw.length; i < len; ++i) {
			inst = instances_to_draw[i];
			if (inst === last_inst) continue;
			this.drawInstanceGL(instances_to_draw[i], glw);
			last_inst = inst
		}
		if (this.useRenderCells) this.last_render_list = instances_to_draw;
		if (this.render_offscreen) {
			shaderindex = this.active_effect_types.length ? this.active_effect_types[0].shaderindex : 0;
			etindex = this.active_effect_types.length ? this.active_effect_types[0].index : 0;
			if (this.active_effect_types.length === 0 || this.active_effect_types.length === 1 && !glw.programUsesCrossSampling(shaderindex) && this.opacity === 1) {
				if (this.active_effect_types.length === 1) {
					glw.switchProgram(shaderindex);
					glw.setProgramParameters(this.layout.getRenderTarget(), 1 / this.runtime.draw_width, 1 / this.runtime.draw_height, 0, 0, 1, 1, myscale, this.getAngle(), this.viewLeft, this.viewTop, (this.viewLeft + this.viewRight) / 2, (this.viewTop + this.viewBottom) / 2, this.runtime.kahanTime.sum, this.effect_params[etindex]);
					if (glw.programIsAnimated(shaderindex)) this.runtime.redraw = true
				} else glw.switchProgram(0);
				glw.setRenderingToTexture(this.layout.getRenderTarget());
				glw.setOpacity(this.opacity);
				glw.setTexture(this.runtime.layer_tex);
				glw.setBlend(this.srcBlend, this.destBlend);
				glw.resetModelView();
				glw.updateModelView();
				var halfw = this.runtime.draw_width / 2;
				var halfh = this.runtime.draw_height / 2;
				glw.quad(-halfw, halfh, halfw, halfh, halfw, -halfh, -halfw, -halfh);
				glw.setTexture(null)
			} else {
				this.layout.renderEffectChain(glw, this, null, this.layout.getRenderTarget())
			}
		}
	};
	Layer.prototype.drawInstanceGL = function(inst, glw) {
		if (!inst.visible || inst.width === 0 || inst.height === 0) return;
		inst.update_bbox();
		var bbox = inst.bbox;
		if (bbox.right < this.viewLeft || bbox.bottom < this.viewTop || bbox.left > this.viewRight || bbox.top > this.viewBottom) return;
		glw.setEarlyZIndex(inst.earlyz_index);
		if (inst.uses_shaders) {
			this.drawInstanceWithShadersGL(inst, glw)
		} else {
			glw.switchProgram(0);
			glw.setBlend(inst.srcBlend, inst.destBlend);
			inst.drawGL(glw)
		}
	};
	Layer.prototype.drawInstanceGL_earlyZPass = function(inst, glw) {
		if (!inst.visible || inst.width === 0 || inst.height === 0) return;
		inst.update_bbox();
		var bbox = inst.bbox;
		if (bbox.right < this.viewLeft || bbox.bottom < this.viewTop || bbox.left > this.viewRight || bbox.top > this.viewBottom) return;
		inst.earlyz_index = this.runtime.earlyz_index++;
		if (inst.blend_mode !== 0 || inst.opacity !== 1 || !inst.shaders_preserve_opaqueness || !inst.drawGL_earlyZPass) return;
		glw.setEarlyZIndex(inst.earlyz_index);
		inst.drawGL_earlyZPass(glw)
	};
	Layer.prototype.drawInstanceWithShadersGL = function(inst, glw) {
		var shaderindex = inst.active_effect_types[0].shaderindex;
		var etindex = inst.active_effect_types[0].index;
		var myscale = this.getScale();
		if (inst.active_effect_types.length === 1 && !glw.programUsesCrossSampling(shaderindex) && !glw.programExtendsBox(shaderindex) && (!inst.angle && !inst.layer.getAngle() || !glw.programUsesDest(shaderindex)) && inst.opacity === 1 && !inst.type.plugin.must_predraw) {
			glw.switchProgram(shaderindex);
			glw.setBlend(inst.srcBlend, inst.destBlend);
			if (glw.programIsAnimated(shaderindex)) this.runtime.redraw = true;
			var destStartX = 0,
				destStartY = 0,
				destEndX = 0,
				destEndY = 0;
			if (glw.programUsesDest(shaderindex)) {
				var bbox = inst.bbox;
				var screenleft = this.layerToCanvas(bbox.left, bbox.top, true, true);
				var screentop = this.layerToCanvas(bbox.left, bbox.top, false, true);
				var screenright = this.layerToCanvas(bbox.right, bbox.bottom, true, true);
				var screenbottom = this.layerToCanvas(bbox.right, bbox.bottom, false, true);
				destStartX = screenleft / windowWidth;
				destStartY = 1 - screentop / windowHeight;
				destEndX = screenright / windowWidth;
				destEndY = 1 - screenbottom / windowHeight
			}
			glw.setProgramParameters(this.render_offscreen ? this.runtime.layer_tex : this.layout.getRenderTarget(), 1 / inst.width, 1 / inst.height, destStartX, destStartY, destEndX, destEndY, myscale, this.getAngle(), this.viewLeft, this.viewTop, (this.viewLeft + this.viewRight) / 2, (this.viewTop + this.viewBottom) / 2, this.runtime.kahanTime.sum, inst.effect_params[etindex]);
			inst.drawGL(glw)
		} else {
			this.layout.renderEffectChain(glw, this, inst, this.render_offscreen ? this.runtime.layer_tex : this.layout.getRenderTarget());
			glw.resetModelView();
			glw.scale(myscale, myscale);
			glw.rotateZ(-this.getAngle());
			glw.translate((this.viewLeft + this.viewRight) / -2, (this.viewTop + this.viewBottom) / -2);
			glw.updateModelView()
		}
	};
	Layer.prototype.canvasToLayer = function(ptx, pty, getx, using_draw_area) {
		var multiplier = this.runtime.devicePixelRatio;
		if (this.runtime.isRetina) {
			ptx *= multiplier;
			pty *= multiplier
		}
		var ox = this.runtime.parallax_x_origin;
		var oy = this.runtime.parallax_y_origin;
		var par_x = (this.layout.scrollX - ox) * this.parallaxX + ox;
		var par_y = (this.layout.scrollY - oy) * this.parallaxY + oy;
		var x = par_x;
		var y = par_y;
		var invScale = 1 / this.getScale(!using_draw_area);
		if (using_draw_area) {
			x -= this.runtime.draw_width * invScale / 2;
			y -= this.runtime.draw_height * invScale / 2
		} else {
			x -= this.runtime.width * invScale / 2;
			y -= this.runtime.height * invScale / 2
		}
		x += ptx * invScale;
		y += pty * invScale;
		var a = this.getAngle();
		if (a !== 0) {
			x -= par_x;
			y -= par_y;
			var cosa = Math.cos(a);
			var sina = Math.sin(a);
			var x_temp = x * cosa - y * sina;
			y = y * cosa + x * sina;
			x = x_temp;
			x += par_x;
			y += par_y
		}
		return getx ? x : y
	};
	Layer.prototype.layerToCanvas = function(ptx, pty, getx, using_draw_area) {
		var ox = this.runtime.parallax_x_origin;
		var oy = this.runtime.parallax_y_origin;
		var par_x = (this.layout.scrollX - ox) * this.parallaxX + ox;
		var par_y = (this.layout.scrollY - oy) * this.parallaxY + oy;
		var x = par_x;
		var y = par_y;
		var a = this.getAngle();
		if (a !== 0) {
			ptx -= par_x;
			pty -= par_y;
			var cosa = Math.cos(-a);
			var sina = Math.sin(-a);
			var x_temp = ptx * cosa - pty * sina;
			pty = pty * cosa + ptx * sina;
			ptx = x_temp;
			ptx += par_x;
			pty += par_y
		}
		var invScale = 1 / this.getScale(!using_draw_area);
		if (using_draw_area) {
			x -= this.runtime.draw_width * invScale / 2;
			y -= this.runtime.draw_height * invScale / 2
		} else {
			x -= this.runtime.width * invScale / 2;
			y -= this.runtime.height * invScale / 2
		}
		x = (ptx - x) / invScale;
		y = (pty - y) / invScale;
		var multiplier = this.runtime.devicePixelRatio;
		if (this.runtime.isRetina && !using_draw_area) {
			x /= multiplier;
			y /= multiplier
		}
		return getx ? x : y
	};
	Layer.prototype.rotatePt = function(x_, y_, getx) {
		if (this.getAngle() === 0) return getx ? x_ : y_;
		var nx = this.layerToCanvas(x_, y_, true);
		var ny = this.layerToCanvas(x_, y_, false);
		this.disableAngle = true;
		var px = this.canvasToLayer(nx, ny, true);
		var py = this.canvasToLayer(nx, ny, true);
		this.disableAngle = false;
		return getx ? px : py
	};
	Layer.prototype.saveToJSON = function() {
		var i, len, et;
		var o = {
			s: this.scale,
			a: this.angle,
			vl: this.viewLeft,
			vt: this.viewTop,
			vr: this.viewRight,
			vb: this.viewBottom,
			v: this.visible,
			bc: this.background_color,
			t: this.transparent,
			px: this.parallaxX,
			py: this.parallaxY,
			o: this.opacity,
			zr: this.zoomRate,
			fx: [],
			cg: this.created_globals,
			instances: []
		};
		for (i = 0, len = this.effect_types.length; i < len; i++) {
			et = this.effect_types[i];
			o["fx"].push({
				name: et.name,
				active: et.active,
				params: this.effect_params[et.index]
			})
		}
		return o
	};
	Layer.prototype.loadFromJSON = function(o) {
		var i, j, len, p, inst, fx;
		this.scale = o["s"];
		this.angle = o["a"];
		this.viewLeft = o["vl"];
		this.viewTop = o["vt"];
		this.viewRight = o["vr"];
		this.viewBottom = o["vb"];
		this.visible = o["v"];
		this.background_color = o["bc"];
		this.transparent = o["t"];
		this.parallaxX = o["px"];
		this.parallaxY = o["py"];
		this.opacity = o["o"];
		this.zoomRate = o["zr"];
		this.created_globals = o["cg"] || [];
		cr.shallowAssignArray(this.initial_instances, this.startup_initial_instances);
		var temp_set = new cr.ObjectSet;
		for (i = 0, len = this.created_globals.length; i < len; ++i) temp_set.add(this.created_globals[i]);
		for (i = 0, j = 0, len = this.initial_instances.length; i < len; ++i) {
			if (!temp_set.contains(this.initial_instances[i][2])) {
				this.initial_instances[j] = this.initial_instances[i];
				++j
			}
		}
		cr.truncateArray(this.initial_instances, j);
		var ofx = o["fx"];
		for (i = 0, len = ofx.length; i < len; i++) {
			fx = this.getEffectByName(ofx[i]["name"]);
			if (!fx) continue;
			fx.active = ofx[i]["active"];
			this.effect_params[fx.index] = ofx[i]["params"]
		}
		this.updateActiveEffects();
		this.instances.sort(sort_by_zindex);
		this.zindices_stale = true
	};
	cr.layer = Layer
})();
(function() {
	var allUniqueSolModifiers = [];

	function testSolsMatch(arr1, arr2) {
		var i, len = arr1.length;
		switch (len) {
		case 0:
			return true;
		case 1:
			return arr1[0] === arr2[0];
		case 2:
			return arr1[0] === arr2[0] && arr1[1] === arr2[1];
		default:
			for (i = 0; i < len; i++) {
				if (arr1[i] !== arr2[i]) return false
			}
			return true
		}
	}
	function solArraySorter(t1, t2) {
		return t1.index - t2.index
	}
	function findMatchingSolModifier(arr) {
		var i, len, u, temp, subarr;
		if (arr.length === 2) {
			if (arr[0].index > arr[1].index) {
				temp = arr[0];
				arr[0] = arr[1];
				arr[1] = temp
			}
		} else if (arr.length > 2) arr.sort(solArraySorter);
		if (arr.length >= allUniqueSolModifiers.length) allUniqueSolModifiers.length = arr.length + 1;
		if (!allUniqueSolModifiers[arr.length]) allUniqueSolModifiers[arr.length] = [];
		subarr = allUniqueSolModifiers[arr.length];
		for (i = 0, len = subarr.length; i < len; i++) {
			u = subarr[i];
			if (testSolsMatch(arr, u)) return u
		}
		subarr.push(arr);
		return arr
	}
	function EventSheet(runtime, m) {
		this.runtime = runtime;
		this.triggers = {};
		this.fasttriggers = {};
		this.hasRun = false;
		this.includes = new cr.ObjectSet;
		this.deep_includes = [];
		this.already_included_sheets = [];
		this.name = m[0];
		var em = m[1];
		this.events = [];
		var i, len;
		for (i = 0, len = em.length; i < len; i++) this.init_event(em[i], null, this.events)
	}
	EventSheet.prototype.toString = function() {
		return this.name
	};
	EventSheet.prototype.init_event = function(m, parent, nontriggers) {
		switch (m[0]) {
		case 0:
			{
				var block = new cr.eventblock(this, parent, m);
				cr.seal(block);
				if (block.orblock) {
					nontriggers.push(block);
					var i, len;
					for (i = 0, len = block.conditions.length; i < len; i++) {
						if (block.conditions[i].trigger) this.init_trigger(block, i)
					}
				} else {
					if (block.is_trigger()) this.init_trigger(block, 0);
					else nontriggers.push(block)
				}
				break
			}
		case 1:
			{
				var v = new cr.eventvariable(this, parent, m);
				cr.seal(v);
				nontriggers.push(v);
				break
			}
		case 2:
			{
				var inc = new cr.eventinclude(this, parent, m);
				cr.seal(inc);
				nontriggers.push(inc);
				break
			}
		default:
		}
	};
	EventSheet.prototype.postInit = function() {
		var i, len;
		for (i = 0, len = this.events.length; i < len; i++) {
			this.events[i].postInit(i < len - 1 && this.events[i + 1].is_else_block)
		}
	};
	EventSheet.prototype.updateDeepIncludes = function() {
		cr.clearArray(this.deep_includes);
		cr.clearArray(this.already_included_sheets);
		this.addDeepIncludes(this);
		cr.clearArray(this.already_included_sheets)
	};
	EventSheet.prototype.addDeepIncludes = function(root_sheet) {
		var i, len, inc, sheet;
		var deep_includes = root_sheet.deep_includes;
		var already_included_sheets = root_sheet.already_included_sheets;
		var arr = this.includes.valuesRef();
		for (i = 0, len = arr.length; i < len; ++i) {
			inc = arr[i];
			sheet = inc.include_sheet;
			if (!inc.isActive() || root_sheet === sheet || already_included_sheets.indexOf(sheet) > -1) continue;
			already_included_sheets.push(sheet);
			sheet.addDeepIncludes(root_sheet);
			deep_includes.push(sheet)
		}
	};
	EventSheet.prototype.run = function(from_include) {
		if (!this.runtime.resuming_breakpoint) {
			this.hasRun = true;
			if (!from_include) this.runtime.isRunningEvents = true
		}
		var i, len;
		for (i = 0, len = this.events.length; i < len; i++) {
			var ev = this.events[i];
			ev.run();
			this.runtime.clearSol(ev.solModifiers);
			if (this.runtime.hasPendingInstances) this.runtime.ClearDeathRow()
		}
		if (!from_include) this.runtime.isRunningEvents = false
	};

	function isPerformanceSensitiveTrigger(method) {
		if (cr.plugins_.Sprite && method === cr.plugins_.Sprite.prototype.cnds.OnFrameChanged) {
			return true
		}
		return false
	}
	EventSheet.prototype.init_trigger = function(trig, index) {
		if (!trig.orblock) this.runtime.triggers_to_postinit.push(trig);
		var i, len;
		var cnd = trig.conditions[index];
		var type_name;
		if (cnd.type) type_name = cnd.type.name;
		else type_name = "system";
		var fasttrigger = cnd.fasttrigger;
		var triggers = fasttrigger ? this.fasttriggers : this.triggers;
		if (!triggers[type_name]) triggers[type_name] = [];
		var obj_entry = triggers[type_name];
		var method = cnd.func;
		if (fasttrigger) {
			if (!cnd.parameters.length) return;
			var firstparam = cnd.parameters[0];
			if (firstparam.type !== 1 || firstparam.expression.type !== 2) {
				return
			}
			var fastevs;
			var firstvalue = firstparam.expression.value.toLowerCase();
			var i, len;
			for (i = 0, len = obj_entry.length; i < len; i++) {
				if (obj_entry[i].method == method) {
					fastevs = obj_entry[i].evs;
					if (!fastevs[firstvalue]) fastevs[firstvalue] = [
						[trig, index]
					];
					else fastevs[firstvalue].push([trig, index]);
					return
				}
			}
			fastevs = {};
			fastevs[firstvalue] = [
				[trig, index]
			];
			obj_entry.push({
				method: method,
				evs: fastevs
			})
		} else {
			for (i = 0, len = obj_entry.length; i < len; i++) {
				if (obj_entry[i].method == method) {
					obj_entry[i].evs.push([trig, index]);
					return
				}
			}
			if (isPerformanceSensitiveTrigger(method)) obj_entry.unshift({
				method: method,
				evs: [
					[trig, index]
				]
			});
			else obj_entry.push({
				method: method,
				evs: [
					[trig, index]
				]
			})
		}
	};
	cr.eventsheet = EventSheet;

	function Selection(type) {
		this.type = type;
		this.instances = [];
		this.else_instances = [];
		this.select_all = true
	}
	Selection.prototype.hasObjects = function() {
		if (this.select_all) return this.type.instances.length;
		else return this.instances.length
	};
	Selection.prototype.getObjects = function() {
		if (this.select_all) return this.type.instances;
		else return this.instances
	};
	Selection.prototype.pick_one = function(inst) {
		if (!inst) return;
		if (inst.runtime.getCurrentEventStack().current_event.orblock) {
			if (this.select_all) {
				cr.clearArray(this.instances);
				cr.shallowAssignArray(this.else_instances, inst.type.instances);
				this.select_all = false
			}
			var i = this.else_instances.indexOf(inst);
			if (i !== -1) {
				this.instances.push(this.else_instances[i]);
				this.else_instances.splice(i, 1)
			}
		} else {
			this.select_all = false;
			cr.clearArray(this.instances);
			this.instances[0] = inst
		}
	};
	cr.selection = Selection;

	function EventBlock(sheet, parent, m) {
		this.sheet = sheet;
		this.parent = parent;
		this.runtime = sheet.runtime;
		this.solModifiers = [];
		this.solModifiersIncludingParents = [];
		this.solWriterAfterCnds = false;
		this.group = false;
		this.initially_activated = false;
		this.toplevelevent = false;
		this.toplevelgroup = false;
		this.has_else_block = false;
		this.conditions = [];
		this.actions = [];
		this.subevents = [];
		this.group_name = "";
		this.group = false;
		this.initially_activated = false;
		this.group_active = false;
		this.contained_includes = null;
		if (m[1]) {
			this.group_name = m[1][1].toLowerCase();
			this.group = true;
			this.initially_activated = !! m[1][0];
			this.contained_includes = [];
			this.group_active = this.initially_activated;
			this.runtime.allGroups.push(this);
			this.runtime.groups_by_name[this.group_name] = this
		}
		this.orblock = m[2];
		this.sid = m[4];
		if (!this.group) this.runtime.blocksBySid[this.sid.toString()] = this;
		var i, len;
		var cm = m[5];
		for (i = 0, len = cm.length; i < len; i++) {
			var cnd = new cr.condition(this, cm[i]);
			cnd.index = i;
			cr.seal(cnd);
			this.conditions.push(cnd);
			this.addSolModifier(cnd.type)
		}
		var am = m[6];
		for (i = 0, len = am.length; i < len; i++) {
			var act = new cr.action(this, am[i]);
			act.index = i;
			cr.seal(act);
			this.actions.push(act)
		}
		if (m.length === 8) {
			var em = m[7];
			for (i = 0, len = em.length; i < len; i++) this.sheet.init_event(em[i], this, this.subevents)
		}
		this.is_else_block = false;
		if (this.conditions.length) {
			this.is_else_block = this.conditions[0].type == null && this.conditions[0].func == cr.system_object.prototype.cnds.Else
		}
	}
	window["_c2hh_"] = "DA39A3EE5E6B4B0D3255BFEF95601890AFD80709";
	EventBlock.prototype.postInit = function(hasElse) {
		var i, len;
		var p = this.parent;
		if (this.group) {
			this.toplevelgroup = true;
			while (p) {
				if (!p.group) {
					this.toplevelgroup = false;
					break
				}
				p = p.parent
			}
		}
		this.toplevelevent = !this.is_trigger() && (!this.parent || this.parent.group && this.parent.toplevelgroup);
		this.has_else_block = !! hasElse;
		this.solModifiersIncludingParents = this.solModifiers.slice(0);
		p = this.parent;
		while (p) {
			for (i = 0, len = p.solModifiers.length; i < len; i++) this.addParentSolModifier(p.solModifiers[i]);
			p = p.parent
		}
		this.solModifiers = findMatchingSolModifier(this.solModifiers);
		this.solModifiersIncludingParents = findMatchingSolModifier(this.solModifiersIncludingParents);
		var i, len;
		for (i = 0, len = this.conditions.length; i < len; i++) this.conditions[i].postInit();
		for (i = 0, len = this.actions.length; i < len; i++) this.actions[i].postInit();
		for (i = 0, len = this.subevents.length; i < len; i++) {
			this.subevents[i].postInit(i < len - 1 && this.subevents[i + 1].is_else_block)
		}
	};
	EventBlock.prototype.setGroupActive = function(a) {
		if (this.group_active === !! a) return;
		this.group_active = !! a;
		var i, len;
		for (i = 0, len = this.contained_includes.length; i < len; ++i) {
			this.contained_includes[i].updateActive()
		}
		if (len > 0 && this.runtime.running_layout.event_sheet) this.runtime.running_layout.event_sheet.updateDeepIncludes()
	};

	function addSolModifierToList(type, arr) {
		var i, len, t;
		if (!type) return;
		if (arr.indexOf(type) === -1) arr.push(type);
		if (type.is_contained) {
			for (i = 0, len = type.container.length; i < len; i++) {
				t = type.container[i];
				if (type === t) continue;
				if (arr.indexOf(t) === -1) arr.push(t)
			}
		}
	}
	EventBlock.prototype.addSolModifier = function(type) {
		addSolModifierToList(type, this.solModifiers)
	};
	EventBlock.prototype.addParentSolModifier = function(type) {
		addSolModifierToList(type, this.solModifiersIncludingParents)
	};
	EventBlock.prototype.setSolWriterAfterCnds = function() {
		this.solWriterAfterCnds = true;
		if (this.parent) this.parent.setSolWriterAfterCnds()
	};
	EventBlock.prototype.is_trigger = function() {
		if (!this.conditions.length) return false;
		else return this.conditions[0].trigger
	};
	EventBlock.prototype.run = function() {
		var i, len, c, any_true = false,
			cnd_result;
		var runtime = this.runtime;
		var evinfo = this.runtime.getCurrentEventStack();
		evinfo.current_event = this;
		var conditions = this.conditions;
		if (!this.is_else_block) evinfo.else_branch_ran = false;
		if (this.orblock) {
			if (conditions.length === 0) any_true = true;
			evinfo.cndindex = 0;
			for (len = conditions.length; evinfo.cndindex < len; evinfo.cndindex++) {
				c = conditions[evinfo.cndindex];
				if (c.trigger) continue;
				cnd_result = c.run();
				if (cnd_result) any_true = true
			}
			evinfo.last_event_true = any_true;
			if (any_true) this.run_actions_and_subevents()
		} else {
			evinfo.cndindex = 0;
			for (len = conditions.length; evinfo.cndindex < len; evinfo.cndindex++) {
				cnd_result = conditions[evinfo.cndindex].run();
				if (!cnd_result) {
					evinfo.last_event_true = false;
					if (this.toplevelevent && runtime.hasPendingInstances) runtime.ClearDeathRow();
					return
				}
			}
			evinfo.last_event_true = true;
			this.run_actions_and_subevents()
		}
		this.end_run(evinfo)
	};
	EventBlock.prototype.end_run = function(evinfo) {
		if (evinfo.last_event_true && this.has_else_block) evinfo.else_branch_ran = true;
		if (this.toplevelevent && this.runtime.hasPendingInstances) this.runtime.ClearDeathRow()
	};
	EventBlock.prototype.run_orblocktrigger = function(index) {
		var evinfo = this.runtime.getCurrentEventStack();
		evinfo.current_event = this;
		if (this.conditions[index].run()) {
			this.run_actions_and_subevents();
			this.runtime.getCurrentEventStack().last_event_true = true
		}
	};
	EventBlock.prototype.run_actions_and_subevents = function() {
		var evinfo = this.runtime.getCurrentEventStack();
		var len;
		for (evinfo.actindex = 0, len = this.actions.length; evinfo.actindex < len; evinfo.actindex++) {
			if (this.actions[evinfo.actindex].run()) return
		}
		this.run_subevents()
	};
	EventBlock.prototype.resume_actions_and_subevents = function() {
		var evinfo = this.runtime.getCurrentEventStack();
		var len;
		for (len = this.actions.length; evinfo.actindex < len; evinfo.actindex++) {
			if (this.actions[evinfo.actindex].run()) return
		}
		this.run_subevents()
	};
	EventBlock.prototype.run_subevents = function() {
		if (!this.subevents.length) return;
		var i, len, subev, pushpop;
		var last = this.subevents.length - 1;
		this.runtime.pushEventStack(this);
		if (this.solWriterAfterCnds) {
			for (i = 0, len = this.subevents.length; i < len; i++) {
				subev = this.subevents[i];
				pushpop = !this.toplevelgroup || !this.group && i < last;
				if (pushpop) this.runtime.pushCopySol(subev.solModifiers);
				subev.run();
				if (pushpop) this.runtime.popSol(subev.solModifiers);
				else this.runtime.clearSol(subev.solModifiers)
			}
		} else {
			for (i = 0, len = this.subevents.length; i < len; i++) {
				this.subevents[i].run()
			}
		}
		this.runtime.popEventStack()
	};
	EventBlock.prototype.run_pretrigger = function() {
		var evinfo = this.runtime.getCurrentEventStack();
		evinfo.current_event = this;
		var any_true = false;
		var i, len;
		for (evinfo.cndindex = 0, len = this.conditions.length; evinfo.cndindex < len; evinfo.cndindex++) {
			if (this.conditions[evinfo.cndindex].run()) any_true = true;
			else if (!this.orblock) return false
		}
		return this.orblock ? any_true : true
	};
	EventBlock.prototype.retrigger = function() {
		this.runtime.execcount++;
		var prevcndindex = this.runtime.getCurrentEventStack().cndindex;
		var len;
		var evinfo = this.runtime.pushEventStack(this);
		if (!this.orblock) {
			for (evinfo.cndindex = prevcndindex + 1, len = this.conditions.length; evinfo.cndindex < len; evinfo.cndindex++) {
				if (!this.conditions[evinfo.cndindex].run()) {
					this.runtime.popEventStack();
					return false
				}
			}
		}
		this.run_actions_and_subevents();
		this.runtime.popEventStack();
		return true
	};
	EventBlock.prototype.isFirstConditionOfType = function(cnd) {
		var cndindex = cnd.index;
		if (cndindex === 0) return true;
		--cndindex;
		for (; cndindex >= 0; --cndindex) {
			if (this.conditions[cndindex].type === cnd.type) return false
		}
		return true
	};
	cr.eventblock = EventBlock;

	function Condition(block, m) {
		this.block = block;
		this.sheet = block.sheet;
		this.runtime = block.runtime;
		this.parameters = [];
		this.results = [];
		this.extra = {};
		this.index = -1;
		this.anyParamVariesPerInstance = false;
		this.func = this.runtime.GetObjectReference(m[1]);
		this.trigger = m[3] > 0;
		this.fasttrigger = m[3] === 2;
		this.looping = m[4];
		this.inverted = m[5];
		this.isstatic = m[6];
		this.sid = m[7];
		this.runtime.cndsBySid[this.sid.toString()] = this;
		if (m[0] === -1) {
			this.type = null;
			this.run = this.run_system;
			this.behaviortype = null;
			this.beh_index = -1
		} else {
			this.type = this.runtime.types_by_index[m[0]];
			if (this.isstatic) this.run = this.run_static;
			else this.run = this.run_object;
			if (m[2]) {
				this.behaviortype = this.type.getBehaviorByName(m[2]);
				this.beh_index = this.type.getBehaviorIndexByName(m[2])
			} else {
				this.behaviortype = null;
				this.beh_index = -1
			}
			if (this.block.parent) this.block.parent.setSolWriterAfterCnds()
		}
		if (this.fasttrigger) this.run = this.run_true;
		if (m.length === 10) {
			var i, len;
			var em = m[9];
			for (i = 0, len = em.length; i < len; i++) {
				var param = new cr.parameter(this, em[i]);
				cr.seal(param);
				this.parameters.push(param)
			}
			this.results.length = em.length
		}
	}
	Condition.prototype.postInit = function() {
		var i, len, p;
		for (i = 0, len = this.parameters.length; i < len; i++) {
			p = this.parameters[i];
			p.postInit();
			if (p.variesPerInstance) this.anyParamVariesPerInstance = true
		}
	};
	Condition.prototype.run_true = function() {
		return true
	};
	Condition.prototype.run_system = function() {
		var i, len;
		for (i = 0, len = this.parameters.length; i < len; i++) this.results[i] = this.parameters[i].get();
		return cr.xor(this.func.apply(this.runtime.system, this.results), this.inverted)
	};
	Condition.prototype.run_static = function() {
		var i, len;
		for (i = 0, len = this.parameters.length; i < len; i++) this.results[i] = this.parameters[i].get();
		var ret = this.func.apply(this.behaviortype ? this.behaviortype : this.type, this.results);
		this.type.applySolToContainer();
		return ret
	};
	Condition.prototype.run_object = function() {
		var i, j, k, leni, lenj, p, ret, met, inst, s, sol2;
		var type = this.type;
		var sol = type.getCurrentSol();
		var is_orblock = this.block.orblock && !this.trigger;
		var offset = 0;
		var is_contained = type.is_contained;
		var is_family = type.is_family;
		var family_index = type.family_index;
		var beh_index = this.beh_index;
		var is_beh = beh_index > -1;
		var params_vary = this.anyParamVariesPerInstance;
		var parameters = this.parameters;
		var results = this.results;
		var inverted = this.inverted;
		var func = this.func;
		var arr, container;
		if (params_vary) {
			for (j = 0, lenj = parameters.length; j < lenj; ++j) {
				p = parameters[j];
				if (!p.variesPerInstance) results[j] = p.get(0)
			}
		} else {
			for (j = 0, lenj = parameters.length; j < lenj; ++j) results[j] = parameters[j].get(0)
		}
		if (sol.select_all) {
			cr.clearArray(sol.instances);
			cr.clearArray(sol.else_instances);
			arr = type.instances;
			for (i = 0, leni = arr.length; i < leni; ++i) {
				inst = arr[i];
				if (params_vary) {
					for (j = 0, lenj = parameters.length; j < lenj; ++j) {
						p = parameters[j];
						if (p.variesPerInstance) results[j] = p.get(i)
					}
				}
				if (is_beh) {
					offset = 0;
					if (is_family) {
						offset = inst.type.family_beh_map[family_index]
					}
					ret = func.apply(inst.behavior_insts[beh_index + offset], results)
				} else ret = func.apply(inst, results);
				met = cr.xor(ret, inverted);
				if (met) sol.instances.push(inst);
				else if (is_orblock) sol.else_instances.push(inst)
			}
			if (type.finish) type.finish(true);
			sol.select_all = false;
			type.applySolToContainer();
			return sol.hasObjects()
		} else {
			k = 0;
			var using_else_instances = is_orblock && !this.block.isFirstConditionOfType(this);
			arr = using_else_instances ? sol.else_instances : sol.instances;
			var any_true = false;
			for (i = 0, leni = arr.length; i < leni; ++i) {
				inst = arr[i];
				if (params_vary) {
					for (j = 0, lenj = parameters.length; j < lenj; ++j) {
						p = parameters[j];
						if (p.variesPerInstance) results[j] = p.get(i)
					}
				}
				if (is_beh) {
					offset = 0;
					if (is_family) {
						offset = inst.type.family_beh_map[family_index]
					}
					ret = func.apply(inst.behavior_insts[beh_index + offset], results)
				} else ret = func.apply(inst, results);
				if (cr.xor(ret, inverted)) {
					any_true = true;
					if (using_else_instances) {
						sol.instances.push(inst);
						if (is_contained) {
							for (j = 0, lenj = inst.siblings.length; j < lenj; j++) {
								s = inst.siblings[j];
								s.type.getCurrentSol().instances.push(s)
							}
						}
					} else {
						arr[k] = inst;
						if (is_contained) {
							for (j = 0, lenj = inst.siblings.length; j < lenj; j++) {
								s = inst.siblings[j];
								s.type.getCurrentSol().instances[k] = s
							}
						}
						k++
					}
				} else {
					if (using_else_instances) {
						arr[k] = inst;
						if (is_contained) {
							for (j = 0, lenj = inst.siblings.length; j < lenj; j++) {
								s = inst.siblings[j];
								s.type.getCurrentSol().else_instances[k] = s
							}
						}
						k++
					} else if (is_orblock) {
						sol.else_instances.push(inst);
						if (is_contained) {
							for (j = 0, lenj = inst.siblings.length; j < lenj; j++) {
								s = inst.siblings[j];
								s.type.getCurrentSol().else_instances.push(s)
							}
						}
					}
				}
			}
			cr.truncateArray(arr, k);
			if (is_contained) {
				container = type.container;
				for (i = 0, leni = container.length; i < leni; i++) {
					sol2 = container[i].getCurrentSol();
					if (using_else_instances) cr.truncateArray(sol2.else_instances, k);
					else cr.truncateArray(sol2.instances, k)
				}
			}
			var pick_in_finish = any_true;
			if (using_else_instances && !any_true) {
				for (i = 0, leni = sol.instances.length; i < leni; i++) {
					inst = sol.instances[i];
					if (params_vary) {
						for (j = 0, lenj = parameters.length; j < lenj; j++) {
							p = parameters[j];
							if (p.variesPerInstance) results[j] = p.get(i)
						}
					}
					if (is_beh) ret = func.apply(inst.behavior_insts[beh_index], results);
					else ret = func.apply(inst, results);
					if (cr.xor(ret, inverted)) {
						any_true = true;
						break
					}
				}
			}
			if (type.finish) type.finish(pick_in_finish || is_orblock);
			return is_orblock ? any_true : sol.hasObjects()
		}
	};
	cr.condition = Condition;

	function Action(block, m) {
		this.block = block;
		this.sheet = block.sheet;
		this.runtime = block.runtime;
		this.parameters = [];
		this.results = [];
		this.extra = {};
		this.index = -1;
		this.anyParamVariesPerInstance = false;
		this.func = this.runtime.GetObjectReference(m[1]);
		if (m[0] === -1) {
			this.type = null;
			this.run = this.run_system;
			this.behaviortype = null;
			this.beh_index = -1
		} else {
			this.type = this.runtime.types_by_index[m[0]];
			this.run = this.run_object;
			if (m[2]) {
				this.behaviortype = this.type.getBehaviorByName(m[2]);
				this.beh_index = this.type.getBehaviorIndexByName(m[2])
			} else {
				this.behaviortype = null;
				this.beh_index = -1
			}
		}
		this.sid = m[3];
		this.runtime.actsBySid[this.sid.toString()] = this;
		if (m.length === 6) {
			var i, len;
			var em = m[5];
			for (i = 0, len = em.length; i < len; i++) {
				var param = new cr.parameter(this, em[i]);
				cr.seal(param);
				this.parameters.push(param)
			}
			this.results.length = em.length
		}
	}
	Action.prototype.postInit = function() {
		var i, len, p;
		for (i = 0, len = this.parameters.length; i < len; i++) {
			p = this.parameters[i];
			p.postInit();
			if (p.variesPerInstance) this.anyParamVariesPerInstance = true
		}
	};
	Action.prototype.run_system = function() {
		var runtime = this.runtime;
		var i, len;
		var parameters = this.parameters;
		var results = this.results;
		for (i = 0, len = parameters.length; i < len; ++i) results[i] = parameters[i].get();
		return this.func.apply(runtime.system, results)
	};
	Action.prototype.run_object = function() {
		var type = this.type;
		var beh_index = this.beh_index;
		var family_index = type.family_index;
		var params_vary = this.anyParamVariesPerInstance;
		var parameters = this.parameters;
		var results = this.results;
		var func = this.func;
		var instances = type.getCurrentSol().getObjects();
		var is_family = type.is_family;
		var is_beh = beh_index > -1;
		var i, j, leni, lenj, p, inst, offset;
		if (params_vary) {
			for (j = 0, lenj = parameters.length; j < lenj; ++j) {
				p = parameters[j];
				if (!p.variesPerInstance) results[j] = p.get(0)
			}
		} else {
			for (j = 0, lenj = parameters.length; j < lenj; ++j) results[j] = parameters[j].get(0)
		}
		for (i = 0, leni = instances.length; i < leni; ++i) {
			inst = instances[i];
			if (params_vary) {
				for (j = 0, lenj = parameters.length; j < lenj; ++j) {
					p = parameters[j];
					if (p.variesPerInstance) results[j] = p.get(i)
				}
			}
			if (is_beh) {
				offset = 0;
				if (is_family) {
					offset = inst.type.family_beh_map[family_index]
				}
				func.apply(inst.behavior_insts[beh_index + offset], results)
			} else func.apply(inst, results)
		}
		return false
	};
	cr.action = Action;
	var tempValues = [];
	var tempValuesPtr = -1;

	function pushTempValue() {
		tempValuesPtr++;
		if (tempValues.length === tempValuesPtr) tempValues.push(new cr.expvalue);
		return tempValues[tempValuesPtr]
	}
	function popTempValue() {
		tempValuesPtr--
	}
	function Parameter(owner, m) {
		this.owner = owner;
		this.block = owner.block;
		this.sheet = owner.sheet;
		this.runtime = owner.runtime;
		this.type = m[0];
		this.expression = null;
		this.solindex = 0;
		this.get = null;
		this.combosel = 0;
		this.layout = null;
		this.key = 0;
		this.object = null;
		this.index = 0;
		this.varname = null;
		this.eventvar = null;
		this.fileinfo = null;
		this.subparams = null;
		this.variadicret = null;
		this.subparams = null;
		this.variadicret = null;
		this.variesPerInstance = false;
		var i, len, param;
		switch (m[0]) {
		case 0:
		case 7:
			this.expression = new cr.expNode(this, m[1]);
			this.solindex = 0;
			this.get = this.get_exp;
			break;
		case 1:
			this.expression = new cr.expNode(this, m[1]);
			this.solindex = 0;
			this.get = this.get_exp_str;
			break;
		case 5:
			this.expression = new cr.expNode(this, m[1]);
			this.solindex = 0;
			this.get = this.get_layer;
			break;
		case 3:
		case 8:
			this.combosel = m[1];
			this.get = this.get_combosel;
			break;
		case 6:
			this.layout = this.runtime.layouts[m[1]];
			this.get = this.get_layout;
			break;
		case 9:
			this.key = m[1];
			this.get = this.get_key;
			break;
		case 4:
			this.object = this.runtime.types_by_index[m[1]];
			this.get = this.get_object;
			this.block.addSolModifier(this.object);
			if (this.owner instanceof cr.action) this.block.setSolWriterAfterCnds();
			else if (this.block.parent) this.block.parent.setSolWriterAfterCnds();
			break;
		case 10:
			this.index = m[1];
			if (owner.type.is_family) {
				this.get = this.get_familyvar;
				this.variesPerInstance = true
			} else this.get = this.get_instvar;
			break;
		case 11:
			this.varname = m[1];
			this.eventvar = null;
			this.get = this.get_eventvar;
			break;
		case 2:
		case 12:
			this.fileinfo = m[1];
			this.get = this.get_audiofile;
			break;
		case 13:
			this.get = this.get_variadic;
			this.subparams = [];
			this.variadicret = [];
			for (i = 1, len = m.length; i < len; i++) {
				param = new cr.parameter(this.owner, m[i]);
				cr.seal(param);
				this.subparams.push(param);
				this.variadicret.push(0)
			}
			break;
		default:
		}
	}
	Parameter.prototype.postInit = function() {
		var i, len;
		if (this.type === 11) {
			this.eventvar = this.runtime.getEventVariableByName(this.varname, this.block.parent)
		} else if (this.type === 13) {
			for (i = 0, len = this.subparams.length; i < len; i++) this.subparams[i].postInit()
		}
		if (this.expression) this.expression.postInit()
	};
	Parameter.prototype.maybeVaryForType = function(t) {
		if (this.variesPerInstance) return;
		if (!t) return;
		if (!t.plugin.singleglobal) {
			this.variesPerInstance = true;
			return
		}
	};
	Parameter.prototype.setVaries = function() {
		this.variesPerInstance = true
	};
	Parameter.prototype.get_exp = function(solindex) {
		this.solindex = solindex || 0;
		var temp = pushTempValue();
		this.expression.get(temp);
		popTempValue();
		return temp.data
	};
	Parameter.prototype.get_exp_str = function(solindex) {
		this.solindex = solindex || 0;
		var temp = pushTempValue();
		this.expression.get(temp);
		popTempValue();
		if (cr.is_string(temp.data)) return temp.data;
		else return ""
	};
	Parameter.prototype.get_object = function() {
		return this.object
	};
	Parameter.prototype.get_combosel = function() {
		return this.combosel
	};
	Parameter.prototype.get_layer = function(solindex) {
		this.solindex = solindex || 0;
		var temp = pushTempValue();
		this.expression.get(temp);
		popTempValue();
		if (temp.is_number()) return this.runtime.getLayerByNumber(temp.data);
		else return this.runtime.getLayerByName(temp.data)
	};
	Parameter.prototype.get_layout = function() {
		return this.layout
	};
	Parameter.prototype.get_key = function() {
		return this.key
	};
	Parameter.prototype.get_instvar = function() {
		return this.index
	};
	Parameter.prototype.get_familyvar = function(solindex_) {
		var solindex = solindex_ || 0;
		var familytype = this.owner.type;
		var realtype = null;
		var sol = familytype.getCurrentSol();
		var objs = sol.getObjects();
		if (objs.length) realtype = objs[solindex % objs.length].type;
		else if (sol.else_instances.length) realtype = sol.else_instances[solindex % sol.else_instances.length].type;
		else if (familytype.instances.length) realtype = familytype.instances[solindex % familytype.instances.length].type;
		else return 0;
		return this.index + realtype.family_var_map[familytype.family_index]
	};
	Parameter.prototype.get_eventvar = function() {
		return this.eventvar
	};
	Parameter.prototype.get_audiofile = function() {
		return this.fileinfo
	};
	Parameter.prototype.get_variadic = function() {
		var i, len;
		for (i = 0, len = this.subparams.length; i < len; i++) {
			this.variadicret[i] = this.subparams[i].get()
		}
		return this.variadicret
	};
	cr.parameter = Parameter;

	function EventVariable(sheet, parent, m) {
		this.sheet = sheet;
		this.parent = parent;
		this.runtime = sheet.runtime;
		this.solModifiers = [];
		this.name = m[1];
		this.vartype = m[2];
		this.initial = m[3];
		this.is_static = !! m[4];
		this.is_constant = !! m[5];
		this.sid = m[6];
		this.runtime.varsBySid[this.sid.toString()] = this;
		this.data = this.initial;
		if (this.parent) {
			if (this.is_static || this.is_constant) this.localIndex = -1;
			else this.localIndex = this.runtime.stackLocalCount++;
			this.runtime.all_local_vars.push(this)
		} else {
			this.localIndex = -1;
			this.runtime.all_global_vars.push(this)
		}
	}
	EventVariable.prototype.postInit = function() {
		this.solModifiers = findMatchingSolModifier(this.solModifiers)
	};
	EventVariable.prototype.setValue = function(x) {
		var lvs = this.runtime.getCurrentLocalVarStack();
		if (!this.parent || this.is_static || !lvs) this.data = x;
		else {
			if (this.localIndex >= lvs.length) lvs.length = this.localIndex + 1;
			lvs[this.localIndex] = x
		}
	};
	EventVariable.prototype.getValue = function() {
		var lvs = this.runtime.getCurrentLocalVarStack();
		if (!this.parent || this.is_static || !lvs || this.is_constant) return this.data;
		else {
			if (this.localIndex >= lvs.length) {
				return this.initial
			}
			if (typeof lvs[this.localIndex] === "undefined") {
				return this.initial
			}
			return lvs[this.localIndex]
		}
	};
	EventVariable.prototype.run = function() {
		if (this.parent && !this.is_static && !this.is_constant) this.setValue(this.initial)
	};
	cr.eventvariable = EventVariable;

	function EventInclude(sheet, parent, m) {
		this.sheet = sheet;
		this.parent = parent;
		this.runtime = sheet.runtime;
		this.solModifiers = [];
		this.include_sheet = null;
		this.include_sheet_name = m[1];
		this.active = true
	}
	EventInclude.prototype.toString = function() {
		return "include:" + this.include_sheet.toString()
	};
	EventInclude.prototype.postInit = function() {
		this.include_sheet = this.runtime.eventsheets[this.include_sheet_name];
		this.sheet.includes.add(this);
		this.solModifiers = findMatchingSolModifier(this.solModifiers);
		var p = this.parent;
		while (p) {
			if (p.group) p.contained_includes.push(this);
			p = p.parent
		}
		this.updateActive()
	};
	EventInclude.prototype.run = function() {
		if (this.parent) this.runtime.pushCleanSol(this.runtime.types_by_index);
		if (!this.include_sheet.hasRun) this.include_sheet.run(true);
		if (this.parent) this.runtime.popSol(this.runtime.types_by_index)
	};
	EventInclude.prototype.updateActive = function() {
		var p = this.parent;
		while (p) {
			if (p.group && !p.group_active) {
				this.active = false;
				return
			}
			p = p.parent
		}
		this.active = true
	};
	EventInclude.prototype.isActive = function() {
		return this.active
	};
	cr.eventinclude = EventInclude;

	function EventStackFrame() {
		this.temp_parents_arr = [];
		this.reset(null);
		cr.seal(this)
	}
	EventStackFrame.prototype.reset = function(cur_event) {
		this.current_event = cur_event;
		this.cndindex = 0;
		this.actindex = 0;
		cr.clearArray(this.temp_parents_arr);
		this.last_event_true = false;
		this.else_branch_ran = false;
		this.any_true_state = false
	};
	EventStackFrame.prototype.isModifierAfterCnds = function() {
		if (this.current_event.solWriterAfterCnds) return true;
		if (this.cndindex < this.current_event.conditions.length - 1) return !!this.current_event.solModifiers.length;
		return false
	};
	cr.eventStackFrame = EventStackFrame
})();
(function() {
	function ExpNode(owner_, m) {
		this.owner = owner_;
		this.runtime = owner_.runtime;
		this.type = m[0];
		this.get = [this.eval_int, this.eval_float, this.eval_string, this.eval_unaryminus, this.eval_add, this.eval_subtract, this.eval_multiply, this.eval_divide, this.eval_mod, this.eval_power, this.eval_and, this.eval_or, this.eval_equal, this.eval_notequal, this.eval_less, this.eval_lessequal, this.eval_greater, this.eval_greaterequal, this.eval_conditional, this.eval_system_exp, this.eval_object_exp, this.eval_instvar_exp, this.eval_behavior_exp, this.eval_eventvar_exp][this.type];
		var paramsModel = null;
		this.value = null;
		this.first = null;
		this.second = null;
		this.third = null;
		this.func = null;
		this.results = null;
		this.parameters = null;
		this.object_type = null;
		this.beh_index = -1;
		this.instance_expr = null;
		this.varindex = -1;
		this.behavior_type = null;
		this.varname = null;
		this.eventvar = null;
		this.return_string = false;
		switch (this.type) {
		case 0:
		case 1:
		case 2:
			this.value = m[1];
			break;
		case 3:
			this.first = new cr.expNode(owner_, m[1]);
			break;
		case 18:
			this.first = new cr.expNode(owner_, m[1]);
			this.second = new cr.expNode(owner_, m[2]);
			this.third = new cr.expNode(owner_, m[3]);
			break;
		case 19:
			this.func = this.runtime.GetObjectReference(m[1]);
			if (this.func === cr.system_object.prototype.exps.random || this.func === cr.system_object.prototype.exps.choose) {
				this.owner.setVaries()
			}
			this.results = [];
			this.parameters = [];
			if (m.length === 3) {
				paramsModel = m[2];
				this.results.length = paramsModel.length + 1
			} else this.results.length = 1;
			break;
		case 20:
			this.object_type = this.runtime.types_by_index[m[1]];
			this.beh_index = -1;
			this.func = this.runtime.GetObjectReference(m[2]);
			this.return_string = m[3];
			if (cr.plugins_.Function && this.func === cr.plugins_.Function.prototype.exps.Call) {
				this.owner.setVaries()
			}
			if (m[4]) this.instance_expr = new cr.expNode(owner_, m[4]);
			else this.instance_expr = null;
			this.results = [];
			this.parameters = [];
			if (m.length === 6) {
				paramsModel = m[5];
				this.results.length = paramsModel.length + 1
			} else this.results.length = 1;
			break;
		case 21:
			this.object_type = this.runtime.types_by_index[m[1]];
			this.return_string = m[2];
			if (m[3]) this.instance_expr = new cr.expNode(owner_, m[3]);
			else this.instance_expr = null;
			this.varindex = m[4];
			break;
		case 22:
			this.object_type = this.runtime.types_by_index[m[1]];
			this.behavior_type = this.object_type.getBehaviorByName(m[2]);
			this.beh_index = this.object_type.getBehaviorIndexByName(m[2]);
			this.func = this.runtime.GetObjectReference(m[3]);
			this.return_string = m[4];
			if (m[5]) this.instance_expr = new cr.expNode(owner_, m[5]);
			else this.instance_expr = null;
			this.results = [];
			this.parameters = [];
			if (m.length === 7) {
				paramsModel = m[6];
				this.results.length = paramsModel.length + 1
			} else this.results.length = 1;
			break;
		case 23:
			this.varname = m[1];
			this.eventvar = null;
			break
		}
		this.owner.maybeVaryForType(this.object_type);
		if (this.type >= 4 && this.type <= 17) {
			this.first = new cr.expNode(owner_, m[1]);
			this.second = new cr.expNode(owner_, m[2])
		}
		if (paramsModel) {
			var i, len;
			for (i = 0, len = paramsModel.length; i < len; i++) this.parameters.push(new cr.expNode(owner_, paramsModel[i]))
		}
		cr.seal(this)
	}
	ExpNode.prototype.postInit = function() {
		if (this.type === 23) {
			this.eventvar = this.owner.runtime.getEventVariableByName(this.varname, this.owner.block.parent)
		}
		if (this.first) this.first.postInit();
		if (this.second) this.second.postInit();
		if (this.third) this.third.postInit();
		if (this.instance_expr) this.instance_expr.postInit();
		if (this.parameters) {
			var i, len;
			for (i = 0, len = this.parameters.length; i < len; i++) this.parameters[i].postInit()
		}
	};
	var tempValues = [];
	var tempValuesPtr = -1;

	function pushTempValue() {
		++tempValuesPtr;
		if (tempValues.length === tempValuesPtr) tempValues.push(new cr.expvalue);
		return tempValues[tempValuesPtr]
	}
	function popTempValue() {
		--tempValuesPtr
	}
	function eval_params(parameters, results, temp) {
		var i, len;
		for (i = 0, len = parameters.length; i < len; ++i) {
			parameters[i].get(temp);
			results[i + 1] = temp.data
		}
	}
	ExpNode.prototype.eval_system_exp = function(ret) {
		var parameters = this.parameters;
		var results = this.results;
		results[0] = ret;
		var temp = pushTempValue();
		eval_params(parameters, results, temp);
		popTempValue();
		this.func.apply(this.runtime.system, results)
	};
	ExpNode.prototype.eval_object_exp = function(ret) {
		var object_type = this.object_type;
		var results = this.results;
		var parameters = this.parameters;
		var instance_expr = this.instance_expr;
		var func = this.func;
		var index = this.owner.solindex;
		var sol = object_type.getCurrentSol();
		var instances = sol.getObjects();
		if (!instances.length) {
			if (sol.else_instances.length) instances = sol.else_instances;
			else {
				if (this.return_string) ret.set_string("");
				else ret.set_int(0);
				return
			}
		}
		results[0] = ret;
		ret.object_class = object_type;
		var temp = pushTempValue();
		eval_params(parameters, results, temp);
		if (instance_expr) {
			instance_expr.get(temp);
			if (temp.is_number()) {
				index = temp.data;
				instances = object_type.instances
			}
		}
		popTempValue();
		var len = instances.length;
		if (index >= len || index <= -len) index %= len;
		if (index < 0) index += len;
		var returned_val = func.apply(instances[index], results)
	};
	ExpNode.prototype.eval_behavior_exp = function(ret) {
		var object_type = this.object_type;
		var results = this.results;
		var parameters = this.parameters;
		var instance_expr = this.instance_expr;
		var beh_index = this.beh_index;
		var func = this.func;
		var index = this.owner.solindex;
		var sol = object_type.getCurrentSol();
		var instances = sol.getObjects();
		if (!instances.length) {
			if (sol.else_instances.length) instances = sol.else_instances;
			else {
				if (this.return_string) ret.set_string("");
				else ret.set_int(0);
				return
			}
		}
		results[0] = ret;
		ret.object_class = object_type;
		var temp = pushTempValue();
		eval_params(parameters, results, temp);
		if (instance_expr) {
			instance_expr.get(temp);
			if (temp.is_number()) {
				index = temp.data;
				instances = object_type.instances
			}
		}
		popTempValue();
		var len = instances.length;
		if (index >= len || index <= -len) index %= len;
		if (index < 0) index += len;
		var inst = instances[index];
		var offset = 0;
		if (object_type.is_family) {
			offset = inst.type.family_beh_map[object_type.family_index]
		}
		var returned_val = func.apply(inst.behavior_insts[beh_index + offset], results)
	};
	ExpNode.prototype.eval_instvar_exp = function(ret) {
		var instance_expr = this.instance_expr;
		var object_type = this.object_type;
		var varindex = this.varindex;
		var index = this.owner.solindex;
		var sol = object_type.getCurrentSol();
		var instances = sol.getObjects();
		var inst;
		if (!instances.length) {
			if (sol.else_instances.length) instances = sol.else_instances;
			else {
				if (this.return_string) ret.set_string("");
				else ret.set_int(0);
				return
			}
		}
		if (instance_expr) {
			var temp = pushTempValue();
			instance_expr.get(temp);
			if (temp.is_number()) {
				index = temp.data;
				var type_instances = object_type.instances;
				if (type_instances.length !== 0) {
					index %= type_instances.length;
					if (index < 0) index += type_instances.length
				}
				inst = object_type.getInstanceByIID(index);
				var to_ret = inst.instance_vars[varindex];
				if (cr.is_string(to_ret)) ret.set_string(to_ret);
				else ret.set_float(to_ret);
				popTempValue();
				return
			}
			popTempValue()
		}
		var len = instances.length;
		if (index >= len || index <= -len) index %= len;
		if (index < 0) index += len;
		inst = instances[index];
		var offset = 0;
		if (object_type.is_family) {
			offset = inst.type.family_var_map[object_type.family_index]
		}
		var to_ret = inst.instance_vars[varindex + offset];
		if (cr.is_string(to_ret)) ret.set_string(to_ret);
		else ret.set_float(to_ret)
	};
	ExpNode.prototype.eval_int = function(ret) {
		ret.type = cr.exptype.Integer;
		ret.data = this.value
	};
	ExpNode.prototype.eval_float = function(ret) {
		ret.type = cr.exptype.Float;
		ret.data = this.value
	};
	ExpNode.prototype.eval_string = function(ret) {
		ret.type = cr.exptype.String;
		ret.data = this.value
	};
	ExpNode.prototype.eval_unaryminus = function(ret) {
		this.first.get(ret);
		if (ret.is_number()) ret.data = -ret.data
	};
	ExpNode.prototype.eval_add = function(ret) {
		this.first.get(ret);
		var temp = pushTempValue();
		this.second.get(temp);
		if (ret.is_number() && temp.is_number()) {
			ret.data += temp.data;
			if (temp.is_float()) ret.make_float()
		}
		popTempValue()
	};
	ExpNode.prototype.eval_subtract = function(ret) {
		this.first.get(ret);
		var temp = pushTempValue();
		this.second.get(temp);
		if (ret.is_number() && temp.is_number()) {
			ret.data -= temp.data;
			if (temp.is_float()) ret.make_float()
		}
		popTempValue()
	};
	ExpNode.prototype.eval_multiply = function(ret) {
		this.first.get(ret);
		var temp = pushTempValue();
		this.second.get(temp);
		if (ret.is_number() && temp.is_number()) {
			ret.data *= temp.data;
			if (temp.is_float()) ret.make_float()
		}
		popTempValue()
	};
	ExpNode.prototype.eval_divide = function(ret) {
		this.first.get(ret);
		var temp = pushTempValue();
		this.second.get(temp);
		if (ret.is_number() && temp.is_number()) {
			ret.data /= temp.data;
			ret.make_float()
		}
		popTempValue()
	};
	ExpNode.prototype.eval_mod = function(ret) {
		this.first.get(ret);
		var temp = pushTempValue();
		this.second.get(temp);
		if (ret.is_number() && temp.is_number()) {
			ret.data %= temp.data;
			if (temp.is_float()) ret.make_float()
		}
		popTempValue()
	};
	ExpNode.prototype.eval_power = function(ret) {
		this.first.get(ret);
		var temp = pushTempValue();
		this.second.get(temp);
		if (ret.is_number() && temp.is_number()) {
			ret.data = Math.pow(ret.data, temp.data);
			if (temp.is_float()) ret.make_float()
		}
		popTempValue()
	};
	ExpNode.prototype.eval_and = function(ret) {
		this.first.get(ret);
		var temp = pushTempValue();
		this.second.get(temp);
		if (temp.is_string() || ret.is_string()) this.eval_and_stringconcat(ret, temp);
		else this.eval_and_logical(ret, temp);
		popTempValue()
	};
	ExpNode.prototype.eval_and_stringconcat = function(ret, temp) {
		if (ret.is_string() && temp.is_string()) this.eval_and_stringconcat_str_str(ret, temp);
		else this.eval_and_stringconcat_num(ret, temp)
	};
	ExpNode.prototype.eval_and_stringconcat_str_str = function(ret, temp) {
		ret.data += temp.data
	};
	ExpNode.prototype.eval_and_stringconcat_num = function(ret, temp) {
		if (ret.is_string()) {
			ret.data += (Math.round(temp.data * 1e10) / 1e10).toString()
		} else {
			ret.set_string(ret.data.toString() + temp.data)
		}
	};
	ExpNode.prototype.eval_and_logical = function(ret, temp) {
		ret.set_int(ret.data && temp.data ? 1 : 0)
	};
	ExpNode.prototype.eval_or = function(ret) {
		this.first.get(ret);
		var temp = pushTempValue();
		this.second.get(temp);
		if (ret.is_number() && temp.is_number()) {
			if (ret.data || temp.data) ret.set_int(1);
			else ret.set_int(0)
		}
		popTempValue()
	};
	ExpNode.prototype.eval_conditional = function(ret) {
		this.first.get(ret);
		if (ret.data) this.second.get(ret);
		else this.third.get(ret)
	};
	ExpNode.prototype.eval_equal = function(ret) {
		this.first.get(ret);
		var temp = pushTempValue();
		this.second.get(temp);
		ret.set_int(ret.data === temp.data ? 1 : 0);
		popTempValue()
	};
	ExpNode.prototype.eval_notequal = function(ret) {
		this.first.get(ret);
		var temp = pushTempValue();
		this.second.get(temp);
		ret.set_int(ret.data !== temp.data ? 1 : 0);
		popTempValue()
	};
	ExpNode.prototype.eval_less = function(ret) {
		this.first.get(ret);
		var temp = pushTempValue();
		this.second.get(temp);
		ret.set_int(ret.data < temp.data ? 1 : 0);
		popTempValue()
	};
	ExpNode.prototype.eval_lessequal = function(ret) {
		this.first.get(ret);
		var temp = pushTempValue();
		this.second.get(temp);
		ret.set_int(ret.data <= temp.data ? 1 : 0);
		popTempValue()
	};
	ExpNode.prototype.eval_greater = function(ret) {
		this.first.get(ret);
		var temp = pushTempValue();
		this.second.get(temp);
		ret.set_int(ret.data > temp.data ? 1 : 0);
		popTempValue()
	};
	ExpNode.prototype.eval_greaterequal = function(ret) {
		this.first.get(ret);
		var temp = pushTempValue();
		this.second.get(temp);
		ret.set_int(ret.data >= temp.data ? 1 : 0);
		popTempValue()
	};
	ExpNode.prototype.eval_eventvar_exp = function(ret) {
		var val = this.eventvar.getValue();
		if (cr.is_number(val)) ret.set_float(val);
		else ret.set_string(val)
	};
	cr.expNode = ExpNode;

	function ExpValue(type, data) {
		this.type = type || cr.exptype.Integer;
		this.data = data || 0;
		this.object_class = null;
		if (this.type == cr.exptype.Integer) this.data = Math.floor(this.data);
		cr.seal(this)
	}
	ExpValue.prototype.is_int = function() {
		return this.type === cr.exptype.Integer
	};
	ExpValue.prototype.is_float = function() {
		return this.type === cr.exptype.Float
	};
	ExpValue.prototype.is_number = function() {
		return this.type === cr.exptype.Integer || this.type === cr.exptype.Float
	};
	ExpValue.prototype.is_string = function() {
		return this.type === cr.exptype.String
	};
	ExpValue.prototype.make_int = function() {
		if (!this.is_int()) {
			if (this.is_float()) this.data = Math.floor(this.data);
			else if (this.is_string()) this.data = parseInt(this.data, 10);
			this.type = cr.exptype.Integer
		}
	};
	ExpValue.prototype.make_float = function() {
		if (!this.is_float()) {
			if (this.is_string()) this.data = parseFloat(this.data);
			this.type = cr.exptype.Float
		}
	};
	ExpValue.prototype.make_string = function() {
		if (!this.is_string()) {
			this.data = this.data.toString();
			this.type = cr.exptype.String
		}
	};
	ExpValue.prototype.set_int = function(val) {
		this.type = cr.exptype.Integer;
		this.data = Math.floor(val)
	};
	ExpValue.prototype.set_float = function(val) {
		this.type = cr.exptype.Float;
		this.data = val
	};
	ExpValue.prototype.set_string = function(val) {
		this.type = cr.exptype.String;
		this.data = val
	};
	ExpValue.prototype.set_any = function(val) {
		if (cr.is_number(val)) {
			this.type = cr.exptype.Float;
			this.data = val
		} else if (cr.is_string(val)) {
			this.type = cr.exptype.String;
			this.data = val.toString()
		} else {
			this.type = cr.exptype.Integer;
			this.data = 0
		}
	};
	cr.expvalue = ExpValue;
	cr.exptype = {
		Integer: 0,
		Float: 1,
		String: 2
	}
})();
cr.system_object = function(runtime) {
	this.runtime = runtime;
	this.waits = []
};
cr.system_object.prototype.saveToJSON = function() {
	var o = {};
	var i, len, j, lenj, p, w, t, sobj;
	o["waits"] = [];
	var owaits = o["waits"];
	var waitobj;
	for (i = 0, len = this.waits.length; i < len; i++) {
		w = this.waits[i];
		waitobj = {
			t: w.time,
			st: w.signaltag,
			s: w.signalled,
			ev: w.ev.sid,
			sm: [],
			sols: {}
		};
		if (w.ev.actions[w.actindex]) waitobj["act"] = w.ev.actions[w.actindex].sid;
		for (j = 0, lenj = w.solModifiers.length; j < lenj; j++) waitobj["sm"].push(w.solModifiers[j].sid);
		for (p in w.sols) {
			if (w.sols.hasOwnProperty(p)) {
				t = this.runtime.types_by_index[parseInt(p, 10)];
				sobj = {
					sa: w.sols[p].sa,
					insts: []
				};
				for (j = 0, lenj = w.sols[p].insts.length; j < lenj; j++) sobj["insts"].push(w.sols[p].insts[j].uid);
				waitobj["sols"][t.sid.toString()] = sobj
			}
		}
		owaits.push(waitobj)
	}
	return o
};
cr.system_object.prototype.loadFromJSON = function(o) {
	var owaits = o["waits"];
	var i, len, j, lenj, p, w, addWait, e, aindex, t, savedsol, nusol, inst;
	cr.clearArray(this.waits);
	for (i = 0, len = owaits.length; i < len; i++) {
		w = owaits[i];
		e = this.runtime.blocksBySid[w["ev"].toString()];
		if (!e) continue;
		aindex = -1;
		for (j = 0, lenj = e.actions.length; j < lenj; j++) {
			if (e.actions[j].sid === w["act"]) {
				aindex = j;
				break
			}
		}
		if (aindex === -1) continue;
		addWait = {};
		addWait.sols = {};
		addWait.solModifiers = [];
		addWait.deleteme = false;
		addWait.time = w["t"];
		addWait.signaltag = w["st"] || "";
		addWait.signalled = !! w["s"];
		addWait.ev = e;
		addWait.actindex = aindex;
		for (j = 0, lenj = w["sm"].length; j < lenj; j++) {
			t = this.runtime.getObjectTypeBySid(w["sm"][j]);
			if (t) addWait.solModifiers.push(t)
		}
		for (p in w["sols"]) {
			if (w["sols"].hasOwnProperty(p)) {
				t = this.runtime.getObjectTypeBySid(parseInt(p, 10));
				if (!t) continue;
				savedsol = w["sols"][p];
				nusol = {
					sa: savedsol["sa"],
					insts: []
				};
				for (j = 0, lenj = savedsol["insts"].length; j < lenj; j++) {
					inst = this.runtime.getObjectByUID(savedsol["insts"][j]);
					if (inst) nusol.insts.push(inst)
				}
				addWait.sols[t.index.toString()] = nusol
			}
		}
		this.waits.push(addWait)
	}
};
(function() {
	var sysProto = cr.system_object.prototype;

	function SysCnds() {}
	SysCnds.prototype.EveryTick = function() {
		return true
	};
	SysCnds.prototype.OnLayoutStart = function() {
		return true
	};
	SysCnds.prototype.OnLayoutEnd = function() {
		return true
	};
	SysCnds.prototype.Compare = function(x, cmp, y) {
		return cr.do_cmp(x, cmp, y)
	};
	SysCnds.prototype.CompareTime = function(cmp, t) {
		var elapsed = this.runtime.kahanTime.sum;
		if (cmp === 0) {
			var cnd = this.runtime.getCurrentCondition();
			if (!cnd.extra["CompareTime_executed"]) {
				if (elapsed >= t) {
					cnd.extra["CompareTime_executed"] = true;
					return true
				}
			}
			return false
		}
		return cr.do_cmp(elapsed, cmp, t)
	};
	SysCnds.prototype.LayerVisible = function(layer) {
		if (!layer) return false;
		else return layer.visible
	};
	SysCnds.prototype.LayerEmpty = function(layer) {
		if (!layer) return false;
		else return !layer.instances.length
	};
	SysCnds.prototype.LayerCmpOpacity = function(layer, cmp, opacity_) {
		if (!layer) return false;
		return cr.do_cmp(layer.opacity * 100, cmp, opacity_)
	};
	SysCnds.prototype.Repeat = function(count) {
		var current_frame = this.runtime.getCurrentEventStack();
		var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
		var current_loop = this.runtime.pushLoopStack();
		var i;
		if (solModifierAfterCnds) {
			for (i = 0; i < count && !current_loop.stopped; i++) {
				this.runtime.pushCopySol(current_event.solModifiers);
				current_loop.index = i;
				current_event.retrigger();
				this.runtime.popSol(current_event.solModifiers)
			}
		} else {
			for (i = 0; i < count && !current_loop.stopped; i++) {
				current_loop.index = i;
				current_event.retrigger()
			}
		}
		this.runtime.popLoopStack();
		return false
	};
	SysCnds.prototype.While = function(count) {
		var current_frame = this.runtime.getCurrentEventStack();
		var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
		var current_loop = this.runtime.pushLoopStack();
		var i;
		if (solModifierAfterCnds) {
			for (i = 0; !current_loop.stopped; i++) {
				this.runtime.pushCopySol(current_event.solModifiers);
				current_loop.index = i;
				if (!current_event.retrigger()) current_loop.stopped = true;
				this.runtime.popSol(current_event.solModifiers)
			}
		} else {
			for (i = 0; !current_loop.stopped; i++) {
				current_loop.index = i;
				if (!current_event.retrigger()) current_loop.stopped = true
			}
		}
		this.runtime.popLoopStack();
		return false
	};
	SysCnds.prototype.For = function(name, start, end) {
		var current_frame = this.runtime.getCurrentEventStack();
		var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
		var current_loop = this.runtime.pushLoopStack(name);
		var i;
		if (end < start) {
			if (solModifierAfterCnds) {
				for (i = start; i >= end && !current_loop.stopped; --i) {
					this.runtime.pushCopySol(current_event.solModifiers);
					current_loop.index = i;
					current_event.retrigger();
					this.runtime.popSol(current_event.solModifiers)
				}
			} else {
				for (i = start; i >= end && !current_loop.stopped; --i) {
					current_loop.index = i;
					current_event.retrigger()
				}
			}
		} else {
			if (solModifierAfterCnds) {
				for (i = start; i <= end && !current_loop.stopped; ++i) {
					this.runtime.pushCopySol(current_event.solModifiers);
					current_loop.index = i;
					current_event.retrigger();
					this.runtime.popSol(current_event.solModifiers)
				}
			} else {
				for (i = start; i <= end && !current_loop.stopped; ++i) {
					current_loop.index = i;
					current_event.retrigger()
				}
			}
		}
		this.runtime.popLoopStack();
		return false
	};
	var foreach_instancestack = [];
	var foreach_instanceptr = -1;
	SysCnds.prototype.ForEach = function(obj) {
		var sol = obj.getCurrentSol();
		foreach_instanceptr++;
		if (foreach_instancestack.length === foreach_instanceptr) foreach_instancestack.push([]);
		var instances = foreach_instancestack[foreach_instanceptr];
		cr.shallowAssignArray(instances, sol.getObjects());
		var current_frame = this.runtime.getCurrentEventStack();
		var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
		var current_loop = this.runtime.pushLoopStack();
		var i, len, j, lenj, inst, s, sol2;
		var is_contained = obj.is_contained;
		if (solModifierAfterCnds) {
			for (i = 0, len = instances.length; i < len && !current_loop.stopped; i++) {
				this.runtime.pushCopySol(current_event.solModifiers);
				inst = instances[i];
				sol = obj.getCurrentSol();
				sol.select_all = false;
				cr.clearArray(sol.instances);
				sol.instances[0] = inst;
				if (is_contained) {
					for (j = 0, lenj = inst.siblings.length; j < lenj; j++) {
						s = inst.siblings[j];
						sol2 = s.type.getCurrentSol();
						sol2.select_all = false;
						cr.clearArray(sol2.instances);
						sol2.instances[0] = s
					}
				}
				current_loop.index = i;
				current_event.retrigger();
				this.runtime.popSol(current_event.solModifiers)
			}
		} else {
			sol.select_all = false;
			cr.clearArray(sol.instances);
			for (i = 0, len = instances.length; i < len && !current_loop.stopped; i++) {
				inst = instances[i];
				sol.instances[0] = inst;
				if (is_contained) {
					for (j = 0, lenj = inst.siblings.length; j < lenj; j++) {
						s = inst.siblings[j];
						sol2 = s.type.getCurrentSol();
						sol2.select_all = false;
						cr.clearArray(sol2.instances);
						sol2.instances[0] = s
					}
				}
				current_loop.index = i;
				current_event.retrigger()
			}
		}
		cr.clearArray(instances);
		this.runtime.popLoopStack();
		foreach_instanceptr--;
		return false
	};

	function foreach_sortinstances(a, b) {
		var va = a.extra["c2_feo_val"];
		var vb = b.extra["c2_feo_val"];
		if (cr.is_number(va) && cr.is_number(vb)) return va - vb;
		else {
			va = "" + va;
			vb = "" + vb;
			if (va < vb) return -1;
			else if (va > vb) return 1;
			else return 0
		}
	}
	SysCnds.prototype.ForEachOrdered = function(obj, exp, order) {
		var sol = obj.getCurrentSol();
		foreach_instanceptr++;
		if (foreach_instancestack.length === foreach_instanceptr) foreach_instancestack.push([]);
		var instances = foreach_instancestack[foreach_instanceptr];
		cr.shallowAssignArray(instances, sol.getObjects());
		var current_frame = this.runtime.getCurrentEventStack();
		var current_event = current_frame.current_event;
		var current_condition = this.runtime.getCurrentCondition();
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
		var current_loop = this.runtime.pushLoopStack();
		var i, len, j, lenj, inst, s, sol2;
		for (i = 0, len = instances.length; i < len; i++) {
			instances[i].extra["c2_feo_val"] = current_condition.parameters[1].get(i)
		}
		instances.sort(foreach_sortinstances);
		if (order === 1) instances.reverse();
		var is_contained = obj.is_contained;
		if (solModifierAfterCnds) {
			for (i = 0, len = instances.length; i < len && !current_loop.stopped; i++) {
				this.runtime.pushCopySol(current_event.solModifiers);
				inst = instances[i];
				sol = obj.getCurrentSol();
				sol.select_all = false;
				cr.clearArray(sol.instances);
				sol.instances[0] = inst;
				if (is_contained) {
					for (j = 0, lenj = inst.siblings.length; j < lenj; j++) {
						s = inst.siblings[j];
						sol2 = s.type.getCurrentSol();
						sol2.select_all = false;
						cr.clearArray(sol2.instances);
						sol2.instances[0] = s
					}
				}
				current_loop.index = i;
				current_event.retrigger();
				this.runtime.popSol(current_event.solModifiers)
			}
		} else {
			sol.select_all = false;
			cr.clearArray(sol.instances);
			for (i = 0, len = instances.length; i < len && !current_loop.stopped; i++) {
				inst = instances[i];
				sol.instances[0] = inst;
				if (is_contained) {
					for (j = 0, lenj = inst.siblings.length; j < lenj; j++) {
						s = inst.siblings[j];
						sol2 = s.type.getCurrentSol();
						sol2.select_all = false;
						cr.clearArray(sol2.instances);
						sol2.instances[0] = s
					}
				}
				current_loop.index = i;
				current_event.retrigger()
			}
		}
		cr.clearArray(instances);
		this.runtime.popLoopStack();
		foreach_instanceptr--;
		return false
	};
	SysCnds.prototype.PickByComparison = function(obj_, exp_, cmp_, val_) {
		var i, len, k, inst;
		if (!obj_) return;
		foreach_instanceptr++;
		if (foreach_instancestack.length === foreach_instanceptr) foreach_instancestack.push([]);
		var tmp_instances = foreach_instancestack[foreach_instanceptr];
		var sol = obj_.getCurrentSol();
		cr.shallowAssignArray(tmp_instances, sol.getObjects());
		if (sol.select_all) cr.clearArray(sol.else_instances);
		var current_condition = this.runtime.getCurrentCondition();
		for (i = 0, k = 0, len = tmp_instances.length; i < len; i++) {
			inst = tmp_instances[i];
			tmp_instances[k] = inst;
			exp_ = current_condition.parameters[1].get(i);
			val_ = current_condition.parameters[3].get(i);
			if (cr.do_cmp(exp_, cmp_, val_)) {
				k++
			} else {
				sol.else_instances.push(inst)
			}
		}
		cr.truncateArray(tmp_instances, k);
		sol.select_all = false;
		cr.shallowAssignArray(sol.instances, tmp_instances);
		cr.clearArray(tmp_instances);
		foreach_instanceptr--;
		obj_.applySolToContainer();
		return !!sol.instances.length
	};
	SysCnds.prototype.PickByEvaluate = function(obj_, exp_) {
		var i, len, k, inst;
		if (!obj_) return;
		foreach_instanceptr++;
		if (foreach_instancestack.length === foreach_instanceptr) foreach_instancestack.push([]);
		var tmp_instances = foreach_instancestack[foreach_instanceptr];
		var sol = obj_.getCurrentSol();
		cr.shallowAssignArray(tmp_instances, sol.getObjects());
		if (sol.select_all) cr.clearArray(sol.else_instances);
		var current_condition = this.runtime.getCurrentCondition();
		for (i = 0, k = 0, len = tmp_instances.length; i < len; i++) {
			inst = tmp_instances[i];
			tmp_instances[k] = inst;
			exp_ = current_condition.parameters[1].get(i);
			if (exp_) {
				k++
			} else {
				sol.else_instances.push(inst)
			}
		}
		cr.truncateArray(tmp_instances, k);
		sol.select_all = false;
		cr.shallowAssignArray(sol.instances, tmp_instances);
		cr.clearArray(tmp_instances);
		foreach_instanceptr--;
		obj_.applySolToContainer();
		return !!sol.instances.length
	};
	SysCnds.prototype.TriggerOnce = function() {
		var cndextra = this.runtime.getCurrentCondition().extra;
		if (typeof cndextra["TriggerOnce_lastTick"] === "undefined") cndextra["TriggerOnce_lastTick"] = -1;
		var last_tick = cndextra["TriggerOnce_lastTick"];
		var cur_tick = this.runtime.tickcount;
		cndextra["TriggerOnce_lastTick"] = cur_tick;
		return this.runtime.layout_first_tick || last_tick !== cur_tick - 1
	};
	SysCnds.prototype.Every = function(seconds) {
		var cnd = this.runtime.getCurrentCondition();
		var last_time = cnd.extra["Every_lastTime"] || 0;
		var cur_time = this.runtime.kahanTime.sum;
		if (typeof cnd.extra["Every_seconds"] === "undefined") cnd.extra["Every_seconds"] = seconds;
		var this_seconds = cnd.extra["Every_seconds"];
		if (cur_time >= last_time + this_seconds) {
			cnd.extra["Every_lastTime"] = last_time + this_seconds;
			if (cur_time >= cnd.extra["Every_lastTime"] + .04) {
				cnd.extra["Every_lastTime"] = cur_time
			}
			cnd.extra["Every_seconds"] = seconds;
			return true
		} else if (cur_time < last_time - .1) {
			cnd.extra["Every_lastTime"] = cur_time
		}
		return false
	};
	SysCnds.prototype.PickNth = function(obj, index) {
		if (!obj) return false;
		var sol = obj.getCurrentSol();
		var instances = sol.getObjects();
		index = cr.floor(index);
		if (index < 0 || index >= instances.length) return false;
		var inst = instances[index];
		sol.pick_one(inst);
		obj.applySolToContainer();
		return true
	};
	SysCnds.prototype.PickRandom = function(obj) {
		if (!obj) return false;
		var sol = obj.getCurrentSol();
		var instances = sol.getObjects();
		var index = cr.floor(Math.random() * instances.length);
		if (index >= instances.length) return false;
		var inst = instances[index];
		sol.pick_one(inst);
		obj.applySolToContainer();
		return true
	};
	SysCnds.prototype.CompareVar = function(v, cmp, val) {
		return cr.do_cmp(v.getValue(), cmp, val)
	};
	SysCnds.prototype.IsGroupActive = function(group) {
		var g = this.runtime.groups_by_name[group.toLowerCase()];
		return g && g.group_active
	};
	SysCnds.prototype.IsPreview = function() {
		return typeof cr_is_preview !== "undefined"
	};
	SysCnds.prototype.PickAll = function(obj) {
		if (!obj) return false;
		if (!obj.instances.length) return false;
		var sol = obj.getCurrentSol();
		sol.select_all = true;
		obj.applySolToContainer();
		return true
	};
	SysCnds.prototype.IsMobile = function() {
		return this.runtime.isMobile
	};
	SysCnds.prototype.CompareBetween = function(x, a, b) {
		return x >= a && x <= b
	};
	SysCnds.prototype.Else = function() {
		var current_frame = this.runtime.getCurrentEventStack();
		if (current_frame.else_branch_ran) return false;
		else return !current_frame.last_event_true
	};
	SysCnds.prototype.OnLoadFinished = function() {
		return true
	};
	SysCnds.prototype.OnCanvasSnapshot = function() {
		return true
	};
	SysCnds.prototype.EffectsSupported = function() {
		return !!this.runtime.glwrap
	};
	SysCnds.prototype.OnSaveComplete = function() {
		return true
	};
	SysCnds.prototype.OnLoadComplete = function() {
		return true
	};
	SysCnds.prototype.OnLoadFailed = function() {
		return true
	};
	SysCnds.prototype.ObjectUIDExists = function(u) {
		return !!this.runtime.getObjectByUID(u)
	};
	SysCnds.prototype.IsOnPlatform = function(p) {
		var rt = this.runtime;
		switch (p) {
		case 0:
			return !rt.isDomFree && !rt.isNodeWebkit && !rt.isCordova && !rt.isWinJS && !rt.isWindowsPhone8 && !rt.isBlackberry10 && !rt.isAmazonWebApp;
		case 1:
			return rt.isiOS;
		case 2:
			return rt.isAndroid;
		case 3:
			return rt.isWindows8App;
		case 4:
			return rt.isWindowsPhone8;
		case 5:
			return rt.isBlackberry10;
		case 6:
			return rt.isTizen;
		case 7:
			return rt.isCocoonJs;
		case 8:
			return rt.isCordova;
		case 9:
			return rt.isArcade;
		case 10:
			return rt.isNodeWebkit;
		case 11:
			return rt.isCrosswalk;
		case 12:
			return rt.isAmazonWebApp;
		default:
			return false
		}
	};
	var cacheRegex = null;
	var lastRegex = "";
	var lastFlags = "";

	function getRegex(regex_, flags_) {
		if (!cacheRegex || regex_ !== lastRegex || flags_ !== lastFlags) {
			cacheRegex = new RegExp(regex_, flags_);
			lastRegex = regex_;
			lastFlags = flags_
		}
		cacheRegex.lastIndex = 0;
		return cacheRegex
	}
	SysCnds.prototype.RegexTest = function(str_, regex_, flags_) {
		var regex = getRegex(regex_, flags_);
		return regex.test(str_)
	};
	var tmp_arr = [];
	SysCnds.prototype.PickOverlappingPoint = function(obj_, x_, y_) {
		if (!obj_) return false;
		var sol = obj_.getCurrentSol();
		var instances = sol.getObjects();
		var current_event = this.runtime.getCurrentEventStack().current_event;
		var orblock = current_event.orblock;
		var cnd = this.runtime.getCurrentCondition();
		var i, len, inst, pick;
		if (sol.select_all) {
			cr.shallowAssignArray(tmp_arr, instances);
			cr.clearArray(sol.else_instances);
			sol.select_all = false;
			cr.clearArray(sol.instances)
		} else {
			if (orblock) {
				cr.shallowAssignArray(tmp_arr, sol.else_instances);
				cr.clearArray(sol.else_instances)
			} else {
				cr.shallowAssignArray(tmp_arr, instances);
				cr.clearArray(sol.instances)
			}
		}
		for (i = 0, len = tmp_arr.length; i < len; ++i) {
			inst = tmp_arr[i];
			inst.update_bbox();
			pick = cr.xor(inst.contains_pt(x_, y_), cnd.inverted);
			if (pick) sol.instances.push(inst);
			else sol.else_instances.push(inst)
		}
		obj_.applySolToContainer();
		return cr.xor( !! sol.instances.length, cnd.inverted)
	};
	SysCnds.prototype.IsNaN = function(n) {
		return !!isNaN(n)
	};
	SysCnds.prototype.AngleWithin = function(a1, within, a2) {
		return cr.angleDiff(cr.to_radians(a1), cr.to_radians(a2)) <= cr.to_radians(within)
	};
	SysCnds.prototype.IsClockwiseFrom = function(a1, a2) {
		return cr.angleClockwise(cr.to_radians(a1), cr.to_radians(a2))
	};
	SysCnds.prototype.IsBetweenAngles = function(a, la, ua) {
		var angle = cr.to_clamped_radians(a);
		var lower = cr.to_clamped_radians(la);
		var upper = cr.to_clamped_radians(ua);
		var obtuse = !cr.angleClockwise(upper, lower);
		if (obtuse) return !(!cr.angleClockwise(angle, lower) && cr.angleClockwise(angle, upper));
		else return cr.angleClockwise(angle, lower) && !cr.angleClockwise(angle, upper)
	};
	SysCnds.prototype.IsValueType = function(x, t) {
		if (typeof x === "number") return t === 0;
		else return t === 1
	};
	sysProto.cnds = new SysCnds;

	function SysActs() {}
	SysActs.prototype.GoToLayout = function(to) {
		if (this.runtime.isloading) return;
		if (this.runtime.changelayout) return;
		this.runtime.changelayout = to
	};
	SysActs.prototype.NextPrevLayout = function(prev) {
		if (this.runtime.isloading) return;
		if (this.runtime.changelayout) return;
		var index = this.runtime.layouts_by_index.indexOf(this.runtime.running_layout);
		if (prev && index === 0) return;
		if (!prev && index === this.runtime.layouts_by_index.length - 1) return;
		var to = this.runtime.layouts_by_index[index + (prev ? -1 : 1)];
		this.runtime.changelayout = to
	};
	SysActs.prototype.CreateObject = function(obj, layer, x, y) {
		if (!layer || !obj) return;
		var inst = this.runtime.createInstance(obj, layer, x, y);
		if (!inst) return;
		this.runtime.isInOnDestroy++;
		var i, len, s;
		this.runtime.trigger(Object.getPrototypeOf(obj.plugin).cnds.OnCreated, inst);
		if (inst.is_contained) {
			for (i = 0, len = inst.siblings.length; i < len; i++) {
				s = inst.siblings[i];
				this.runtime.trigger(Object.getPrototypeOf(s.type.plugin).cnds.OnCreated, s)
			}
		}
		this.runtime.isInOnDestroy--;
		var sol = obj.getCurrentSol();
		sol.select_all = false;
		cr.clearArray(sol.instances);
		sol.instances[0] = inst;
		if (inst.is_contained) {
			for (i = 0, len = inst.siblings.length; i < len; i++) {
				s = inst.siblings[i];
				sol = s.type.getCurrentSol();
				sol.select_all = false;
				cr.clearArray(sol.instances);
				sol.instances[0] = s
			}
		}
	};
	SysActs.prototype.SetLayerVisible = function(layer, visible_) {
		if (!layer) return;
		if (layer.visible !== visible_) {
			layer.visible = visible_;
			this.runtime.redraw = true
		}
	};
	SysActs.prototype.SetLayerOpacity = function(layer, opacity_) {
		if (!layer) return;
		opacity_ = cr.clamp(opacity_ / 100, 0, 1);
		if (layer.opacity !== opacity_) {
			layer.opacity = opacity_;
			this.runtime.redraw = true
		}
	};
	SysActs.prototype.SetLayerScaleRate = function(layer, sr) {
		if (!layer) return;
		if (layer.zoomRate !== sr) {
			layer.zoomRate = sr;
			this.runtime.redraw = true
		}
	};
	SysActs.prototype.SetLayerForceOwnTexture = function(layer, f) {
		if (!layer) return;
		f = !! f;
		if (layer.forceOwnTexture !== f) {
			layer.forceOwnTexture = f;
			this.runtime.redraw = true
		}
	};
	SysActs.prototype.SetLayoutScale = function(s) {
		if (!this.runtime.running_layout) return;
		if (this.runtime.running_layout.scale !== s) {
			this.runtime.running_layout.scale = s;
			this.runtime.running_layout.boundScrolling();
			this.runtime.redraw = true
		}
	};
	SysActs.prototype.ScrollX = function(x) {
		this.runtime.running_layout.scrollToX(x)
	};
	SysActs.prototype.ScrollY = function(y) {
		this.runtime.running_layout.scrollToY(y)
	};
	SysActs.prototype.Scroll = function(x, y) {
		this.runtime.running_layout.scrollToX(x);
		this.runtime.running_layout.scrollToY(y)
	};
	SysActs.prototype.ScrollToObject = function(obj) {
		var inst = obj.getFirstPicked();
		if (inst) {
			this.runtime.running_layout.scrollToX(inst.x);
			this.runtime.running_layout.scrollToY(inst.y)
		}
	};
	SysActs.prototype.SetVar = function(v, x) {
		if (v.vartype === 0) {
			if (cr.is_number(x)) v.setValue(x);
			else v.setValue(parseFloat(x))
		} else if (v.vartype === 1) v.setValue(x.toString())
	};
	SysActs.prototype.AddVar = function(v, x) {
		if (v.vartype === 0) {
			if (cr.is_number(x)) v.setValue(v.getValue() + x);
			else v.setValue(v.getValue() + parseFloat(x))
		} else if (v.vartype === 1) v.setValue(v.getValue() + x.toString())
	};
	SysActs.prototype.SubVar = function(v, x) {
		if (v.vartype === 0) {
			if (cr.is_number(x)) v.setValue(v.getValue() - x);
			else v.setValue(v.getValue() - parseFloat(x))
		}
	};
	SysActs.prototype.SetGroupActive = function(group, active) {
		var g = this.runtime.groups_by_name[group.toLowerCase()];
		if (!g) return;
		switch (active) {
		case 0:
			g.setGroupActive(false);
			break;
		case 1:
			g.setGroupActive(true);
			break;
		case 2:
			g.setGroupActive(!g.group_active);
			break
		}
	};
	SysActs.prototype.SetTimescale = function(ts_) {
		var ts = ts_;
		if (ts < 0) ts = 0;
		this.runtime.timescale = ts
	};
	SysActs.prototype.SetObjectTimescale = function(obj, ts_) {
		var ts = ts_;
		if (ts < 0) ts = 0;
		if (!obj) return;
		var sol = obj.getCurrentSol();
		var instances = sol.getObjects();
		var i, len;
		for (i = 0, len = instances.length; i < len; i++) {
			instances[i].my_timescale = ts
		}
	};
	SysActs.prototype.RestoreObjectTimescale = function(obj) {
		if (!obj) return false;
		var sol = obj.getCurrentSol();
		var instances = sol.getObjects();
		var i, len;
		for (i = 0, len = instances.length; i < len; i++) {
			instances[i].my_timescale = -1
		}
	};
	var waitobjrecycle = [];

	function allocWaitObject() {
		var w;
		if (waitobjrecycle.length) w = waitobjrecycle.pop();
		else {
			w = {};
			w.sols = {};
			w.solModifiers = []
		}
		w.deleteme = false;
		return w
	}
	function freeWaitObject(w) {
		cr.wipe(w.sols);
		cr.clearArray(w.solModifiers);
		waitobjrecycle.push(w)
	}
	var solstateobjects = [];

	function allocSolStateObject() {
		var s;
		if (solstateobjects.length) s = solstateobjects.pop();
		else {
			s = {};
			s.insts = []
		}
		s.sa = false;
		return s
	}
	function freeSolStateObject(s) {
		cr.clearArray(s.insts);
		solstateobjects.push(s)
	}
	SysActs.prototype.Wait = function(seconds) {
		if (seconds < 0) return;
		var i, len, s, t, ss;
		var evinfo = this.runtime.getCurrentEventStack();
		var waitobj = allocWaitObject();
		waitobj.time = this.runtime.kahanTime.sum + seconds;
		waitobj.signaltag = "";
		waitobj.signalled = false;
		waitobj.ev = evinfo.current_event;
		waitobj.actindex = evinfo.actindex + 1;
		for (i = 0, len = this.runtime.types_by_index.length; i < len; i++) {
			t = this.runtime.types_by_index[i];
			s = t.getCurrentSol();
			if (s.select_all && evinfo.current_event.solModifiers.indexOf(t) === -1) continue;
			waitobj.solModifiers.push(t);
			ss = allocSolStateObject();
			ss.sa = s.select_all;
			cr.shallowAssignArray(ss.insts, s.instances);
			waitobj.sols[i.toString()] = ss
		}
		this.waits.push(waitobj);
		return true
	};
	SysActs.prototype.WaitForSignal = function(tag) {
		var i, len, s, t, ss;
		var evinfo = this.runtime.getCurrentEventStack();
		var waitobj = allocWaitObject();
		waitobj.time = -1;
		waitobj.signaltag = tag.toLowerCase();
		waitobj.signalled = false;
		waitobj.ev = evinfo.current_event;
		waitobj.actindex = evinfo.actindex + 1;
		for (i = 0, len = this.runtime.types_by_index.length; i < len; i++) {
			t = this.runtime.types_by_index[i];
			s = t.getCurrentSol();
			if (s.select_all && evinfo.current_event.solModifiers.indexOf(t) === -1) continue;
			waitobj.solModifiers.push(t);
			ss = allocSolStateObject();
			ss.sa = s.select_all;
			cr.shallowAssignArray(ss.insts, s.instances);
			waitobj.sols[i.toString()] = ss
		}
		this.waits.push(waitobj);
		return true
	};
	SysActs.prototype.Signal = function(tag) {
		var lowertag = tag.toLowerCase();
		var i, len, w;
		for (i = 0, len = this.waits.length; i < len; ++i) {
			w = this.waits[i];
			if (w.time !== -1) continue;
			if (w.signaltag === lowertag) w.signalled = true
		}
	};
	SysActs.prototype.SetLayerScale = function(layer, scale) {
		if (!layer) return;
		if (layer.scale === scale) return;
		layer.scale = scale;
		this.runtime.redraw = true
	};
	SysActs.prototype.ResetGlobals = function() {
		var i, len, g;
		for (i = 0, len = this.runtime.all_global_vars.length; i < len; i++) {
			g = this.runtime.all_global_vars[i];
			g.data = g.initial
		}
	};
	SysActs.prototype.SetLayoutAngle = function(a) {
		a = cr.to_radians(a);
		a = cr.clamp_angle(a);
		if (this.runtime.running_layout) {
			if (this.runtime.running_layout.angle !== a) {
				this.runtime.running_layout.angle = a;
				this.runtime.redraw = true
			}
		}
	};
	SysActs.prototype.SetLayerAngle = function(layer, a) {
		if (!layer) return;
		a = cr.to_radians(a);
		a = cr.clamp_angle(a);
		if (layer.angle === a) return;
		layer.angle = a;
		this.runtime.redraw = true
	};
	SysActs.prototype.SetLayerParallax = function(layer, px, py) {
		if (!layer) return;
		if (layer.parallaxX === px / 100 && layer.parallaxY === py / 100) return;
		layer.parallaxX = px / 100;
		layer.parallaxY = py / 100;
		if (layer.parallaxX !== 1 || layer.parallaxY !== 1) {
			var i, len, instances = layer.instances;
			for (i = 0, len = instances.length; i < len; ++i) {
				instances[i].type.any_instance_parallaxed = true
			}
		}
		this.runtime.redraw = true
	};
	SysActs.prototype.SetLayerBackground = function(layer, c) {
		if (!layer) return;
		var r = cr.GetRValue(c);
		var g = cr.GetGValue(c);
		var b = cr.GetBValue(c);
		if (layer.background_color[0] === r && layer.background_color[1] === g && layer.background_color[2] === b) return;
		layer.background_color[0] = r;
		layer.background_color[1] = g;
		layer.background_color[2] = b;
		this.runtime.redraw = true
	};
	SysActs.prototype.SetLayerTransparent = function(layer, t) {
		if (!layer) return;
		if ( !! t === !! layer.transparent) return;
		layer.transparent = !! t;
		this.runtime.redraw = true
	};
	SysActs.prototype.SetLayerBlendMode = function(layer, bm) {
		if (!layer) return;
		if (layer.blend_mode === bm) return;
		layer.blend_mode = bm;
		layer.compositeOp = cr.effectToCompositeOp(layer.blend_mode);
		if (this.runtime.gl) cr.setGLBlend(layer, layer.blend_mode, this.runtime.gl);
		this.runtime.redraw = true
	};
	SysActs.prototype.StopLoop = function() {
		if (this.runtime.loop_stack_index < 0) return;
		this.runtime.getCurrentLoop().stopped = true
	};
	SysActs.prototype.GoToLayoutByName = function(layoutname) {
		if (this.runtime.isloading) return;
		if (this.runtime.changelayout) return;
		var l;
		for (l in this.runtime.layouts) {
			if (this.runtime.layouts.hasOwnProperty(l) && cr.equals_nocase(l, layoutname)) {
				this.runtime.changelayout = this.runtime.layouts[l];
				return
			}
		}
	};
	SysActs.prototype.RestartLayout = function(layoutname) {
		if (this.runtime.isloading) return;
		if (this.runtime.changelayout) return;
		if (!this.runtime.running_layout) return;
		this.runtime.changelayout = this.runtime.running_layout;
		var i, len, g;
		for (i = 0, len = this.runtime.allGroups.length; i < len; i++) {
			g = this.runtime.allGroups[i];
			g.setGroupActive(g.initially_activated)
		}
	};
	SysActs.prototype.SnapshotCanvas = function(format_, quality_) {
		this.runtime.doCanvasSnapshot(format_ === 0 ? "image/png" : "image/jpeg", quality_ / 100)
	};
	SysActs.prototype.SetCanvasSize = function(w, h) {
		if (w <= 0 || h <= 0) return;
		var mode = this.runtime.fullscreen_mode;
		var isfullscreen = document["mozFullScreen"] || document["webkitIsFullScreen"] || !! document["msFullscreenElement"] || document["fullScreen"] || this.runtime.isNodeFullscreen;
		if (isfullscreen && this.runtime.fullscreen_scaling > 0) mode = this.runtime.fullscreen_scaling;
		if (mode === 0) {
			this.runtime["setSize"](w, h, true)
		} else {
			this.runtime.original_width = w;
			this.runtime.original_height = h;
			this.runtime["setSize"](this.runtime.lastWindowWidth, this.runtime.lastWindowHeight, true)
		}
	};
	SysActs.prototype.SetLayoutEffectEnabled = function(enable_, effectname_) {
		if (!this.runtime.running_layout || !this.runtime.glwrap) return;
		var et = this.runtime.running_layout.getEffectByName(effectname_);
		if (!et) return;
		var enable = enable_ === 1;
		if (et.active == enable) return;
		et.active = enable;
		this.runtime.running_layout.updateActiveEffects();
		this.runtime.redraw = true
	};
	SysActs.prototype.SetLayerEffectEnabled = function(layer, enable_, effectname_) {
		if (!layer || !this.runtime.glwrap) return;
		var et = layer.getEffectByName(effectname_);
		if (!et) return;
		var enable = enable_ === 1;
		if (et.active == enable) return;
		et.active = enable;
		layer.updateActiveEffects();
		this.runtime.redraw = true
	};
	SysActs.prototype.SetLayoutEffectParam = function(effectname_, index_, value_) {
		if (!this.runtime.running_layout || !this.runtime.glwrap) return;
		var et = this.runtime.running_layout.getEffectByName(effectname_);
		if (!et) return;
		var params = this.runtime.running_layout.effect_params[et.index];
		index_ = Math.floor(index_);
		if (index_ < 0 || index_ >= params.length) return;
		if (this.runtime.glwrap.getProgramParameterType(et.shaderindex, index_) === 1) value_ /= 100;
		if (params[index_] === value_) return;
		params[index_] = value_;
		if (et.active) this.runtime.redraw = true
	};
	SysActs.prototype.SetLayerEffectParam = function(layer, effectname_, index_, value_) {
		if (!layer || !this.runtime.glwrap) return;
		var et = layer.getEffectByName(effectname_);
		if (!et) return;
		var params = layer.effect_params[et.index];
		index_ = Math.floor(index_);
		if (index_ < 0 || index_ >= params.length) return;
		if (this.runtime.glwrap.getProgramParameterType(et.shaderindex, index_) === 1) value_ /= 100;
		if (params[index_] === value_) return;
		params[index_] = value_;
		if (et.active) this.runtime.redraw = true
	};
	SysActs.prototype.SaveState = function(slot_) {
		this.runtime.saveToSlot = slot_
	};
	SysActs.prototype.LoadState = function(slot_) {
		this.runtime.loadFromSlot = slot_
	};
	SysActs.prototype.LoadStateJSON = function(jsonstr_) {
		this.runtime.loadFromJson = jsonstr_
	};
	SysActs.prototype.SetHalfFramerateMode = function(set_) {
		this.runtime.halfFramerateMode = set_ !== 0
	};
	SysActs.prototype.SetFullscreenQuality = function(q) {
		var isfullscreen = document["mozFullScreen"] || document["webkitIsFullScreen"] || !! document["msFullscreenElement"] || document["fullScreen"] || this.isNodeFullscreen;
		if (!isfullscreen && this.runtime.fullscreen_mode === 0) return;
		this.runtime.wantFullscreenScalingQuality = q !== 0;
		this.runtime["setSize"](this.runtime.lastWindowWidth, this.runtime.lastWindowHeight, true)
	};
	SysActs.prototype.ResetPersisted = function() {
		var i, len;
		for (i = 0, len = this.runtime.layouts_by_index.length; i < len; ++i) {
			this.runtime.layouts_by_index[i].persist_data = {};
			this.runtime.layouts_by_index[i].first_visit = true
		}
	};
	SysActs.prototype.RecreateInitialObjects = function(obj, x1, y1, x2, y2) {
		if (!obj) return;
		this.runtime.running_layout.recreateInitialObjects(obj, x1, y1, x2, y2)
	};
	SysActs.prototype.SetPixelRounding = function(m) {
		this.runtime.pixel_rounding = m !== 0;

		this.runtime.redraw = true
	};
	SysActs.prototype.SetMinimumFramerate = function(f) {
		if (f < 1) f = 1;
		if (f > 120) f = 120;
		this.runtime.minimumFramerate = f
	};
	sysProto.acts = new SysActs;

	function SysExps() {}
	SysExps.prototype["int"] = function(ret, x) {
		if (cr.is_string(x)) {
			ret.set_int(parseInt(x, 10));
			if (isNaN(ret.data)) ret.data = 0
		} else ret.set_int(x)
	};
	SysExps.prototype["float"] = function(ret, x) {
		if (cr.is_string(x)) {
			ret.set_float(parseFloat(x));
			if (isNaN(ret.data)) ret.data = 0
		} else ret.set_float(x)
	};
	SysExps.prototype.str = function(ret, x) {
		if (cr.is_string(x)) ret.set_string(x);
		else ret.set_string(x.toString())
	};
	SysExps.prototype.len = function(ret, x) {
		ret.set_int(x.length || 0)
	};
	SysExps.prototype.random = function(ret, a, b) {
		if (b === undefined) {
			ret.set_float(Math.random() * a)
		} else {
			ret.set_float(Math.random() * (b - a) + a)
		}
	};
	SysExps.prototype.sqrt = function(ret, x) {
		ret.set_float(Math.sqrt(x))
	};
	SysExps.prototype.abs = function(ret, x) {
		ret.set_float(Math.abs(x))
	};
	SysExps.prototype.round = function(ret, x) {
		ret.set_int(Math.round(x))
	};
	SysExps.prototype.floor = function(ret, x) {
		ret.set_int(Math.floor(x))
	};
	SysExps.prototype.ceil = function(ret, x) {
		ret.set_int(Math.ceil(x))
	};
	SysExps.prototype.sin = function(ret, x) {
		ret.set_float(Math.sin(cr.to_radians(x)))
	};
	SysExps.prototype.cos = function(ret, x) {
		ret.set_float(Math.cos(cr.to_radians(x)))
	};
	SysExps.prototype.tan = function(ret, x) {
		ret.set_float(Math.tan(cr.to_radians(x)))
	};
	SysExps.prototype.asin = function(ret, x) {
		ret.set_float(cr.to_degrees(Math.asin(x)))
	};
	SysExps.prototype.acos = function(ret, x) {
		ret.set_float(cr.to_degrees(Math.acos(x)))
	};
	SysExps.prototype.atan = function(ret, x) {
		ret.set_float(cr.to_degrees(Math.atan(x)))
	};
	SysExps.prototype.exp = function(ret, x) {
		ret.set_float(Math.exp(x))
	};
	SysExps.prototype.ln = function(ret, x) {
		ret.set_float(Math.log(x))
	};
	SysExps.prototype.log10 = function(ret, x) {
		ret.set_float(Math.log(x) / Math.LN10)
	};
	SysExps.prototype.max = function(ret) {
		var max_ = arguments[1];
		if (typeof max_ !== "number") max_ = 0;
		var i, len, a;
		for (i = 2, len = arguments.length; i < len; i++) {
			a = arguments[i];
			if (typeof a !== "number") continue;
			if (max_ < a) max_ = a
		}
		ret.set_float(max_)
	};
	SysExps.prototype.min = function(ret) {
		var min_ = arguments[1];
		if (typeof min_ !== "number") min_ = 0;
		var i, len, a;
		for (i = 2, len = arguments.length; i < len; i++) {
			a = arguments[i];
			if (typeof a !== "number") continue;
			if (min_ > a) min_ = a
		}
		ret.set_float(min_)
	};
	SysExps.prototype.dt = function(ret) {
		ret.set_float(this.runtime.dt)
	};
	SysExps.prototype.timescale = function(ret) {
		ret.set_float(this.runtime.timescale)
	};
	SysExps.prototype.wallclocktime = function(ret) {
		ret.set_float((Date.now() - this.runtime.start_time) / 1e3)
	};
	SysExps.prototype.time = function(ret) {
		ret.set_float(this.runtime.kahanTime.sum)
	};
	SysExps.prototype.tickcount = function(ret) {
		ret.set_int(this.runtime.tickcount)
	};
	SysExps.prototype.objectcount = function(ret) {
		ret.set_int(this.runtime.objectcount)
	};
	SysExps.prototype.fps = function(ret) {
		ret.set_int(this.runtime.fps)
	};
	SysExps.prototype.loopindex = function(ret, name_) {
		var loop, i, len;
		if (!this.runtime.loop_stack.length) {
			ret.set_int(0);
			return
		}
		if (name_) {
			for (i = this.runtime.loop_stack_index; i >= 0; --i) {
				loop = this.runtime.loop_stack[i];
				if (loop.name === name_) {
					ret.set_int(loop.index);
					return
				}
			}
			ret.set_int(0)
		} else {
			loop = this.runtime.getCurrentLoop();
			ret.set_int(loop ? loop.index : -1)
		}
	};
	SysExps.prototype.distance = function(ret, x1, y1, x2, y2) {
		ret.set_float(cr.distanceTo(x1, y1, x2, y2))
	};
	SysExps.prototype.angle = function(ret, x1, y1, x2, y2) {
		ret.set_float(cr.to_degrees(cr.angleTo(x1, y1, x2, y2)))
	};
	SysExps.prototype.scrollx = function(ret) {
		ret.set_float(this.runtime.running_layout.scrollX)
	};
	SysExps.prototype.scrolly = function(ret) {
		ret.set_float(this.runtime.running_layout.scrollY)
	};
	SysExps.prototype.newline = function(ret) {
		ret.set_string("\n")
	};
	SysExps.prototype.lerp = function(ret, a, b, x) {
		ret.set_float(cr.lerp(a, b, x))
	};
	SysExps.prototype.qarp = function(ret, a, b, c, x) {
		ret.set_float(cr.qarp(a, b, c, x))
	};
	SysExps.prototype.cubic = function(ret, a, b, c, d, x) {
		ret.set_float(cr.cubic(a, b, c, d, x))
	};
	SysExps.prototype.cosp = function(ret, a, b, x) {
		ret.set_float(cr.cosp(a, b, x))
	};
	SysExps.prototype.windowwidth = function(ret) {
		ret.set_int(this.runtime.width)
	};
	SysExps.prototype.windowheight = function(ret) {
		ret.set_int(this.runtime.height)
	};
	SysExps.prototype.uppercase = function(ret, str) {
		ret.set_string(cr.is_string(str) ? str.toUpperCase() : "")
	};
	SysExps.prototype.lowercase = function(ret, str) {
		ret.set_string(cr.is_string(str) ? str.toLowerCase() : "")
	};
	SysExps.prototype.clamp = function(ret, x, l, u) {
		if (x < l) ret.set_float(l);
		else if (x > u) ret.set_float(u);
		else ret.set_float(x)
	};
	SysExps.prototype.layerscale = function(ret, layerparam) {
		var layer = this.runtime.getLayer(layerparam);
		if (!layer) ret.set_float(0);
		else ret.set_float(layer.scale)
	};
	SysExps.prototype.layeropacity = function(ret, layerparam) {
		var layer = this.runtime.getLayer(layerparam);
		if (!layer) ret.set_float(0);
		else ret.set_float(layer.opacity * 100)
	};
	SysExps.prototype.layerscalerate = function(ret, layerparam) {
		var layer = this.runtime.getLayer(layerparam);
		if (!layer) ret.set_float(0);
		else ret.set_float(layer.zoomRate)
	};
	SysExps.prototype.layerparallaxx = function(ret, layerparam) {
		var layer = this.runtime.getLayer(layerparam);
		if (!layer) ret.set_float(0);
		else ret.set_float(layer.parallaxX * 100)
	};
	SysExps.prototype.layerparallaxy = function(ret, layerparam) {
		var layer = this.runtime.getLayer(layerparam);
		if (!layer) ret.set_float(0);
		else ret.set_float(layer.parallaxY * 100)
	};
	SysExps.prototype.layerindex = function(ret, layerparam) {
		var layer = this.runtime.getLayer(layerparam);
		if (!layer) ret.set_int(-1);
		else ret.set_int(layer.index)
	};
	SysExps.prototype.layoutscale = function(ret) {
		if (this.runtime.running_layout) ret.set_float(this.runtime.running_layout.scale);
		else ret.set_float(0)
	};
	SysExps.prototype.layoutangle = function(ret) {
		ret.set_float(cr.to_degrees(this.runtime.running_layout.angle))
	};
	SysExps.prototype.layerangle = function(ret, layerparam) {
		var layer = this.runtime.getLayer(layerparam);
		if (!layer) ret.set_float(0);
		else ret.set_float(cr.to_degrees(layer.angle))
	};
	SysExps.prototype.layoutwidth = function(ret) {
		ret.set_int(this.runtime.running_layout.width)
	};
	SysExps.prototype.layoutheight = function(ret) {
		ret.set_int(this.runtime.running_layout.height)
	};
	SysExps.prototype.find = function(ret, text, searchstr) {
		if (cr.is_string(text) && cr.is_string(searchstr)) ret.set_int(text.search(new RegExp(cr.regexp_escape(searchstr), "i")));
		else ret.set_int(-1)
	};
	SysExps.prototype.left = function(ret, text, n) {
		ret.set_string(cr.is_string(text) ? text.substr(0, n) : "")
	};
	SysExps.prototype.right = function(ret, text, n) {
		ret.set_string(cr.is_string(text) ? text.substr(text.length - n) : "")
	};
	SysExps.prototype.mid = function(ret, text, index_, length_) {
		ret.set_string(cr.is_string(text) ? text.substr(index_, length_) : "")
	};
	SysExps.prototype.tokenat = function(ret, text, index_, sep) {
		if (cr.is_string(text) && cr.is_string(sep)) {
			var arr = text.split(sep);
			var i = cr.floor(index_);
			if (i < 0 || i >= arr.length) ret.set_string("");
			else ret.set_string(arr[i])
		} else ret.set_string("")
	};
	SysExps.prototype.tokencount = function(ret, text, sep) {
		if (cr.is_string(text) && text.length) ret.set_int(text.split(sep).length);
		else ret.set_int(0)
	};
	SysExps.prototype.replace = function(ret, text, find_, replace_) {
		if (cr.is_string(text) && cr.is_string(find_) && cr.is_string(replace_)) ret.set_string(text.replace(new RegExp(cr.regexp_escape(find_), "gi"), replace_));
		else ret.set_string(cr.is_string(text) ? text : "")
	};
	SysExps.prototype.trim = function(ret, text) {
		ret.set_string(cr.is_string(text) ? text.trim() : "")
	};
	SysExps.prototype.pi = function(ret) {
		ret.set_float(cr.PI)
	};
	SysExps.prototype.layoutname = function(ret) {
		if (this.runtime.running_layout) ret.set_string(this.runtime.running_layout.name);
		else ret.set_string("")
	};
	SysExps.prototype.renderer = function(ret) {
		ret.set_string(this.runtime.gl ? "webgl" : "canvas2d")
	};
	SysExps.prototype.rendererdetail = function(ret) {
		ret.set_string(this.runtime.glUnmaskedRenderer)
	};
	SysExps.prototype.anglediff = function(ret, a, b) {
		ret.set_float(cr.to_degrees(cr.angleDiff(cr.to_radians(a), cr.to_radians(b))))
	};
	SysExps.prototype.choose = function(ret) {
		var index = cr.floor(Math.random() * (arguments.length - 1));
		ret.set_any(arguments[index + 1])
	};
	SysExps.prototype.rgb = function(ret, r, g, b) {
		ret.set_int(cr.RGB(r, g, b))
	};
	SysExps.prototype.projectversion = function(ret) {
		ret.set_string(this.runtime.versionstr)
	};
	SysExps.prototype.projectname = function(ret) {
		ret.set_string(this.runtime.projectName)
	};
	SysExps.prototype.anglelerp = function(ret, a, b, x) {
		a = cr.to_radians(a);
		b = cr.to_radians(b);
		var diff = cr.angleDiff(a, b);
		if (cr.angleClockwise(b, a)) {
			ret.set_float(cr.to_clamped_degrees(a + diff * x))
		} else {
			ret.set_float(cr.to_clamped_degrees(a - diff * x))
		}
	};
	SysExps.prototype.anglerotate = function(ret, a, b, c) {
		a = cr.to_radians(a);
		b = cr.to_radians(b);
		c = cr.to_radians(c);
		ret.set_float(cr.to_clamped_degrees(cr.angleRotate(a, b, c)))
	};
	SysExps.prototype.zeropad = function(ret, n, d) {
		var s = n < 0 ? "-" : "";
		if (n < 0) n = -n;
		var zeroes = d - n.toString().length;
		for (var i = 0; i < zeroes; i++) s += "0";
		ret.set_string(s + n.toString())
	};
	SysExps.prototype.cpuutilisation = function(ret) {
		ret.set_float(this.runtime.cpuutilisation / 1e3)
	};
	SysExps.prototype.viewportleft = function(ret, layerparam) {
		var layer = this.runtime.getLayer(layerparam);
		ret.set_float(layer ? layer.viewLeft : 0)
	};
	SysExps.prototype.viewporttop = function(ret, layerparam) {
		var layer = this.runtime.getLayer(layerparam);
		ret.set_float(layer ? layer.viewTop : 0)
	};
	SysExps.prototype.viewportright = function(ret, layerparam) {
		var layer = this.runtime.getLayer(layerparam);
		ret.set_float(layer ? layer.viewRight : 0)
	};
	SysExps.prototype.viewportbottom = function(ret, layerparam) {
		var layer = this.runtime.getLayer(layerparam);
		ret.set_float(layer ? layer.viewBottom : 0)
	};
	SysExps.prototype.loadingprogress = function(ret) {
		ret.set_float(this.runtime.loadingprogress)
	};
	SysExps.prototype.unlerp = function(ret, a, b, y) {
		ret.set_float(cr.unlerp(a, b, y))
	};
	SysExps.prototype.canvassnapshot = function(ret) {
		ret.set_string(this.runtime.snapshotData)
	};
	SysExps.prototype.urlencode = function(ret, s) {
		ret.set_string(encodeURIComponent(s))
	};
	SysExps.prototype.urldecode = function(ret, s) {
		ret.set_string(decodeURIComponent(s))
	};
	SysExps.prototype.canvastolayerx = function(ret, layerparam, x, y) {
		var layer = this.runtime.getLayer(layerparam);
		ret.set_float(layer ? layer.canvasToLayer(x, y, true) : 0)
	};
	SysExps.prototype.canvastolayery = function(ret, layerparam, x, y) {
		var layer = this.runtime.getLayer(layerparam);
		ret.set_float(layer ? layer.canvasToLayer(x, y, false) : 0)
	};
	SysExps.prototype.layertocanvasx = function(ret, layerparam, x, y) {
		var layer = this.runtime.getLayer(layerparam);
		ret.set_float(layer ? layer.layerToCanvas(x, y, true) : 0)
	};
	SysExps.prototype.layertocanvasy = function(ret, layerparam, x, y) {
		var layer = this.runtime.getLayer(layerparam);
		ret.set_float(layer ? layer.layerToCanvas(x, y, false) : 0)
	};
	SysExps.prototype.savestatejson = function(ret) {
		ret.set_string(this.runtime.lastSaveJson)
	};
	SysExps.prototype.imagememoryusage = function(ret) {
		if (this.runtime.glwrap) ret.set_float(Math.round(100 * this.runtime.glwrap.estimateVRAM() / (1024 * 1024)) / 100);
		else ret.set_float(0)
	};
	SysExps.prototype.regexsearch = function(ret, str_, regex_, flags_) {
		var regex = getRegex(regex_, flags_);
		ret.set_int(str_ ? str_.search(regex) : -1)
	};
	SysExps.prototype.regexreplace = function(ret, str_, regex_, flags_, replace_) {
		var regex = getRegex(regex_, flags_);
		ret.set_string(str_ ? str_.replace(regex, replace_) : "")
	};
	var regexMatches = [];
	var lastMatchesStr = "";
	var lastMatchesRegex = "";
	var lastMatchesFlags = "";

	function updateRegexMatches(str_, regex_, flags_) {
		if (str_ === lastMatchesStr && regex_ === lastMatchesRegex && flags_ === lastMatchesFlags) return;
		var regex = getRegex(regex_, flags_);
		regexMatches = str_.match(regex);
		lastMatchesStr = str_;
		lastMatchesRegex = regex_;
		lastMatchesFlags = flags_
	}
	SysExps.prototype.regexmatchcount = function(ret, str_, regex_, flags_) {
		var regex = getRegex(regex_, flags_);
		updateRegexMatches(str_, regex_, flags_);
		ret.set_int(regexMatches ? regexMatches.length : 0)
	};
	SysExps.prototype.regexmatchat = function(ret, str_, regex_, flags_, index_) {
		index_ = Math.floor(index_);
		var regex = getRegex(regex_, flags_);
		updateRegexMatches(str_, regex_, flags_);
		if (!regexMatches || index_ < 0 || index_ >= regexMatches.length) ret.set_string("");
		else ret.set_string(regexMatches[index_])
	};
	SysExps.prototype.infinity = function(ret) {
		ret.set_float(Infinity)
	};
	SysExps.prototype.setbit = function(ret, n, b, v) {
		n = n | 0;
		b = b | 0;
		v = v !== 0 ? 1 : 0;
		ret.set_int(n & ~ (1 << b) | v << b)
	};
	SysExps.prototype.togglebit = function(ret, n, b) {
		n = n | 0;
		b = b | 0;
		ret.set_int(n ^ 1 << b)
	};
	SysExps.prototype.getbit = function(ret, n, b) {
		n = n | 0;
		b = b | 0;
		ret.set_int(n & 1 << b ? 1 : 0)
	};
	SysExps.prototype.originalwindowwidth = function(ret) {
		ret.set_int(this.runtime.original_width)
	};
	SysExps.prototype.originalwindowheight = function(ret) {
		ret.set_int(this.runtime.original_height)
	};
	sysProto.exps = new SysExps;
	sysProto.runWaits = function() {
		var i, j, len, w, k, s, ss;
		var evinfo = this.runtime.getCurrentEventStack();
		for (i = 0, len = this.waits.length; i < len; i++) {
			w = this.waits[i];
			if (w.time === -1) {
				if (!w.signalled) continue
			} else {
				if (w.time > this.runtime.kahanTime.sum) continue
			}
			evinfo.current_event = w.ev;
			evinfo.actindex = w.actindex;
			evinfo.cndindex = 0;
			for (k in w.sols) {
				if (w.sols.hasOwnProperty(k)) {
					s = this.runtime.types_by_index[parseInt(k, 10)].getCurrentSol();
					ss = w.sols[k];
					s.select_all = ss.sa;
					cr.shallowAssignArray(s.instances, ss.insts);
					freeSolStateObject(ss)
				}
			}
			w.ev.resume_actions_and_subevents();
			this.runtime.clearSol(w.solModifiers);
			w.deleteme = true
		}
		for (i = 0, j = 0, len = this.waits.length; i < len; i++) {
			w = this.waits[i];
			this.waits[j] = w;
			if (w.deleteme) freeWaitObject(w);
			else j++
		}
		cr.truncateArray(this.waits, j)
	}
})();
(function() {
	cr.add_common_aces = function(m, pluginProto) {
		var singleglobal_ = m[1];
		var position_aces = m[3];
		var size_aces = m[4];
		var angle_aces = m[5];
		var appearance_aces = m[6];
		var zorder_aces = m[7];
		var effects_aces = m[8];
		if (!pluginProto.cnds) pluginProto.cnds = {};
		if (!pluginProto.acts) pluginProto.acts = {};
		if (!pluginProto.exps) pluginProto.exps = {};
		var cnds = pluginProto.cnds;
		var acts = pluginProto.acts;
		var exps = pluginProto.exps;
		if (position_aces) {
			cnds.CompareX = function(cmp, x) {
				return cr.do_cmp(this.x, cmp, x)
			};
			cnds.CompareY = function(cmp, y) {
				return cr.do_cmp(this.y, cmp, y)
			};
			cnds.IsOnScreen = function() {
				var layer = this.layer;
				this.update_bbox();
				var bbox = this.bbox;
				return !(bbox.right < layer.viewLeft || bbox.bottom < layer.viewTop || bbox.left > layer.viewRight || bbox.top > layer.viewBottom)
			};
			cnds.IsOutsideLayout = function() {
				this.update_bbox();
				var bbox = this.bbox;
				var layout = this.runtime.running_layout;
				return bbox.right < 0 || bbox.bottom < 0 || bbox.left > layout.width || bbox.top > layout.height
			};
			cnds.PickDistance = function(which, x, y) {
				var sol = this.getCurrentSol();
				var instances = sol.getObjects();
				if (!instances.length) return false;
				var inst = instances[0];
				var pickme = inst;
				var dist = cr.distanceTo(inst.x, inst.y, x, y);
				var i, len, d;
				for (i = 1, len = instances.length; i < len; i++) {
					inst = instances[i];
					d = cr.distanceTo(inst.x, inst.y, x, y);
					if (which === 0 && d < dist || which === 1 && d > dist) {
						dist = d;
						pickme = inst
					}
				}
				sol.pick_one(pickme);
				return true
			};
			acts.SetX = function(x) {
				if (this.x !== x) {
					this.x = x;
					this.set_bbox_changed()
				}
			};
			acts.SetY = function(y) {
				if (this.y !== y) {
					this.y = y;
					this.set_bbox_changed()
				}
			};
			acts.SetPos = function(x, y) {
				if (this.x !== x || this.y !== y) {
					this.x = x;
					this.y = y;
					this.set_bbox_changed()
				}
			};
			acts.SetPosToObject = function(obj, imgpt) {
				var inst = obj.getPairedInstance(this);
				if (!inst) return;
				var newx, newy;
				if (inst.getImagePoint) {
					newx = inst.getImagePoint(imgpt, true);
					newy = inst.getImagePoint(imgpt, false)
				} else {
					newx = inst.x;
					newy = inst.y
				}
				if (this.x !== newx || this.y !== newy) {
					this.x = newx;
					this.y = newy;
					this.set_bbox_changed()
				}
			};
			acts.MoveForward = function(dist) {
				if (dist !== 0) {
					this.x += Math.cos(this.angle) * dist;
					this.y += Math.sin(this.angle) * dist;
					this.set_bbox_changed()
				}
			};
			acts.MoveAtAngle = function(a, dist) {
				if (dist !== 0) {
					this.x += Math.cos(cr.to_radians(a)) * dist;
					this.y += Math.sin(cr.to_radians(a)) * dist;
					this.set_bbox_changed()
				}
			};
			exps.X = function(ret) {
				ret.set_float(this.x)
			};
			exps.Y = function(ret) {
				ret.set_float(this.y)
			};
			exps.dt = function(ret) {
				ret.set_float(this.runtime.getDt(this))
			}
		}
		if (size_aces) {
			cnds.CompareWidth = function(cmp, w) {
				return cr.do_cmp(this.width, cmp, w)
			};
			cnds.CompareHeight = function(cmp, h) {
				return cr.do_cmp(this.height, cmp, h)
			};
			acts.SetWidth = function(w) {
				if (this.width !== w) {
					this.width = w;
					this.set_bbox_changed()
				}
			};
			acts.SetHeight = function(h) {
				if (this.height !== h) {
					this.height = h;
					this.set_bbox_changed()
				}
			};
			acts.SetSize = function(w, h) {
				if (this.width !== w || this.height !== h) {
					this.width = w;
					this.height = h;
					this.set_bbox_changed()
				}
			};
			exps.Width = function(ret) {
				ret.set_float(this.width)
			};
			exps.Height = function(ret) {
				ret.set_float(this.height)
			};
			exps.BBoxLeft = function(ret) {
				this.update_bbox();
				ret.set_float(this.bbox.left)
			};
			exps.BBoxTop = function(ret) {
				this.update_bbox();
				ret.set_float(this.bbox.top)
			};
			exps.BBoxRight = function(ret) {
				this.update_bbox();
				ret.set_float(this.bbox.right)
			};
			exps.BBoxBottom = function(ret) {
				this.update_bbox();
				ret.set_float(this.bbox.bottom)
			}
		}
		if (angle_aces) {
			cnds.AngleWithin = function(within, a) {
				return cr.angleDiff(this.angle, cr.to_radians(a)) <= cr.to_radians(within)
			};
			cnds.IsClockwiseFrom = function(a) {
				return cr.angleClockwise(this.angle, cr.to_radians(a))
			};
			cnds.IsBetweenAngles = function(a, b) {
				var lower = cr.to_clamped_radians(a);
				var upper = cr.to_clamped_radians(b);
				var angle = cr.clamp_angle(this.angle);
				var obtuse = !cr.angleClockwise(upper, lower);
				if (obtuse) return !(!cr.angleClockwise(angle, lower) && cr.angleClockwise(angle, upper));
				else return cr.angleClockwise(angle, lower) && !cr.angleClockwise(angle, upper)
			};
			acts.SetAngle = function(a) {
				var newangle = cr.to_radians(cr.clamp_angle_degrees(a));
				if (isNaN(newangle)) return;
				if (this.angle !== newangle) {
					this.angle = newangle;
					this.set_bbox_changed()
				}
			};
			acts.RotateClockwise = function(a) {
				if (a !== 0 && !isNaN(a)) {
					this.angle += cr.to_radians(a);
					this.angle = cr.clamp_angle(this.angle);
					this.set_bbox_changed()
				}
			};
			acts.RotateCounterclockwise = function(a) {
				if (a !== 0 && !isNaN(a)) {
					this.angle -= cr.to_radians(a);
					this.angle = cr.clamp_angle(this.angle);
					this.set_bbox_changed()
				}
			};
			acts.RotateTowardAngle = function(amt, target) {
				var newangle = cr.angleRotate(this.angle, cr.to_radians(target), cr.to_radians(amt));
				if (isNaN(newangle)) return;
				if (this.angle !== newangle) {
					this.angle = newangle;
					this.set_bbox_changed()
				}
			};
			acts.RotateTowardPosition = function(amt, x, y) {
				var dx = x - this.x;
				var dy = y - this.y;
				var target = Math.atan2(dy, dx);
				var newangle = cr.angleRotate(this.angle, target, cr.to_radians(amt));
				if (isNaN(newangle)) return;
				if (this.angle !== newangle) {
					this.angle = newangle;
					this.set_bbox_changed()
				}
			};
			acts.SetTowardPosition = function(x, y) {
				var dx = x - this.x;
				var dy = y - this.y;
				var newangle = Math.atan2(dy, dx);
				if (isNaN(newangle)) return;
				if (this.angle !== newangle) {
					this.angle = newangle;
					this.set_bbox_changed()
				}
			};
			exps.Angle = function(ret) {
				ret.set_float(cr.to_clamped_degrees(this.angle))
			}
		}
		if (!singleglobal_) {
			cnds.CompareInstanceVar = function(iv, cmp, val) {
				return cr.do_cmp(this.instance_vars[iv], cmp, val)
			};
			cnds.IsBoolInstanceVarSet = function(iv) {
				return this.instance_vars[iv]
			};
			cnds.PickInstVarHiLow = function(which, iv) {
				var sol = this.getCurrentSol();
				var instances = sol.getObjects();
				if (!instances.length) return false;
				var inst = instances[0];
				var pickme = inst;
				var val = inst.instance_vars[iv];
				var i, len, v;
				for (i = 1, len = instances.length; i < len; i++) {
					inst = instances[i];
					v = inst.instance_vars[iv];
					if (which === 0 && v < val || which === 1 && v > val) {
						val = v;
						pickme = inst
					}
				}
				sol.pick_one(pickme);
				return true
			};
			cnds.PickByUID = function(u) {
				var i, len, j, inst, families, instances, sol;
				var cnd = this.runtime.getCurrentCondition();
				if (cnd.inverted) {
					sol = this.getCurrentSol();
					if (sol.select_all) {
						sol.select_all = false;
						cr.clearArray(sol.instances);
						cr.clearArray(sol.else_instances);
						instances = this.instances;
						for (i = 0, len = instances.length; i < len; i++) {
							inst = instances[i];
							if (inst.uid === u) sol.else_instances.push(inst);
							else sol.instances.push(inst)
						}
						this.applySolToContainer();
						return !!sol.instances.length
					} else {
						for (i = 0, j = 0, len = sol.instances.length; i < len; i++) {
							inst = sol.instances[i];
							sol.instances[j] = inst;
							if (inst.uid === u) {
								sol.else_instances.push(inst)
							} else j++
						}
						cr.truncateArray(sol.instances, j);
						this.applySolToContainer();
						return !!sol.instances.length
					}
				} else {
					inst = this.runtime.getObjectByUID(u);
					if (!inst) return false;
					sol = this.getCurrentSol();
					if (!sol.select_all && sol.instances.indexOf(inst) === -1) return false;
					if (this.is_family) {
						families = inst.type.families;
						for (i = 0, len = families.length; i < len; i++) {
							if (families[i] === this) {
								sol.pick_one(inst);
								this.applySolToContainer();
								return true
							}
						}
					} else if (inst.type === this) {
						sol.pick_one(inst);
						this.applySolToContainer();
						return true
					}
					return false
				}
			};
			cnds.OnCreated = function() {
				return true
			};
			cnds.OnDestroyed = function() {
				return true
			};
			acts.SetInstanceVar = function(iv, val) {
				var myinstvars = this.instance_vars;
				if (cr.is_number(myinstvars[iv])) {
					if (cr.is_number(val)) myinstvars[iv] = val;
					else myinstvars[iv] = parseFloat(val)
				} else if (cr.is_string(myinstvars[iv])) {
					if (cr.is_string(val)) myinstvars[iv] = val;
					else myinstvars[iv] = val.toString()
				} else;
			};
			acts.AddInstanceVar = function(iv, val) {
				var myinstvars = this.instance_vars;
				if (cr.is_number(myinstvars[iv])) {
					if (cr.is_number(val)) myinstvars[iv] += val;
					else myinstvars[iv] += parseFloat(val)
				} else if (cr.is_string(myinstvars[iv])) {
					if (cr.is_string(val)) myinstvars[iv] += val;
					else myinstvars[iv] += val.toString()
				} else;
			};
			acts.SubInstanceVar = function(iv, val) {
				var myinstvars = this.instance_vars;
				if (cr.is_number(myinstvars[iv])) {
					if (cr.is_number(val)) myinstvars[iv] -= val;
					else myinstvars[iv] -= parseFloat(val)
				} else;
			};
			acts.SetBoolInstanceVar = function(iv, val) {
				this.instance_vars[iv] = val ? 1 : 0
			};
			acts.ToggleBoolInstanceVar = function(iv) {
				this.instance_vars[iv] = 1 - this.instance_vars[iv]
			};
			acts.Destroy = function() {
				this.runtime.DestroyInstance(this)
			};
			if (!acts.LoadFromJsonString) {
				acts.LoadFromJsonString = function(str_) {
					var o, i, len, binst;
					try {
						o = JSON.parse(str_)
					} catch (e) {
						return
					}
					this.runtime.loadInstanceFromJSON(this, o, true);
					if (this.afterLoad) this.afterLoad();
					if (this.behavior_insts) {
						for (i = 0, len = this.behavior_insts.length; i < len; ++i) {
							binst = this.behavior_insts[i];
							if (binst.afterLoad) binst.afterLoad()
						}
					}
				}
			}
			exps.Count = function(ret) {
				var count = ret.object_class.instances.length;
				var i, len, inst;
				for (i = 0, len = this.runtime.createRow.length; i < len; i++) {
					inst = this.runtime.createRow[i];
					if (ret.object_class.is_family) {
						if (inst.type.families.indexOf(ret.object_class) >= 0) count++
					} else {
						if (inst.type === ret.object_class) count++
					}
				}
				ret.set_int(count)
			};
			exps.PickedCount = function(ret) {
				ret.set_int(ret.object_class.getCurrentSol().getObjects().length)
			};
			exps.UID = function(ret) {
				ret.set_int(this.uid)
			};
			exps.IID = function(ret) {
				ret.set_int(this.get_iid())
			};
			if (!exps.AsJSON) {
				exps.AsJSON = function(ret) {
					ret.set_string(JSON.stringify(this.runtime.saveInstanceToJSON(this, true)))
				}
			}
		}
		if (appearance_aces) {
			cnds.IsVisible = function() {
				return this.visible
			};
			acts.SetVisible = function(v) {
				if (!v !== !this.visible) {
					this.visible = v;
					this.runtime.redraw = true
				}
			};
			cnds.CompareOpacity = function(cmp, x) {
				return cr.do_cmp(cr.round6dp(this.opacity * 100), cmp, x)
			};
			acts.SetOpacity = function(x) {
				var new_opacity = x / 100;
				if (new_opacity < 0) new_opacity = 0;
				else if (new_opacity > 1) new_opacity = 1;
				if (new_opacity !== this.opacity) {
					this.opacity = new_opacity;
					this.runtime.redraw = true
				}
			};
			exps.Opacity = function(ret) {
				ret.set_float(cr.round6dp(this.opacity * 100))
			}
		}
		if (zorder_aces) {
			cnds.IsOnLayer = function(layer_) {
				if (!layer_) return false;
				return this.layer === layer_
			};
			cnds.PickTopBottom = function(which_) {
				var sol = this.getCurrentSol();
				var instances = sol.getObjects();
				if (!instances.length) return false;
				var inst = instances[0];
				var pickme = inst;
				var i, len;
				for (i = 1, len = instances.length; i < len; i++) {
					inst = instances[i];
					if (which_ === 0) {
						if (inst.layer.index > pickme.layer.index || inst.layer.index === pickme.layer.index && inst.get_zindex() > pickme.get_zindex()) {
							pickme = inst
						}
					} else {
						if (inst.layer.index < pickme.layer.index || inst.layer.index === pickme.layer.index && inst.get_zindex() < pickme.get_zindex()) {
							pickme = inst
						}
					}
				}
				sol.pick_one(pickme);
				return true
			};
			acts.MoveToTop = function() {
				var layer = this.layer;
				var layer_instances = layer.instances;
				if (layer_instances.length && layer_instances[layer_instances.length - 1] === this) return;
				layer.removeFromInstanceList(this, false);
				layer.appendToInstanceList(this, false);
				this.runtime.redraw = true
			};
			acts.MoveToBottom = function() {
				var layer = this.layer;
				var layer_instances = layer.instances;
				if (layer_instances.length && layer_instances[0] === this) return;
				layer.removeFromInstanceList(this, false);
				layer.prependToInstanceList(this, false);
				this.runtime.redraw = true
			};
			acts.MoveToLayer = function(layerMove) {
				if (!layerMove || layerMove == this.layer) return;
				this.layer.removeFromInstanceList(this, true);
				this.layer = layerMove;
				layerMove.appendToInstanceList(this, true);
				this.runtime.redraw = true
			};
			acts.ZMoveToObject = function(where_, obj_) {
				var isafter = where_ === 0;
				if (!obj_) return;
				var other = obj_.getFirstPicked(this);
				if (!other || other.uid === this.uid) return;
				if (this.layer.index !== other.layer.index) {
					this.layer.removeFromInstanceList(this, true);
					this.layer = other.layer;
					other.layer.appendToInstanceList(this, true)
				}
				this.layer.moveInstanceAdjacent(this, other, isafter);
				this.runtime.redraw = true
			};
			exps.LayerNumber = function(ret) {
				ret.set_int(this.layer.number)
			};
			exps.LayerName = function(ret) {
				ret.set_string(this.layer.name)
			};
			exps.ZIndex = function(ret) {
				ret.set_int(this.get_zindex())
			}
		}
		if (effects_aces) {
			acts.SetEffectEnabled = function(enable_, effectname_) {
				if (!this.runtime.glwrap) return;
				var i = this.type.getEffectIndexByName(effectname_);
				if (i < 0) return;
				var enable = enable_ === 1;
				if (this.active_effect_flags[i] === enable) return;
				this.active_effect_flags[i] = enable;
				this.updateActiveEffects();
				this.runtime.redraw = true
			};
			acts.SetEffectParam = function(effectname_, index_, value_) {
				if (!this.runtime.glwrap) return;
				var i = this.type.getEffectIndexByName(effectname_);
				if (i < 0) return;
				var et = this.type.effect_types[i];
				var params = this.effect_params[i];
				index_ = Math.floor(index_);
				if (index_ < 0 || index_ >= params.length) return;
				if (this.runtime.glwrap.getProgramParameterType(et.shaderindex, index_) === 1) value_ /= 100;
				if (params[index_] === value_) return;
				params[index_] = value_;
				if (et.active) this.runtime.redraw = true
			}
		}
	};
	cr.set_bbox_changed = function() {
		this.bbox_changed = true;
		this.cell_changed = true;
		this.type.any_cell_changed = true;
		this.runtime.redraw = true;
		var i, len, callbacks = this.bbox_changed_callbacks;
		for (i = 0, len = callbacks.length; i < len; ++i) {
			callbacks[i](this)
		}
		if (this.layer.useRenderCells) this.update_bbox()
	};
	cr.add_bbox_changed_callback = function(f) {
		if (f) {
			this.bbox_changed_callbacks.push(f)
		}
	};
	cr.update_bbox = function() {
		if (!this.bbox_changed) return;
		var bbox = this.bbox;
		var bquad = this.bquad;
		bbox.set(this.x, this.y, this.x + this.width, this.y + this.height);
		bbox.offset(-this.hotspotX * this.width, -this.hotspotY * this.height);
		if (!this.angle) {
			bquad.set_from_rect(bbox)
		} else {
			bbox.offset(-this.x, -this.y);
			bquad.set_from_rotated_rect(bbox, this.angle);
			bquad.offset(this.x, this.y);
			bquad.bounding_box(bbox)
		}
		bbox.normalize();
		this.bbox_changed = false;
		this.update_render_cell()
	};
	var tmprc = new cr.rect(0, 0, 0, 0);
	cr.update_render_cell = function() {
		if (!this.layer.useRenderCells) return;
		var mygrid = this.layer.render_grid;
		var bbox = this.bbox;
		tmprc.set(mygrid.XToCell(bbox.left), mygrid.YToCell(bbox.top), mygrid.XToCell(bbox.right), mygrid.YToCell(bbox.bottom));
		if (this.rendercells.equals(tmprc)) return;
		if (this.rendercells.right < this.rendercells.left) mygrid.update(this, null, tmprc);
		else mygrid.update(this, this.rendercells, tmprc);
		this.rendercells.copy(tmprc);
		this.layer.render_list_stale = true
	};
	cr.update_collision_cell = function() {
		if (!this.cell_changed || !this.collisionsEnabled) return;
		this.update_bbox();
		var mygrid = this.type.collision_grid;
		var bbox = this.bbox;
		tmprc.set(mygrid.XToCell(bbox.left), mygrid.YToCell(bbox.top), mygrid.XToCell(bbox.right), mygrid.YToCell(bbox.bottom));
		if (this.collcells.equals(tmprc)) return;
		if (this.collcells.right < this.collcells.left) mygrid.update(this, null, tmprc);
		else mygrid.update(this, this.collcells, tmprc);
		this.collcells.copy(tmprc);
		this.cell_changed = false
	};
	cr.inst_contains_pt = function(x, y) {
		if (!this.bbox.contains_pt(x, y)) return false;
		if (!this.bquad.contains_pt(x, y)) return false;
		if (this.collision_poly && !this.collision_poly.is_empty()) {
			this.collision_poly.cache_poly(this.width, this.height, this.angle);
			return this.collision_poly.contains_pt(x - this.x, y - this.y)
		} else return true
	};
	cr.inst_get_iid = function() {
		this.type.updateIIDs();
		return this.iid
	};
	cr.inst_get_zindex = function() {
		this.layer.updateZIndices();
		return this.zindex
	};
	cr.inst_updateActiveEffects = function() {
		cr.clearArray(this.active_effect_types);
		var i, len, et;
		var preserves_opaqueness = true;
		for (i = 0, len = this.active_effect_flags.length; i < len; i++) {
			if (this.active_effect_flags[i]) {
				et = this.type.effect_types[i];
				this.active_effect_types.push(et);
				if (!et.preservesOpaqueness) preserves_opaqueness = false
			}
		}
		this.uses_shaders = !! this.active_effect_types.length;
		this.shaders_preserve_opaqueness = preserves_opaqueness
	};
	cr.inst_toString = function() {
		return "Inst" + this.puid
	};
	cr.type_getFirstPicked = function(frominst) {
		if (frominst && frominst.is_contained && frominst.type != this) {
			var i, len, s;
			for (i = 0, len = frominst.siblings.length; i < len; i++) {
				s = frominst.siblings[i];
				if (s.type == this) return s
			}
		}
		var instances = this.getCurrentSol().getObjects();
		if (instances.length) return instances[0];
		else return null
	};
	cr.type_getPairedInstance = function(inst) {
		var instances = this.getCurrentSol().getObjects();
		if (instances.length) return instances[inst.get_iid() % instances.length];
		else return null
	};
	cr.type_updateIIDs = function() {
		if (!this.stale_iids || this.is_family) return;
		var i, len;
		for (i = 0, len = this.instances.length; i < len; i++) this.instances[i].iid = i;
		var next_iid = i;
		var createRow = this.runtime.createRow;
		for (i = 0, len = createRow.length; i < len; ++i) {
			if (createRow[i].type === this) createRow[i].iid = next_iid++
		}
		this.stale_iids = false
	};
	cr.type_getInstanceByIID = function(i) {
		if (i < this.instances.length) return this.instances[i];
		i -= this.instances.length;
		var createRow = this.runtime.createRow;
		var j, lenj;
		for (j = 0, lenj = createRow.length; j < lenj; ++j) {
			if (createRow[j].type === this) {
				if (i === 0) return createRow[j];
				--i
			}
		}
		return null
	};
	cr.type_getCurrentSol = function() {
		return this.solstack[this.cur_sol]
	};
	cr.type_pushCleanSol = function() {
		this.cur_sol++;
		if (this.cur_sol === this.solstack.length) this.solstack.push(new cr.selection(this));
		else this.solstack[this.cur_sol].select_all = true
	};
	cr.type_pushCopySol = function() {
		this.cur_sol++;
		if (this.cur_sol === this.solstack.length) this.solstack.push(new cr.selection(this));
		var clonesol = this.solstack[this.cur_sol];
		var prevsol = this.solstack[this.cur_sol - 1];
		if (prevsol.select_all) clonesol.select_all = true;
		else {
			clonesol.select_all = false;
			cr.shallowAssignArray(clonesol.instances, prevsol.instances);
			cr.shallowAssignArray(clonesol.else_instances, prevsol.else_instances)
		}
	};
	cr.type_popSol = function() {
		this.cur_sol--
	};
	cr.type_getBehaviorByName = function(behname) {
		var i, len, j, lenj, f, index = 0;
		if (!this.is_family) {
			for (i = 0, len = this.families.length; i < len; i++) {
				f = this.families[i];
				for (j = 0, lenj = f.behaviors.length; j < lenj; j++) {
					if (behname === f.behaviors[j].name) {
						this.extra["lastBehIndex"] = index;
						return f.behaviors[j]
					}
					index++
				}
			}
		}
		for (i = 0, len = this.behaviors.length; i < len; i++) {
			if (behname === this.behaviors[i].name) {
				this.extra["lastBehIndex"] = index;
				return this.behaviors[i]
			}
			index++
		}
		return null
	};
	cr.type_getBehaviorIndexByName = function(behname) {
		var b = this.getBehaviorByName(behname);
		if (b) return this.extra["lastBehIndex"];
		else return -1
	};
	cr.type_getEffectIndexByName = function(name_) {
		var i, len;
		for (i = 0, len = this.effect_types.length; i < len; i++) {
			if (this.effect_types[i].name === name_) return i
		}
		return -1
	};
	cr.type_applySolToContainer = function() {
		if (!this.is_contained || this.is_family) return;
		var i, len, j, lenj, t, sol, sol2;
		this.updateIIDs();
		sol = this.getCurrentSol();
		var select_all = sol.select_all;
		var es = this.runtime.getCurrentEventStack();
		var orblock = es && es.current_event && es.current_event.orblock;
		for (i = 0, len = this.container.length; i < len; i++) {
			t = this.container[i];
			if (t === this) continue;
			t.updateIIDs();
			sol2 = t.getCurrentSol();
			sol2.select_all = select_all;
			if (!select_all) {
				cr.clearArray(sol2.instances);
				for (j = 0, lenj = sol.instances.length; j < lenj; ++j) sol2.instances[j] = t.getInstanceByIID(sol.instances[j].iid);
				if (orblock) {
					cr.clearArray(sol2.else_instances);
					for (j = 0, lenj = sol.else_instances.length; j < lenj; ++j) sol2.else_instances[j] = t.getInstanceByIID(sol.else_instances[j].iid)
				}
			}
		}
	};
	cr.type_toString = function() {
		return "Type" + this.sid
	};
	cr.do_cmp = function(x, cmp, y) {
		if (typeof x === "undefined" || typeof y === "undefined") return false;
		switch (cmp) {
		case 0:
			return x === y;
		case 1:
			return x !== y;
		case 2:
			return x < y;
		case 3:
			return x <= y;
		case 4:
			return x > y;
		case 5:
			return x >= y;
		default:
			;
			return false
		}
	}
})();
cr.shaders = {};
cr.plugins_.Sprite = function(runtime) {
	this.runtime = runtime
};
(function() {
	var pluginProto = cr.plugins_.Sprite.prototype;
	pluginProto.Type = function(plugin) {
		this.plugin = plugin;
		this.runtime = plugin.runtime
	};
	var typeProto = pluginProto.Type.prototype;

	function frame_getDataUri() {
		if (this.datauri.length === 0) {
			var tmpcanvas = document.createElement("canvas");

			tmpcanvas.width = this.width;
			tmpcanvas.height = this.height;
			var tmpctx = tmpcanvas.getContext("2d");
			if (this.spritesheeted) {
				tmpctx.drawImage(this.texture_img, this.offx, this.offy, this.width, this.height, 0, 0, this.width, this.height)
			} else {
				tmpctx.drawImage(this.texture_img, 0, 0, this.width, this.height)
			}
			this.datauri = tmpcanvas.toDataURL("image/png")
		}
		return this.datauri
	}
	typeProto.onCreate = function() {
		if (this.is_family) return;
		var i, leni, j, lenj;
		var anim, frame, animobj, frameobj, wt, uv;
		this.all_frames = [];
		this.has_loaded_textures = false;
		for (i = 0, leni = this.animations.length; i < leni; i++) {
			anim = this.animations[i];
			animobj = {};
			animobj.name = anim[0];
			animobj.speed = anim[1];
			animobj.loop = anim[2];
			animobj.repeatcount = anim[3];
			animobj.repeatto = anim[4];
			animobj.pingpong = anim[5];
			animobj.sid = anim[6];
			animobj.frames = [];
			for (j = 0, lenj = anim[7].length; j < lenj; j++) {
				frame = anim[7][j];
				frameobj = {};
				frameobj.texture_file = frame[0];
				frameobj.texture_filesize = frame[1];
				frameobj.offx = frame[2];
				frameobj.offy = frame[3];
				frameobj.width = frame[4];
				frameobj.height = frame[5];
				frameobj.duration = frame[6];
				frameobj.hotspotX = frame[7];
				frameobj.hotspotY = frame[8];
				frameobj.image_points = frame[9];
				frameobj.poly_pts = frame[10];
				frameobj.pixelformat = frame[11];
				frameobj.spritesheeted = frameobj.width !== 0;
				frameobj.datauri = "";
				frameobj.getDataUri = frame_getDataUri;
				uv = {};
				uv.left = 0;
				uv.top = 0;
				uv.right = 1;
				uv.bottom = 1;
				frameobj.sheetTex = uv;
				frameobj.webGL_texture = null;
				wt = this.runtime.findWaitingTexture(frame[0]);
				if (wt) {
					frameobj.texture_img = wt
				} else {
					frameobj.texture_img = new Image;
					frameobj.texture_img.cr_src = frame[0];
					frameobj.texture_img.cr_filesize = frame[1];
					frameobj.texture_img.c2webGL_texture = null;
					this.runtime.waitForImageLoad(frameobj.texture_img, frame[0])
				}
				cr.seal(frameobj);
				animobj.frames.push(frameobj);
				this.all_frames.push(frameobj)
			}
			cr.seal(animobj);
			this.animations[i] = animobj
		}
	};
	typeProto.updateAllCurrentTexture = function() {
		var i, len, inst;
		for (i = 0, len = this.instances.length; i < len; i++) {
			inst = this.instances[i];
			inst.curWebGLTexture = inst.curFrame.webGL_texture
		}
	};
	typeProto.onLostWebGLContext = function() {
		if (this.is_family) return;
		var i, len, frame;
		for (i = 0, len = this.all_frames.length; i < len; ++i) {
			frame = this.all_frames[i];
			frame.texture_img.c2webGL_texture = null;
			frame.webGL_texture = null
		}
		this.has_loaded_textures = false;
		this.updateAllCurrentTexture()
	};
	typeProto.onRestoreWebGLContext = function() {
		if (this.is_family || !this.instances.length) return;
		var i, len, frame;
		for (i = 0, len = this.all_frames.length; i < len; ++i) {
			frame = this.all_frames[i];
			frame.webGL_texture = this.runtime.glwrap.loadTexture(frame.texture_img, false, this.runtime.linearSampling, frame.pixelformat)
		}
		this.updateAllCurrentTexture()
	};
	typeProto.loadTextures = function() {
		if (this.is_family || this.has_loaded_textures || !this.runtime.glwrap) return;
		var i, len, frame;
		for (i = 0, len = this.all_frames.length; i < len; ++i) {
			frame = this.all_frames[i];
			frame.webGL_texture = this.runtime.glwrap.loadTexture(frame.texture_img, false, this.runtime.linearSampling, frame.pixelformat)
		}
		this.has_loaded_textures = true
	};
	typeProto.unloadTextures = function() {
		if (this.is_family || this.instances.length || !this.has_loaded_textures) return;
		var i, len, frame;
		for (i = 0, len = this.all_frames.length; i < len; ++i) {
			frame = this.all_frames[i];
			this.runtime.glwrap.deleteTexture(frame.webGL_texture);
			frame.webGL_texture = null
		}
		this.has_loaded_textures = false
	};
	var already_drawn_images = [];
	typeProto.preloadCanvas2D = function(ctx) {
		var i, len, frameimg;
		cr.clearArray(already_drawn_images);
		for (i = 0, len = this.all_frames.length; i < len; ++i) {
			frameimg = this.all_frames[i].texture_img;
			if (already_drawn_images.indexOf(frameimg) !== -1) continue;
			ctx.drawImage(frameimg, 0, 0);
			already_drawn_images.push(frameimg)
		}
	};
	pluginProto.Instance = function(type) {
		this.type = type;
		this.runtime = type.runtime;
		var poly_pts = this.type.animations[0].frames[0].poly_pts;
		if (this.recycled) this.collision_poly.set_pts(poly_pts);
		else this.collision_poly = new cr.CollisionPoly(poly_pts)
	};
	var instanceProto = pluginProto.Instance.prototype;
	instanceProto.onCreate = function() {
		this.visible = this.properties[0] === 0;
		this.isTicking = false;
		this.inAnimTrigger = false;
		this.collisionsEnabled = this.properties[3] !== 0;
		if (!(this.type.animations.length === 1 && this.type.animations[0].frames.length === 1) && this.type.animations[0].speed !== 0) {
			this.runtime.tickMe(this);
			this.isTicking = true
		}
		this.cur_animation = this.getAnimationByName(this.properties[1]) || this.type.animations[0];
		this.cur_frame = this.properties[2];
		if (this.cur_frame < 0) this.cur_frame = 0;
		if (this.cur_frame >= this.cur_animation.frames.length) this.cur_frame = this.cur_animation.frames.length - 1;
		var curanimframe = this.cur_animation.frames[this.cur_frame];
		this.collision_poly.set_pts(curanimframe.poly_pts);
		this.hotspotX = curanimframe.hotspotX;
		this.hotspotY = curanimframe.hotspotY;
		this.cur_anim_speed = this.cur_animation.speed;
		if (this.recycled) this.animTimer.reset();
		else this.animTimer = new cr.KahanAdder;
		this.frameStart = this.getNowTime();
		this.animPlaying = true;
		this.animRepeats = 0;
		this.animForwards = true;
		this.animTriggerName = "";
		this.changeAnimName = "";
		this.changeAnimFrom = 0;
		this.changeAnimFrame = -1;
		this.type.loadTextures();
		var i, leni, j, lenj;
		var anim, frame, uv, maintex;
		for (i = 0, leni = this.type.animations.length; i < leni; i++) {
			anim = this.type.animations[i];
			for (j = 0, lenj = anim.frames.length; j < lenj; j++) {
				frame = anim.frames[j];
				if (frame.width === 0) {
					frame.width = frame.texture_img.width;
					frame.height = frame.texture_img.height
				}
				if (frame.spritesheeted) {
					maintex = frame.texture_img;
					uv = frame.sheetTex;
					uv.left = frame.offx / maintex.width;
					uv.top = frame.offy / maintex.height;
					uv.right = (frame.offx + frame.width) / maintex.width;
					uv.bottom = (frame.offy + frame.height) / maintex.height;
					if (frame.offx === 0 && frame.offy === 0 && frame.width === maintex.width && frame.height === maintex.height) {
						frame.spritesheeted = false
					}
				}
			}
		}
		this.curFrame = this.cur_animation.frames[this.cur_frame];
		this.curWebGLTexture = this.curFrame.webGL_texture
	};
	instanceProto.saveToJSON = function() {
		var o = {
			a: this.cur_animation.sid,
			f: this.cur_frame,
			cas: this.cur_anim_speed,
			fs: this.frameStart,
			ar: this.animRepeats,
			at: this.animTimer.sum
		};
		if (!this.animPlaying) o["ap"] = this.animPlaying;
		if (!this.animForwards) o["af"] = this.animForwards;
		return o
	};
	instanceProto.loadFromJSON = function(o) {
		var anim = this.getAnimationBySid(o["a"]);
		if (anim) this.cur_animation = anim;
		this.cur_frame = o["f"];
		if (this.cur_frame < 0) this.cur_frame = 0;
		if (this.cur_frame >= this.cur_animation.frames.length) this.cur_frame = this.cur_animation.frames.length - 1;
		this.cur_anim_speed = o["cas"];
		this.frameStart = o["fs"];
		this.animRepeats = o["ar"];
		this.animTimer.reset();
		this.animTimer.sum = o["at"];
		this.animPlaying = o.hasOwnProperty("ap") ? o["ap"] : true;
		this.animForwards = o.hasOwnProperty("af") ? o["af"] : true;
		this.curFrame = this.cur_animation.frames[this.cur_frame];
		this.curWebGLTexture = this.curFrame.webGL_texture;
		this.collision_poly.set_pts(this.curFrame.poly_pts);
		this.hotspotX = this.curFrame.hotspotX;
		this.hotspotY = this.curFrame.hotspotY
	};
	instanceProto.animationFinish = function(reverse) {
		this.cur_frame = reverse ? 0 : this.cur_animation.frames.length - 1;
		this.animPlaying = false;
		this.animTriggerName = this.cur_animation.name;
		this.inAnimTrigger = true;
		this.runtime.trigger(cr.plugins_.Sprite.prototype.cnds.OnAnyAnimFinished, this);
		this.runtime.trigger(cr.plugins_.Sprite.prototype.cnds.OnAnimFinished, this);
		this.inAnimTrigger = false;
		this.animRepeats = 0
	};
	instanceProto.getNowTime = function() {
		return this.animTimer.sum
	};
	instanceProto.tick = function() {
		this.animTimer.add(this.runtime.getDt(this));
		if (this.changeAnimName.length) this.doChangeAnim();
		if (this.changeAnimFrame >= 0) this.doChangeAnimFrame();
		var now = this.getNowTime();
		var cur_animation = this.cur_animation;
		var prev_frame = cur_animation.frames[this.cur_frame];
		var next_frame;
		var cur_frame_time = prev_frame.duration / this.cur_anim_speed;
		if (this.animPlaying && now >= this.frameStart + cur_frame_time) {
			if (this.animForwards) {
				this.cur_frame++
			} else {
				this.cur_frame--
			}
			this.frameStart += cur_frame_time;
			if (this.cur_frame >= cur_animation.frames.length) {
				if (cur_animation.pingpong) {
					this.animForwards = false;
					this.cur_frame = cur_animation.frames.length - 2
				} else if (cur_animation.loop) {
					this.cur_frame = cur_animation.repeatto
				} else {
					this.animRepeats++;
					if (this.animRepeats >= cur_animation.repeatcount) {
						this.animationFinish(false)
					} else {
						this.cur_frame = cur_animation.repeatto
					}
				}
			}
			if (this.cur_frame < 0) {
				if (cur_animation.pingpong) {
					this.cur_frame = 1;
					this.animForwards = true;
					if (!cur_animation.loop) {
						this.animRepeats++;
						if (this.animRepeats >= cur_animation.repeatcount) {
							this.animationFinish(true)
						}
					}
				} else {
					if (cur_animation.loop) {
						this.cur_frame = cur_animation.repeatto
					} else {
						this.animRepeats++;
						if (this.animRepeats >= cur_animation.repeatcount) {
							this.animationFinish(true)
						} else {
							this.cur_frame = cur_animation.repeatto
						}
					}
				}
			}
			if (this.cur_frame < 0) this.cur_frame = 0;
			else if (this.cur_frame >= cur_animation.frames.length) this.cur_frame = cur_animation.frames.length - 1;
			if (now > this.frameStart + cur_animation.frames[this.cur_frame].duration / this.cur_anim_speed) {
				this.frameStart = now
			}
			next_frame = cur_animation.frames[this.cur_frame];
			this.OnFrameChanged(prev_frame, next_frame);
			this.runtime.redraw = true
		}
	};
	instanceProto.getAnimationByName = function(name_) {
		var i, len, a;
		for (i = 0, len = this.type.animations.length; i < len; i++) {
			a = this.type.animations[i];
			if (cr.equals_nocase(a.name, name_)) return a
		}
		return null
	};
	instanceProto.getAnimationBySid = function(sid_) {
		var i, len, a;
		for (i = 0, len = this.type.animations.length; i < len; i++) {
			a = this.type.animations[i];
			if (a.sid === sid_) return a
		}
		return null
	};
	instanceProto.doChangeAnim = function() {
		var prev_frame = this.cur_animation.frames[this.cur_frame];
		var anim = this.getAnimationByName(this.changeAnimName);
		this.changeAnimName = "";
		if (!anim) return;
		if (cr.equals_nocase(anim.name, this.cur_animation.name) && this.animPlaying) return;
		this.cur_animation = anim;
		this.cur_anim_speed = anim.speed;
		if (this.cur_frame < 0) this.cur_frame = 0;
		if (this.cur_frame >= this.cur_animation.frames.length) this.cur_frame = this.cur_animation.frames.length - 1;
		if (this.changeAnimFrom === 1) this.cur_frame = 0;
		this.animPlaying = true;
		this.frameStart = this.getNowTime();
		this.animForwards = true;
		this.OnFrameChanged(prev_frame, this.cur_animation.frames[this.cur_frame]);
		this.runtime.redraw = true
	};
	instanceProto.doChangeAnimFrame = function() {
		var prev_frame = this.cur_animation.frames[this.cur_frame];
		var prev_frame_number = this.cur_frame;
		this.cur_frame = cr.floor(this.changeAnimFrame);
		if (this.cur_frame < 0) this.cur_frame = 0;
		if (this.cur_frame >= this.cur_animation.frames.length) this.cur_frame = this.cur_animation.frames.length - 1;
		if (prev_frame_number !== this.cur_frame) {
			this.OnFrameChanged(prev_frame, this.cur_animation.frames[this.cur_frame]);
			this.frameStart = this.getNowTime();
			this.runtime.redraw = true
		}
		this.changeAnimFrame = -1
	};
	instanceProto.OnFrameChanged = function(prev_frame, next_frame) {
		var oldw = prev_frame.width;
		var oldh = prev_frame.height;
		var neww = next_frame.width;
		var newh = next_frame.height;
		if (oldw != neww) this.width *= neww / oldw;
		if (oldh != newh) this.height *= newh / oldh;
		this.hotspotX = next_frame.hotspotX;
		this.hotspotY = next_frame.hotspotY;
		this.collision_poly.set_pts(next_frame.poly_pts);
		this.set_bbox_changed();
		this.curFrame = next_frame;
		this.curWebGLTexture = next_frame.webGL_texture;
		var i, len, b;
		for (i = 0, len = this.behavior_insts.length; i < len; i++) {
			b = this.behavior_insts[i];
			if (b.onSpriteFrameChanged) b.onSpriteFrameChanged(prev_frame, next_frame)
		}
		this.runtime.trigger(cr.plugins_.Sprite.prototype.cnds.OnFrameChanged, this)
	};
	instanceProto.draw = function(ctx) {
		ctx.globalAlpha = this.opacity;
		var cur_frame = this.curFrame;
		var spritesheeted = cur_frame.spritesheeted;
		var cur_image = cur_frame.texture_img;
		var myx = this.x;
		var myy = this.y;
		var w = this.width;
		var h = this.height;
		if (this.angle === 0 && w >= 0 && h >= 0) {
			myx -= this.hotspotX * w;
			myy -= this.hotspotY * h;
			if (this.runtime.pixel_rounding) {
				myx = Math.round(myx);
				myy = Math.round(myy)
			}
			if (spritesheeted) {
				ctx.drawImage(cur_image, cur_frame.offx, cur_frame.offy, cur_frame.width, cur_frame.height, myx, myy, w, h)
			} else {
				ctx.drawImage(cur_image, myx, myy, w, h)
			}
		} else {
			if (this.runtime.pixel_rounding) {
				myx = Math.round(myx);
				myy = Math.round(myy)
			}
			ctx.save();
			var widthfactor = w > 0 ? 1 : -1;
			var heightfactor = h > 0 ? 1 : -1;
			ctx.translate(myx, myy);
			if (widthfactor !== 1 || heightfactor !== 1) ctx.scale(widthfactor, heightfactor);
			ctx.rotate(this.angle * widthfactor * heightfactor);
			var drawx = 0 - this.hotspotX * cr.abs(w);
			var drawy = 0 - this.hotspotY * cr.abs(h);
			if (spritesheeted) {
				ctx.drawImage(cur_image, cur_frame.offx, cur_frame.offy, cur_frame.width, cur_frame.height, drawx, drawy, cr.abs(w), cr.abs(h))
			} else {
				ctx.drawImage(cur_image, drawx, drawy, cr.abs(w), cr.abs(h))
			}
			ctx.restore()
		}
	};
	instanceProto.drawGL_earlyZPass = function(glw) {
		this.drawGL(glw)
	};
	instanceProto.drawGL = function(glw) {
		glw.setTexture(this.curWebGLTexture);
		glw.setOpacity(this.opacity);
		var cur_frame = this.curFrame;
		var q = this.bquad;
		if (this.runtime.pixel_rounding) {
			var ox = Math.round(this.x) - this.x;
			var oy = Math.round(this.y) - this.y;
			if (cur_frame.spritesheeted) glw.quadTex(q.tlx + ox, q.tly + oy, q.trx + ox, q.try_ + oy, q.brx + ox, q.bry + oy, q.blx + ox, q.bly + oy, cur_frame.sheetTex);
			else glw.quad(q.tlx + ox, q.tly + oy, q.trx + ox, q.try_ + oy, q.brx + ox, q.bry + oy, q.blx + ox, q.bly + oy)
		} else {
			if (cur_frame.spritesheeted) glw.quadTex(q.tlx, q.tly, q.trx, q.try_, q.brx, q.bry, q.blx, q.bly, cur_frame.sheetTex);
			else glw.quad(q.tlx, q.tly, q.trx, q.try_, q.brx, q.bry, q.blx, q.bly)
		}
	};
	instanceProto.getImagePointIndexByName = function(name_) {
		var cur_frame = this.curFrame;
		var i, len;
		for (i = 0, len = cur_frame.image_points.length; i < len; i++) {
			if (cr.equals_nocase(name_, cur_frame.image_points[i][0])) return i
		}
		return -1
	};
	instanceProto.getImagePoint = function(imgpt, getX) {
		var cur_frame = this.curFrame;
		var image_points = cur_frame.image_points;
		var index;
		if (cr.is_string(imgpt)) index = this.getImagePointIndexByName(imgpt);
		else index = imgpt - 1;
		index = cr.floor(index);
		if (index < 0 || index >= image_points.length) return getX ? this.x : this.y;
		var x = (image_points[index][1] - cur_frame.hotspotX) * this.width;
		var y = image_points[index][2];
		y = (y - cur_frame.hotspotY) * this.height;
		var cosa = Math.cos(this.angle);
		var sina = Math.sin(this.angle);
		var x_temp = x * cosa - y * sina;
		y = y * cosa + x * sina;
		x = x_temp;
		x += this.x;
		y += this.y;
		return getX ? x : y
	};

	function Cnds() {}
	var arrCache = [];

	function allocArr() {
		if (arrCache.length) return arrCache.pop();
		else return [0, 0, 0]
	}
	function freeArr(a) {
		a[0] = 0;
		a[1] = 0;
		a[2] = 0;
		arrCache.push(a)
	}
	function makeCollKey(a, b) {
		if (a < b) return "" + a + "," + b;
		else return "" + b + "," + a
	}
	function collmemory_add(collmemory, a, b, tickcount) {
		var a_uid = a.uid;
		var b_uid = b.uid;
		var key = makeCollKey(a_uid, b_uid);
		if (collmemory.hasOwnProperty(key)) {
			collmemory[key][2] = tickcount;
			return
		}
		var arr = allocArr();
		arr[0] = a_uid;
		arr[1] = b_uid;
		arr[2] = tickcount;
		collmemory[key] = arr
	}
	function collmemory_remove(collmemory, a, b) {
		var key = makeCollKey(a.uid, b.uid);
		if (collmemory.hasOwnProperty(key)) {
			freeArr(collmemory[key]);
			delete collmemory[key]
		}
	}
	function collmemory_removeInstance(collmemory, inst) {
		var uid = inst.uid;
		var p, entry;
		for (p in collmemory) {
			if (collmemory.hasOwnProperty(p)) {
				entry = collmemory[p];
				if (entry[0] === uid || entry[1] === uid) {
					freeArr(collmemory[p]);
					delete collmemory[p]
				}
			}
		}
	}
	var last_coll_tickcount = -2;

	function collmemory_has(collmemory, a, b) {
		var key = makeCollKey(a.uid, b.uid);
		if (collmemory.hasOwnProperty(key)) {
			last_coll_tickcount = collmemory[key][2];
			return true
		} else {
			last_coll_tickcount = -2;
			return false
		}
	}
	var candidates1 = [];
	Cnds.prototype.OnCollision = function(rtype) {
		if (!rtype) return false;
		var runtime = this.runtime;
		var cnd = runtime.getCurrentCondition();
		var ltype = cnd.type;
		var collmemory = null;
		if (cnd.extra["collmemory"]) {
			collmemory = cnd.extra["collmemory"]
		} else {
			collmemory = {};
			cnd.extra["collmemory"] = collmemory
		}
		if (!cnd.extra["spriteCreatedDestroyCallback"]) {
			cnd.extra["spriteCreatedDestroyCallback"] = true;
			runtime.addDestroyCallback(function(inst) {
				collmemory_removeInstance(cnd.extra["collmemory"], inst)
			})
		}
		var lsol = ltype.getCurrentSol();
		var rsol = rtype.getCurrentSol();
		var linstances = lsol.getObjects();
		var rinstances;
		var l, linst, r, rinst;
		var curlsol, currsol;
		var tickcount = this.runtime.tickcount;
		var lasttickcount = tickcount - 1;
		var exists, run;
		var current_event = runtime.getCurrentEventStack().current_event;
		var orblock = current_event.orblock;
		for (l = 0; l < linstances.length; l++) {
			linst = linstances[l];
			if (rsol.select_all) {
				linst.update_bbox();
				this.runtime.getCollisionCandidates(linst.layer, rtype, linst.bbox, candidates1);
				rinstances = candidates1
			} else rinstances = rsol.getObjects();
			for (r = 0; r < rinstances.length; r++) {
				rinst = rinstances[r];
				if (runtime.testOverlap(linst, rinst) || runtime.checkRegisteredCollision(linst, rinst)) {
					exists = collmemory_has(collmemory, linst, rinst);
					run = !exists || last_coll_tickcount < lasttickcount;
					collmemory_add(collmemory, linst, rinst, tickcount);
					if (run) {
						runtime.pushCopySol(current_event.solModifiers);
						curlsol = ltype.getCurrentSol();
						currsol = rtype.getCurrentSol();
						curlsol.select_all = false;
						currsol.select_all = false;
						if (ltype === rtype) {
							curlsol.instances.length = 2;
							curlsol.instances[0] = linst;
							curlsol.instances[1] = rinst;
							ltype.applySolToContainer()
						} else {
							curlsol.instances.length = 1;
							currsol.instances.length = 1;
							curlsol.instances[0] = linst;
							currsol.instances[0] = rinst;
							ltype.applySolToContainer();
							rtype.applySolToContainer()
						}
						current_event.retrigger();
						runtime.popSol(current_event.solModifiers)
					}
				} else {
					collmemory_remove(collmemory, linst, rinst)
				}
			}
			cr.clearArray(candidates1)
		}
		return false
	};
	var rpicktype = null;
	var rtopick = new cr.ObjectSet;
	var needscollisionfinish = false;
	var candidates2 = [];
	var temp_bbox = new cr.rect(0, 0, 0, 0);

	function DoOverlapCondition(rtype, offx, offy) {
		if (!rtype) return false;
		var do_offset = offx !== 0 || offy !== 0;
		var oldx, oldy, ret = false,
			r, lenr, rinst;
		var cnd = this.runtime.getCurrentCondition();
		var ltype = cnd.type;
		var inverted = cnd.inverted;
		var rsol = rtype.getCurrentSol();
		var orblock = this.runtime.getCurrentEventStack().current_event.orblock;
		var rinstances;
		if (rsol.select_all) {
			this.update_bbox();
			temp_bbox.copy(this.bbox);
			temp_bbox.offset(offx, offy);
			this.runtime.getCollisionCandidates(this.layer, rtype, temp_bbox, candidates2);
			rinstances = candidates2
		} else if (orblock) rinstances = rsol.else_instances;
		else rinstances = rsol.instances;
		rpicktype = rtype;
		needscollisionfinish = ltype !== rtype && !inverted;
		if (do_offset) {
			oldx = this.x;
			oldy = this.y;
			this.x += offx;
			this.y += offy;
			this.set_bbox_changed()
		}
		for (r = 0, lenr = rinstances.length; r < lenr; r++) {
			rinst = rinstances[r];
			if (this.runtime.testOverlap(this, rinst)) {
				ret = true;
				if (inverted) break;
				if (ltype !== rtype) rtopick.add(rinst)
			}
		}
		if (do_offset) {
			this.x = oldx;
			this.y = oldy;
			this.set_bbox_changed()
		}
		cr.clearArray(candidates2);
		return ret
	}
	typeProto.finish = function(do_pick) {
		if (!needscollisionfinish) return;
		if (do_pick) {
			var orblock = this.runtime.getCurrentEventStack().current_event.orblock;
			var sol = rpicktype.getCurrentSol();
			var topick = rtopick.valuesRef();
			var i, len, inst;
			if (sol.select_all) {
				sol.select_all = false;
				cr.clearArray(sol.instances);
				for (i = 0, len = topick.length; i < len; ++i) {
					sol.instances[i] = topick[i]
				}
				if (orblock) {
					cr.clearArray(sol.else_instances);
					for (i = 0, len = rpicktype.instances.length; i < len; ++i) {
						inst = rpicktype.instances[i];
						if (!rtopick.contains(inst)) sol.else_instances.push(inst)
					}
				}
			} else {
				if (orblock) {
					var initsize = sol.instances.length;
					for (i = 0, len = topick.length; i < len; ++i) {
						sol.instances[initsize + i] = topick[i];
						cr.arrayFindRemove(sol.else_instances, topick[i])
					}
				} else {
					cr.shallowAssignArray(sol.instances, topick)
				}
			}
			rpicktype.applySolToContainer()
		}
		rtopick.clear();
		needscollisionfinish = false
	};
	Cnds.prototype.IsOverlapping = function(rtype) {
		return DoOverlapCondition.call(this, rtype, 0, 0)
	};
	Cnds.prototype.IsOverlappingOffset = function(rtype, offx, offy) {
		return DoOverlapCondition.call(this, rtype, offx, offy)
	};
	Cnds.prototype.IsAnimPlaying = function(animname) {
		if (this.changeAnimName.length) return cr.equals_nocase(this.changeAnimName, animname);
		else return cr.equals_nocase(this.cur_animation.name, animname)
	};
	Cnds.prototype.CompareFrame = function(cmp, framenum) {
		return cr.do_cmp(this.cur_frame, cmp, framenum)
	};
	Cnds.prototype.CompareAnimSpeed = function(cmp, x) {
		var s = this.animForwards ? this.cur_anim_speed : -this.cur_anim_speed;
		return cr.do_cmp(s, cmp, x)
	};
	Cnds.prototype.OnAnimFinished = function(animname) {
		return cr.equals_nocase(this.animTriggerName, animname)
	};
	Cnds.prototype.OnAnyAnimFinished = function() {
		return true
	};
	Cnds.prototype.OnFrameChanged = function() {
		return true
	};
	Cnds.prototype.IsMirrored = function() {
		return this.width < 0
	};
	Cnds.prototype.IsFlipped = function() {
		return this.height < 0
	};
	Cnds.prototype.OnURLLoaded = function() {
		return true
	};
	Cnds.prototype.IsCollisionEnabled = function() {
		return this.collisionsEnabled
	};
	pluginProto.cnds = new Cnds;

	function Acts() {}
	Acts.prototype.Spawn = function(obj, layer, imgpt) {
		if (!obj || !layer) return;
		var inst = this.runtime.createInstance(obj, layer, this.getImagePoint(imgpt, true), this.getImagePoint(imgpt, false));
		if (!inst) return;
		if (typeof inst.angle !== "undefined") {
			inst.angle = this.angle;
			inst.set_bbox_changed()
		}
		this.runtime.isInOnDestroy++;
		var i, len, s;
		this.runtime.trigger(Object.getPrototypeOf(obj.plugin).cnds.OnCreated, inst);
		if (inst.is_contained) {
			for (i = 0, len = inst.siblings.length; i < len; i++) {
				s = inst.siblings[i];
				this.runtime.trigger(Object.getPrototypeOf(s.type.plugin).cnds.OnCreated, s)
			}
		}
		this.runtime.isInOnDestroy--;
		var cur_act = this.runtime.getCurrentAction();
		var reset_sol = false;
		if (cr.is_undefined(cur_act.extra["Spawn_LastExec"]) || cur_act.extra["Spawn_LastExec"] < this.runtime.execcount) {
			reset_sol = true;
			cur_act.extra["Spawn_LastExec"] = this.runtime.execcount
		}
		var sol;
		if (obj != this.type) {
			sol = obj.getCurrentSol();
			sol.select_all = false;
			if (reset_sol) {
				cr.clearArray(sol.instances);
				sol.instances[0] = inst
			} else sol.instances.push(inst);
			if (inst.is_contained) {
				for (i = 0, len = inst.siblings.length; i < len; i++) {
					s = inst.siblings[i];
					sol = s.type.getCurrentSol();
					sol.select_all = false;
					if (reset_sol) {
						cr.clearArray(sol.instances);
						sol.instances[0] = s
					} else sol.instances.push(s)
				}
			}
		}
	};
	Acts.prototype.SetEffect = function(effect) {
		this.blend_mode = effect;
		this.compositeOp = cr.effectToCompositeOp(effect);
		cr.setGLBlend(this, effect, this.runtime.gl);
		this.runtime.redraw = true
	};
	Acts.prototype.StopAnim = function() {
		this.animPlaying = false
	};
	Acts.prototype.StartAnim = function(from) {
		this.animPlaying = true;
		this.frameStart = this.getNowTime();
		if (from === 1 && this.cur_frame !== 0) {
			this.changeAnimFrame = 0;
			if (!this.inAnimTrigger) this.doChangeAnimFrame()
		}
		if (!this.isTicking) {
			this.runtime.tickMe(this);
			this.isTicking = true
		}
	};
	Acts.prototype.SetAnim = function(animname, from) {
		this.changeAnimName = animname;
		this.changeAnimFrom = from;
		if (!this.isTicking) {
			this.runtime.tickMe(this);
			this.isTicking = true
		}
		if (!this.inAnimTrigger) this.doChangeAnim()
	};
	Acts.prototype.SetAnimFrame = function(framenumber) {
		this.changeAnimFrame = framenumber;
		if (!this.isTicking) {
			this.runtime.tickMe(this);
			this.isTicking = true
		}
		if (!this.inAnimTrigger) this.doChangeAnimFrame()
	};
	Acts.prototype.SetAnimSpeed = function(s) {
		this.cur_anim_speed = cr.abs(s);
		this.animForwards = s >= 0;
		if (!this.isTicking) {
			this.runtime.tickMe(this);
			this.isTicking = true
		}
	};
	Acts.prototype.SetMirrored = function(m) {
		var neww = cr.abs(this.width) * (m === 0 ? -1 : 1);
		if (this.width === neww) return;
		this.width = neww;
		this.set_bbox_changed()
	};
	Acts.prototype.SetFlipped = function(f) {
		var newh = cr.abs(this.height) * (f === 0 ? -1 : 1);
		if (this.height === newh) return;
		this.height = newh;
		this.set_bbox_changed()
	};
	Acts.prototype.SetScale = function(s) {
		var cur_frame = this.curFrame;
		var mirror_factor = this.width < 0 ? -1 : 1;
		var flip_factor = this.height < 0 ? -1 : 1;
		var new_width = cur_frame.width * s * mirror_factor;
		var new_height = cur_frame.height * s * flip_factor;
		if (this.width !== new_width || this.height !== new_height) {
			this.width = new_width;
			this.height = new_height;
			this.set_bbox_changed()
		}
	};
	Acts.prototype.LoadURL = function(url_, resize_) {
		var img = new Image;
		var self = this;
		var curFrame_ = this.curFrame;
		img.onload = function() {
			if (curFrame_.texture_img.src === img.src) {
				if (self.runtime.glwrap && self.curFrame === curFrame_) self.curWebGLTexture = curFrame_.webGL_texture;
				if (resize_ === 0) {
					self.width = img.width;
					self.height = img.height;
					self.set_bbox_changed()
				}
				self.runtime.redraw = true;
				self.runtime.trigger(cr.plugins_.Sprite.prototype.cnds.OnURLLoaded, self);
				return
			}
			curFrame_.texture_img = img;
			curFrame_.offx = 0;
			curFrame_.offy = 0;
			curFrame_.width = img.width;
			curFrame_.height = img.height;
			curFrame_.spritesheeted = false;
			curFrame_.datauri = "";
			curFrame_.pixelformat = 0;
			if (self.runtime.glwrap) {
				if (curFrame_.webGL_texture) self.runtime.glwrap.deleteTexture(curFrame_.webGL_texture);
				curFrame_.webGL_texture = self.runtime.glwrap.loadTexture(img, false, self.runtime.linearSampling);
				if (self.curFrame === curFrame_) self.curWebGLTexture = curFrame_.webGL_texture;
				self.type.updateAllCurrentTexture()
			}
			if (resize_ === 0) {
				self.width = img.width;
				self.height = img.height;
				self.set_bbox_changed()
			}
			self.runtime.redraw = true;
			self.runtime.trigger(cr.plugins_.Sprite.prototype.cnds.OnURLLoaded, self)
		};
		if (url_.substr(0, 5) !== "data:") img["crossOrigin"] = "anonymous";
		img.src = url_
	};
	Acts.prototype.SetCollisions = function(set_) {
		if (this.collisionsEnabled === (set_ !== 0)) return;
		this.collisionsEnabled = set_ !== 0;
		if (this.collisionsEnabled) this.set_bbox_changed();
		else {
			if (this.collcells.right >= this.collcells.left) this.type.collision_grid.update(this, this.collcells, null);
			this.collcells.set(0, 0, -1, -1)
		}
	};
	pluginProto.acts = new Acts;

	function Exps() {}
	Exps.prototype.AnimationFrame = function(ret) {
		ret.set_int(this.cur_frame)
	};
	Exps.prototype.AnimationFrameCount = function(ret) {
		ret.set_int(this.cur_animation.frames.length)
	};
	Exps.prototype.AnimationName = function(ret) {
		ret.set_string(this.cur_animation.name)
	};
	Exps.prototype.AnimationSpeed = function(ret) {
		ret.set_float(this.animForwards ? this.cur_anim_speed : -this.cur_anim_speed)
	};
	Exps.prototype.ImagePointX = function(ret, imgpt) {
		ret.set_float(this.getImagePoint(imgpt, true))
	};
	Exps.prototype.ImagePointY = function(ret, imgpt) {
		ret.set_float(this.getImagePoint(imgpt, false))
	};
	Exps.prototype.ImagePointCount = function(ret) {
		ret.set_int(this.curFrame.image_points.length)
	};
	Exps.prototype.ImageWidth = function(ret) {
		ret.set_float(this.curFrame.width)
	};
	Exps.prototype.ImageHeight = function(ret) {
		ret.set_float(this.curFrame.height)
	};
	pluginProto.exps = new Exps
})();
cr.plugins_.Spritefont2 = function(runtime) {
	this.runtime = runtime
};
(function() {
	var pluginProto = cr.plugins_.Spritefont2.prototype;
	pluginProto.onCreate = function() {};
	pluginProto.Type = function(plugin) {
		this.plugin = plugin;
		this.runtime = plugin.runtime
	};
	var typeProto = pluginProto.Type.prototype;
	typeProto.onCreate = function() {
		if (this.is_family) return;
		this.texture_img = new Image;
		this.runtime.waitForImageLoad(this.texture_img, this.texture_file);
		this.webGL_texture = null
	};
	typeProto.onLostWebGLContext = function() {
		if (this.is_family) return;
		this.webGL_texture = null
	};
	typeProto.onRestoreWebGLContext = function() {
		if (this.is_family || !this.instances.length) return;
		if (!this.webGL_texture) {
			this.webGL_texture = this.runtime.glwrap.loadTexture(this.texture_img, false, this.runtime.linearSampling, this.texture_pixelformat)
		}
		var i, len;
		for (i = 0, len = this.instances.length; i < len; i++) this.instances[i].webGL_texture = this.webGL_texture
	};
	typeProto.unloadTextures = function() {
		if (this.is_family || this.instances.length || !this.webGL_texture) return;
		this.runtime.glwrap.deleteTexture(this.webGL_texture);
		this.webGL_texture = null
	};
	typeProto.preloadCanvas2D = function(ctx) {
		ctx.drawImage(this.texture_img, 0, 0)
	};
	pluginProto.Instance = function(type) {
		this.type = type;
		this.runtime = type.runtime
	};
	var instanceProto = pluginProto.Instance.prototype;
	instanceProto.onDestroy = function() {
		freeAllLines(this.lines);
		freeAllClip(this.clipList);
		freeAllClipUV(this.clipUV);
		cr.wipe(this.characterWidthList)
	};
	instanceProto.onCreate = function() {
		this.texture_img = this.type.texture_img;
		this.characterWidth = this.properties[0];
		this.characterHeight = this.properties[1];
		this.characterSet = this.properties[2];
		this.text = this.properties[3];
		this.characterScale = this.properties[4];
		this.visible = this.properties[5] === 0;
		this.halign = this.properties[6] / 2;
		this.valign = this.properties[7] / 2;
		this.wrapbyword = this.properties[9] === 0;
		this.characterSpacing = this.properties[10];
		this.lineHeight = this.properties[11];
		this.textWidth = 0;
		this.textHeight = 0;
		if (this.recycled) {
			cr.clearArray(this.lines);
			cr.wipe(this.clipList);
			cr.wipe(this.clipUV);
			cr.wipe(this.characterWidthList)
		} else {
			this.lines = [];
			this.clipList = {};
			this.clipUV = {};
			this.characterWidthList = {}
		}
		this.text_changed = true;
		this.lastwrapwidth = this.width;
		if (this.runtime.glwrap) {
			if (!this.type.webGL_texture) {
				this.type.webGL_texture = this.runtime.glwrap.loadTexture(this.type.texture_img, false, this.runtime.linearSampling, this.type.texture_pixelformat)
			}
			this.webGL_texture = this.type.webGL_texture
		}
		this.SplitSheet()
	};
	instanceProto.saveToJSON = function() {
		var save = {
			t: this.text,
			csc: this.characterScale,
			csp: this.characterSpacing,
			lh: this.lineHeight,
			tw: this.textWidth,
			th: this.textHeight,
			lrt: this.last_render_tick,
			ha: this.halign,
			va: this.valign,
			cw: {}
		};
		for (var ch in this.characterWidthList) save["cw"][ch] = this.characterWidthList[ch];
		return save
	};
	instanceProto.loadFromJSON = function(o) {
		this.text = o["t"];
		this.characterScale = o["csc"];
		this.characterSpacing = o["csp"];
		this.lineHeight = o["lh"];
		this.textWidth = o["tw"];
		this.textHeight = o["th"];
		this.last_render_tick = o["lrt"];
		if (o.hasOwnProperty("ha")) this.halign = o["ha"];
		if (o.hasOwnProperty("va")) this.valign = o["va"];
		for (var ch in o["cw"]) this.characterWidthList[ch] = o["cw"][ch];
		this.text_changed = true;
		this.lastwrapwidth = this.width
	};

	function trimRight(text) {
		return text.replace(/\s\s*$/, "")
	}
	var MAX_CACHE_SIZE = 1e3;

	function alloc(cache, Constructor) {
		if (cache.length) return cache.pop();
		else return new Constructor
	}
	function free(cache, data) {
		if (cache.length < MAX_CACHE_SIZE) {
			cache.push(data)
		}
	}
	function freeAll(cache, dataList, isArray) {
		if (isArray) {
			var i, len;
			for (i = 0, len = dataList.length; i < len; i++) {
				free(cache, dataList[i])
			}
			cr.clearArray(dataList)
		} else {
			var prop;
			for (prop in dataList) {
				if (Object.prototype.hasOwnProperty.call(dataList, prop)) {
					free(cache, dataList[prop]);
					delete dataList[prop]
				}
			}
		}
	}
	function addLine(inst, lineIndex, cur_line) {
		var lines = inst.lines;
		var line;
		cur_line = trimRight(cur_line);
		if (lineIndex >= lines.length) lines.push(allocLine());
		line = lines[lineIndex];
		line.text = cur_line;
		line.width = inst.measureWidth(cur_line);
		inst.textWidth = cr.max(inst.textWidth, line.width)
	}
	var linesCache = [];

	function allocLine() {
		return alloc(linesCache, Object)
	}
	function freeLine(l) {
		free(linesCache, l)
	}
	function freeAllLines(arr) {
		freeAll(linesCache, arr, true)
	}
	function addClip(obj, property, x, y, w, h) {
		if (obj[property] === undefined) {
			obj[property] = alloc(clipCache, Object)
		}
		obj[property].x = x;
		obj[property].y = y;
		obj[property].w = w;
		obj[property].h = h
	}
	var clipCache = [];

	function allocClip() {
		return alloc(clipCache, Object)
	}
	function freeAllClip(obj) {
		freeAll(clipCache, obj, false)
	}
	function addClipUV(obj, property, left, top, right, bottom) {
		if (obj[property] === undefined) {
			obj[property] = alloc(clipUVCache, cr.rect)
		}
		obj[property].left = left;
		obj[property].top = top;
		obj[property].right = right;
		obj[property].bottom = bottom
	}
	var clipUVCache = [];

	function allocClipUV() {
		return alloc(clipUVCache, cr.rect)
	}
	function freeAllClipUV(obj) {
		freeAll(clipUVCache, obj, false)
	}
	instanceProto.SplitSheet = function() {
		var texture = this.texture_img;
		var texWidth = texture.width;
		var texHeight = texture.height;
		var charWidth = this.characterWidth;
		var charHeight = this.characterHeight;
		var charU = charWidth / texWidth;
		var charV = charHeight / texHeight;
		var charSet = this.characterSet;
		var cols = Math.floor(texWidth / charWidth);
		var rows = Math.floor(texHeight / charHeight);
		for (var c = 0; c < charSet.length; c++) {
			if (c >= cols * rows) break;
			var x = c % cols;
			var y = Math.floor(c / cols);
			var letter = charSet.charAt(c);
			if (this.runtime.glwrap) {
				addClipUV(this.clipUV, letter, x * charU, y * charV, (x + 1) * charU, (y + 1) * charV)
			} else {
				addClip(this.clipList, letter, x * charWidth, y * charHeight, charWidth, charHeight)
			}
		}
	};
	var wordsCache = [];
	pluginProto.TokeniseWords = function(text) {
		cr.clearArray(wordsCache);
		var cur_word = "";
		var ch;
		var i = 0;
		while (i < text.length) {
			ch = text.charAt(i);
			if (ch === "\n") {
				if (cur_word.length) {
					wordsCache.push(cur_word);
					cur_word = ""
				}
				wordsCache.push("\n");
				++i
			} else if (ch === " " || ch === "	" || ch === "-") {
				do {
					cur_word += text.charAt(i);
					i++
				} while (i < text.length && (text.charAt(i) === " " || text.charAt(i) === "	"));
				wordsCache.push(cur_word);
				cur_word = ""
			} else if (i < text.length) {
				cur_word += ch;
				i++
			}
		}
		if (cur_word.length) wordsCache.push(cur_word)
	};
	pluginProto.WordWrap = function(inst) {
		var text = inst.text;
		var lines = inst.lines;
		if (!text || !text.length) {
			freeAllLines(lines);
			return
		}
		var width = inst.width;
		if (width <= 2) {
			freeAllLines(lines);
			return
		}
		var charWidth = inst.characterWidth;
		var charScale = inst.characterScale;
		var charSpacing = inst.characterSpacing;
		if (text.length * (charWidth * charScale + charSpacing) - charSpacing <= width && text.indexOf("\n") === -1) {
			var all_width = inst.measureWidth(text);
			if (all_width <= width) {
				freeAllLines(lines);
				lines.push(allocLine());
				lines[0].text = text;
				lines[0].width = all_width;
				inst.textWidth = all_width;
				inst.textHeight = inst.characterHeight * charScale + inst.lineHeight;
				return
			}
		}
		var wrapbyword = inst.wrapbyword;

		this.WrapText(inst);
		inst.textHeight = lines.length * (inst.characterHeight * charScale + inst.lineHeight)
	};
	pluginProto.WrapText = function(inst) {
		var wrapbyword = inst.wrapbyword;
		var text = inst.text;
		var lines = inst.lines;
		var width = inst.width;
		var wordArray;
		if (wrapbyword) {
			this.TokeniseWords(text);
			wordArray = wordsCache
		} else {
			wordArray = text
		}
		var cur_line = "";
		var prev_line;
		var line_width;
		var i;
		var lineIndex = 0;
		var line;
		var ignore_newline = false;
		for (i = 0; i < wordArray.length; i++) {
			if (wordArray[i] === "\n") {
				if (ignore_newline === true) {
					ignore_newline = false
				} else {
					addLine(inst, lineIndex, cur_line);
					lineIndex++
				}
				cur_line = "";
				continue
			}
			ignore_newline = false;
			prev_line = cur_line;
			cur_line += wordArray[i];
			line_width = inst.measureWidth(trimRight(cur_line));
			if (line_width > width) {
				if (prev_line === "") {
					addLine(inst, lineIndex, cur_line);
					cur_line = "";
					ignore_newline = true
				} else {
					addLine(inst, lineIndex, prev_line);
					cur_line = wordArray[i]
				}
				lineIndex++;
				if (!wrapbyword && cur_line === " ") cur_line = ""
			}
		}
		if (trimRight(cur_line).length) {
			addLine(inst, lineIndex, cur_line);
			lineIndex++
		}
		for (i = lineIndex; i < lines.length; i++) freeLine(lines[i]);
		lines.length = lineIndex
	};
	instanceProto.measureWidth = function(text) {
		var spacing = this.characterSpacing;
		var len = text.length;
		var width = 0;
		for (var i = 0; i < len; i++) {
			width += this.getCharacterWidth(text.charAt(i)) * this.characterScale + spacing
		}
		width -= width > 0 ? spacing : 0;
		return width
	};
	instanceProto.getCharacterWidth = function(character) {
		var widthList = this.characterWidthList;
		if (widthList[character] !== undefined) {
			return widthList[character]
		} else {
			return this.characterWidth
		}
	};
	instanceProto.rebuildText = function() {
		if (this.text_changed || this.width !== this.lastwrapwidth) {
			this.textWidth = 0;
			this.textHeight = 0;
			this.type.plugin.WordWrap(this);
			this.text_changed = false;
			this.lastwrapwidth = this.width
		}
	};
	var EPSILON = 1e-5;
	instanceProto.draw = function(ctx, glmode) {
		var texture = this.texture_img;
		if (this.text !== "" && texture != null) {
			this.rebuildText();
			if (this.height < this.characterHeight * this.characterScale + this.lineHeight) {
				return
			}
			ctx.globalAlpha = this.opacity;
			var myx = this.x;
			var myy = this.y;
			if (this.runtime.pixel_rounding) {
				myx = Math.round(myx);
				myy = Math.round(myy)
			}
			var viewLeft = this.layer.viewLeft;
			var viewTop = this.layer.viewTop;
			var viewRight = this.layer.viewRight;
			var viewBottom = this.layer.viewBottom;
			ctx.save();
			ctx.translate(myx, myy);
			ctx.rotate(this.angle);
			var ha = this.halign;
			var va = this.valign;
			var scale = this.characterScale;
			var charHeight = this.characterHeight * scale;
			var lineHeight = this.lineHeight;
			var charSpace = this.characterSpacing;
			var lines = this.lines;
			var textHeight = this.textHeight;
			var letterWidth;
			var halign;
			var valign = va * cr.max(0, this.height - textHeight);
			var offx = -(this.hotspotX * this.width);
			var offy = -(this.hotspotY * this.height);
			offy += valign;
			var drawX;
			var drawY = offy;
			var roundX, roundY;
			for (var i = 0; i < lines.length; i++) {
				var line = lines[i].text;
				var len = lines[i].width;
				halign = ha * cr.max(0, this.width - len);
				drawX = offx + halign;
				drawY += lineHeight;
				if (myy + drawY + charHeight < viewTop) {
					drawY += charHeight;
					continue
				}
				for (var j = 0; j < line.length; j++) {
					var letter = line.charAt(j);
					letterWidth = this.getCharacterWidth(letter);
					var clip = this.clipList[letter];
					if (myx + drawX + letterWidth * scale + charSpace < viewLeft) {
						drawX += letterWidth * scale + charSpace;
						continue
					}
					if (drawX + letterWidth * scale > this.width + EPSILON) {
						break
					}
					if (clip !== undefined) {
						roundX = drawX;
						roundY = drawY;
						if (this.angle === 0) {
							roundX = Math.round(roundX);
							roundY = Math.round(roundY)
						}
						ctx.drawImage(this.texture_img, clip.x, clip.y, clip.w, clip.h, roundX, roundY, clip.w * scale, clip.h * scale)
					}
					drawX += letterWidth * scale + charSpace;
					if (myx + drawX > viewRight) break
				}
				drawY += charHeight;
				if (drawY + charHeight + lineHeight > this.height || myy + drawY > viewBottom) {
					break
				}
			}
			ctx.restore()
		}
	};
	var dQuad = new cr.quad;

	function rotateQuad(quad, cosa, sina) {
		var x_temp;
		x_temp = quad.tlx * cosa - quad.tly * sina;
		quad.tly = quad.tly * cosa + quad.tlx * sina;
		quad.tlx = x_temp;
		x_temp = quad.trx * cosa - quad.try_ * sina;
		quad.try_ = quad.try_ * cosa + quad.trx * sina;
		quad.trx = x_temp;
		x_temp = quad.blx * cosa - quad.bly * sina;
		quad.bly = quad.bly * cosa + quad.blx * sina;
		quad.blx = x_temp;
		x_temp = quad.brx * cosa - quad.bry * sina;
		quad.bry = quad.bry * cosa + quad.brx * sina;
		quad.brx = x_temp
	}
	instanceProto.drawGL = function(glw) {
		glw.setTexture(this.webGL_texture);
		glw.setOpacity(this.opacity);
		if (!this.text) return;
		this.rebuildText();
		if (this.height < this.characterHeight * this.characterScale + this.lineHeight) {
			return
		}
		this.update_bbox();
		var q = this.bquad;
		var ox = 0;
		var oy = 0;
		if (this.runtime.pixel_rounding) {
			ox = Math.round(this.x) - this.x;
			oy = Math.round(this.y) - this.y
		}
		var viewLeft = this.layer.viewLeft;
		var viewTop = this.layer.viewTop;
		var viewRight = this.layer.viewRight;
		var viewBottom = this.layer.viewBottom;
		var angle = this.angle;
		var ha = this.halign;
		var va = this.valign;
		var scale = this.characterScale;
		var charHeight = this.characterHeight * scale;
		var lineHeight = this.lineHeight;
		var charSpace = this.characterSpacing;
		var lines = this.lines;
		var textHeight = this.textHeight;
		var letterWidth;
		var cosa, sina;
		if (angle !== 0) {
			cosa = Math.cos(angle);
			sina = Math.sin(angle)
		}
		var halign;
		var valign = va * cr.max(0, this.height - textHeight);
		var offx = q.tlx + ox;
		var offy = q.tly + oy;
		var drawX;
		var drawY = valign;
		var roundX, roundY;
		for (var i = 0; i < lines.length; i++) {
			var line = lines[i].text;
			var lineWidth = lines[i].width;
			halign = ha * cr.max(0, this.width - lineWidth);
			drawX = halign;
			drawY += lineHeight;
			if (angle === 0 && offy + drawY + charHeight < viewTop) {
				drawY += charHeight;
				continue
			}
			for (var j = 0; j < line.length; j++) {
				var letter = line.charAt(j);
				letterWidth = this.getCharacterWidth(letter);
				var clipUV = this.clipUV[letter];
				if (offx + drawX + letterWidth * scale + charSpace < viewLeft) {
					drawX += letterWidth * scale + charSpace;
					continue
				}
				if (drawX + letterWidth * scale > this.width + EPSILON) {
					break
				}
				if (clipUV !== undefined) {
					var clipWidth = this.characterWidth * scale;
					var clipHeight = this.characterHeight * scale;
					roundX = drawX;
					roundY = drawY;
					if (angle === 0) {
						roundX = Math.round(roundX);
						roundY = Math.round(roundY)
					}
					dQuad.tlx = roundX;
					dQuad.tly = roundY;
					dQuad.trx = roundX + clipWidth;
					dQuad.try_ = roundY;
					dQuad.blx = roundX;
					dQuad.bly = roundY + clipHeight;
					dQuad.brx = roundX + clipWidth;
					dQuad.bry = roundY + clipHeight;
					if (angle !== 0) {
						rotateQuad(dQuad, cosa, sina)
					}
					dQuad.offset(offx, offy);
					glw.quadTex(dQuad.tlx, dQuad.tly, dQuad.trx, dQuad.try_, dQuad.brx, dQuad.bry, dQuad.blx, dQuad.bly, clipUV)
				}
				drawX += letterWidth * scale + charSpace;
				if (angle === 0 && offx + drawX > viewRight) break
			}
			drawY += charHeight;
			if (drawY + charHeight + lineHeight > this.height || offy + drawY > viewBottom) {
				break
			}
		}
	};

	function Cnds() {}
	Cnds.prototype.CompareText = function(text_to_compare, case_sensitive) {
		if (case_sensitive) return this.text == text_to_compare;
		else return cr.equals_nocase(this.text, text_to_compare)
	};
	pluginProto.cnds = new Cnds;

	function Acts() {}
	Acts.prototype.SetText = function(param) {
		if (cr.is_number(param) && param < 1e9) param = Math.round(param * 1e10) / 1e10;
		var text_to_set = param.toString();
		if (this.text !== text_to_set) {
			this.text = text_to_set;
			this.text_changed = true;
			this.runtime.redraw = true
		}
	};
	Acts.prototype.AppendText = function(param) {
		if (cr.is_number(param)) param = Math.round(param * 1e10) / 1e10;
		var text_to_append = param.toString();
		if (text_to_append) {
			this.text += text_to_append;
			this.text_changed = true;
			this.runtime.redraw = true
		}
	};
	Acts.prototype.SetScale = function(param) {
		if (param !== this.characterScale) {
			this.characterScale = param;
			this.text_changed = true;
			this.runtime.redraw = true
		}
	};
	Acts.prototype.SetCharacterSpacing = function(param) {
		if (param !== this.CharacterSpacing) {
			this.characterSpacing = param;
			this.text_changed = true;
			this.runtime.redraw = true
		}
	};
	Acts.prototype.SetLineHeight = function(param) {
		if (param !== this.lineHeight) {
			this.lineHeight = param;
			this.text_changed = true;
			this.runtime.redraw = true
		}
	};
	instanceProto.SetCharWidth = function(character, width) {
		var w = parseInt(width, 10);
		if (this.characterWidthList[character] !== w) {
			this.characterWidthList[character] = w;
			this.text_changed = true;
			this.runtime.redraw = true
		}
	};
	Acts.prototype.SetCharacterWidth = function(characterSet, width) {
		if (characterSet !== "") {
			for (var c = 0; c < characterSet.length; c++) {
				this.SetCharWidth(characterSet.charAt(c), width)
			}
		}
	};
	Acts.prototype.SetEffect = function(effect) {
		this.blend_mode = effect;
		this.compositeOp = cr.effectToCompositeOp(effect);
		cr.setGLBlend(this, effect, this.runtime.gl);
		this.runtime.redraw = true
	};
	Acts.prototype.SetHAlign = function(a) {
		this.halign = a / 2;
		this.text_changed = true;
		this.runtime.redraw = true
	};
	Acts.prototype.SetVAlign = function(a) {
		this.valign = a / 2;
		this.text_changed = true;
		this.runtime.redraw = true
	};
	pluginProto.acts = new Acts;

	function Exps() {}
	Exps.prototype.CharacterWidth = function(ret, character) {
		ret.set_int(this.getCharacterWidth(character))
	};
	Exps.prototype.CharacterHeight = function(ret) {
		ret.set_int(this.characterHeight)
	};
	Exps.prototype.CharacterScale = function(ret) {
		ret.set_float(this.characterScale)
	};
	Exps.prototype.CharacterSpacing = function(ret) {
		ret.set_int(this.characterSpacing)
	};
	Exps.prototype.LineHeight = function(ret) {
		ret.set_int(this.lineHeight)
	};
	Exps.prototype.Text = function(ret) {
		ret.set_string(this.text)
	};
	Exps.prototype.TextWidth = function(ret) {
		this.rebuildText();
		ret.set_float(this.textWidth)
	};
	Exps.prototype.TextHeight = function(ret) {
		this.rebuildText();
		ret.set_float(this.textHeight)
	};
	pluginProto.exps = new Exps
})();
cr.plugins_.TiledBg = function(runtime) {
	this.runtime = runtime
};
(function() {
	var pluginProto = cr.plugins_.TiledBg.prototype;
	pluginProto.Type = function(plugin) {
		this.plugin = plugin;
		this.runtime = plugin.runtime
	};
	var typeProto = pluginProto.Type.prototype;
	typeProto.onCreate = function() {
		if (this.is_family) return;
		this.texture_img = new Image;
		this.texture_img.cr_filesize = this.texture_filesize;
		this.runtime.waitForImageLoad(this.texture_img, this.texture_file);
		this.pattern = null;
		this.webGL_texture = null
	};
	typeProto.onLostWebGLContext = function() {
		if (this.is_family) return;
		this.webGL_texture = null
	};
	typeProto.onRestoreWebGLContext = function() {
		if (this.is_family || !this.instances.length) return;
		if (!this.webGL_texture) {
			this.webGL_texture = this.runtime.glwrap.loadTexture(this.texture_img, true, this.runtime.linearSampling, this.texture_pixelformat)
		}
		var i, len;
		for (i = 0, len = this.instances.length; i < len; i++) this.instances[i].webGL_texture = this.webGL_texture
	};
	typeProto.loadTextures = function() {
		if (this.is_family || this.webGL_texture || !this.runtime.glwrap) return;
		this.webGL_texture = this.runtime.glwrap.loadTexture(this.texture_img, true, this.runtime.linearSampling, this.texture_pixelformat)
	};
	typeProto.unloadTextures = function() {
		if (this.is_family || this.instances.length || !this.webGL_texture) return;
		this.runtime.glwrap.deleteTexture(this.webGL_texture);
		this.webGL_texture = null
	};
	typeProto.preloadCanvas2D = function(ctx) {
		ctx.drawImage(this.texture_img, 0, 0)
	};
	pluginProto.Instance = function(type) {
		this.type = type;
		this.runtime = type.runtime
	};
	var instanceProto = pluginProto.Instance.prototype;
	instanceProto.onCreate = function() {
		this.visible = this.properties[0] === 0;
		this.rcTex = new cr.rect(0, 0, 0, 0);
		this.has_own_texture = false;
		this.texture_img = this.type.texture_img;
		if (this.runtime.glwrap) {
			this.type.loadTextures();
			this.webGL_texture = this.type.webGL_texture
		} else {
			if (!this.type.pattern) this.type.pattern = this.runtime.ctx.createPattern(this.type.texture_img, "repeat");
			this.pattern = this.type.pattern
		}
	};
	instanceProto.afterLoad = function() {
		this.has_own_texture = false;
		this.texture_img = this.type.texture_img
	};
	instanceProto.onDestroy = function() {
		if (this.runtime.glwrap && this.has_own_texture && this.webGL_texture) {
			this.runtime.glwrap.deleteTexture(this.webGL_texture);
			this.webGL_texture = null
		}
	};
	instanceProto.draw = function(ctx) {
		ctx.globalAlpha = this.opacity;
		ctx.save();
		ctx.fillStyle = this.pattern;
		var myx = this.x;
		var myy = this.y;
		if (this.runtime.pixel_rounding) {
			myx = Math.round(myx);
			myy = Math.round(myy)
		}
		var drawX = -(this.hotspotX * this.width);
		var drawY = -(this.hotspotY * this.height);
		var offX = drawX % this.texture_img.width;
		var offY = drawY % this.texture_img.height;
		if (offX < 0) offX += this.texture_img.width;
		if (offY < 0) offY += this.texture_img.height;
		ctx.translate(myx, myy);
		ctx.rotate(this.angle);
		ctx.translate(offX, offY);
		ctx.fillRect(drawX - offX, drawY - offY, this.width, this.height);
		ctx.restore()
	};
	instanceProto.drawGL_earlyZPass = function(glw) {
		this.drawGL(glw)
	};
	instanceProto.drawGL = function(glw) {
		glw.setTexture(this.webGL_texture);
		glw.setOpacity(this.opacity);
		var rcTex = this.rcTex;
		rcTex.right = this.width / this.texture_img.width;
		rcTex.bottom = this.height / this.texture_img.height;
		var q = this.bquad;
		if (this.runtime.pixel_rounding) {
			var ox = Math.round(this.x) - this.x;
			var oy = Math.round(this.y) - this.y;
			glw.quadTex(q.tlx + ox, q.tly + oy, q.trx + ox, q.try_ + oy, q.brx + ox, q.bry + oy, q.blx + ox, q.bly + oy, rcTex)
		} else glw.quadTex(q.tlx, q.tly, q.trx, q.try_, q.brx, q.bry, q.blx, q.bly, rcTex)
	};

	function Cnds() {}
	Cnds.prototype.OnURLLoaded = function() {
		return true
	};
	pluginProto.cnds = new Cnds;

	function Acts() {}
	Acts.prototype.SetEffect = function(effect) {
		this.blend_mode = effect;
		this.compositeOp = cr.effectToCompositeOp(effect);
		cr.setGLBlend(this, effect, this.runtime.gl);
		this.runtime.redraw = true
	};
	Acts.prototype.LoadURL = function(url_) {
		var img = new Image;
		var self = this;
		img.onload = function() {
			self.texture_img = img;
			if (self.runtime.glwrap) {
				if (self.has_own_texture && self.webGL_texture) self.runtime.glwrap.deleteTexture(self.webGL_texture);
				self.webGL_texture = self.runtime.glwrap.loadTexture(img, true, self.runtime.linearSampling)
			} else {
				self.pattern = self.runtime.ctx.createPattern(img, "repeat")
			}
			self.has_own_texture = true;
			self.runtime.redraw = true;
			self.runtime.trigger(cr.plugins_.TiledBg.prototype.cnds.OnURLLoaded, self)
		};
		if (url_.substr(0, 5) !== "data:") img.crossOrigin = "anonymous";
		img.src = url_
	};
	pluginProto.acts = new Acts;

	function Exps() {}
	Exps.prototype.ImageWidth = function(ret) {
		ret.set_float(this.texture_img.width)
	};
	Exps.prototype.ImageHeight = function(ret) {
		ret.set_float(this.texture_img.height)
	};
	pluginProto.exps = new Exps
})();
cr.plugins_.Touch = function(runtime) {
	this.runtime = runtime
};
(function() {
	var pluginProto = cr.plugins_.Touch.prototype;
	pluginProto.Type = function(plugin) {
		this.plugin = plugin;
		this.runtime = plugin.runtime
	};
	var typeProto = pluginProto.Type.prototype;
	typeProto.onCreate = function() {};
	pluginProto.Instance = function(type) {
		this.type = type;
		this.runtime = type.runtime;
		this.touches = [];
		this.mouseDown = false
	};
	var instanceProto = pluginProto.Instance.prototype;
	var dummyoffset = {
		left: 0,
		top: 0
	};
	instanceProto.findTouch = function(id) {
		var i, len;
		for (i = 0, len = this.touches.length; i < len; i++) {
			if (this.touches[i]["id"] === id) return i
		}
		return -1
	};
	var appmobi_accx = 0;
	var appmobi_accy = 0;
	var appmobi_accz = 0;

	function AppMobiGetAcceleration(evt) {
		appmobi_accx = evt.x;
		appmobi_accy = evt.y;
		appmobi_accz = evt.z
	}
	var pg_accx = 0;
	var pg_accy = 0;
	var pg_accz = 0;

	function PhoneGapGetAcceleration(evt) {
		pg_accx = evt.x;
		pg_accy = evt.y;
		pg_accz = evt.z
	}
	var theInstance = null;
	var touchinfo_cache = [];

	function AllocTouchInfo(x, y, id, index) {
		var ret;
		if (touchinfo_cache.length) ret = touchinfo_cache.pop();
		else ret = new TouchInfo;
		ret.init(x, y, id, index);
		return ret
	}
	function ReleaseTouchInfo(ti) {
		if (touchinfo_cache.length < 100) touchinfo_cache.push(ti)
	}
	var GESTURE_HOLD_THRESHOLD = 15;
	var GESTURE_HOLD_TIMEOUT = 500;
	var GESTURE_TAP_TIMEOUT = 333;
	var GESTURE_DOUBLETAP_THRESHOLD = 25;

	function TouchInfo() {
		this.starttime = 0;
		this.time = 0;
		this.lasttime = 0;
		this.startx = 0;
		this.starty = 0;
		this.x = 0;
		this.y = 0;
		this.lastx = 0;
		this.lasty = 0;
		this["id"] = 0;
		this.startindex = 0;
		this.triggeredHold = false;
		this.tooFarForHold = false
	}
	TouchInfo.prototype.init = function(x, y, id, index) {
		var nowtime = cr.performance_now();
		this.time = nowtime;
		this.lasttime = nowtime;
		this.starttime = nowtime;
		this.startx = x;
		this.starty = y;
		this.x = x;
		this.y = y;
		this.lastx = x;
		this.lasty = y;
		this["id"] = id;
		this.startindex = index;
		this.triggeredHold = false;
		this.tooFarForHold = false
	};
	TouchInfo.prototype.update = function(nowtime, x, y) {
		this.lasttime = this.time;
		this.time = nowtime;
		this.lastx = this.x;
		this.lasty = this.y;
		this.x = x;
		this.y = y;
		if (!this.tooFarForHold && cr.distanceTo(this.startx, this.starty, this.x, this.y) >= GESTURE_HOLD_THRESHOLD) {
			this.tooFarForHold = true
		}
	};
	TouchInfo.prototype.maybeTriggerHold = function(inst, index) {
		if (this.triggeredHold) return;
		var nowtime = cr.performance_now();
		if (nowtime - this.starttime >= GESTURE_HOLD_TIMEOUT && !this.tooFarForHold && cr.distanceTo(this.startx, this.starty, this.x, this.y) < GESTURE_HOLD_THRESHOLD) {
			this.triggeredHold = true;
			inst.trigger_index = this.startindex;
			inst.trigger_id = this["id"];
			inst.getTouchIndex = index;
			inst.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnHoldGesture, inst);
			inst.curTouchX = this.x;
			inst.curTouchY = this.y;
			inst.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnHoldGestureObject, inst);
			inst.getTouchIndex = 0
		}
	};
	var lastTapX = -1e3;
	var lastTapY = -1e3;
	var lastTapTime = -1e4;
	TouchInfo.prototype.maybeTriggerTap = function(inst, index) {
		if (this.triggeredHold) return;
		var nowtime = cr.performance_now();
		if (nowtime - this.starttime <= GESTURE_TAP_TIMEOUT && !this.tooFarForHold && cr.distanceTo(this.startx, this.starty, this.x, this.y) < GESTURE_HOLD_THRESHOLD) {
			inst.trigger_index = this.startindex;
			inst.trigger_id = this["id"];
			inst.getTouchIndex = index;
			if (nowtime - lastTapTime <= GESTURE_TAP_TIMEOUT * 2 && cr.distanceTo(lastTapX, lastTapY, this.x, this.y) < GESTURE_DOUBLETAP_THRESHOLD) {
				inst.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnDoubleTapGesture, inst);
				inst.curTouchX = this.x;
				inst.curTouchY = this.y;
				inst.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnDoubleTapGestureObject, inst);
				lastTapX = -1e3;
				lastTapY = -1e3;
				lastTapTime = -1e4
			} else {
				inst.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnTapGesture, inst);
				inst.curTouchX = this.x;
				inst.curTouchY = this.y;
				inst.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnTapGestureObject, inst);
				lastTapX = this.x;
				lastTapY = this.y;
				lastTapTime = nowtime
			}
			inst.getTouchIndex = 0
		}
	};
	instanceProto.onCreate = function() {
		theInstance = this;
		this.isWindows8 = !! (typeof window["c2isWindows8"] !== "undefined" && window["c2isWindows8"]);
		this.orient_alpha = 0;
		this.orient_beta = 0;
		this.orient_gamma = 0;
		this.acc_g_x = 0;
		this.acc_g_y = 0;
		this.acc_g_z = 0;
		this.acc_x = 0;
		this.acc_y = 0;
		this.acc_z = 0;
		this.curTouchX = 0;
		this.curTouchY = 0;
		this.trigger_index = 0;
		this.trigger_id = 0;
		this.getTouchIndex = 0;
		this.useMouseInput = this.properties[0] !== 0;
		var elem = this.runtime.fullscreen_mode > 0 ? document : this.runtime.canvas;
		var elem2 = document;
		if (this.runtime.isDirectCanvas) elem2 = elem = window["Canvas"];
		else if (this.runtime.isCocoonJs) elem2 = elem = window;
		var self = this;
		if (window.navigator["pointerEnabled"]) {
			elem.addEventListener("pointerdown", function(info) {
				self.onPointerStart(info)
			}, false);
			elem.addEventListener("pointermove", function(info) {
				self.onPointerMove(info)
			}, false);
			elem2.addEventListener("pointerup", function(info) {
				self.onPointerEnd(info, false)
			}, false);
			elem2.addEventListener("pointercancel", function(info) {
				self.onPointerEnd(info, true)
			}, false);
			if (this.runtime.canvas) {
				this.runtime.canvas.addEventListener("MSGestureHold", function(e) {
					e.preventDefault()
				}, false);
				document.addEventListener("MSGestureHold", function(e) {
					e.preventDefault()
				}, false);
				this.runtime.canvas.addEventListener("gesturehold", function(e) {
					e.preventDefault()
				}, false);
				document.addEventListener("gesturehold", function(e) {
					e.preventDefault()
				}, false)
			}
		} else if (window.navigator["msPointerEnabled"]) {
			elem.addEventListener("MSPointerDown", function(info) {
				self.onPointerStart(info)
			}, false);
			elem.addEventListener("MSPointerMove", function(info) {
				self.onPointerMove(info)
			}, false);
			elem2.addEventListener("MSPointerUp", function(info) {
				self.onPointerEnd(info, false)
			}, false);
			elem2.addEventListener("MSPointerCancel", function(info) {
				self.onPointerEnd(info, true)
			}, false);
			if (this.runtime.canvas) {
				this.runtime.canvas.addEventListener("MSGestureHold", function(e) {
					e.preventDefault()
				}, false);
				document.addEventListener("MSGestureHold", function(e) {
					e.preventDefault()
				}, false)
			}
		} else {
			elem.addEventListener("touchstart", function(info) {
				self.onTouchStart(info)
			}, false);
			elem.addEventListener("touchmove", function(info) {
				self.onTouchMove(info)
			}, false);
			elem2.addEventListener("touchend", function(info) {
				self.onTouchEnd(info, false)
			}, false);
			elem2.addEventListener("touchcancel", function(info) {
				self.onTouchEnd(info, true)
			}, false)
		}
		if (this.isWindows8) {
			var win8accelerometerFn = function(e) {
					var reading = e["reading"];
					self.acc_x = reading["accelerationX"];
					self.acc_y = reading["accelerationY"];
					self.acc_z = reading["accelerationZ"]
				};
			var win8inclinometerFn = function(e) {
					var reading = e["reading"];
					self.orient_alpha = reading["yawDegrees"];
					self.orient_beta = reading["pitchDegrees"];
					self.orient_gamma = reading["rollDegrees"]
				};
			var accelerometer = Windows["Devices"]["Sensors"]["Accelerometer"]["getDefault"]();
			if (accelerometer) {
				accelerometer["reportInterval"] = Math.max(accelerometer["minimumReportInterval"], 16);
				accelerometer.addEventListener("readingchanged", win8accelerometerFn)
			}
			var inclinometer = Windows["Devices"]["Sensors"]["Inclinometer"]["getDefault"]();
			if (inclinometer) {
				inclinometer["reportInterval"] = Math.max(inclinometer["minimumReportInterval"], 16);
				inclinometer.addEventListener("readingchanged", win8inclinometerFn)
			}
			document.addEventListener("visibilitychange", function(e) {
				if (document["hidden"] || document["msHidden"]) {
					if (accelerometer) accelerometer.removeEventListener("readingchanged", win8accelerometerFn);
					if (inclinometer) inclinometer.removeEventListener("readingchanged", win8inclinometerFn)
				} else {
					if (accelerometer) accelerometer.addEventListener("readingchanged", win8accelerometerFn);
					if (inclinometer) inclinometer.addEventListener("readingchanged", win8inclinometerFn)
				}
			}, false)
		} else {
			window.addEventListener("deviceorientation", function(eventData) {
				self.orient_alpha = eventData["alpha"] || 0;
				self.orient_beta = eventData["beta"] || 0;
				self.orient_gamma = eventData["gamma"] || 0
			}, false);
			window.addEventListener("devicemotion", function(eventData) {
				if (eventData["accelerationIncludingGravity"]) {
					self.acc_g_x = eventData["accelerationIncludingGravity"]["x"] || 0;
					self.acc_g_y = eventData["accelerationIncludingGravity"]["y"] || 0;
					self.acc_g_z = eventData["accelerationIncludingGravity"]["z"] || 0
				}
				if (eventData["acceleration"]) {
					self.acc_x = eventData["acceleration"]["x"] || 0;
					self.acc_y = eventData["acceleration"]["y"] || 0;
					self.acc_z = eventData["acceleration"]["z"] || 0
				}
			}, false)
		}
		if (this.useMouseInput && !this.runtime.isDomFree) {
			jQuery(document).mousemove(function(info) {
				self.onMouseMove(info)
			});
			jQuery(document).mousedown(function(info) {
				self.onMouseDown(info)
			});
			jQuery(document).mouseup(function(info) {
				self.onMouseUp(info)
			})
		}
		if (!this.runtime.isiOS && this.runtime.isCordova && navigator["accelerometer"] && navigator["accelerometer"]["watchAcceleration"]) {
			navigator["accelerometer"]["watchAcceleration"](PhoneGapGetAcceleration, null, {
				frequency: 40
			})
		}
		this.runtime.tick2Me(this)
	};
	instanceProto.onPointerMove = function(info) {
		if (info["pointerType"] === info["MSPOINTER_TYPE_MOUSE"] || info["pointerType"] === "mouse") return;
		if (info.preventDefault) info.preventDefault();
		var i = this.findTouch(info["pointerId"]);
		var nowtime = cr.performance_now();
		if (i >= 0) {
			var offset = this.runtime.isDomFree ? dummyoffset : jQuery(this.runtime.canvas).offset();
			var t = this.touches[i];
			if (nowtime - t.time < 2) return;
			t.update(nowtime, info.pageX - offset.left, info.pageY - offset.top)
		}
	};
	instanceProto.onPointerStart = function(info) {
		if (info["pointerType"] === info["MSPOINTER_TYPE_MOUSE"] || info["pointerType"] === "mouse") return;
		if (info.preventDefault && cr.isCanvasInputEvent(info)) info.preventDefault();
		var offset = this.runtime.isDomFree ? dummyoffset : jQuery(this.runtime.canvas).offset();
		var touchx = info.pageX - offset.left;
		var touchy = info.pageY - offset.top;
		var nowtime = cr.performance_now();
		this.trigger_index = this.touches.length;
		this.trigger_id = info["pointerId"];
		this.touches.push(AllocTouchInfo(touchx, touchy, info["pointerId"], this.trigger_index));
		this.runtime.isInUserInputEvent = true;
		this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnNthTouchStart, this);
		this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnTouchStart, this);
		this.curTouchX = touchx;
		this.curTouchY = touchy;
		this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnTouchObject, this);
		this.runtime.isInUserInputEvent = false
	};
	instanceProto.onPointerEnd = function(info, isCancel) {
		if (info["pointerType"] === info["MSPOINTER_TYPE_MOUSE"] || info["pointerType"] === "mouse") return;
		if (info.preventDefault && cr.isCanvasInputEvent(info)) info.preventDefault();
		var i = this.findTouch(info["pointerId"]);
		this.trigger_index = i >= 0 ? this.touches[i].startindex : -1;
		this.trigger_id = i >= 0 ? this.touches[i]["id"] : -1;
		this.runtime.isInUserInputEvent = true;
		this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnNthTouchEnd, this);
		this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnTouchEnd, this);
		if (i >= 0) {
			if (!isCancel) this.touches[i].maybeTriggerTap(this, i);
			ReleaseTouchInfo(this.touches[i]);
			this.touches.splice(i, 1)
		}
		this.runtime.isInUserInputEvent = false
	};
	instanceProto.onTouchMove = function(info) {
		if (info.preventDefault) info.preventDefault();
		var nowtime = cr.performance_now();
		var i, len, t, u;
		for (i = 0, len = info.changedTouches.length; i < len; i++) {
			t = info.changedTouches[i];
			var j = this.findTouch(t["identifier"]);
			if (j >= 0) {
				var offset = this.runtime.isDomFree ? dummyoffset : jQuery(this.runtime.canvas).offset();
				u = this.touches[j];
				if (nowtime - u.time < 2) continue;
				u.update(nowtime, t.pageX - offset.left, t.pageY - offset.top)
			}
		}
	};
	instanceProto.onTouchStart = function(info) {
		if (info.preventDefault && cr.isCanvasInputEvent(info)) info.preventDefault();
		var offset = this.runtime.isDomFree ? dummyoffset : jQuery(this.runtime.canvas).offset();
		var nowtime = cr.performance_now();
		this.runtime.isInUserInputEvent = true;
		var i, len, t, j;
		for (i = 0, len = info.changedTouches.length; i < len; i++) {
			t = info.changedTouches[i];
			j = this.findTouch(t["identifier"]);
			if (j !== -1) continue;
			var touchx = t.pageX - offset.left;
			var touchy = t.pageY - offset.top;
			this.trigger_index = this.touches.length;
			this.trigger_id = t["identifier"];
			this.touches.push(AllocTouchInfo(touchx, touchy, t["identifier"], this.trigger_index));
			this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnNthTouchStart, this);
			this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnTouchStart, this);
			this.curTouchX = touchx;
			this.curTouchY = touchy;
			this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnTouchObject, this)
		}
		this.runtime.isInUserInputEvent = false
	};
	instanceProto.onTouchEnd = function(info, isCancel) {
		if (info.preventDefault && cr.isCanvasInputEvent(info)) info.preventDefault();
		this.runtime.isInUserInputEvent = true;
		var i, len, t, j;
		for (i = 0, len = info.changedTouches.length; i < len; i++) {
			t = info.changedTouches[i];
			j = this.findTouch(t["identifier"]);
			if (j >= 0) {
				this.trigger_index = this.touches[j].startindex;
				this.trigger_id = this.touches[j]["id"];
				this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnNthTouchEnd, this);
				this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnTouchEnd, this);
				if (!isCancel) this.touches[j].maybeTriggerTap(this, j);
				ReleaseTouchInfo(this.touches[j]);
				this.touches.splice(j, 1)
			}
		}
		this.runtime.isInUserInputEvent = false
	};
	instanceProto.getAlpha = function() {
		if (this.runtime.isCordova && this.orient_alpha === 0 && pg_accz !== 0) return pg_accz * 90;
		else return this.orient_alpha
	};
	instanceProto.getBeta = function() {
		if (this.runtime.isCordova && this.orient_beta === 0 && pg_accy !== 0) return pg_accy * 90;
		else return this.orient_beta
	};
	instanceProto.getGamma = function() {
		if (this.runtime.isCordova && this.orient_gamma === 0 && pg_accx !== 0) return pg_accx * 90;
		else return this.orient_gamma
	};
	var noop_func = function() {};
	instanceProto.onMouseDown = function(info) {
		var t = {
			pageX: info.pageX,
			pageY: info.pageY,
			identifier: 0
		};
		var fakeinfo = {
			changedTouches: [t]
		};
		this.onTouchStart(fakeinfo);
		this.mouseDown = true
	};
	instanceProto.onMouseMove = function(info) {
		if (!this.mouseDown) return;
		var t = {
			pageX: info.pageX,
			pageY: info.pageY,
			identifier: 0
		};
		var fakeinfo = {
			changedTouches: [t]
		};
		this.onTouchMove(fakeinfo)
	};
	instanceProto.onMouseUp = function(info) {
		if (info.preventDefault && this.runtime.had_a_click && !this.runtime.isMobile) info.preventDefault();
		this.runtime.had_a_click = true;
		var t = {
			pageX: info.pageX,
			pageY: info.pageY,
			identifier: 0
		};
		var fakeinfo = {
			changedTouches: [t]
		};
		this.onTouchEnd(fakeinfo);
		this.mouseDown = false
	};
	instanceProto.tick2 = function() {
		var i, len, t;
		var nowtime = cr.performance_now();
		for (i = 0, len = this.touches.length; i < len; ++i) {
			t = this.touches[i];
			if (t.time <= nowtime - 50) t.lasttime = nowtime;
			t.maybeTriggerHold(this, i)
		}
	};

	function Cnds() {}
	Cnds.prototype.OnTouchStart = function() {
		return true
	};
	Cnds.prototype.OnTouchEnd = function() {
		return true
	};
	Cnds.prototype.IsInTouch = function() {
		return this.touches.length
	};
	Cnds.prototype.OnTouchObject = function(type) {
		if (!type) return false;
		return this.runtime.testAndSelectCanvasPointOverlap(type, this.curTouchX, this.curTouchY, false)
	};
	var touching = [];
	Cnds.prototype.IsTouchingObject = function(type) {
		if (!type) return false;
		var sol = type.getCurrentSol();
		var instances = sol.getObjects();
		var px, py;
		var i, leni, j, lenj;
		for (i = 0, leni = instances.length; i < leni; i++) {
			var inst = instances[i];
			inst.update_bbox();
			for (j = 0, lenj = this.touches.length; j < lenj; j++) {
				var touch = this.touches[j];
				px = inst.layer.canvasToLayer(touch.x, touch.y, true);
				py = inst.layer.canvasToLayer(touch.x, touch.y, false);
				if (inst.contains_pt(px, py)) {
					touching.push(inst);
					break
				}
			}
		}
		if (touching.length) {
			sol.select_all = false;
			cr.shallowAssignArray(sol.instances, touching);
			type.applySolToContainer();
			cr.clearArray(touching);
			return true
		} else return false
	};
	Cnds.prototype.CompareTouchSpeed = function(index, cmp, s) {
		index = Math.floor(index);
		if (index < 0 || index >= this.touches.length) return false;
		var t = this.touches[index];
		var dist = cr.distanceTo(t.x, t.y, t.lastx, t.lasty);
		var timediff = (t.time - t.lasttime) / 1e3;
		var speed = 0;
		if (timediff > 0) speed = dist / timediff;
		return cr.do_cmp(speed, cmp, s)
	};
	Cnds.prototype.OrientationSupported = function() {
		return typeof window["DeviceOrientationEvent"] !== "undefined"
	};
	Cnds.prototype.MotionSupported = function() {
		return typeof window["DeviceMotionEvent"] !== "undefined"
	};
	Cnds.prototype.CompareOrientation = function(orientation_, cmp_, angle_) {
		var v = 0;
		if (orientation_ === 0) v = this.getAlpha();
		else if (orientation_ === 1) v = this.getBeta();
		else v = this.getGamma();
		return cr.do_cmp(v, cmp_, angle_)
	};
	Cnds.prototype.CompareAcceleration = function(acceleration_, cmp_, angle_) {
		var v = 0;
		if (acceleration_ === 0) v = this.acc_g_x;
		else if (acceleration_ === 1) v = this.acc_g_y;
		else if (acceleration_ === 2) v = this.acc_g_z;
		else if (acceleration_ === 3) v = this.acc_x;
		else if (acceleration_ === 4) v = this.acc_y;
		else if (acceleration_ === 5) v = this.acc_z;
		return cr.do_cmp(v, cmp_, angle_)
	};
	Cnds.prototype.OnNthTouchStart = function(touch_) {
		touch_ = Math.floor(touch_);
		return touch_ === this.trigger_index
	};
	Cnds.prototype.OnNthTouchEnd = function(touch_) {
		touch_ = Math.floor(touch_);
		return touch_ === this.trigger_index
	};
	Cnds.prototype.HasNthTouch = function(touch_) {
		touch_ = Math.floor(touch_);
		return this.touches.length >= touch_ + 1
	};
	Cnds.prototype.OnHoldGesture = function() {
		return true
	};
	Cnds.prototype.OnTapGesture = function() {
		return true
	};
	Cnds.prototype.OnDoubleTapGesture = function() {
		return true
	};
	Cnds.prototype.OnHoldGestureObject = function(type) {
		if (!type) return false;
		return this.runtime.testAndSelectCanvasPointOverlap(type, this.curTouchX, this.curTouchY, false)
	};
	Cnds.prototype.OnTapGestureObject = function(type) {
		if (!type) return false;
		return this.runtime.testAndSelectCanvasPointOverlap(type, this.curTouchX, this.curTouchY, false)
	};
	Cnds.prototype.OnDoubleTapGestureObject = function(type) {
		if (!type) return false;
		return this.runtime.testAndSelectCanvasPointOverlap(type, this.curTouchX, this.curTouchY, false)
	};
	pluginProto.cnds = new Cnds;

	function Exps() {}
	Exps.prototype.TouchCount = function(ret) {
		ret.set_int(this.touches.length)
	};
	Exps.prototype.X = function(ret, layerparam) {
		var index = this.getTouchIndex;
		if (index < 0 || index >= this.touches.length) {
			ret.set_float(0);
			return
		}
		var layer, oldScale, oldZoomRate, oldParallaxX, oldAngle;
		if (cr.is_undefined(layerparam)) {
			layer = this.runtime.getLayerByNumber(0);
			oldScale = layer.scale;
			oldZoomRate = layer.zoomRate;
			oldParallaxX = layer.parallaxX;
			oldAngle = layer.angle;
			layer.scale = 1;
			layer.zoomRate = 1;
			layer.parallaxX = 1;
			layer.angle = 0;
			ret.set_float(layer.canvasToLayer(this.touches[index].x, this.touches[index].y, true));
			layer.scale = oldScale;
			layer.zoomRate = oldZoomRate;
			layer.parallaxX = oldParallaxX;
			layer.angle = oldAngle
		} else {
			if (cr.is_number(layerparam)) layer = this.runtime.getLayerByNumber(layerparam);
			else layer = this.runtime.getLayerByName(layerparam);
			if (layer) ret.set_float(layer.canvasToLayer(this.touches[index].x, this.touches[index].y, true));
			else ret.set_float(0)
		}
	};
	Exps.prototype.XAt = function(ret, index, layerparam) {
		index = Math.floor(index);
		if (index < 0 || index >= this.touches.length) {
			ret.set_float(0);
			return
		}
		var layer, oldScale, oldZoomRate, oldParallaxX, oldAngle;
		if (cr.is_undefined(layerparam)) {
			layer = this.runtime.getLayerByNumber(0);
			oldScale = layer.scale;
			oldZoomRate = layer.zoomRate;
			oldParallaxX = layer.parallaxX;
			oldAngle = layer.angle;
			layer.scale = 1;
			layer.zoomRate = 1;
			layer.parallaxX = 1;
			layer.angle = 0;
			ret.set_float(layer.canvasToLayer(this.touches[index].x, this.touches[index].y, true));
			layer.scale = oldScale;
			layer.zoomRate = oldZoomRate;
			layer.parallaxX = oldParallaxX;
			layer.angle = oldAngle
		} else {
			if (cr.is_number(layerparam)) layer = this.runtime.getLayerByNumber(layerparam);
			else layer = this.runtime.getLayerByName(layerparam);
			if (layer) ret.set_float(layer.canvasToLayer(this.touches[index].x, this.touches[index].y, true));
			else ret.set_float(0)
		}
	};
	Exps.prototype.XForID = function(ret, id, layerparam) {
		var index = this.findTouch(id);
		if (index < 0) {
			ret.set_float(0);
			return
		}
		var touch = this.touches[index];
		var layer, oldScale, oldZoomRate, oldParallaxX, oldAngle;
		if (cr.is_undefined(layerparam)) {
			layer = this.runtime.getLayerByNumber(0);
			oldScale = layer.scale;
			oldZoomRate = layer.zoomRate;
			oldParallaxX = layer.parallaxX;
			oldAngle = layer.angle;
			layer.scale = 1;
			layer.zoomRate = 1;
			layer.parallaxX = 1;
			layer.angle = 0;
			ret.set_float(layer.canvasToLayer(touch.x, touch.y, true));
			layer.scale = oldScale;
			layer.zoomRate = oldZoomRate;
			layer.parallaxX = oldParallaxX;
			layer.angle = oldAngle
		} else {
			if (cr.is_number(layerparam)) layer = this.runtime.getLayerByNumber(layerparam);
			else layer = this.runtime.getLayerByName(layerparam);
			if (layer) ret.set_float(layer.canvasToLayer(touch.x, touch.y, true));
			else ret.set_float(0)
		}
	};
	Exps.prototype.Y = function(ret, layerparam) {
		var index = this.getTouchIndex;
		if (index < 0 || index >= this.touches.length) {
			ret.set_float(0);
			return
		}
		var layer, oldScale, oldZoomRate, oldParallaxY, oldAngle;
		if (cr.is_undefined(layerparam)) {
			layer = this.runtime.getLayerByNumber(0);
			oldScale = layer.scale;
			oldZoomRate = layer.zoomRate;
			oldParallaxY = layer.parallaxY;
			oldAngle = layer.angle;
			layer.scale = 1;
			layer.zoomRate = 1;
			layer.parallaxY = 1;
			layer.angle = 0;
			ret.set_float(layer.canvasToLayer(this.touches[index].x, this.touches[index].y, false));
			layer.scale = oldScale;
			layer.zoomRate = oldZoomRate;
			layer.parallaxY = oldParallaxY;
			layer.angle = oldAngle
		} else {
			if (cr.is_number(layerparam)) layer = this.runtime.getLayerByNumber(layerparam);
			else layer = this.runtime.getLayerByName(layerparam);
			if (layer) ret.set_float(layer.canvasToLayer(this.touches[index].x, this.touches[index].y, false));
			else ret.set_float(0)
		}
	};
	Exps.prototype.YAt = function(ret, index, layerparam) {
		index = Math.floor(index);
		if (index < 0 || index >= this.touches.length) {
			ret.set_float(0);
			return
		}
		var layer, oldScale, oldZoomRate, oldParallaxY, oldAngle;
		if (cr.is_undefined(layerparam)) {
			layer = this.runtime.getLayerByNumber(0);
			oldScale = layer.scale;
			oldZoomRate = layer.zoomRate;
			oldParallaxY = layer.parallaxY;
			oldAngle = layer.angle;
			layer.scale = 1;
			layer.zoomRate = 1;
			layer.parallaxY = 1;
			layer.angle = 0;
			ret.set_float(layer.canvasToLayer(this.touches[index].x, this.touches[index].y, false));
			layer.scale = oldScale;
			layer.zoomRate = oldZoomRate;
			layer.parallaxY = oldParallaxY;
			layer.angle = oldAngle
		} else {
			if (cr.is_number(layerparam)) layer = this.runtime.getLayerByNumber(layerparam);
			else layer = this.runtime.getLayerByName(layerparam);
			if (layer) ret.set_float(layer.canvasToLayer(this.touches[index].x, this.touches[index].y, false));
			else ret.set_float(0)
		}
	};
	Exps.prototype.YForID = function(ret, id, layerparam) {
		var index = this.findTouch(id);
		if (index < 0) {
			ret.set_float(0);
			return
		}
		var touch = this.touches[index];
		var layer, oldScale, oldZoomRate, oldParallaxY, oldAngle;
		if (cr.is_undefined(layerparam)) {
			layer = this.runtime.getLayerByNumber(0);
			oldScale = layer.scale;
			oldZoomRate = layer.zoomRate;
			oldParallaxY = layer.parallaxY;
			oldAngle = layer.angle;
			layer.scale = 1;
			layer.zoomRate = 1;
			layer.parallaxY = 1;
			layer.angle = 0;
			ret.set_float(layer.canvasToLayer(touch.x, touch.y, false));
			layer.scale = oldScale;
			layer.zoomRate = oldZoomRate;
			layer.parallaxY = oldParallaxY;
			layer.angle = oldAngle
		} else {
			if (cr.is_number(layerparam)) layer = this.runtime.getLayerByNumber(layerparam);
			else layer = this.runtime.getLayerByName(layerparam);
			if (layer) ret.set_float(layer.canvasToLayer(touch.x, touch.y, false));
			else ret.set_float(0)
		}
	};
	Exps.prototype.AbsoluteX = function(ret) {
		if (this.touches.length) ret.set_float(this.touches[0].x);
		else ret.set_float(0)
	};
	Exps.prototype.AbsoluteXAt = function(ret, index) {
		index = Math.floor(index);
		if (index < 0 || index >= this.touches.length) {
			ret.set_float(0);
			return
		}
		ret.set_float(this.touches[index].x)
	};
	Exps.prototype.AbsoluteXForID = function(ret, id) {
		var index = this.findTouch(id);
		if (index < 0) {
			ret.set_float(0);
			return
		}
		var touch = this.touches[index];
		ret.set_float(touch.x)
	};
	Exps.prototype.AbsoluteY = function(ret) {
		if (this.touches.length) ret.set_float(this.touches[0].y);
		else ret.set_float(0)
	};
	Exps.prototype.AbsoluteYAt = function(ret, index) {
		index = Math.floor(index);
		if (index < 0 || index >= this.touches.length) {
			ret.set_float(0);
			return
		}
		ret.set_float(this.touches[index].y)
	};
	Exps.prototype.AbsoluteYForID = function(ret, id) {
		var index = this.findTouch(id);
		if (index < 0) {
			ret.set_float(0);
			return
		}
		var touch = this.touches[index];
		ret.set_float(touch.y)
	};
	Exps.prototype.SpeedAt = function(ret, index) {
		index = Math.floor(index);
		if (index < 0 || index >= this.touches.length) {
			ret.set_float(0);
			return
		}
		var t = this.touches[index];
		var dist = cr.distanceTo(t.x, t.y, t.lastx, t.lasty);
		var timediff = (t.time - t.lasttime) / 1e3;
		if (timediff === 0) ret.set_float(0);
		else ret.set_float(dist / timediff)
	};
	Exps.prototype.SpeedForID = function(ret, id) {
		var index = this.findTouch(id);
		if (index < 0) {
			ret.set_float(0);
			return
		}
		var touch = this.touches[index];
		var dist = cr.distanceTo(touch.x, touch.y, touch.lastx, touch.lasty);
		var timediff = (touch.time - touch.lasttime) / 1e3;
		if (timediff === 0) ret.set_float(0);
		else ret.set_float(dist / timediff)
	};
	Exps.prototype.AngleAt = function(ret, index) {
		index = Math.floor(index);
		if (index < 0 || index >= this.touches.length) {
			ret.set_float(0);
			return
		}
		var t = this.touches[index];
		ret.set_float(cr.to_degrees(cr.angleTo(t.lastx, t.lasty, t.x, t.y)))
	};
	Exps.prototype.AngleForID = function(ret, id) {
		var index = this.findTouch(id);
		if (index < 0) {
			ret.set_float(0);
			return
		}
		var touch = this.touches[index];
		ret.set_float(cr.to_degrees(cr.angleTo(touch.lastx, touch.lasty, touch.x, touch.y)))
	};
	Exps.prototype.Alpha = function(ret) {
		ret.set_float(this.getAlpha())
	};
	Exps.prototype.Beta = function(ret) {
		ret.set_float(this.getBeta())
	};
	Exps.prototype.Gamma = function(ret) {
		ret.set_float(this.getGamma())
	};
	Exps.prototype.AccelerationXWithG = function(ret) {
		ret.set_float(this.acc_g_x)
	};
	Exps.prototype.AccelerationYWithG = function(ret) {
		ret.set_float(this.acc_g_y)
	};
	Exps.prototype.AccelerationZWithG = function(ret) {
		ret.set_float(this.acc_g_z)
	};
	Exps.prototype.AccelerationX = function(ret) {
		ret.set_float(this.acc_x)
	};
	Exps.prototype.AccelerationY = function(ret) {
		ret.set_float(this.acc_y)
	};
	Exps.prototype.AccelerationZ = function(ret) {
		ret.set_float(this.acc_z)
	};
	Exps.prototype.TouchIndex = function(ret) {
		ret.set_int(this.trigger_index)
	};
	Exps.prototype.TouchID = function(ret) {
		ret.set_float(this.trigger_id)
	};
	pluginProto.exps = new Exps
})();
cr.plugins_.meiriq_common = function(runtime) {
	this.runtime = runtime
};
window["meiriq"] = {
	CommonComponent: {
		instance: {
			config_common: function() {
				console.log("not ready yet!")
			}
		}
	}
};
window["meiriq"]["__ready"] = function() {};
window["meiriq"].onReady = function(fn) {
	if (typeof fn === "function") window["meiriq"]["__ready"] = fn
};
(function() {
	var pluginProto = cr.plugins_.meiriq_common.prototype;
	var share = "share";
	var more = "more";
	var rank = "rank";
	pluginProto.Type = function(plugin) {
		this.plugin = plugin;
		this.runtime = plugin.runtime
	};
	var typeProto = pluginProto.Type.prototype;
	typeProto.onCreate = function() {};
	pluginProto.Instance = function(type) {
		this.type = type;
		this.runtime = type.runtime;
		this.init()
	};
	var instanceProto = pluginProto.Instance.prototype;
	instanceProto.onCreate = function() {};
	instanceProto.draw = function(ctx) {};
	instanceProto.drawGL = function(glw) {};
	instanceProto.init = function() {
		var self = this;
		this.gameName = null;
		this.permitStart = 1;
		this.permitOverPanel = true;
		this.highScore = 0;
		this.highLevel = 0;
		this.gameType = "score";
		this.buttonLayout = ["restart"];
		window["meiriq"].CommonComponent.instance.config_common = function(_gamedata, _cb_hooks) {
			var gamedata = _gamedata;
			var cb_hooks = _cb_hooks;
			if (!gamedata) gamedata = {};
			if (!cb_hooks) cb_hooks = {};
			for (var i in cb_hooks) {
				if (!self.hooks) self.hooks = {};
				if (typeof cb_hooks[i] === "function") {
					self.hooks[i] = cb_hooks[i]
				}
			}
			self.gameName = gamedata.name;
			self.permitStart = gamedata.permitStart || 1;
			self.buttonLayout = Array.isArray(gamedata.buttonLayout) ? gamedata.buttonLayout : ["restart"];
			return self.interface
		};
		this.hooks = {};
		this.interface = {
			home: function() {
				self.runtime.trigger(pluginProto.cnds.onHome, self)
			},
			pause: function() {
				self.runtime.trigger(pluginProto.cnds.onPause, self)
			},
			resume: function() {
				self.runtime.trigger(pluginProto.cnds.onResume, self)
			},
			updatePermitStart: function(value) {
				self.permitStart = value
			}
		};
		this.exeHooks = {
			start: function(name) {
				if (!self.gameName && typeof name === "string") self.gameName = name;
				if (!window.localStorage.getItem(self.gameName + "Score")) {
					self.gameScore = 0
				} else {
					self.gameScore = Number(window.localStorage.getItem(self.gameName + "Score"))
				}
				if (!window.localStorage.getItem(self.gameName + "Level")) {
					self.gameLevel = 0
				} else {
					self.gameLevel = Number(window.localStorage.getItem(self.gameName + "Level"))
				}
				return !!self.permitStart
			},
			gameover: function(score) {
				if (self.gameType === "score" && self.gameName) {
					if (score > self.gameScore) {
						window.localStorage.setItem(self.gameName + "Score", String(score));
						self.gameScore = score
					} else if (!self.gameScore) {
						self.gameScore = window.localStorage.getItem(self.gameName + "Score")
					}
				} else {
					self.gameScore = 0
				}
			},
			restart: function() {
				if (!self.permitStart) {
					return false
				}
				if (typeof winIni !== "undefined") {
					clearInterval(winIni)
				}
				self.hideOverPanel();
				return true
			},
			share: function() {},
			more: function() {},
			noop: function() {}
		};
		this.hideOverPanel = function() {
			var gameover = document.querySelector("#meiriq_over");
			if (gameover) {
				gameover.parentNode.removeChild(gameover)
			}
		};
		this.runtime.trigger(pluginProto.cnds.ifUseragentIndexOf, this);
		window["meiriq"]["__ready"]()
	};
	pluginProto.cnds = {};
	var cnds = pluginProto.cnds;
	cnds.onHome = function() {
		this.hideOverPanel();
		return true
	};
	cnds.onPause = function() {
		return true
	};
	cnds.onResume = function() {
		return true
	};
	cnds.onCbHook = function(hook) {
		return this.currhook === hook
	};
	cnds.ifUseragentIndexOf = function(keywords) {
		if (window.navigator && typeof window.navigator.userAgent === "string" && keywords.length > 2) {
			return window.navigator.userAgent.indexOf(keywords)
		}
		return false
	};
	pluginProto.acts = {};
	var acts = pluginProto.acts;
	acts.executedHook = function(hook, params) {
		if (typeof hook !== "string") {
			return
		}
		var _params = params;
		if (!Array.isArray(_params)) _params = [params];
		if (hook === "start" || hook === "restart") {
			if (!this.permitStart) {
				return
			}
		}
		var cbResult = true;
		if (typeof this.hooks["cb_" + hook] === "function" && hook !== "noop") {
			cbResult = this.hooks["cb_" + hook].apply(this, _params);
			if (hook === "gameover") {
				this.permitOverPanel = cbResult
			}
		}
		if (typeof this.exeHooks[hook] === "function" && hook !== "noop") {
			var permittion = this.exeHooks[hook].apply(this, _params);
			if (permittion !== false) {
				this.currhook = hook;
				this.runtime.trigger(pluginProto.cnds.onCbHook, this);
				this.currhook = null
			}
		}
	};
	acts.gameOverPanel = function(score) {
		var gameover = document.querySelector("#meiriq_over");
		if (gameover) {
			return
		}
		score = +score;
		if (typeof window["post_score"] === "function") {
			if (window["post_score"](score) === 0) {
				return
			}
		}
		var context = this;
		var res = function() {
				var replayUpBmp = "data:image/png;base64,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";
				var replayDownBmp = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANIAAABWCAYAAAC6uMiMAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAoISURBVHhe7Zy/q2VXGYYnJn/A/AtpU9kEBEVEwZ+tfTobOxv71OnsjCCCYGMniFiERFQQWyFY2igJRmMgEBC53ufMvHO/88239l7r7HX2PXfO+8KTe/ZeP7+1vnftfWZy59GtXjbGbKa8aYwZo7xpjBmjvPmEV175wmtvvPXu57//0xtjrhU8gBdKj9xR3nyVxq+/+d7N1371z5tv//E/N9/58yfGXB3kPh7ACwdD3XojeUU8d+OxTFR1bMy1Esz0OHkGji4e8wg7mOhPt42NMUfgjaevedlMRxeHpxGPsqoTY64dvNF4Kt2Z6JZX+XL1rd99XHZizLWDN/AIXnnqmbaRqg6MMU9YMxIFNpIxKwQjxT/BO/zn8DTiS5SNZMwyByM9+QOH+FR63kj82bkxpsZGMmYCNpIxE7CRjJmAjWTMBGwkYybQbST+9tYYU2MjGTOBizYSj8wf/P7jA2//5dMjdJ+/DKvaGrMnF2kkGeedv3128+Gn/7tZEuXUk7mq/jI2n5lNt5G++c6/zw5GwBSnSqain6p/ApY5MV5Vx5hTuAgjkeAk9ixVRpGJpPc/+u9RuTFbuHcj8fQgqc8hjMP3rGwiZCO9eHB46hW/Kj8n92okAl77DrRVet3LemhG0oHT4j6S59KQ2O+q/Jzcm5FGTEQ9JQyLpM9bTEj7al4VnHIacw/yaylr1aNoJvoYWZ8q+aoD6JzaehhIF22kr//2X9PoNRELQkLwelb1w33KT9lwErbqs4Ix9hTxxPFjfFoTEcsU06nzpV1r3D1EXsTxR5Hy+u3B7kbCvWsbRPnoolKfROrViJHoOyZvDznBqzotcuyxr3hf6FDiJ9dxHdRfC8oltRd8t6zaLBHnUpUvEccG4iaWXqKq8hasQR57lN2NFDeu0pagekwqsYBVH7Ogf6lKkhHUV070Vvla/cxo/SXO0de59eCMxAnHAre0NaBLMRLGkfZIzlw+msyj9ZeY2Rf5MILEHKryFlsPOug20jd+/dFmmHRLGKBq0wsm1Sb2iLpVPzOIZibmqs4IMTl7ytfqZ3rqk2yqN0us0/d+U4+XoS7zW8oTqVWHseiDOGbsS2Q3I/G0IIhK3O9d0Arajm4y9au+tsJcpKXEHEGxteasco2Xr9dYqx9jmq3eOVJPqspBahkpHuRLhjyF3YwUX3eytpwOPFaVCCNqJeVW2CBp1mYpvtacsxHy9RL5NbSqk2OiTQslPD+rchH77Nn/nvpSa921Log5VHVOpdtI/LOsW4inQRQLjhmqNj0QhDZvRCx21d8W2Jwo5hXHYQ1khthujd74qEf9aKTYT55fVmtNYgJW5ZHW2BnWQOrZizh3xqjqSFV/Pe23sJuRCK5SzyKuwSKRpCPQpuprC1WMSijGlEZj3sNIS3PqNQeM1JV61yOuQ3UYSVV/cW/Yi1y+ld2MFBch6hxB3QcxSYm1Sqi4BiNxqx0/GScTy6m/lMxV+7Un5KUYKZqhaiNVZVojNPpG0MNuRmqJjazqPzTiRhFTlVDcj+qNXX23Ei6PpWvE5156+19ipK7UGjcTXwer/qXcX1z33rFGsZEmwOZI2qhWQsW61IllLaRWEuSxdD2qtf7PpWpc7jFuJqq3jHWR+Jz7hK1vRjbSRuJpxybptYHN0b3cJm5szwZKpxqJdoxTEefS2ovc32xVcZ17zKzW2vaym5HihkWxmVX9hwCmaSXikpHy38twnetEpFONhKox1l6VROyffpbQevTUlaq4WMts+kxUvGa+uXzpMIGtB/puRiKQSgRR1X8IxITNyZCTOxPXg7pVHSFVCQd5rDgvibL8JTvOYWkf1mKJjNSVWnEtwXwltZd0HeOr4p9Jt5G++ssPNxGDimLhq/qXTt6kXB4TKpeJmPAkRlUHJMasyvNY8bpKJrWL0r2KnljESF2pFVeL+CRFPN24L8X+Yvyj44ywm5Hid4ksyqo2l0o8DVFMTtGTUPH1BikhluosSWPlsWMyUZbvrSXYpRmpNXcp3mNvmIu0dGBtYTcj5YCiRhfyPskmah0CvQkV+1OSR2YYibXXPRQTEVUHQWTEHCN1pZH9jwcyY8S5S7m/fIif4+DezUiQNzBq9knBYlUn/BZ6TQSnJB/KSRCNRBnXGcZAGqsau3WQtdadfvcW867mIoghKs9dqowZc491WDs8RtnVSGubM+ukUMKzYIxZ1Rklm6iVgGLESHld4pxjWWvMPFZr7Gympbmt7dU5tGYkxYUqs0hVGUQzteqcSreRvvKLD6YQg8liYzFT1a6XnPAsPglU1e2lOgmrepGYzFV5Js47rgGfpda4eazW2JU52I9YJ0J9oB/ET92bgcQcuF7ap5g3rTWVWjHlg6RnH3vZ3Ug5mEoEOJr81I/JGDXDTPTNvHsXf9RIQN8kVLw3y0hL674W0ymx9CAtmRmyiVp7KS31F9cTbT24xe5GghxMJTaPDV4zgAzUShJpbbNmMyv5ZhiJNdI9xFrkPVgy06xYMlJrb/K8UT5oItLaXhOrRExrOdbDvRgJYjBLIlAWBmhDAvCTaxaZ8h4tJco5mJV8MeH5nMvjKxJjci+OXZlIbXvNNCuWSNz/alziinvL5yUTgbRmJKCO1FN/jXszEsTFPKf2NhHMSr64RtFIOkiiFGe8H5OxSpi8B5VZZ8WiOcc5ocogsQ6fe54aUo8x6C+OsTVH7tVIwMblhZ0l+q0SYw/YTMYncaryXn7+h7t/+DDGkk0UkycmPvfRUnJFM1VJPctIec6otT/cRz2mEFJvGz3NiWvtabfGvRsJCEIbPkv0t3VxLgFiwEwQT2USjXuYIMcZy2jTStYIfbRO/dhfVd6L+olzq+qdCn3S98i+z5pDt5G+/LMPzg4LXZ1aI8JA9FP1b8y5uCgjAe7GCBiCR26P9ApDO9pX/RpzTi7OSBEeuzymeWRXYBy9klTtjdmLizaSMQ8FG8mYCdhIxkzARjJmAt1G+tJP/mGMaWAjGTMBG8mYCXQb6Ys//rsxpoGNZMwEbCRjJmAjGTOBYSPxxSp2YIwZNJL+8il3Ysw1Ev0wZCT+L2uInRlzrUQ/dBsJ5/ErC/rVBT+ZzLVSeaHbSK+/+d6hEb/Kyy/R6VeGjblG5AE8gTeGjAQ8yujg/b9+YszVggfwgnzRZaTX3njrXTWooBNjXnSq3Bd4ZNVIjx597odVY1ENasyLRpX7Ao90GOnRd5eeStWgxrxoVLkPh6fRrUdaRgJuPnsqtcxUDWrMi0aV+09MdPQ0Avnn2Yejp9KhwUsv/YjG1UDGXAsHA9164eCJ+mlUGCmbSdCRMddG9MCxiZpGujMTlZ+ZKRnKmKvjqQ/ufJFNBEcXFB4/mY4MZcwVcmwgmWjRSHBspmgoY66R6IXaRPDcDfG8oYy5XloGEuXNjDox5hqpPJEpbxpjunn08v8B3MyXzTkG8ZYAAAAASUVORK5CYII=";
				var shareUpBmp = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANIAAABWCAYAAAC6uMiMAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAApESURBVHhe7ZxPyyRXFYdbIQsli/kKAZfOIpLN6MZFPkAIwYVIRBGGGAQRJTBbV1kYCEKWOrpz4xeI4CJ+gMFdNllk7UZMjI4O7X2udWp+fd5TVbeqq/+fAw/9dt2/des8dav7nXc2JV5IkmRvwoOV976x+f77r2ye/Pabm22S3Co4gAuRI0J48KV3X9588OGrm+2nD1/cfvHTzfaLnyfJDVJyHwdwASdww7li3DlwjwYfvxZ0miQ3DE50Mt1zzsDOm3tsYdgXdZQktw5udI95XqadN/d4HqyPcz8rDZMk2QE3cARXnDvPJSq8xIer+pko6CRJbp7iBo7gSufMiEhRB0mSVMZE4gDcT5GSZJxOpPvizY5IGJYiJckEIpLuSjsiPUiRkmScTqQHnTMjIvFlQ5IkISlSkqxAipQkK5AiJckKpEhJsgIpUpKsQIqUJCuQIiXJClylSE8fv779z59/t93+/W+V/z750/bpH34c1k2SNWgX6SeXwbOPHm2H4tknf/3/35AE7ZJkH65KJHadqagycRcJ2ifJUq5HpHe+1qkyHfUxL+ojSRZyNSK17EYWdVcK+rgE/vXed7b//s0v6mtUnpyGmxSJLyCiPuZAMj/9469mJTRfgCAxX35E5S3QfugcmBPlHsYzAaNyYG7s6r7PpI1mkf759vnCiZAszVGSMOpnDhaMG5VHkLA1ZoxPcpPkjGMiaB+UAWW8DkapP7lGyFnG83M4BcxVRT8kc67hEBctEl8asBOxGHNijYWzoK96J//ltyeTsJ/nHJFKvxaI4vvgleA4uw67pKJyUceXg64f9f0cToGd11FixvUY4iJFMoGWLjbJGfU7BskGlmgWduesUeajSbk43IW18GP5Mm2j+DYebgAWa9xk1sAenVvo86C8RuVTMFY0hzlclEg8wo0KNHRcgoWL+p7CwhLN4igidedF3zqW36109+lD59T144NEsjgXkeag5xeVH4N2kd46LVM7EElUf9la7q5DyVwlCvpuwaImmnu/k9z2mCfovOuXE678Djwi6tjWvrzqWCrAPiKxLhZ2fpfEjkhB+TE4e5GmPgORBD7xarvHr9eySukjqjMHiymRfLs7d3tX3oL2rz9r3/wcScwxbXOnvMAYFtckEjcWylgbPX4ITiISF4+T5KJBlaG7oMZSgQ6FhSWaBe+HLiToOfhzbIUxLHQs1sDCJwtrwzGI5ke5fTnBzxZ2fpfE0PlZUK71D8HRRQofP7pAHnYSTT4ftD+mQIbFHJFIVIsoQa3t1B1zZ83KGPaqx5GUfuizr2MhbaJy2llE8zx3htZf82jpTayVdpEe7o/eQedGL1DQ7zGwqInm3u9cSGlTk7YLpNIyTV7aa5knvPmYFF2wNkP1vDg7Ucr0utj5XRJD669rzNpo2docTSTuCEvi1AIZFq0i6W4UiaLJXXckV66EN6DS3o/LmMyHNaNPWzett1POXbobw+KaROL8LaJrsCZHEym8Ww5FWZBzEciwaBWJ4xZeFF2LlgtMwtOmtitj1Civ9MsxRPP1KY+koD7HefVll8qQSKDXwT8VrMnRRNITmopzvMgWnIfurszVX0gt96JoGTF2cSmjvdKLVMKXUR+5rE4kUu2DCJLOQ3s/xqGI5toK7YfOqa5HF4fMqxSpEQvOg4S1iETiWB/lmCaMJTkxlTyaBC1xZ43d2H58XwY6J6178Chj6bnPgXmP9dGfxx5jTHE0kXaSqyG4oNy9o75OgQXz0gTnPedmr/pcPhVT50dfPLbVz0iSDNF7xl8lJNk4Txv/0DCWnvscpkTStdlnnDGOJpJ/pGkNFuEchEISsOTqo1w8/Synye+hrgV9af9T+GTx7+v60r+MQZ3BOZRXXwaHSrRDMiUS52RBPkV19qVZpM9/tD9cqKVR7/YlWaJ+jw1z0eC8onqKXkwuOMJF9YbQZIneA32CBUljZUbU7tJpOSfKpursw1FFgjGZ+IUsnz/GHlPOQaj+wnXB+6ieom1axPNYIthYY8nTRymjntInVAlfBpF85w7zrjEiid78uKlFdfbh6CIBInBiXDQgsbwcrf/CQdsciyi4AUR1we9GUZ0pTADWhPdjybNXLJzfKWkRqT76dnGIm8VJRJqDfQU8FENC0Q5BK90/WvV1lqBS6LzGLo5JQAzdDWlPPRPFY2HjtIhEnX4NOvq5lFdfBoe4Wx+asbVQ9HqtfRM+e5GMVqFgqB6JEvU9B/+IoIkZ1WdMC+YV1YGxZNC7KeNP1beI5B5rd6m0npNeuzVyQWkX6QfnwdQj31TUBQz6bYWLVYOLVt7fuThD9UvUxz9XbuwkgyvTXdDGGKvfRymjnqLz8WVQ5XP9nTvMu0awForekGgT1VnKxYlk7CNU/TwW9DmFJrQl3NjFUcmmEnQsGbQfk3Gs/l4xkYznyNhaeGrdUq/u7EH5Ui5WJGPq75aiWHrX1XF0d4mO84jJBbOYkncsGaKysfoW1GEHU/o5lVdfBvUzkuvv3Blbi2Nx8SIZeteeChY+6mMM3Y18ey2zO53Op+XuN5QMVcgudNyx5LGIbhhj7S6VczinqxGJnak5Fix4f7FKRHdt+iSop497HK/fELn6CruYBe21jF3Cgp/tOJJY+Pn0UcamP8XmSfgyWLpbnxLmXWPBdV2LmxSJhY/6GGJsNzKQwR7fNMmjZPZoeCm0XIXUOfXRJdJeccJkXEq/RinS/ugj0FQgXdTHEDVpy0Uipj7r7OxGM8M/AurnrGinqLtVV16jSyQLEsw++7TiRb4EmPOp5341IkHLrkRyRW2nIKn1C4YhEMkn5xQkwJiglI+NTdvKxCNkcjjaRXrzMiAxhwKJ+M/8onZJsg9XJxJwd+YxCXGAx6L6OBfUTZI1uEqRkuTYpEhJsgIpUpKsQIqUJCvQLNJn30uSZIgUKUlWIEVKkhVIkZJkBdpF+m6SJEOkSEmyAvNFYiuTDpLkZhEXUqQkWcpSkf7xw69W+o6S5IZRH2aJxN+71L95efNup0lyS+CA+cD7ZpEwT/+ArJqYj3nJrVFyvrqARJ0PvG8WyQzk/5Pjb3sq/Jwkt4bkP07gxiyRPn5ts/304Yu1g2cfPUqSmwUHcAEnFolkfPjqc37/rec8LnWpnySXDrmsua05ry58PkckbQjaqQ6WIiXXQqtIQH1c6ZyJRXr/lc0T31A71cFSpORamCMSjuBK50ws0rsvbz7wjbVTHYzBU6bk0rE81tzWnPcu4AiudM6EIt0vvPHo65u/aAfaqQ4GNokkuWR8XmvOqwe4gSOdK6FIQOGDr3x585bJ5PEDJsk1EuU+TuAGjnSumDe9SLorUekNGnxps/k1z4PRdpgktwIO4EInEbuRf6wLRaq7UqHKVF7fATpKklvD8t9J5B/rdkQKZQI6UamS5BaQvK8eFIYkgp03FHqZeqGS5EYxD1SiUZFAZTKhVKokuSUs/82HSCK4c8CwBipVktwi6kLkCoQHFe0kSW6VyA0lPJgkSTObF/4HraMy1itR+9AAAAAASUVORK5CYII=";
				var shareDownBmp = "data:image/png;base64,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";
				var moreUpBmp = "data:image/png;base64,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";
				var moreDownBmp = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANIAAABWCAYAAAC6uMiMAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAsfSURBVHhe7Z2/iibHFcUHBBsrEngyvYGyFX4HGwzK9AQCgwOBnDhwIiGDYBGO7ES5nkCOHCuRwU/g3JnBf1byMq5TU7d8+n63qqu7q78d7XcO/PTN1N9bt+7pnllrrTtJkiRJ+tHomRBin/LkZ2/dffDpe3fffPXTuwchbhV4AF4wX8Aga7KB72Lydx++8/DvX98/fP/F/cMPXwpxe6D24QF4AZ6AN8gnoazzbTNRtLAQtwqZ6W3yy4WyifAKk4mEiIE3yo95ZqaFzF35bYRXWbSIELcOvNF7K2UTJd7FL1f6nUiIGHgDHoFXimfaRooWEEI80jISvgDoeHwjvUjOE0KEkJEWf4KHf+S3UeJ9GUmIPsVI7xfP1LeSjCTEBmQkISYwbqQv0gQhRIiMJMQEZCQhJiAjCTEBGUmICchIQkxARhJiAsNGevm7eyFEAxlJiAnISEJMQEYSYgIykhATGDfSZ2mCeDJ8/4dfPLz6658e/vvnP4b9Z/DD1x/l/Vp7mhBX2P+Pv2ewTtR/Bhbv2Xl6UkbKf5SYCgSJfvXt5/nwuJRXf/tLvQQG7VZMGI95mI9/Gzda/yhY/5qKYjBwbtO1CjPfA5RyH/WbIiNx7s4uamYtZsRlRP2jvHYjwTw4RC4MGGSGzGTJXC8/e36x5164GK6hKAaj5qpRIGdwxEh1bhIedr7/LHjfbv/BPL42IyGZeDLVgjhRuNijTxwjv/E2wAUf9feI9genG7pRVL7oRu+Oi3lE9sZCDjYpiJvf3NFD9UdrJLyBsoFegx4vaN4baoRZF8VsLcytwvrdfTcaaatmGolr7fJh+vz/Zzh4P1c1Uk7MScnfollvJ1wELgoF1oLPG/UzVkDrPK9vrVlwwbXiQIxZtege4zCh36+7B37YRf0eE+fSWNRb+nrRRxrPfcywkf7z2/tDXPv3izUhcVGco+QLPOGhgB9Fov3Ohs+CQo7G1OJLY7nddEbsyLPtixry/VxX+WGw406O1gK4ipH4qfGUFF3MKPxEw9e4jIh6sekz6je4ANbi4p/7jwrr5f2LcBa/3xqmnpGw7giIheexUdDPfYBjx1jLJ1MV3AFq06+5h9ONhKfbU9beRLJBon4Dlz8yblEwK0/2mUbK+5KJ9+TD1Iub9+gpMkvNYZJ/yHAuWm/S0bs6wulG4iQ8Se1Mrmm16AeNBExra9rvJkfJT2sqcHwf7We0zmLqxd16WxgmfB3NNXmj1fg7+WWzeSPO4lQjcQKesvYk1/Q6jHSEyEBQVMCeNSMtlMaMrAnYSK27qHsn2Rj+aaeXM15/NKatnGokf1lVJclICD45SVPl9unFE8Xf40wdMRKK6+WLn+Uz27lrjqPzpzYrzDU2GakIe/PYiBpX5x4QY1UZl++0qLcP8mHCGaIxRznNSK3fjXBg/HGhH48nZU0oCe2LMUl88XkfPy993yqOxYWQeJ8RzlTLSDMfOFhr1EDGmpEQt5m43okb6+H7WCtyPj/m8feog2iO0Ysnr5Pat+aDGTfSb9KEDXCCTDnQ0g8zwVS+rR64yMYAewJFbVVpfk5qWfNx3cf/vSebJX1vhmShn+esYcIloHha8AVG/YwpGynYkwtnSNg7gXlY0/Lm8zNK3T+taW0cN+cwGhuBuEyILRpjoL+qnA3CXtF4prUP18/IOi1OMxIHCPni4H5uj4p8iyxJuWDSJbf2uohvYxJNraI3RgsKmFprwgBmurpukp01s9MkI0RnwZ4m5LQ31sNzR/ID+Nwm3rcFmxBr+Dbsj3j8vFFOM5I/sL0NAN48/ITIl49XZOnHoXapXAabEXvlhKU+LlDsudDgRRomu5QWIwUFuKjWzAlqjjbGfQTkEUWLT24ztYyEMfjeU88Apa+tvWeMhfmKRg3A++V16PsRM/Y4zUg+Sbk9meUigabUZmbDofbICpAvt/eEDmMcJJ+jiAvLU/forI8Yeb21S+XznaINueBYOA/1PGmtrfe59iDhhzD2icZELOKwe0naskaL84zEsotJRurJCuiokUA2Jb3lbF3bA3DxQjx2jdOKeaCIuZDOUK+w8CRHP/KIBwDfVctImGO5Z2oxp09u559eIhbnH8iXwT+pVCG+zsN2lOu8kZKsqJHsRRKTkBi02YH2FoovAKxnl7v4ca/8KLCIccOFGNlM7pxHhPhHLhVjcIaZ5DspwtfRvoDvpt5lERuAjcTzmZExHpzdqxcvk+e6Ox/J9wjDRsJ/uXkL3gxIequf28GR4oRhsQYn3MyU1y2X5i8El+rjiMBaAMVnbb4oDV+c0ZhKiof3uTa1qJMQTzRmUYjpE218j3wGNom1eUbGeMKH7MD8RexFo3c+wmlGQrEt5A5b+1M7Crs5rwiHRjEaYUKT0Id1+MdIrGnrG1w4kM1bY3EZ6WvEgbneCP7ifP9TIsdqcvfE4Jwmy1fLDCMmGRnDLH40S3O4Bnr3l+el8ZHQF83ZymlGin4fwsF5DJ58aybCnNZhMT8yFBsnerpyQZhGCt2b40LlcrE/x+XPfZTozHvl1+sVJJ/d8lrb0iePPcNIvD9yvLiP9Bndob9r7Ml1hu/9nD2cZiQQGiMF7o2BBETFPXrIqLCwnk8s9m2N5XFrYF2cLcdMl9tSFMsRZhppkfdOQeenepHdC85kQkw8HmOyOmuOjDE4Tq4LbsfX1p4fsrZ+EffzveEurX0vpxoJNC89HSQflA7kxW+rNZrrrO2T2qP1tmDG8hd3IcSS8oGxR4yFuSiUI+SHCsebYkN7tB/gsVZ4+DRxkS7Gd/I7MgbwPjlOyl02c2qzPrRlc1kblL62mA2/Jvft4XQjgT1P0NaPcy1QBIvkDQgXeaSgDVzKoiihFEs+dy+mMgYX3yvimSCvI4XG5GI1pbHWntcp8vNnGcnfaxQn2nIO8YBhYyUhv6075jvD/GjMKFcxEuCk93SkuPEGGzXtkcRZMbaMks9AxsB57LKj8VWpD3Mxbq+xMA8gRtszx4qiGYg1IsddhK+tPa9ZxHeG9epe6dPaGcRW1RjjTcF798DaiA2fUb/h41zLQ4+rGQkgMflSrQALVjxb30ItkJC8jxWP22dvwromxfqpf+QMbCwuRi/08bze2E0quVgrNCPnr4gNU9vTJ77HebzQVsc31IqD1/O5mMWsPYaN9K+P72+ei0JJBYQ2FEI0fgsLY5UChTF5zGYjYZ0E5mEtrA+j85prwDi2L8eT3xZF1u7z4+O/UMkfj/FYTrBf1D8DO99aLD1kpA3gTYaCx2fUPxMUvN8HxYS2LicWXATnYxFfEEftK/j+10WO+2DeZCQhJiAjCTEBGUmICYwb6VdpghAiREYSYgIykhATkJGEmICMJMQEZCQhJiAjCTGBYSP985f3QogGMpIQE5CRhJiAjCTEBDYZKf9i9XG8kBC3Rv737JIn8PUmI9nf2+DFhLhV2A/bjPTi8f8LAJPx12t5USFuBdQ+PGB/+RJtw0b67sN38mT8jUghxCPwBLyxyUhsplfffi7EzcImGjbSp+/dfWMTIr7++U+EeOOJat+AR+CV4pm2kXoL+Q2FeBOJah+gb8hIz966+6D3VvIbCvEmEtU+gDfgEXileGZhJIDGbKbEJ603k99QiDeRqO7Lm+iT4hHzi/knC18s3krpM5sJ4JcrIW4V8wE80XobmdhICzMRvxfiBqkecCZqGmnxVgKYGBhKiJuCfJB9kWATLYwEmZEWbyZgCwlxi5gPiifMRGakC5m7vJmqoYS4UdgLbKLQSJB1tgwlxK3iDQRWxYOBLSLELeL9sEt+ESFukY7u7v4HJOK9dqjTx5QAAAAASUVORK5CYII=";

				var winBmp = "data:image/png;base64,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";
				var rankUpBmp = "data:image/png;base64,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";
				var rankDownBmp = "data:image/png;base64,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";
				return {
					rankUpBmp: rankUpBmp,
					rankDownBmp: rankDownBmp,
					replayDownBmp: replayDownBmp,
					replayUpBmp: replayUpBmp,
					winBmp: winBmp,
					moreDownBmp: moreDownBmp,
					moreUpBmp: moreUpBmp,
					shareUpBmp: shareUpBmp,
					shareDownBmp: shareDownBmp
				}
			}();
		var result = "win";
		var div = document.createElement("div");
		div.setAttribute("id", "meiriq_over");
		div.style.position = "absolute";
		div.style.width = "100%";
		div.style.height = "100%";
		div.style.top = "0";
		div.style.left = "0";
		div.style.bottom = "0";
		div.style.right = "0";
		div.style.textAlign = "center";
		div.style.zIndex = "8";
		div.innerHTML = '<div style="width:100%;height:100%;background-color: #000000;opacity: 0.5;">' + "</div>" + '<div id="mainWrap" style="width:80%;background-color: #ffffff;border-radius: 10px;position:absolute;bottom:0;left:0;right:0;top:0;margin:auto;">' + '<div id="scoreWrap" style="text-align: center;margin-top:-20%;width: 100%;"></div>' + '<div id="highscoreWrap" style="width:100%;">' + '<span id="highscore" style="font-family: SimHei;color:#565656;font-size: 1em;"></span>' + "</div>" + '<div id="iconWrap" style="position:relative;width:100%;margin-top: 2%;"></div>' + '<div id="btnWrap"  style="text-align: center;position: relative;top: 0%;width: 100%;"></div>';
		document.body.appendChild(div);
		var mainWrap = document.querySelector("#mainWrap");
		if (window.innerHeight >= window.innerWidth) {
			mainWrap.style.width = window.innerWidth * .66 + "px"
		} else {
			if (window.innerWidth * .4 * .85 >= window.innerHeight * .66) {
				mainWrap.style.width = window.innerHeight * .66 + "px"
			} else {
				mainWrap.style.width = window.innerWidth * .4 + "px"
			}
		}
		mainWrap.style.margin = "0 auto";
		mainWrap.style.top = "51%";
		mainWrap.style.height = mainWrap.offsetWidth * .85 + "px";
		mainWrap.style.marginTop = -mainWrap.style.height.replace("px", "") / 2 + "px";
		var btnRes = {};
		btnRes["restart"] = {
			up: res.replayUpBmp,
			down: res.replayDownBmp,
			cb: function() {
				acts.executedHook.apply(context, ["restart"])
			}
		};
		btnRes[more] = {
			up: res.moreUpBmp,
			down: res.moreDownBmp,
			cb: function() {
				acts.executedHook.apply(context, ["more"])
			}
		};
		btnRes[share] = {
			up: res.shareUpBmp,
			down: res.shareDownBmp,
			cb: function() {
				acts.executedHook.apply(context, ["share"])
			}
		};
		btnRes[rank] = {
			up: res.rankUpBmp,
			down: res.rankDownBmp,
			cb: function() {
				acts.executedHook.apply(context, ["rank"])
			}
		};
		if (!Array.isArray(this.buttonLayout)) {
			this.buttonLayout = []
		}
		if (this.buttonLayout.length >= 3) {
			this.buttonLayout.length = 3;
			mainWrap.style.top = "48%"
		}
		this.buttonLayout.forEach(function(btn) {
			if (btn in btnRes) {
				createBtn(btnRes[btn].up, btnRes[btn].down, btnRes[btn].cb)
			}
		});

		function createBtn(upBmp, downBmp, cb) {
			var btnWrap = document.querySelector("#btnWrap");
			var btn = document.createElement("img");
			if (btnWrap) {
				btn.setAttribute("src", upBmp);
				btn.style.width = "45%";
				btn.style.padding = "0 2%";
				btnWrap.appendChild(btn);
				if (window.navigator.userAgent.toLowerCase().indexOf("mobile") >= 0) {
					btn.addEventListener("touchstart", function(e) {
						e.preventDefault();
						this.setAttribute("src", downBmp)
					}, false);
					btn.addEventListener("touchend", function(e) {
						e.preventDefault();
						this.setAttribute("src", upBmp)
					}, false)
				} else {
					btn.addEventListener("mousedown", function(e) {
						e.preventDefault();
						btn.setAttribute("src", downBmp)
					}, false);
					document.addEventListener("mouseup", function(e) {
						e.preventDefault();
						btn.setAttribute("src", upBmp)
					}, true)
				}
				if (typeof cb === "function") {
					if (window.navigator.userAgent.toLowerCase().indexOf("mobile") >= 0) {
						btn.addEventListener("touchend", cb, false)
					} else {
						btn.addEventListener("click", cb, false)
					}
				}
				return btn
			}
			return false
		}
		var scoreBmp = ["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAACMCAYAAACK9Qy7AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAe7SURBVHhe7ZvLb1VVFMbpUyhYKUgEAUMUIgycODH+C0KMiYYECII08hABiTHGgXHgwEQTjYkTGDAxKaW05VVaajEgpVS0UwlUwJaiyKvl1Qf0sfzW3Wt7776919bbWzjA9yU/zuOeF+t39tn73LYTRhMRyQV5YOLQ0NBksARsAKVkGFqXxahVkdbL6pZrpRxb7GBFOMFSsBGUgy6g6Sdp0XSCMvAe0PoVj0mMysBBloE60ItlJoOgdkM2vQhWgOlYzLMyjxxsXIidpgFtflf1YEz2gppew2Q1yLeSpw82ysEOK8Ex0K8HSBsVPzhIUuEaRdqgtp2YrAUFVvrUwYbPgrrYXskZVAGgp0PkTqtI+16R09tFWneQRLQm7dUi3e0id2+llYM63wSbMFtk5Q+DD0qwwZHY1snpuyHyR4XImW0itS+K7MTmu0ladoGqqSKNb6Nu5ZDTBgNWy4SYlHWYzTENLliRq7bAndiWienrEmlejxMV2olANRkVlUBv3r2zRdoq00k5DKaZChes0EdVo20TTy/6nxOlOHABRYyFCrBvpsj5MpGBe1ZcF20EYAtm3cgLM9o6VoHbsS18BvpEmlahZeCdkDLGTkzKHJEL9VbgeLQxgEleSD4WNoNu97GlrVZkP6zqMzHVCcj/Q2/qqnw8cTDi1c4+Iaj9ZUzmxYRgoRj84j7ywcPuBFpHVQ5bRzbRm7tmrsilZquzC+p/G6DgeJPHPwuxoC8r8fReF6lb4JpZqgOTzNBOvmbWsMcW6t8NPsBsvrYQHV31uI8sF390O/JxlV1ijy3QtBxFHjbkaoGHYhWyHIQd+uUWvG+gaVFI9tFXh0OL4ANv9AmBA+1HSlTIZwBDqoScw0vggRmuiaU6KMkc7QYaUgq5Dl5SIeH7h77qn8SwuBovguzQs48KqZ8v0vO3FdwFHnrAZhUSfnelQlo+EdkziULGA9+xdzRYwV3gQV8Q11DI/Ub75YOzMfQ9bgV3oZAHBYVEDAqJGBQSMSgkYlBIxKCQiEEhEYNCIgaFRAwKiRgUEjEoJGJQSMSgkIhBIRGDQiLGQy1Ez6+/pRE1tKiprnc0PLRC9GfPdfNETn0r8ts34OtocHqbSOPrmUt5aIXonXj0VXdN+hszqf5S6UGgOfOlSHnS9Y6WR0JI1NL6FYVEKhQSsVBIPLjeq+AjsBV8OM6sxymPujMnhELiwfWeBbg4yQEF44n9/QyGVkmhkHhwvb9jMvIf3WcpOB+qnxQKiYdCUh30fkAhFgoJQiEeCrFQSBAK8VCIhUKCUIiHQiwUEoRCPBRioZAgFOKhEAuFBKEQD4VYKCQIhXgoxEIhQSjEQyEWCglCIR4KsVBIEArxUIiFQoJQiIdCLBQShEI8FGKhkCAU4qEQC4UEoRAPhVgoJAiFeCjEQiFBKMRDIRYKCUIhHgqxUEgQCvFQiIVCglCIh0IsFBKEQjwUYqGQIBTioRALhQShEA+FWCgkCIV4KMRCIUEoxEMhFgoJQiEeCrFQSBAK8VCIhUKCUIiHQiwUEoRCPBRioZAgFOKhEAuFBKEQD4VYKCQIhXgoxEIhQSjEQyEWCglCIR4KsURfyHnwDGafwnT6eIJz5GD6XezEiaGQeHC93aAW1ICD48wecM5OHQ+FRCwUErFQSMTy2Ao58orIvX6Rvl7QEw1QHjn1xWMoRM+9v0Tk2BLwWnQ4/oZI/UKRyqTrHS0PrRBF/9M7I0YZqAB7QKprHgn9P9XMEulosIK7wEMP2KJCGm2diwr5eTN2LnzwQh5FVGb9CyLdf1nBXeDhOnhZhXwO+my9y9lykQNPZ94sSXpUSMMiGBi0YrvAwWVMSlTIMnDbrbZcaRGpneued6kOSjJHByuH/lvIGnDHrbZoh6MdD4VkF+0C9KnTuBRF1uFaPHDQBJ5UIZsAxnMJ6TjsOh4+srKL79DbD1mh44EDHVxNUSGLwDW32tKLxboF7nmX6sAkM2JDXnQFl5qt0C7aIMDHmC1QIcXgV/eRD5pT00o0sRyOtLJJrP/AO0xfl9XZBfXXPnw1yMUWko8VW0C3fvhv2mrwYjaT/Ui20Bu7Klek+R0rcDyo/RVMno/9AAYzuVixyizFM9CLndfgIHlsJdlAb+wDGCil7j+aMCmKCdFg4Tms1GFXmAv1IvvmsC8ZK3pD78aNfaIUN/pdK64L6q5fmWzFbJ7piAnRx9anIBxtDdwTOV8GKXh0UUpmxIa6hXjavIu+o9MKGw9qfhHMMBXxYKV27hjvJkWHy22VInvR3PS7HD6+Ro/exLufEDn5PmTccPVMCOqtrUNHV/HW4YOV+vPjdeBmbOvEqJTuNoipwDh6vvvqWZ+JJDU6mqqaihdAjFTbqkXuDi+pBrX+AZMppmB48GERNtIXxTRHAD1/uhZzertI6w6SjNalHRK62yHillbd1S4pqDGGsTLTSp8+2KgArMUOwx94PnqSwUGSjjQSNKhrP/gJrLCSjxzslw9WY6fwDZ4ZU1BPzS4wDYsFVu7RBTvkYUf9/aTvQX/siExGQf30qxH9taLlWEzfZ4wmOEARmIqDvQmqQRfQaNMjqdF0gjKwEbwFJqGOw0dTmQYHw3u/TMSBJ4MlYAMoJcPQuiy2G3miStDaWRlHyIQJ/wCnjSPiob3ZGgAAAABJRU5ErkJggg==", "data:image/png;base64,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", "data:image/png;base64,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", "data:image/png;base64,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", "data:image/png;base64,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", "data:image/png;base64,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", "data:image/png;base64,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", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAACMCAYAAACK9Qy7AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAA9vSURBVHhe7Z19yJXlHcczs7RWMnLRWouKSGT4jyTEGsQIjPmHI8GxaESzRcMJxfxjMvxjDcbcoFYsCBojqLXmyvlEmr2pc4jVLLNws/Klmb2bOnsqNctr38+5fmf3fd339fhSnvs6z/XcX/hyjuc5nvN7Odf77/e7ThgKzrmx4nhx1qFDh24U/yzuEg+IH7U8LLHRTvE+EdvNFE8Xx8meo8zERwf+gzhB/xkH7Ndzp8dPeWxx7OjaTo8fiEvFq8XT9dKRHaM3jdGbfyTu4UNaHH/ItgfFFXp6nTjGTF+H3jROvEn8oPM/W/QU2Fmco6cnmwsK6MVR/FEc7Ly7ikOHnNuvRvPhVucGN4kvtxySsg922ve+cwf2OvfZZ54RYG/xZj0Nuy+9eKa42r+tBByxd7NzW+917h/fc+7BU537i/y3qOWQxD5LznLuqWnOrfmBcy//3rltD/gfNPasQHZ/W7zIXNFpHaP1wjzxI/8Ww8FPvCP48Af0tofEv7U8Ki4WsdeDIk7ih7xqhndM3Sc4ZZ14TschesJ07Gn7W4Hty5x7+KvO/VUfGPvSlsdGHMOPe8s96sIOmJE9ZH+6rmv1dBQOuVjc6f9koO+jueFpGPuClsdOftw4hR97CbI/a5eb9HQ0DpnLC/5Phjee8q2DJhf74Jafj90fOD/2CuQDuq3Tcchs8UN73ePtNc4t+1rrkF6QVrL8Ij8LK0E+YGU/qXVI02SwX3q274VKkA863VbrkKaJTbEtNi4BH+CL1iFNs3VIn7F1SJ+xdUifsXVIn7F1SJ+xdUifsXVIn7F1SJ+xdUifsXVIn7F1SJ/x8JuLc1uHNM3Db79PbB3SJLsHVGs5rQ0hH6wS2wOqRtkdPyrdFZAPHhVPax3SJLHno1937t0wpkT2D87UW4c0RSJPHpvo3MEwhEH2D6JO6g558++tQ443u7Or7UvMyAVkf2J9J3TjsgiuDh2CB/FkG5N1/EjrWDFF1jcbG2R7Ynxv0FMfTqp/nCO+5/9cArFDeLRtJV+cndi2sc49/3MzbgHZ/g09jO84A+iF08QwcgvgST5g4EvFdC32ZS2PTH7Uyy+oDeZAth/QQxEBr38Q+X6tuLvzjjIIeXxH48m6eb61LNHbB04ZnlxyUtxYTZCuf9U3zagFsLl4tbmigP5GwPU1YjxRB8dAPExXtuPx4UXm/c9qVtlt7TGj9Yqd1qGV+bvPmTELyN6bxHHmhhD6+8n64yIxnswwnEEaAANqikkKg/mqb5sgBWRntkquMvPXoffQdU0XSVQMg6+HO97SuooFWdMTFKa6A192buPtJkgB2XiTHkab+Q8PvfkKkeBfpmTDP+GTMZBZTtPdFS3yicnO7X7ZBPHApuLdenpsGbn6T5eJd4gvie+JNLN+JLKRiVTvbumunvxGmu6KFrn2KhOkgMl6hZn580EfcIl4JR/Uh7xcJN24Pikha+mRr/juI2a0XpEfwIqpzg2+aYIUkJykDx5b6xhOkHLMEskgrqTl2Y4DA2vMaL0kDlnzXROkgGTcLk4x0fOEFCQtb53pXKC729B06+juW716vwlSQHKuN7HzhZQ8VwwXtowdqdLyyMR9UgvBj8PJqmTcJ/7WxM4TUpCCB3eK4WyQLGIWZE0P5t0fwAs/MUEKSMYt4mQTPU9IQZJWw+oTtI6Nv/Er86a7K1oHC0F+EBVIzsUmdp6QglTXWajHg15lAwEED5+fbjB/JprUyULwPBM9T0hBqhZt6WjcBa2DwZQVcpLB/MJa2jOQnKtN7HwhJSeK4eEam6Arr2zeGZCKF3z3J/tMGA/JSJc638TOE1JwvBTlLCHEPunO8XOKwXzJKc79+5cmSAHJyU7HuSZ6npCCU8Xwp0jreG6OP/toeqpL62AhqB6zDMn4mXiXiZ0npCALQTbnQgy+7ktXNN06IN/5HJWWQkhOX6EhZ0jP86RkGAdATap/3ZXwEGqyj9apQHIuNbHzhZS8VFT/VMInGjsen9r8YM6x9v3i6pmx7oqd6Dkmdp6QnmdLyXq0wIfv+F3dFIdQfC9llyowOYuIkhwhJTkCqGyTfOQHVAyUYjCPLwQJD73FxM4T0pOF4CKvcgm7N8oRZzTfOnD+Q5rRvXSLCVJAcq7Uw9Ed0Q5XSEn2rcJCnUx1X/qVXwOkGMwZt+IRJfeZ2PlCSk43fQvs3+V3dVMN5vFcjzfEerxVTpCeF0rJbV7lEuiuUuzq0jo4jXxruQlSQHKSAJJ9d3WNV7cEWgfn1k13VZDWse7HJkgByUnAxQ0mdp6QggSEP2o6FyCPhfCeplsHPwAmEdTkrUByjoiF4GQxPPNgqtuJtzqx+RbCNgmHUJV4KyA57zCx84R0JKLyeq9uCR/vSBPAAOmu2MSsQHK+Ik430fOEFKR11OOtCKBONdUlkv39F0yQApJzwMTOE9KRAHD1SxXQOojVTTGYszLf8FMTpIDkHBGt4yKxkrIqkqfHCrlph/B9FJgmGrICybnIxM4XUvJS07cAtwysva4wUNVovSSDOXtmlfBQyckVRwtM7DwhBUm1q28ScTfHQIJIdkiIz4s/M0EKSM714lQTPU9Iz295dUvgEIpt7lRTXSLZ48HT95jYeUIKcmnWQq9uCdxek7J1xAMYnhazD55mqvuK6exB63j1D944TTuEtc7SSUPVKLnbxM4XUnKa6VuAE8GV09O1DnZ1CTEqQXLuEUfEEW39PHTPi94ZKRzCYnDz70yQApJzpVjcH5UjpOAM07cA+1acymGcph1CfDDbJJVoRCBZ804tkI7x1rHrn/5XmqJ14JB46+DWTn+RV66QgiSZhvFW/DJJLUjhDAbzoY9obzWx84WUnGn6FmAhiFFSOIR9K6IRD4bJvZKTLNprTOw8IQUJYHjcdC6Qqrvi+9hN/s+9JkgByUnFizNN9DwhBevRAuToPTs7TetgqstEohKNCCTrPBM7T0hHAhjqqQUsxOg2YgbrNWmVr/3RBCkgOZl0jDXR84SUJBqxc3f7/7FfizDqdaUazEm8iR/R5h2NCKQnd4uHYCFIelgKh3BEG49GJIs2+0MoEm82mM4FKJyWImmTHwAZWPF4K3JS6vef5wQpOderWwJT3dXfSdM6GLPi4T2Ucv2hiZ0npCC7uvV73DmipduIGaznHOPc64tNkAKS8zYTO19Iz1le3RKY6j4zJ91gzkX+/33NhCkgh+Q91QVSkvLaIXau8TnmMYP1mn8S490VWbSXm9h5QgpOE6lZG2LHI+kGc6q/sTNQgeTMe1cXSMkFpm8BproYJdVgvi26TUJqwQwTO09IQaa69fpWW2WQVIM53eRbj5kgBSRn3gtBKdgpGOPVLYFoDupbpYjV5TuJ9eKYuALJm3dqgXQkTzA8hGIDrxPAMLZurCZIq6R1ViA5R0REyUwxrP7GeQOHUCkqMNA6WITu3WzCFJCceUcjSsexUvIOr24JTHWXJQqeZps9vhDcIF5moucJKUhJ1zDeCmySj1Jss/MDYAMzfmvBzSZ2npCCZ4r1gjF0FatmpBvMOaIlgLsEyclRwCwTPU9ISfIEw6R/6hJu/HWargrSKuPd1TLxYhM9T0hBrvUJgUNe1Pow1WDO8fC+6FR3romdJ6QjU937vLolvDmQJi0N8iOIn3k8Jk4y0fOEFLxKDPetuq0j1b4VoUUUHahAcl5vYucJKUjV6XrBGJImqf6cajDniPbAxyaMh+Qk6X+aiZ4npCB5gmHSP4YgE4nIjpjBek2+950nTZgCkpPLbPIOD5We8726JTDNJIA5hUO6rYMA7grkjGtN7DwhHYm3qpfEIN4pxcwKMn6wM1CB5GR/7WwTPU9ISW4RDVddJL3QOlI4BGeQ9DO43YQJkPdCUArGWweVO6ngmWKqS3fFEW09eJp4q0tN9DwhBaeI4SbR/kFf0ihV6yBhNH5Ee5sesi9WWd/VpdDx2u+nG8xJqY4HT2cfjcgFYvUt1E0L0+3qEm/FmX0FkvMWMX7bZi6QggvEsL4Vx6O0jlTdFcfDlSuIgOTMvnVMEuvRiBRsoXBL04M530cXGS8YQ1327K8gIt4q3CRiqsvOaqp9K0o5DdZTCwQWrWNM9DwhZ9SzaNnEoyRe04M5zmAwj1dgIOl/RBzR1rdQ2dUlTDNmtF4ShxBvFWkdkvNGEztPSMcxUvJOr24JBC4T1ZFiqgu5R51srAoka/axuqQWRKa6Wo5QUjXFYM6YFe+uePFCEz1PSEkuBw4PoRjMKdpCqE3MaL0kDqHIMvUZK5Cc2SfecNtmPYuWtDSCp5MM5icNVTl0q5j9VJd9qzB4mi0KEm8YzClcHzNcr4hDCLyL7OpKzpkmdr6QktPF8IJHuitWx02vPTpj1YnOPf+L2H2CXA58iYmdL6TkXaZzARJvll/g1wExw/WKfB/dVXxXd7GYfQUfIhLrNUooNtx0d9VpHSKlXLk5oQLJmXfiDZCSl4vhYpAQnxRbJZ3WOHaopE2m5HlPdYEUJRtqvVfb0F0MNr2zSwvhNDIejZj3QrALFBXDFsLsBoc0uf7AGVy5uvF2fy9VCZJvt5h3NGIXUpQK1OF91VyhzUVddB/dfr3XZK3z4KlDJd6w4TnBRM4fUrh+XMsO7xNX+HSxXjul2zqIZonHW42M7qoLKTxDDNchgKlvp9buGb776pVjGMzZ1Y0nbQ6IZ5moIwdSur7Ty2qdnVZyMChZwU3OtJjjPdjjaM5bDuz132uQTFydnf9CMAYpThGyTWaLEDiGeF6KyhDGSathjcK0+IsuHPn/jB1k8VKOvATJw95J/lPdGKQ4d0Wx47u1Y40YGOxxDtPS7Yv8XtfD5/tWg3OOtUvrrjuYQFRaB5Ast4p532V+JMgA5IKsFsOSfTHQapgVkTjDjWsUvO92aUdyDn9nZkVrIwCvAn0/VxCNjKnu4SBbjBbHyxjko9crxQ0FNgJZv7Blz5EvCzxiuHAOLaFMWhOvkywa39Gl71qox9NMrBYyCF2YRnE3S4/MdOrnqEOBhR3dGhuEdEdPTfNkGs1F8pxCEoUYX5F/KtJVjbyZ1dFANsIxHGBdqefz9bi0Y7mjRcc57xdk05DBm/EoAn0+sVZ57+geD8hWdGWjZSxW9sRu3SzWU92+APR53AVFUbS86+oeb8hgo0QcxD2FnDbSxQw9OzsC9H85eJon0kXmHfjWa8iAOAfH0HImigQ/U1KPsQCGiwuB1+0RR3CpCjnwbavoBWTYMSIOIll0tp4z7qwwMp1mgjBHZM3D4Rj1tzK5u/yEE/4Hjzaz9k2NWq0AAAAASUVORK5CYII=", "data:image/png;base64,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", "data:image/png;base64,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"];

		var scoreArr = [];
		var scoreWrap = document.querySelector("#scoreWrap");
		var length = score.toString().length;
		var tempScore = 0;
		var increment = score / 10;
		var size = "20%";
		if (length > 3) {
			size = "14%";
			scoreWrap.style.marginTop = "-12%"
		}
		for (var i = 0; i < length; i++) {
			var scoreImg = document.createElement("img");
			scoreArr.push(scoreImg);
			scoreImg.id = "score" + i;
			scoreImg.style.width = size;
			scoreImg.src = scoreBmp[0];
			scoreWrap.appendChild(scoreImg)
		}
		scoreTimerHandler(score, increment);

		function scoreTimerHandler(score, increment) {
			tempScore += increment;
			if (tempScore >= score) {
				tempScore = score
			} else {
				setTimeout(function() {
					scoreTimerHandler(score, increment)
				}, 50)
			}
			var floorScore = Math.floor(tempScore);
			for (var j = 0; j < length - 1; j++) {
				var pow = Math.pow(10, length - j - 1);
				scoreArr[j].src = scoreBmp[Math.floor(floorScore / pow)];
				floorScore %= pow
			}
			scoreArr[j].src = scoreBmp[floorScore]
		}
		acts.executedHook.apply(this, ["gameover", [score, res.winBmp]]);
		if (this.permitOverPanel === 0) {
			this.hideOverPanel();
			return
		}
		var highscore = document.querySelector("#highscore");
		if (this.gameType == "score") {
			highscore.innerHTML = "最高分：" + this.gameScore || 0;
			if (this.gameScore === 0) {
				highscore.innerHTML = ""
			}
		} else {
			highscore.innerHTML = "最高分：" + this.gameLevel
		}
		var iconWrap = document.querySelector("#iconWrap");
		var highscoreWrap = document.querySelector("#highscoreWrap");
		var win = document.createElement("img");
		win.src = res.winBmp;
		win.style.width = "50%";
		iconWrap.appendChild(win)
	};
	acts.showShareCurtain = function(score) {
		acts.executedHook.apply(this, ["share"])
	};
	pluginProto.exps = {};
	var exps = pluginProto.exps;
	exps.start = function() {
		return "start"
	};
	exps.gameover = function() {
		return "gameover"
	};
	exps.restart = function() {
		return "restart"
	};
	exps.share = function() {
		return "share"
	};
	exps.more = function() {
		return "more"
	}
})();
cr.behaviors.Bullet = function(runtime) {
	this.runtime = runtime
};
(function() {
	var behaviorProto = cr.behaviors.Bullet.prototype;
	behaviorProto.Type = function(behavior, objtype) {
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime
	};
	var behtypeProto = behaviorProto.Type.prototype;
	behtypeProto.onCreate = function() {};
	behaviorProto.Instance = function(type, inst) {
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;
		this.runtime = type.runtime
	};
	var behinstProto = behaviorProto.Instance.prototype;
	behinstProto.onCreate = function() {
		var speed = this.properties[0];
		this.acc = this.properties[1];
		this.g = this.properties[2];
		this.bounceOffSolid = this.properties[3] !== 0;
		this.setAngle = this.properties[4] !== 0;
		this.dx = Math.cos(this.inst.angle) * speed;
		this.dy = Math.sin(this.inst.angle) * speed;
		this.lastx = this.inst.x;
		this.lasty = this.inst.y;
		this.lastKnownAngle = this.inst.angle;
		this.travelled = 0;
		this.enabled = this.properties[5] !== 0
	};
	behinstProto.saveToJSON = function() {
		return {
			acc: this.acc,
			g: this.g,
			dx: this.dx,
			dy: this.dy,
			lx: this.lastx,
			ly: this.lasty,
			lka: this.lastKnownAngle,
			t: this.travelled,
			e: this.enabled
		}
	};
	behinstProto.loadFromJSON = function(o) {
		this.acc = o["acc"];
		this.g = o["g"];
		this.dx = o["dx"];
		this.dy = o["dy"];
		this.lastx = o["lx"];
		this.lasty = o["ly"];
		this.lastKnownAngle = o["lka"];
		this.travelled = o["t"];
		this.enabled = o["e"]
	};
	behinstProto.tick = function() {
		if (!this.enabled) return;
		var dt = this.runtime.getDt(this.inst);
		var s, a;
		var bounceSolid, bounceAngle;
		if (this.inst.angle !== this.lastKnownAngle) {
			if (this.setAngle) {
				s = cr.distanceTo(0, 0, this.dx, this.dy);
				this.dx = Math.cos(this.inst.angle) * s;
				this.dy = Math.sin(this.inst.angle) * s
			}
			this.lastKnownAngle = this.inst.angle
		}
		if (this.acc !== 0) {
			s = cr.distanceTo(0, 0, this.dx, this.dy);
			if (this.dx === 0 && this.dy === 0) a = this.inst.angle;
			else a = cr.angleTo(0, 0, this.dx, this.dy);
			s += this.acc * dt;
			if (s < 0) s = 0;
			this.dx = Math.cos(a) * s;
			this.dy = Math.sin(a) * s
		}
		if (this.g !== 0) this.dy += this.g * dt;
		this.lastx = this.inst.x;
		this.lasty = this.inst.y;
		if (this.dx !== 0 || this.dy !== 0) {
			this.inst.x += this.dx * dt;
			this.inst.y += this.dy * dt;
			this.travelled += cr.distanceTo(0, 0, this.dx * dt, this.dy * dt);
			if (this.setAngle) {
				this.inst.angle = cr.angleTo(0, 0, this.dx, this.dy);
				this.inst.set_bbox_changed();
				this.lastKnownAngle = this.inst.angle
			}
			this.inst.set_bbox_changed();
			if (this.bounceOffSolid) {
				bounceSolid = this.runtime.testOverlapSolid(this.inst);
				if (bounceSolid) {
					this.runtime.registerCollision(this.inst, bounceSolid);
					s = cr.distanceTo(0, 0, this.dx, this.dy);
					bounceAngle = this.runtime.calculateSolidBounceAngle(this.inst, this.lastx, this.lasty);
					this.dx = Math.cos(bounceAngle) * s;
					this.dy = Math.sin(bounceAngle) * s;
					this.inst.x += this.dx * dt;
					this.inst.y += this.dy * dt;
					this.inst.set_bbox_changed();
					if (this.setAngle) {
						this.inst.angle = bounceAngle;
						this.lastKnownAngle = bounceAngle;
						this.inst.set_bbox_changed()
					}
					if (!this.runtime.pushOutSolid(this.inst, this.dx / s, this.dy / s, Math.max(s * 2.5 * dt, 30))) this.runtime.pushOutSolidNearest(this.inst, 100)
				}
			}
		}
	};

	function Cnds() {}
	Cnds.prototype.CompareSpeed = function(cmp, s) {
		return cr.do_cmp(cr.distanceTo(0, 0, this.dx, this.dy), cmp, s)
	};
	Cnds.prototype.CompareTravelled = function(cmp, d) {
		return cr.do_cmp(this.travelled, cmp, d)
	};
	behaviorProto.cnds = new Cnds;

	function Acts() {}
	Acts.prototype.SetSpeed = function(s) {
		var a = cr.angleTo(0, 0, this.dx, this.dy);
		this.dx = Math.cos(a) * s;
		this.dy = Math.sin(a) * s
	};
	Acts.prototype.SetAcceleration = function(a) {
		this.acc = a
	};
	Acts.prototype.SetGravity = function(g) {
		this.g = g
	};
	Acts.prototype.SetAngleOfMotion = function(a) {
		a = cr.to_radians(a);
		var s = cr.distanceTo(0, 0, this.dx, this.dy);
		this.dx = Math.cos(a) * s;
		this.dy = Math.sin(a) * s
	};
	Acts.prototype.Bounce = function(objtype) {
		if (!objtype) return;
		var otherinst = objtype.getFirstPicked(this.inst);
		if (!otherinst) return;
		var dt = this.runtime.getDt(this.inst);
		var s = cr.distanceTo(0, 0, this.dx, this.dy);
		var bounceAngle = this.runtime.calculateSolidBounceAngle(this.inst, this.lastx, this.lasty, otherinst);
		this.dx = Math.cos(bounceAngle) * s;
		this.dy = Math.sin(bounceAngle) * s;
		this.inst.x += this.dx * dt;
		this.inst.y += this.dy * dt;
		this.inst.set_bbox_changed();
		if (this.setAngle) {
			this.inst.angle = bounceAngle;
			this.lastKnownAngle = bounceAngle;
			this.inst.set_bbox_changed()
		}
		if (this.bounceOffSolid) {
			if (!this.runtime.pushOutSolid(this.inst, this.dx / s, this.dy / s, Math.max(s * 2.5 * dt, 30))) this.runtime.pushOutSolidNearest(this.inst, 100)
		} else {
			this.runtime.pushOut(this.inst, this.dx / s, this.dy / s, Math.max(s * 2.5 * dt, 30), otherinst)
		}
	};
	Acts.prototype.SetDistanceTravelled = function(d) {
		this.travelled = d
	};
	Acts.prototype.SetEnabled = function(en) {
		this.enabled = en === 1
	};
	behaviorProto.acts = new Acts;

	function Exps() {}
	Exps.prototype.Speed = function(ret) {
		var s = cr.distanceTo(0, 0, this.dx, this.dy);
		s = cr.round6dp(s);
		ret.set_float(s)
	};
	Exps.prototype.Acceleration = function(ret) {
		ret.set_float(this.acc)
	};
	Exps.prototype.AngleOfMotion = function(ret) {
		ret.set_float(cr.to_degrees(cr.angleTo(0, 0, this.dx, this.dy)))
	};
	Exps.prototype.DistanceTravelled = function(ret) {
		ret.set_float(this.travelled)
	};
	behaviorProto.exps = new Exps
})();
cr.behaviors.Pin = function(runtime) {
	this.runtime = runtime
};
(function() {
	var behaviorProto = cr.behaviors.Pin.prototype;
	behaviorProto.Type = function(behavior, objtype) {
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime
	};
	var behtypeProto = behaviorProto.Type.prototype;
	behtypeProto.onCreate = function() {};
	behaviorProto.Instance = function(type, inst) {
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;
		this.runtime = type.runtime
	};
	var behinstProto = behaviorProto.Instance.prototype;
	behinstProto.onCreate = function() {
		this.pinObject = null;
		this.pinObjectUid = -1;
		this.pinAngle = 0;
		this.pinDist = 0;
		this.myStartAngle = 0;
		this.theirStartAngle = 0;
		this.lastKnownAngle = 0;
		this.mode = 0;
		var self = this;
		if (!this.recycled) {
			this.myDestroyCallback = function(inst) {
				self.onInstanceDestroyed(inst)
			}
		}
		this.runtime.addDestroyCallback(this.myDestroyCallback)
	};
	behinstProto.saveToJSON = function() {
		return {
			uid: this.pinObject ? this.pinObject.uid : -1,
			pa: this.pinAngle,
			pd: this.pinDist,
			msa: this.myStartAngle,
			tsa: this.theirStartAngle,
			lka: this.lastKnownAngle,
			m: this.mode
		}
	};
	behinstProto.loadFromJSON = function(o) {
		this.pinObjectUid = o["uid"];
		this.pinAngle = o["pa"];
		this.pinDist = o["pd"];
		this.myStartAngle = o["msa"];
		this.theirStartAngle = o["tsa"];
		this.lastKnownAngle = o["lka"];
		this.mode = o["m"]
	};
	behinstProto.afterLoad = function() {
		if (this.pinObjectUid === -1) this.pinObject = null;
		else {
			this.pinObject = this.runtime.getObjectByUID(this.pinObjectUid)
		}
		this.pinObjectUid = -1
	};
	behinstProto.onInstanceDestroyed = function(inst) {
		if (this.pinObject == inst) this.pinObject = null
	};
	behinstProto.onDestroy = function() {
		this.pinObject = null;
		this.runtime.removeDestroyCallback(this.myDestroyCallback)
	};
	behinstProto.tick = function() {};
	behinstProto.tick2 = function() {
		if (!this.pinObject) return;
		if (this.lastKnownAngle !== this.inst.angle) this.myStartAngle = cr.clamp_angle(this.myStartAngle + (this.inst.angle - this.lastKnownAngle));
		var newx = this.inst.x;
		var newy = this.inst.y;
		if (this.mode === 3 || this.mode === 4) {
			var dist = cr.distanceTo(this.inst.x, this.inst.y, this.pinObject.x, this.pinObject.y);
			if (dist > this.pinDist || this.mode === 4 && dist < this.pinDist) {
				var a = cr.angleTo(this.pinObject.x, this.pinObject.y, this.inst.x, this.inst.y);
				newx = this.pinObject.x + Math.cos(a) * this.pinDist;
				newy = this.pinObject.y + Math.sin(a) * this.pinDist
			}
		} else {
			newx = this.pinObject.x + Math.cos(this.pinObject.angle + this.pinAngle) * this.pinDist;
			newy = this.pinObject.y + Math.sin(this.pinObject.angle + this.pinAngle) * this.pinDist
		}
		var newangle = cr.clamp_angle(this.myStartAngle + (this.pinObject.angle - this.theirStartAngle));
		this.lastKnownAngle = newangle;
		if ((this.mode === 0 || this.mode === 1 || this.mode === 3 || this.mode === 4) && (this.inst.x !== newx || this.inst.y !== newy)) {
			this.inst.x = newx;
			this.inst.y = newy;
			this.inst.set_bbox_changed()
		}
		if ((this.mode === 0 || this.mode === 2) && this.inst.angle !== newangle) {
			this.inst.angle = newangle;
			this.inst.set_bbox_changed()
		}
	};

	function Cnds() {}
	Cnds.prototype.IsPinned = function() {
		return !!this.pinObject
	};
	behaviorProto.cnds = new Cnds;

	function Acts() {}
	Acts.prototype.Pin = function(obj, mode_) {
		if (!obj) return;
		var otherinst = obj.getFirstPicked(this.inst);
		if (!otherinst) return;
		this.pinObject = otherinst;
		this.pinAngle = cr.angleTo(otherinst.x, otherinst.y, this.inst.x, this.inst.y) - otherinst.angle;
		this.pinDist = cr.distanceTo(otherinst.x, otherinst.y, this.inst.x, this.inst.y);
		this.myStartAngle = this.inst.angle;
		this.lastKnownAngle = this.inst.angle;
		this.theirStartAngle = otherinst.angle;
		this.mode = mode_
	};
	Acts.prototype.Unpin = function() {
		this.pinObject = null
	};
	behaviorProto.acts = new Acts;

	function Exps() {}
	Exps.prototype.PinnedUID = function(ret) {
		ret.set_int(this.pinObject ? this.pinObject.uid : -1)
	};
	behaviorProto.exps = new Exps
})();
cr.behaviors.Platform = function(runtime) {
	this.runtime = runtime
};
(function() {
	var behaviorProto = cr.behaviors.Platform.prototype;
	behaviorProto.Type = function(behavior, objtype) {
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime
	};
	var behtypeProto = behaviorProto.Type.prototype;
	behtypeProto.onCreate = function() {};
	var ANIMMODE_STOPPED = 0;
	var ANIMMODE_MOVING = 1;
	var ANIMMODE_JUMPING = 2;
	var ANIMMODE_FALLING = 3;
	behaviorProto.Instance = function(type, inst) {
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;
		this.runtime = type.runtime;
		this.leftkey = false;
		this.rightkey = false;
		this.jumpkey = false;
		this.jumped = false;
		this.doubleJumped = false;
		this.canDoubleJump = false;
		this.ignoreInput = false;
		this.simleft = false;
		this.simright = false;
		this.simjump = false;
		this.lastFloorObject = null;
		this.loadFloorObject = -1;
		this.lastFloorX = 0;
		this.lastFloorY = 0;
		this.floorIsJumpthru = false;
		this.animMode = ANIMMODE_STOPPED;
		this.fallthrough = 0;
		this.firstTick = true;
		this.dx = 0;
		this.dy = 0
	};
	var behinstProto = behaviorProto.Instance.prototype;
	behinstProto.updateGravity = function() {
		this.downx = Math.cos(this.ga);
		this.downy = Math.sin(this.ga);
		this.rightx = Math.cos(this.ga - Math.PI / 2);
		this.righty = Math.sin(this.ga - Math.PI / 2);
		this.downx = cr.round6dp(this.downx);
		this.downy = cr.round6dp(this.downy);
		this.rightx = cr.round6dp(this.rightx);
		this.righty = cr.round6dp(this.righty);
		this.g1 = this.g;
		if (this.g < 0) {
			this.downx *= -1;
			this.downy *= -1;
			this.g = Math.abs(this.g)
		}
	};
	behinstProto.onCreate = function() {
		this.maxspeed = this.properties[0];
		this.acc = this.properties[1];
		this.dec = this.properties[2];
		this.jumpStrength = this.properties[3];
		this.g = this.properties[4];
		this.g1 = this.g;
		this.maxFall = this.properties[5];
		this.enableDoubleJump = this.properties[6] !== 0;
		this.jumpSustain = this.properties[7] / 1e3;
		this.defaultControls = this.properties[8] === 1;
		this.enabled = this.properties[9] !== 0;
		this.wasOnFloor = false;
		this.wasOverJumpthru = this.runtime.testOverlapJumpThru(this.inst);
		this.loadOverJumpthru = -1;
		this.sustainTime = 0;
		this.ga = cr.to_radians(90);
		this.updateGravity();
		var self = this;
		if (this.defaultControls && !this.runtime.isDomFree) {
			jQuery(document).keydown(function(info) {
				self.onKeyDown(info)
			});
			jQuery(document).keyup(function(info) {
				self.onKeyUp(info)
			})
		}
		if (!this.recycled) {
			this.myDestroyCallback = function(inst) {
				self.onInstanceDestroyed(inst)
			}
		}
		this.runtime.addDestroyCallback(this.myDestroyCallback);
		this.inst.extra["isPlatformBehavior"] = true
	};
	behinstProto.saveToJSON = function() {
		return {
			ii: this.ignoreInput,
			lfx: this.lastFloorX,
			lfy: this.lastFloorY,
			lfo: this.lastFloorObject ? this.lastFloorObject.uid : -1,
			am: this.animMode,
			en: this.enabled,
			fall: this.fallthrough,
			ft: this.firstTick,
			dx: this.dx,
			dy: this.dy,
			ms: this.maxspeed,
			acc: this.acc,
			dec: this.dec,
			js: this.jumpStrength,
			g: this.g,
			g1: this.g1,
			mf: this.maxFall,
			wof: this.wasOnFloor,
			woj: this.wasOverJumpthru ? this.wasOverJumpthru.uid : -1,
			ga: this.ga,
			edj: this.enableDoubleJump,
			cdj: this.canDoubleJump,
			dj: this.doubleJumped,
			sus: this.jumpSustain
		}
	};
	behinstProto.loadFromJSON = function(o) {
		this.ignoreInput = o["ii"];
		this.lastFloorX = o["lfx"];
		this.lastFloorY = o["lfy"];
		this.loadFloorObject = o["lfo"];
		this.animMode = o["am"];
		this.enabled = o["en"];
		this.fallthrough = o["fall"];
		this.firstTick = o["ft"];
		this.dx = o["dx"];
		this.dy = o["dy"];
		this.maxspeed = o["ms"];
		this.acc = o["acc"];
		this.dec = o["dec"];
		this.jumpStrength = o["js"];
		this.g = o["g"];
		this.g1 = o["g1"];
		this.maxFall = o["mf"];
		this.wasOnFloor = o["wof"];
		this.loadOverJumpthru = o["woj"];
		this.ga = o["ga"];
		this.enableDoubleJump = o["edj"];
		this.canDoubleJump = o["cdj"];
		this.doubleJumped = o["dj"];
		this.jumpSustain = o["sus"];
		this.leftkey = false;
		this.rightkey = false;
		this.jumpkey = false;
		this.jumped = false;
		this.simleft = false;
		this.simright = false;
		this.simjump = false;
		this.sustainTime = 0;
		this.updateGravity()
	};
	behinstProto.afterLoad = function() {
		if (this.loadFloorObject === -1) this.lastFloorObject = null;
		else this.lastFloorObject = this.runtime.getObjectByUID(this.loadFloorObject);
		if (this.loadOverJumpthru === -1) this.wasOverJumpthru = null;
		else this.wasOverJumpthru = this.runtime.getObjectByUID(this.loadOverJumpthru)
	};
	behinstProto.onInstanceDestroyed = function(inst) {
		if (this.lastFloorObject == inst) this.lastFloorObject = null
	};
	behinstProto.onDestroy = function() {
		this.lastFloorObject = null;
		this.runtime.removeDestroyCallback(this.myDestroyCallback)
	};
	behinstProto.onKeyDown = function(info) {
		switch (info.which) {
		case 38:
			info.preventDefault();
			this.jumpkey = true;
			break;
		case 37:
			info.preventDefault();
			this.leftkey = true;
			break;
		case 39:
			info.preventDefault();
			this.rightkey = true;
			break
		}
	};
	behinstProto.onKeyUp = function(info) {
		switch (info.which) {
		case 38:
			info.preventDefault();
			this.jumpkey = false;
			this.jumped = false;
			break;
		case 37:
			info.preventDefault();
			this.leftkey = false;
			break;
		case 39:
			info.preventDefault();
			this.rightkey = false;
			break
		}
	};
	behinstProto.onWindowBlur = function() {
		this.leftkey = false;
		this.rightkey = false;
		this.jumpkey = false
	};
	behinstProto.getGDir = function() {
		if (this.g < 0) return -1;
		else return 1
	};
	behinstProto.isOnFloor = function() {
		var ret = null;
		var ret2 = null;
		var i, len, j;
		var oldx = this.inst.x;
		var oldy = this.inst.y;
		this.inst.x += this.downx;
		this.inst.y += this.downy;
		this.inst.set_bbox_changed();
		if (this.lastFloorObject && this.runtime.testOverlap(this.inst, this.lastFloorObject)) {
			this.inst.x = oldx;
			this.inst.y = oldy;
			this.inst.set_bbox_changed();
			return this.lastFloorObject
		} else {
			ret = this.runtime.testOverlapSolid(this.inst);
			if (!ret && this.fallthrough === 0) ret2 = this.runtime.testOverlapJumpThru(this.inst, true);
			this.inst.x = oldx;
			this.inst.y = oldy;
			this.inst.set_bbox_changed();
			if (ret) {
				if (this.runtime.testOverlap(this.inst, ret)) return null;
				else {
					this.floorIsJumpthru = false;
					return ret
				}
			}
			if (ret2 && ret2.length) {
				for (i = 0, j = 0, len = ret2.length; i < len; i++) {
					ret2[j] = ret2[i];
					if (!this.runtime.testOverlap(this.inst, ret2[i])) j++
				}
				if (j >= 1) {
					this.floorIsJumpthru = true;
					return ret2[0]
				}
			}
			return null
		}
	};
	behinstProto.tick = function() {};
	behinstProto.posttick = function() {
		var dt = this.runtime.getDt(this.inst);
		var mx, my, obstacle, mag, allover, i, len, j, oldx, oldy;
		if (!this.jumpkey && !this.simjump) this.jumped = false;
		var left = this.leftkey || this.simleft;
		var right = this.rightkey || this.simright;
		var jumpkey = this.jumpkey || this.simjump;
		var jump = jumpkey && !this.jumped;
		this.simleft = false;
		this.simright = false;
		this.simjump = false;
		if (!this.enabled) return;
		if (this.ignoreInput) {
			left = false;
			right = false;
			jumpkey = false;
			jump = false
		}
		if (!jumpkey) this.sustainTime = 0;
		var lastFloor = this.lastFloorObject;
		var floor_moved = false;
		if (this.firstTick) {
			if (this.runtime.testOverlapSolid(this.inst) || this.runtime.testOverlapJumpThru(this.inst)) {
				this.runtime.pushOutSolid(this.inst, -this.downx, -this.downy, 4, true)
			}
			this.firstTick = false
		}
		if (lastFloor && this.dy === 0 && (lastFloor.y !== this.lastFloorY || lastFloor.x !== this.lastFloorX)) {
			mx = lastFloor.x - this.lastFloorX;
			my = lastFloor.y - this.lastFloorY;
			this.inst.x += mx;
			this.inst.y += my;
			this.inst.set_bbox_changed();
			this.lastFloorX = lastFloor.x;
			this.lastFloorY = lastFloor.y;
			floor_moved = true;
			if (this.runtime.testOverlapSolid(this.inst)) {
				this.runtime.pushOutSolid(this.inst, -mx, -my, Math.sqrt(mx * mx + my * my) * 2.5)
			}
		}
		var floor_ = this.isOnFloor();
		var collobj = this.runtime.testOverlapSolid(this.inst);
		if (collobj) {
			if (this.inst.extra["inputPredicted"]) {
				this.runtime.pushOutSolid(this.inst, -this.downx, -this.downy, 10, false)
			} else if (this.runtime.pushOutSolidNearest(this.inst, Math.max(this.inst.width, this.inst.height) / 2)) {
				this.runtime.registerCollision(this.inst, collobj)
			} else return
		}
		if (floor_) {
			this.doubleJumped = false;
			this.canDoubleJump = false;
			if (this.dy > 0) {
				if (!this.wasOnFloor) {
					this.runtime.pushInFractional(this.inst, -this.downx, -this.downy, floor_, 16);
					this.wasOnFloor = true
				}
				this.dy = 0
			}
			if (lastFloor != floor_) {
				this.lastFloorObject = floor_;
				this.lastFloorX = floor_.x;
				this.lastFloorY = floor_.y;
				this.runtime.registerCollision(this.inst, floor_)
			} else if (floor_moved) {
				collobj = this.runtime.testOverlapSolid(this.inst);
				if (collobj) {
					this.runtime.registerCollision(this.inst, collobj);
					if (mx !== 0) {
						if (mx > 0) this.runtime.pushOutSolid(this.inst, -this.rightx, -this.righty);
						else this.runtime.pushOutSolid(this.inst, this.rightx, this.righty)
					}
					this.runtime.pushOutSolid(this.inst, -this.downx, -this.downy)
				}
			}
		} else {
			if (!jumpkey) this.canDoubleJump = true
		}
		if (floor_ && jump || !floor_ && this.enableDoubleJump && jumpkey && this.canDoubleJump && !this.doubleJumped) {
			oldx = this.inst.x;
			oldy = this.inst.y;
			this.inst.x -= this.downx;
			this.inst.y -= this.downy;
			this.inst.set_bbox_changed();
			if (!this.runtime.testOverlapSolid(this.inst)) {
				this.sustainTime = this.jumpSustain;
				this.runtime.trigger(cr.behaviors.Platform.prototype.cnds.OnJump, this.inst);
				this.animMode = ANIMMODE_JUMPING;
				this.dy = -this.jumpStrength;
				jump = true;
				if (floor_) this.jumped = true;
				else this.doubleJumped = true
			} else jump = false;
			this.inst.x = oldx;
			this.inst.y = oldy;
			this.inst.set_bbox_changed()
		}
		if (!floor_) {
			if (jumpkey && this.sustainTime > 0) {
				this.dy = -this.jumpStrength;
				this.sustainTime -= dt
			} else {
				this.lastFloorObject = null;
				this.dy += this.g * dt;
				if (this.dy > this.maxFall) this.dy = this.maxFall
			}
			if (jump) this.jumped = true
		}
		this.wasOnFloor = !! floor_;
		if (left == right) {
			if (this.dx < 0) {
				this.dx += this.dec * dt;
				if (this.dx > 0) this.dx = 0
			} else if (this.dx > 0) {
				this.dx -= this.dec * dt;
				if (this.dx < 0) this.dx = 0
			}
		}
		if (left && !right) {
			if (this.dx > 0) this.dx -= (this.acc + this.dec) * dt;
			else this.dx -= this.acc * dt
		}
		if (right && !left) {
			if (this.dx < 0) this.dx += (this.acc + this.dec) * dt;
			else this.dx += this.acc * dt
		}
		if (this.dx > this.maxspeed) this.dx = this.maxspeed;
		else if (this.dx < -this.maxspeed) this.dx = -this.maxspeed;
		var landed = false;
		if (this.dx !== 0) {
			oldx = this.inst.x;
			oldy = this.inst.y;
			mx = this.dx * dt * this.rightx;
			my = this.dx * dt * this.righty;
			this.inst.x += this.rightx * (this.dx > 1 ? 1 : -1) - this.downx;
			this.inst.y += this.righty * (this.dx > 1 ? 1 : -1) - this.downy;
			this.inst.set_bbox_changed();
			var is_jumpthru = false;
			var slope_too_steep = this.runtime.testOverlapSolid(this.inst);
			this.inst.x = oldx + mx;
			this.inst.y = oldy + my;
			this.inst.set_bbox_changed();
			obstacle = this.runtime.testOverlapSolid(this.inst);
			if (!obstacle && floor_) {
				obstacle = this.runtime.testOverlapJumpThru(this.inst);
				if (obstacle) {
					this.inst.x = oldx;
					this.inst.y = oldy;
					this.inst.set_bbox_changed();
					if (this.runtime.testOverlap(this.inst, obstacle)) {
						obstacle = null;
						is_jumpthru = false
					} else is_jumpthru = true;
					this.inst.x = oldx + mx;
					this.inst.y = oldy + my;
					this.inst.set_bbox_changed()
				}
			}
			if (obstacle) {
				var push_dist = Math.abs(this.dx * dt) + 2;
				if (slope_too_steep || !this.runtime.pushOutSolid(this.inst, -this.downx, -this.downy, push_dist, is_jumpthru, obstacle)) {
					this.runtime.registerCollision(this.inst, obstacle);
					push_dist = Math.max(Math.abs(this.dx * dt * 2.5), 30);
					if (!this.runtime.pushOutSolid(this.inst, this.rightx * (this.dx < 0 ? 1 : -1), this.righty * (this.dx < 0 ? 1 : -1), push_dist, false)) {
						this.inst.x = oldx;
						this.inst.y = oldy;
						this.inst.set_bbox_changed()
					} else if (floor_ && !is_jumpthru && !this.floorIsJumpthru) {
						oldx = this.inst.x;
						oldy = this.inst.y;
						this.inst.x += this.downx;
						this.inst.y += this.downy;
						if (this.runtime.testOverlapSolid(this.inst)) {
							if (!this.runtime.pushOutSolid(this.inst, -this.downx, -this.downy, 3, false)) {
								this.inst.x = oldx;
								this.inst.y = oldy;
								this.inst.set_bbox_changed()
							}
						} else {
							this.inst.x = oldx;
							this.inst.y = oldy;
							this.inst.set_bbox_changed()
						}
					}
					if (!is_jumpthru) this.dx = 0
				} else if (!slope_too_steep && !jump && Math.abs(this.dy) < Math.abs(this.jumpStrength / 4)) {
					this.dy = 0;
					if (!floor_) landed = true
				}
			} else {
				var newfloor = this.isOnFloor();
				if (floor_ && !newfloor) {
					mag = Math.ceil(Math.abs(this.dx * dt)) + 2;
					oldx = this.inst.x;
					oldy = this.inst.y;
					this.inst.x += this.downx * mag;
					this.inst.y += this.downy * mag;
					this.inst.set_bbox_changed();
					if (this.runtime.testOverlapSolid(this.inst) || this.runtime.testOverlapJumpThru(this.inst)) this.runtime.pushOutSolid(this.inst, -this.downx, -this.downy, mag + 2, true);
					else {
						this.inst.x = oldx;
						this.inst.y = oldy;
						this.inst.set_bbox_changed()
					}
				} else if (newfloor && this.dy === 0) {
					this.runtime.pushInFractional(this.inst, -this.downx, -this.downy, newfloor, 16)
				}
			}
		}
		if (this.dy !== 0) {
			oldx = this.inst.x;
			oldy = this.inst.y;
			this.inst.x += this.dy * dt * this.downx;
			this.inst.y += this.dy * dt * this.downy;
			var newx = this.inst.x;
			var newy = this.inst.y;
			this.inst.set_bbox_changed();
			collobj = this.runtime.testOverlapSolid(this.inst);
			var fell_on_jumpthru = false;
			if (!collobj && this.dy > 0 && !floor_) {
				allover = this.fallthrough > 0 ? null : this.runtime.testOverlapJumpThru(this.inst, true);
				if (allover && allover.length) {
					if (this.wasOverJumpthru) {
						this.inst.x = oldx;
						this.inst.y = oldy;
						this.inst.set_bbox_changed();
						for (i = 0, j = 0, len = allover.length; i < len; i++) {
							allover[j] = allover[i];
							if (!this.runtime.testOverlap(this.inst, allover[i])) j++
						}
						allover.length = j;
						this.inst.x = newx;
						this.inst.y = newy;
						this.inst.set_bbox_changed()
					}
					if (allover.length >= 1) collobj = allover[0]
				}
				fell_on_jumpthru = !! collobj
			}
			if (collobj) {
				this.runtime.registerCollision(this.inst, collobj);
				this.sustainTime = 0;
				var push_dist = fell_on_jumpthru ? Math.abs(this.dy * dt * 2.5 + 10) : Math.max(Math.abs(this.dy * dt * 2.5 + 10), 30);
				if (!this.runtime.pushOutSolid(this.inst, this.downx * (this.dy < 0 ? 1 : -1), this.downy * (this.dy < 0 ? 1 : -1), push_dist, fell_on_jumpthru, collobj)) {
					this.inst.x = oldx;
					this.inst.y = oldy;
					this.inst.set_bbox_changed();
					this.wasOnFloor = true;
					if (!fell_on_jumpthru) this.dy = 0
				} else {
					this.lastFloorObject = collobj;
					this.lastFloorX = collobj.x;
					this.lastFloorY = collobj.y;
					this.floorIsJumpthru = fell_on_jumpthru;
					if (fell_on_jumpthru) landed = true;
					this.dy = 0
				}
			}
		}
		if (this.animMode !== ANIMMODE_FALLING && this.dy > 0 && !floor_) {
			this.runtime.trigger(cr.behaviors.Platform.prototype.cnds.OnFall, this.inst);
			this.animMode = ANIMMODE_FALLING
		}
		if (floor_ || landed) {
			if (this.animMode === ANIMMODE_FALLING || landed || jump && this.dy === 0) {
				this.runtime.trigger(cr.behaviors.Platform.prototype.cnds.OnLand, this.inst);
				if (this.dx === 0 && this.dy === 0) this.animMode = ANIMMODE_STOPPED;
				else this.animMode = ANIMMODE_MOVING
			} else {
				if (this.animMode !== ANIMMODE_STOPPED && this.dx === 0 && this.dy === 0) {
					this.runtime.trigger(cr.behaviors.Platform.prototype.cnds.OnStop, this.inst);
					this.animMode = ANIMMODE_STOPPED
				}
				if (this.animMode !== ANIMMODE_MOVING && (this.dx !== 0 || this.dy !== 0) && !jump) {
					this.runtime.trigger(cr.behaviors.Platform.prototype.cnds.OnMove, this.inst);
					this.animMode = ANIMMODE_MOVING
				}
			}
		}
		if (this.fallthrough > 0) this.fallthrough--;
		this.wasOverJumpthru = this.runtime.testOverlapJumpThru(this.inst)
	};

	function Cnds() {}
	Cnds.prototype.IsMoving = function() {
		return this.dx !== 0 || this.dy !== 0
	};
	Cnds.prototype.CompareSpeed = function(cmp, s) {
		var speed = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
		return cr.do_cmp(speed, cmp, s)
	};
	Cnds.prototype.IsOnFloor = function() {
		if (this.dy !== 0) return false;
		var ret = null;
		var ret2 = null;
		var i, len, j;
		var oldx = this.inst.x;
		var oldy = this.inst.y;
		this.inst.x += this.downx;
		this.inst.y += this.downy;
		this.inst.set_bbox_changed();
		ret = this.runtime.testOverlapSolid(this.inst);
		if (!ret && this.fallthrough === 0) ret2 = this.runtime.testOverlapJumpThru(this.inst, true);
		this.inst.x = oldx;
		this.inst.y = oldy;
		this.inst.set_bbox_changed();
		if (ret) {
			return !this.runtime.testOverlap(this.inst, ret)
		}
		if (ret2 && ret2.length) {
			for (i = 0, j = 0, len = ret2.length; i < len; i++) {
				ret2[j] = ret2[i];
				if (!this.runtime.testOverlap(this.inst, ret2[i])) j++
			}
			if (j >= 1) return true
		}
		return false
	};
	Cnds.prototype.IsByWall = function(side) {
		var ret = false;
		var oldx = this.inst.x;
		var oldy = this.inst.y;
		this.inst.x -= this.downx * 3;
		this.inst.y -= this.downy * 3;
		this.inst.set_bbox_changed();
		if (this.runtime.testOverlapSolid(this.inst)) {
			this.inst.x = oldx;
			this.inst.y = oldy;
			this.inst.set_bbox_changed();
			return false
		}
		if (side === 0) {
			this.inst.x -= this.rightx * 2;
			this.inst.y -= this.righty * 2
		} else {
			this.inst.x += this.rightx * 2;
			this.inst.y += this.righty * 2
		}
		this.inst.set_bbox_changed();
		ret = this.runtime.testOverlapSolid(this.inst);
		this.inst.x = oldx;
		this.inst.y = oldy;
		this.inst.set_bbox_changed();
		return ret
	};
	Cnds.prototype.IsJumping = function() {
		return this.dy < 0
	};
	Cnds.prototype.IsFalling = function() {
		return this.dy > 0
	};
	Cnds.prototype.OnJump = function() {
		return true
	};
	Cnds.prototype.OnFall = function() {
		return true
	};
	Cnds.prototype.OnStop = function() {
		return true
	};
	Cnds.prototype.OnMove = function() {
		return true
	};
	Cnds.prototype.OnLand = function() {
		return true
	};
	Cnds.prototype.IsDoubleJumpEnabled = function() {
		return this.enableDoubleJump
	};
	behaviorProto.cnds = new Cnds;

	function Acts() {}
	Acts.prototype.SetIgnoreInput = function(ignoring) {
		this.ignoreInput = ignoring
	};
	Acts.prototype.SetMaxSpeed = function(maxspeed) {
		this.maxspeed = maxspeed;
		if (this.maxspeed < 0) this.maxspeed = 0
	};
	Acts.prototype.SetAcceleration = function(acc) {
		this.acc = acc;
		if (this.acc < 0) this.acc = 0
	};
	Acts.prototype.SetDeceleration = function(dec) {
		this.dec = dec;
		if (this.dec < 0) this.dec = 0
	};
	Acts.prototype.SetJumpStrength = function(js) {
		this.jumpStrength = js;
		if (this.jumpStrength < 0) this.jumpStrength = 0
	};
	Acts.prototype.SetGravity = function(grav) {
		if (this.g1 === grav) return;
		this.g = grav;
		this.updateGravity();
		if (this.runtime.testOverlapSolid(this.inst)) {
			this.runtime.pushOutSolid(this.inst, this.downx, this.downy, 10);
			this.inst.x += this.downx * 2;
			this.inst.y += this.downy * 2;
			this.inst.set_bbox_changed()
		}
		this.lastFloorObject = null
	};
	Acts.prototype.SetMaxFallSpeed = function(mfs) {
		this.maxFall = mfs;
		if (this.maxFall < 0) this.maxFall = 0
	};
	Acts.prototype.SimulateControl = function(ctrl) {
		switch (ctrl) {
		case 0:
			this.simleft = true;
			break;
		case 1:
			this.simright = true;
			break;
		case 2:
			this.simjump = true;
			break
		}
	};
	Acts.prototype.SetVectorX = function(vx) {
		this.dx = vx
	};
	Acts.prototype.SetVectorY = function(vy) {
		this.dy = vy
	};
	Acts.prototype.SetGravityAngle = function(a) {
		a = cr.to_radians(a);
		a = cr.clamp_angle(a);
		if (this.ga === a) return;
		this.ga = a;
		this.updateGravity();
		this.lastFloorObject = null
	};
	Acts.prototype.SetEnabled = function(en) {
		if (this.enabled !== (en === 1)) {
			this.enabled = en === 1;
			if (!this.enabled) this.lastFloorObject = null
		}
	};
	Acts.prototype.FallThrough = function() {
		var oldx = this.inst.x;
		var oldy = this.inst.y;
		this.inst.x += this.downx;
		this.inst.y += this.downy;
		this.inst.set_bbox_changed();
		var overlaps = this.runtime.testOverlapJumpThru(this.inst, false);
		this.inst.x = oldx;
		this.inst.y = oldy;
		this.inst.set_bbox_changed();
		if (!overlaps) return;
		this.fallthrough = 3;
		this.lastFloorObject = null
	};
	Acts.prototype.SetDoubleJumpEnabled = function(e) {
		this.enableDoubleJump = e !== 0
	};
	Acts.prototype.SetJumpSustain = function(s) {
		this.jumpSustain = s / 1e3
	};
	behaviorProto.acts = new Acts;

	function Exps() {}
	Exps.prototype.Speed = function(ret) {
		ret.set_float(Math.sqrt(this.dx * this.dx + this.dy * this.dy))
	};
	Exps.prototype.MaxSpeed = function(ret) {
		ret.set_float(this.maxspeed)
	};
	Exps.prototype.Acceleration = function(ret) {
		ret.set_float(this.acc)
	};
	Exps.prototype.Deceleration = function(ret) {
		ret.set_float(this.dec)
	};
	Exps.prototype.JumpStrength = function(ret) {
		ret.set_float(this.jumpStrength)
	};
	Exps.prototype.Gravity = function(ret) {
		ret.set_float(this.g)
	};
	Exps.prototype.GravityAngle = function(ret) {
		ret.set_float(cr.to_degrees(this.ga))
	};
	Exps.prototype.MaxFallSpeed = function(ret) {
		ret.set_float(this.maxFall)
	};
	Exps.prototype.MovingAngle = function(ret) {
		ret.set_float(cr.to_degrees(Math.atan2(this.dy, this.dx)))
	};
	Exps.prototype.VectorX = function(ret) {
		ret.set_float(this.dx)
	};
	Exps.prototype.VectorY = function(ret) {
		ret.set_float(this.dy)
	};
	Exps.prototype.JumpSustain = function(ret) {
		ret.set_float(this.jumpSustain * 1e3)
	};
	behaviorProto.exps = new Exps
})();
cr.behaviors.Sin = function(runtime) {
	this.runtime = runtime
};
(function() {
	var behaviorProto = cr.behaviors.Sin.prototype;
	behaviorProto.Type = function(behavior, objtype) {
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime
	};
	var behtypeProto = behaviorProto.Type.prototype;
	behtypeProto.onCreate = function() {};
	behaviorProto.Instance = function(type, inst) {
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;
		this.runtime = type.runtime;
		this.i = 0
	};
	var behinstProto = behaviorProto.Instance.prototype;
	var _2pi = 2 * Math.PI;
	var _pi_2 = Math.PI / 2;
	var _3pi_2 = 3 * Math.PI / 2;
	behinstProto.onCreate = function() {
		this.active = this.properties[0] === 1;
		this.movement = this.properties[1];
		this.wave = this.properties[2];
		this.period = this.properties[3];
		this.period += Math.random() * this.properties[4];
		if (this.period === 0) this.i = 0;
		else {
			this.i = this.properties[5] / this.period * _2pi;
			this.i += Math.random() * this.properties[6] / this.period * _2pi
		}
		this.mag = this.properties[7];
		this.mag += Math.random() * this.properties[8];
		this.initialValue = 0;
		this.initialValue2 = 0;
		this.ratio = 0;
		this.init()
	};
	behinstProto.saveToJSON = function() {
		return {
			i: this.i,
			a: this.active,
			mv: this.movement,
			w: this.wave,
			p: this.period,
			mag: this.mag,
			iv: this.initialValue,
			iv2: this.initialValue2,
			r: this.ratio,
			lkv: this.lastKnownValue,
			lkv2: this.lastKnownValue2
		}
	};
	behinstProto.loadFromJSON = function(o) {
		this.i = o["i"];
		this.active = o["a"];
		this.movement = o["mv"];
		this.wave = o["w"];
		this.period = o["p"];
		this.mag = o["mag"];
		this.initialValue = o["iv"];
		this.initialValue2 = o["iv2"] || 0;
		this.ratio = o["r"];
		this.lastKnownValue = o["lkv"];
		this.lastKnownValue2 = o["lkv2"] || 0
	};
	behinstProto.init = function() {
		switch (this.movement) {
		case 0:
			this.initialValue = this.inst.x;
			break;
		case 1:
			this.initialValue = this.inst.y;
			break;
		case 2:
			this.initialValue = this.inst.width;
			this.ratio = this.inst.height / this.inst.width;
			break;
		case 3:
			this.initialValue = this.inst.width;
			break;
		case 4:
			this.initialValue = this.inst.height;
			break;
		case 5:
			this.initialValue = this.inst.angle;
			this.mag = cr.to_radians(this.mag);
			break;
		case 6:
			this.initialValue = this.inst.opacity;
			break;
		case 7:
			this.initialValue = 0;
			break;
		case 8:
			this.initialValue = this.inst.x;
			this.initialValue2 = this.inst.y;
			break;
		default:
		}
		this.lastKnownValue = this.initialValue;
		this.lastKnownValue2 = this.initialValue2
	};
	behinstProto.waveFunc = function(x) {
		x = x % _2pi;
		switch (this.wave) {
		case 0:
			return Math.sin(x);
		case 1:
			if (x <= _pi_2) return x / _pi_2;
			else if (x <= _3pi_2) return 1 - 2 * (x - _pi_2) / Math.PI;
			else return (x - _3pi_2) / _pi_2 - 1;
		case 2:
			return 2 * x / _2pi - 1;
		case 3:
			return -2 * x / _2pi + 1;
		case 4:
			return x < Math.PI ? -1 : 1
		}
		return 0
	};
	behinstProto.tick = function() {
		var dt = this.runtime.getDt(this.inst);
		if (!this.active || dt === 0) return;
		if (this.period === 0) this.i = 0;
		else {
			this.i += dt / this.period * _2pi;
			this.i = this.i % _2pi
		}
		switch (this.movement) {
		case 0:
			if (this.inst.x !== this.lastKnownValue) this.initialValue += this.inst.x - this.lastKnownValue;
			this.inst.x = this.initialValue + this.waveFunc(this.i) * this.mag;
			this.lastKnownValue = this.inst.x;
			break;
		case 1:
			if (this.inst.y !== this.lastKnownValue) this.initialValue += this.inst.y - this.lastKnownValue;
			this.inst.y = this.initialValue + this.waveFunc(this.i) * this.mag;
			this.lastKnownValue = this.inst.y;
			break;
		case 2:
			this.inst.width = this.initialValue + this.waveFunc(this.i) * this.mag;
			this.inst.height = this.inst.width * this.ratio;
			break;
		case 3:
			this.inst.width = this.initialValue + this.waveFunc(this.i) * this.mag;
			break;
		case 4:
			this.inst.height = this.initialValue + this.waveFunc(this.i) * this.mag;
			break;
		case 5:
			if (this.inst.angle !== this.lastKnownValue) this.initialValue = cr.clamp_angle(this.initialValue + (this.inst.angle - this.lastKnownValue));

			this.inst.angle = cr.clamp_angle(this.initialValue + this.waveFunc(this.i) * this.mag);
			this.lastKnownValue = this.inst.angle;
			break;
		case 6:
			this.inst.opacity = this.initialValue + this.waveFunc(this.i) * this.mag / 100;
			if (this.inst.opacity < 0) this.inst.opacity = 0;
			else if (this.inst.opacity > 1) this.inst.opacity = 1;
			break;
		case 8:
			if (this.inst.x !== this.lastKnownValue) this.initialValue += this.inst.x - this.lastKnownValue;
			if (this.inst.y !== this.lastKnownValue2) this.initialValue2 += this.inst.y - this.lastKnownValue2;
			this.inst.x = this.initialValue + Math.cos(this.inst.angle) * this.waveFunc(this.i) * this.mag;
			this.inst.y = this.initialValue2 + Math.sin(this.inst.angle) * this.waveFunc(this.i) * this.mag;
			this.lastKnownValue = this.inst.x;
			this.lastKnownValue2 = this.inst.y;
			break
		}
		this.inst.set_bbox_changed()
	};
	behinstProto.onSpriteFrameChanged = function(prev_frame, next_frame) {
		switch (this.movement) {
		case 2:
			this.initialValue *= next_frame.width / prev_frame.width;
			this.ratio = next_frame.height / next_frame.width;
			break;
		case 3:
			this.initialValue *= next_frame.width / prev_frame.width;
			break;
		case 4:
			this.initialValue *= next_frame.height / prev_frame.height;
			break
		}
	};

	function Cnds() {}
	Cnds.prototype.IsActive = function() {
		return this.active
	};
	Cnds.prototype.CompareMovement = function(m) {
		return this.movement === m
	};
	Cnds.prototype.ComparePeriod = function(cmp, v) {
		return cr.do_cmp(this.period, cmp, v)
	};
	Cnds.prototype.CompareMagnitude = function(cmp, v) {
		if (this.movement === 5) return cr.do_cmp(this.mag, cmp, cr.to_radians(v));
		else return cr.do_cmp(this.mag, cmp, v)
	};
	Cnds.prototype.CompareWave = function(w) {
		return this.wave === w
	};
	behaviorProto.cnds = new Cnds;

	function Acts() {}
	Acts.prototype.SetActive = function(a) {
		this.active = a === 1
	};
	Acts.prototype.SetPeriod = function(x) {
		this.period = x
	};
	Acts.prototype.SetMagnitude = function(x) {
		this.mag = x;
		if (this.movement === 5) this.mag = cr.to_radians(this.mag)
	};
	Acts.prototype.SetMovement = function(m) {
		if (this.movement === 5) this.mag = cr.to_degrees(this.mag);
		this.movement = m;
		this.init()
	};
	Acts.prototype.SetWave = function(w) {
		this.wave = w
	};
	Acts.prototype.SetPhase = function(x) {
		this.i = x * _2pi % _2pi
	};
	Acts.prototype.UpdateInitialState = function() {
		this.init()
	};
	behaviorProto.acts = new Acts;

	function Exps() {}
	Exps.prototype.CyclePosition = function(ret) {
		ret.set_float(this.i / _2pi)
	};
	Exps.prototype.Period = function(ret) {
		ret.set_float(this.period)
	};
	Exps.prototype.Magnitude = function(ret) {
		if (this.movement === 5) ret.set_float(cr.to_degrees(this.mag));
		else ret.set_float(this.mag)
	};
	Exps.prototype.Value = function(ret) {
		ret.set_float(this.waveFunc(this.i) * this.mag)
	};
	behaviorProto.exps = new Exps
})();
cr.behaviors.jumpthru = function(runtime) {
	this.runtime = runtime
};
(function() {
	var behaviorProto = cr.behaviors.jumpthru.prototype;
	behaviorProto.Type = function(behavior, objtype) {
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime
	};
	var behtypeProto = behaviorProto.Type.prototype;
	behtypeProto.onCreate = function() {};
	behaviorProto.Instance = function(type, inst) {
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;
		this.runtime = type.runtime
	};
	var behinstProto = behaviorProto.Instance.prototype;
	behinstProto.onCreate = function() {
		this.inst.extra["jumpthruEnabled"] = this.properties[0] !== 0
	};
	behinstProto.tick = function() {};

	function Cnds() {}
	Cnds.prototype.IsEnabled = function() {
		return this.inst.extra["jumpthruEnabled"]
	};
	behaviorProto.cnds = new Cnds;

	function Acts() {}
	Acts.prototype.SetEnabled = function(e) {
		this.inst.extra["jumpthruEnabled"] = !! e
	};
	behaviorProto.acts = new Acts
})();
cr.behaviors.solid = function(runtime) {
	this.runtime = runtime
};
(function() {
	var behaviorProto = cr.behaviors.solid.prototype;
	behaviorProto.Type = function(behavior, objtype) {
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime
	};
	var behtypeProto = behaviorProto.Type.prototype;
	behtypeProto.onCreate = function() {};
	behaviorProto.Instance = function(type, inst) {
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;
		this.runtime = type.runtime
	};
	var behinstProto = behaviorProto.Instance.prototype;
	behinstProto.onCreate = function() {
		this.inst.extra["solidEnabled"] = this.properties[0] !== 0
	};
	behinstProto.tick = function() {};

	function Cnds() {}
	Cnds.prototype.IsEnabled = function() {
		return this.inst.extra["solidEnabled"]
	};
	behaviorProto.cnds = new Cnds;

	function Acts() {}
	Acts.prototype.SetEnabled = function(e) {
		this.inst.extra["solidEnabled"] = !! e
	};
	behaviorProto.acts = new Acts
})();
cr.getObjectRefTable = function() {
	return [cr.plugins_.meiriq_common, cr.plugins_.Sprite, cr.plugins_.Touch, cr.plugins_.Spritefont2, cr.plugins_.TiledBg, cr.behaviors.Pin, cr.behaviors.Sin, cr.behaviors.Platform, cr.behaviors.Bullet, cr.behaviors.jumpthru, cr.behaviors.solid, cr.system_object.prototype.cnds.OnLayoutStart, cr.system_object.prototype.acts.SetTimescale, cr.plugins_.meiriq_common.prototype.cnds.onPause, cr.plugins_.meiriq_common.prototype.cnds.onResume, cr.plugins_.meiriq_common.prototype.cnds.onHome, cr.system_object.prototype.acts.ResetGlobals, cr.system_object.prototype.acts.GoToLayout, cr.plugins_.Touch.prototype.cnds.OnTouchStart, cr.plugins_.meiriq_common.prototype.acts.executedHook, cr.plugins_.meiriq_common.prototype.cnds.onCbHook, cr.system_object.prototype.acts.SetVar, cr.behaviors.Bullet.prototype.acts.SetAngleOfMotion, cr.plugins_.TiledBg.prototype.acts.SetPos, cr.system_object.prototype.exps.layoutwidth, cr.plugins_.Sprite.prototype.acts.Destroy, cr.plugins_.TiledBg.prototype.acts.Destroy, cr.behaviors.Pin.prototype.acts.Pin, cr.plugins_.Sprite.prototype.acts.SetAnim, cr.system_object.prototype.acts.Wait, cr.behaviors.Sin.prototype.acts.SetActive, cr.plugins_.Sprite.prototype.acts.SetOpacity, cr.plugins_.Sprite.prototype.cnds.OnCollision, cr.system_object.prototype.cnds.CompareVar, cr.behaviors.Platform.prototype.cnds.IsOnFloor, cr.behaviors.Platform.prototype.acts.SimulateControl, cr.plugins_.TiledBg.prototype.cnds.CompareX, cr.plugins_.TiledBg.prototype.exps.Width, cr.plugins_.TiledBg.prototype.acts.SetX, cr.plugins_.TiledBg.prototype.exps.X, cr.system_object.prototype.cnds.EveryTick, cr.system_object.prototype.acts.AddVar, cr.system_object.prototype.exps.dt, cr.plugins_.Sprite.prototype.cnds.CompareInstanceVar, cr.system_object.prototype.acts.SubVar, cr.system_object.prototype.acts.CreateObject, cr.plugins_.TiledBg.prototype.acts.SetSize, cr.system_object.prototype.exps["int"], cr.system_object.prototype.exps.random, cr.system_object.prototype.exps.floor, cr.system_object.prototype.cnds.For, cr.system_object.prototype.exps.loopindex, cr.system_object.prototype.cnds.Compare, cr.plugins_.Touch.prototype.cnds.OnTouchObject, cr.behaviors.Platform.prototype.acts.FallThrough, cr.behaviors.Platform.prototype.acts.SetJumpStrength, cr.plugins_.Sprite.prototype.cnds.CompareX, cr.plugins_.Sprite.prototype.exps.Width, cr.plugins_.Sprite.prototype.cnds.CompareY, cr.system_object.prototype.exps.layoutheight, cr.plugins_.Sprite.prototype.exps.Height, cr.behaviors.Bullet.prototype.acts.SetGravity, cr.plugins_.Sprite.prototype.cnds.IsOverlapping, cr.behaviors.Sin.prototype.cnds.IsActive, cr.plugins_.Sprite.prototype.acts.SubInstanceVar, cr.system_object.prototype.cnds.Every, cr.plugins_.Sprite.prototype.acts.Spawn, cr.plugins_.Sprite.prototype.cnds.OnCreated, cr.plugins_.Sprite.prototype.acts.SetInstanceVar, cr.plugins_.Sprite.prototype.acts.SetAnimFrame, cr.plugins_.Sprite.prototype.cnds.OnAnimFinished, cr.plugins_.TiledBg.prototype.acts.SetOpacity, cr.system_object.prototype.exps.abs, cr.plugins_.Spritefont2.prototype.acts.SetText, cr.plugins_.Sprite.prototype.acts.AddInstanceVar, cr.plugins_.meiriq_common.prototype.acts.gameOverPanel]
};
var encrypt;
(function(d){d.arrayDecode=function(a){for(var b=a.length-1;0<b;b--)0==a[b]&&a.splice(b,1);a=new Uint8Array(a);for(var b=[],c=0,e=0,d=a.length;c<d;)128>a[c]?(e=a[c],c+=1):224>a[c]?(e=((a[c]&63)<<10)+(a[c+1]&63),c+=2):(e=((a[c]&15)<<20)+((a[c+1]&63)<<6)+(a[c+2]&63),c+=3),b.push(e);a=String.fromCharCode.apply(null,b);a.replace(" ","");return a};d.hexDecode=function(a){var b,c="";for(b=0;b<a.length;b+=2)c+=(0<b?",":"")+a.charAt(b)+a.charAt(b+1);a=c.split(",");for(b=0;b<a.length;b++)a[b]=parseInt(a[b],
16);b=String.fromCharCode.apply(String,a);b.replace(" ","");return b}})(encrypt||(encrypt={}));
eval(encrypt.hexDecode("766172205f686d74203d205f686d74207c7c205b5d3b202866756e6374696f6e2829207b20202076617220686d203d20646f63756d656e742e637265617465456c656d656e74282273637269707422293b202020686d2e737263203d20222f2f686d2e62616964752e636f6d2f686d2e6a733f3631353136333766636439633532666134376665306465373565303239616265223b2020207661722073203d20646f63756d656e742e676574456c656d656e747342795461674e616d65282273637269707422295b305d3b20202020732e706172656e744e6f64652e696e736572744265666f726528686d2c2073293b207d2928293b"));