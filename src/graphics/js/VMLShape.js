/**
 * Base class for creating shapes.
 *
 * @module graphics
 * @class VMLShape
 * @constructor
 * @param {Object} cfg (optional) Attribute configs
 */
VMLShape = function() 
{
    this._transforms = [];
    this.matrix = new Y.Matrix();
    this.rotationMatrix = new Y.Matrix();
    VMLShape.superclass.constructor.apply(this, arguments);
};

VMLShape.NAME = "vmlShape";

Y.extend(VMLShape, Y.BaseGraphic, Y.mix({
	/**
	 * Indicates the type of shape
	 *
	 * @property _type
	 * @readOnly
	 * @type String
	 */
	_type: "shape",
    
    /**
     * Init method, invoked during construction.
     * Calls `initializer` method.
     *
     * @method init
     * @protected
     */
	init: function()
	{
		this.initializer.apply(this, arguments);
	},

	/**
	 * Initializes the shape
	 *
	 * @private
	 * @method _initialize
	 */
	initializer: function(cfg)
	{
		var host = this,
            graphic = cfg.graphic;
        host._graphic = graphic;
		host.createNode();
        this._updateHandler();
	},

	/**
	 * Creates the dom node for the shape.
	 *
     * @method createNode
	 * @return HTMLElement
	 * @private
	 */
	createNode: function()
	{
        var node,
			x = this.get("x"),
			y = this.get("y"),
            w = this.get("width"),
            h = this.get("height"),
			id,
			type,
			nodestring,
			strokestring,
			classString,
			stroke,
			endcap,
			opacity,
			joinstyle,
			miterlimit,
			dashstyle,
			fill,
			fillstring;
			id = this.get("id");
			type = this._type;
			classString = 'vml' + type + ' yui3-vmlShape yui3-' + this.constructor.NAME; 
			stroke = this._getStrokeProps();
			fill = this._getFillProps();
			
			nodestring  = '<' + type + '  xmlns="urn:schemas-microsft.com:vml" id="' + id + '" class="' + classString + '" style="behavior:url(#default#VML);display:inline-block;position:absolute;left:' + x + 'px;top:' + y + 'px;width:' + w + 'px;height:' + h + 'px;"';

		    if(stroke && stroke.weight && stroke.weight > 0)
			{
				endcap = stroke.endcap;
				opacity = parseFloat(stroke.opacity);
				joinstyle = stroke.joinstyle;
				miterlimit = stroke.miterlimit;
				dashstyle = stroke.dashstyle;
				nodestring += ' stroked="t" strokecolor="' + stroke.color + '" strokeWeight="' + stroke.weight + 'px"';
				
				strokestring = '<stroke class="vmlstroke" xmlns="urn:schemas-microsft.com:vml" on="t" style="behavior:url(#default#VML);display:inline-block;"';
				strokestring += ' opacity="' + opacity + '"';
				if(endcap)
				{
					strokestring += ' endcap="' + endcap + '"';
				}
				if(joinstyle)
				{
					strokestring += ' joinstyle="' + joinstyle + '"';
				}
				if(miterlimit)
				{
					strokestring += ' miterlimit="' + miterlimit + '"';
				}
				if(dashstyle)
				{
					strokestring += ' dashstyle="' + dashstyle + '"';
				}
				strokestring += '></stroke>';
				this._strokeNode = DOCUMENT.createElement(strokestring);
				nodestring += ' stroked="t"';
			}
			else
			{
				nodestring += ' stroked="f"';
			}
			if(fill)
			{
				if(fill.node)
				{
					fillstring = fill.node;
					this._fillNode = DOCUMENT.createElement(fillstring);
				}
				if(fill.color)
				{
					nodestring += ' fillcolor="' + fill.color + '"';
				}
				nodestring += ' filled="' + fill.filled + '"';
			}
			
			
			nodestring += '>';
			nodestring += '</' + type + '>';
			
			node = DOCUMENT.createElement(nodestring);
			if(this._strokeNode)
			{
				node.appendChild(this._strokeNode);
			}
			if(this._fillNode)
			{
				node.appendChild(this._fillNode);
			}

			this.node = node;
            this._strokeFlag = false;
            this._fillFlag = false;
	},

	/**
	 * Add a class name to each node.
	 *
	 * @method addClass
	 * @param {String} className the class name to add to the node's class attribute 
	 */
	addClass: function(className)
	{
		var node = this.node;
		Y_DOM.addClass(node, className);
	},

	/**
	 * Removes a class name from each node.
	 *
	 * @method removeClass
	 * @param {String} className the class name to remove from the node's class attribute
	 */
	removeClass: function(className)
	{
		var node = this.node;
		Y_DOM.removeClass(node, className);
	},

	/**
	 * Gets the current position of the node in page coordinates.
	 *
	 * @method getXY
	 * @return Array The XY position of the shape.
	 */
	getXY: function()
	{
		var graphic = this._graphic,
			parentXY = graphic.getXY(),
			x = this.get("x"),
			y = this.get("y");
		return [parentXY[0] + x, parentXY[1] + y];
	},

	/**
	 * Set the position of the shape in page coordinates, regardless of how the node is positioned.
	 *
	 * @method setXY
	 * @param {Array} Contains x & y values for new position (coordinates are page-based)
     *
	 */
	setXY: function(xy)
	{
		var graphic = this._graphic,
			parentXY = graphic.getXY();
		this.set("x", xy[0] - parentXY[0]);
		this.set("y", xy[1] - parentXY[1]);
	},

	/**
	 * Determines whether the node is an ancestor of another HTML element in the DOM hierarchy. 
	 *
	 * @method contains
	 * @param {VMLShape | HTMLElement} needle The possible node or descendent
	 * @return Boolean Whether or not this shape is the needle or its ancestor.
	 */
	contains: function(needle)
	{
		return needle === Y.one(this.node);
	},

	/**
	 * Compares nodes to determine if they match.
	 * Node instances can be compared to each other and/or HTMLElements.
	 * @method compareTo
	 * @param {HTMLElement | Node} refNode The reference node to compare to the node.
	 * @return {Boolean} True if the nodes match, false if they do not.
	 */
	compareTo: function(refNode) {
		var node = this.node;

		return node === refNode;
	},

	/**
	 * Test if the supplied node matches the supplied selector.
	 *
	 * @method test
	 * @param {String} selector The CSS selector to test against.
	 * @return Boolean Wheter or not the shape matches the selector.
	 */
	test: function(selector)
	{
		return Y_SELECTOR.test(this.node, selector);
	},

	/**
	 * @private
	 */
	 _getStrokeProps: function()
	 {
		var props,
			stroke = this.get("stroke"),
			strokeOpacity,
			dashstyle,
			dash = "",
			val,
			i = 0,
			len,
			linecap,
			linejoin;
        if(stroke && stroke.weight && stroke.weight > 0)
		{
			props = {};
			linecap = stroke.linecap || "flat";
			linejoin = stroke.linejoin || "round";
			if(linecap != "round" && linecap != "square")
			{
				linecap = "flat";
			}
			strokeOpacity = parseFloat(stroke.opacity);
			dashstyle = stroke.dashstyle || "none";
			stroke.color = stroke.color || "#000000";
			stroke.weight = stroke.weight || 1;
			stroke.opacity = IS_NUM(strokeOpacity) ? strokeOpacity : 1;
			props.stroked = true;
			props.color = stroke.color;
			props.weight = stroke.weight;
			props.endcap = linecap;
			props.opacity = stroke.opacity;
			if(IS_ARRAY(dashstyle))
			{
				dash = [];
				len = dashstyle.length;
				for(i = 0; i < len; ++i)
				{
					val = dashstyle[i];
					dash[i] = val / stroke.weight;
				}
			}
			if(linejoin == "round" || linejoin == "bevel")
			{
				props.joinstyle = linejoin;
			}
			else
			{
				linejoin = parseInt(linejoin, 10);
				if(IS_NUM(linejoin))
				{
					props.miterlimit = Math.max(linejoin, 1);
					props.joinstyle = "miter";
				}
			}
			props.dashstyle = dash;
		}
		return props;
	 },

	/**
	 * Adds a stroke to the shape node.
	 *
	 * @method _strokeChangeHandler
	 * @private
	 */
	_strokeChangeHandler: function(e)
	{
        if(!this._strokeFlag)
        {
            return;
        }
		var node = this.node,
			stroke = this.get("stroke"),
			strokeOpacity,
			dashstyle,
			dash = "",
			val,
			i = 0,
			len,
			linecap,
			linejoin;
		if(stroke && stroke.weight && stroke.weight > 0)
		{
			linecap = stroke.linecap || "flat";
			linejoin = stroke.linejoin || "round";
			if(linecap != "round" && linecap != "square")
			{
				linecap = "flat";
			}
			strokeOpacity = parseFloat(stroke.opacity);
			dashstyle = stroke.dashstyle || "none";
			stroke.color = stroke.color || "#000000";
			stroke.weight = stroke.weight || 1;
			stroke.opacity = IS_NUM(strokeOpacity) ? strokeOpacity : 1;
			node.stroked = true;
			node.strokeColor = stroke.color;
			node.strokeWeight = stroke.weight + "px";
			if(!this._strokeNode)
			{
				this._strokeNode = this._createGraphicNode("stroke");
				node.appendChild(this._strokeNode);
			}
			this._strokeNode.endcap = linecap;
			this._strokeNode.opacity = stroke.opacity;
			if(IS_ARRAY(dashstyle))
			{
				dash = [];
				len = dashstyle.length;
				for(i = 0; i < len; ++i)
				{
					val = dashstyle[i];
					dash[i] = val / stroke.weight;
				}
			}
			if(linejoin == "round" || linejoin == "bevel")
			{
				this._strokeNode.joinstyle = linejoin;
			}
			else
			{
				linejoin = parseInt(linejoin, 10);
				if(IS_NUM(linejoin))
				{
					this._strokeNode.miterlimit = Math.max(linejoin, 1);
					this._strokeNode.joinstyle = "miter";
				}
			}
			this._strokeNode.dashstyle = dash;
            this._strokeNode.on = true;
		}
		else
		{
            if(this._strokeNode)
            {
                this._strokeNode.on = false;
            }
			node.stroked = false;
		}
        this._strokeFlag = false;
	},

	/**
	 * @private
	 */
	_getFillProps: function()
	{
		var fill = this.get("fill"),
			fillOpacity,
			props,
			gradient,
			i,
			fillstring,
			filled = false;
		if(fill)
		{
			props = {};
			
			if(fill.type == "radial" || fill.type == "linear")
			{
				fillOpacity = parseFloat(fill.opacity);
				fillOpacity = IS_NUM(fillOpacity) ? fillOpacity : 1;
				filled = true;
				gradient = this._getGradientFill(fill);
				fillstring = '<fill xmlns="urn:schemas-microsft.com:vml" class="vmlfill" style="behavior:url(#default#VML);display:inline-block;" opacity="' + fillOpacity + '"';
				for(i in gradient)
				{
					if(gradient.hasOwnProperty(i))
					{
						fillstring += ' ' + i + '="' + gradient[i] + '"';
					}
				}
				fillstring += ' />';
				props.node = fillstring;
			}
			else if(fill.color)
			{
				fillOpacity = parseFloat(fill.opacity);
				filled = true;
                props.color = fill.color;
				if(IS_NUM(fillOpacity))
				{
					fillOpacity = Math.max(Math.min(fillOpacity, 1), 0);
                    props.opacity = fillOpacity;    
				    if(fillOpacity < 1)
                    {
                        props.node = '<fill xmlns="urn:schemas-microsft.com:vml" class="vmlfill" style="behavior:url(#default#VML);display:inline-block;" type="solid" opacity="' + fillOpacity + '"/>';
				    }
                }
			}
			props.filled = filled;
		}
		return props;
	},

	/**
	 * Adds a fill to the shape node.
	 *
	 * @method _fillChangeHandler
	 * @private
	 */
	_fillChangeHandler: function(e)
	{
        if(!this._fillFlag)
        {
            return;
        }
		var node = this.node,
			fill = this.get("fill"),
			fillOpacity,
			fillstring,
			filled = false,
            i,
            gradient;
		if(fill)
		{
			if(fill.type == "radial" || fill.type == "linear")
			{
				filled = true;
				gradient = this._getGradientFill(fill);
                if(this._fillNode)
                {
                    for(i in gradient)
                    {
                        if(gradient.hasOwnProperty(i))
                        {
                            this._fillNode.setAttribute(i, gradient[i]);
                        }
                    }
                }
                else
                {
                    fillstring = '<fill xmlns="urn:schemas-microsft.com:vml" class="vmlfill" style="behavior:url(#default#VML);display:inline-block;"';
                    for(i in gradient)
                    {
                        if(gradient.hasOwnProperty(i))
                        {
                            fillstring += ' ' + i + '="' + gradient[i] + '"';
                        }
                    }
                    fillstring += ' />';
                    this._fillNode = DOCUMENT.createElement(fillstring);
                    node.appendChild(this._fillNode);
                }
			}
			else if(fill.color)
			{
                node.fillcolor = fill.color;
				fillOpacity = parseFloat(fill.opacity);
				filled = true;
				if(IS_NUM(fillOpacity) && fillOpacity < 1)
				{
					fill.opacity = fillOpacity;
                    if(this._fillNode)
					{
                        if(this._fillNode.getAttribute("type") != "solid")
                        {
                            this._fillNode.type = "solid";
                        }
						this._fillNode.opacity = fillOpacity;
					}
					else
					{     
                        fillstring = '<fill xmlns="urn:schemas-microsft.com:vml" class="vmlfill" style="behavior:url(#default#VML);display:inline-block;" type="solid" opacity="' + fillOpacity + '"/>';
                        this._fillNode = DOCUMENT.createElement(fillstring);
                        node.appendChild(this._fillNode);
					}
				}
				else if(this._fillNode)
                {   
                    this._fillNode.opacity = 1;
                    this._fillNode.type = "solid";
				}
			}
		}
		node.filled = filled;
        this._fillFlag = false;
	},

	/**
	 * @private
	 */
	_updateFillNode: function(node)
	{
		if(!this._fillNode)
		{
			this._fillNode = this._createGraphicNode("fill");
			node.appendChild(this._fillNode);
		}
	},

	_getGradientFill: function(fill)
	{
		var gradientProps = {},
			gradientBoxWidth,
			gradientBoxHeight,
			type = fill.type,
			w = this.get("width"),
			h = this.get("height"),
			isNumber = IS_NUM,
			stop,
			stops = fill.stops,
			len = stops.length,
			opacity,
			color,
			i = 0,
			oi,
			colorstring = "",
			cx = fill.cx,
			cy = fill.cy,
			fx = fill.fx,
			fy = fill.fy,
			r = fill.r,
			pct,
			rotation = fill.rotation || 0;
		if(type === "linear")
		{
            if(rotation <= 270)
            {
                rotation = Math.abs(rotation - 270);
            }
			else if(rotation < 360)
            {
                rotation = 270 + (360 - rotation);
            }
            else
            {
                rotation = 270;
            }
            gradientProps.type = "gradient";//"gradientunscaled";
			gradientProps.angle = rotation;
		}
		else if(type === "radial")
		{
			gradientBoxWidth = w * (r * 2);
			gradientBoxHeight = h * (r * 2);
			fx = r * 2 * (fx - 0.5);
			fy = r * 2 * (fy - 0.5);
			fx += cx;
			fy += cy;
			gradientProps.focussize = (gradientBoxWidth/w)/10 + "% " + (gradientBoxHeight/h)/10 + "%";
			gradientProps.alignshape = false;
			gradientProps.type = "gradientradial";
			gradientProps.focus = "100%";
			gradientProps.focusposition = Math.round(fx * 100) + "% " + Math.round(fy * 100) + "%";
		}
		for(;i < len; ++i) {
			stop = stops[i];
			color = stop.color;
			opacity = stop.opacity;
			opacity = isNumber(opacity) ? opacity : 1;
			pct = stop.offset || i/(len-1);
			pct *= (r * 2);
			if(pct <= 1)
			{
				pct = Math.round(100 * pct) + "%";
				oi = i > 0 ? i + 1 : "";
				gradientProps["opacity" + oi] = opacity + "";
				colorstring += ", " + pct + " " + color;
			}
		}
		pct = stops[1].offset || 0;
		pct *= 100;
		if(parseInt(pct, 10) < 100)
		{
			colorstring += ", 100% " + color;
		}
		gradientProps.colors = colorstring.substr(2);
		return gradientProps;
	},

	/**
	 * @private
	 */
	_addTransform: function(type, args)
	{
        args = Y.Array(args);
        this._transform = Y_LANG.trim(this._transform + " " + type + "(" + args.join(", ") + ")");
        args.unshift(type);
        this._transforms.push(args);
        if(this.initialized)
        {
            this._updateTransform();
        }
	},
	
    /**
	 * @private
	 */
	_updateTransform: function()
	{
		var node = this.node,
            key,
			transform,
			transformOrigin,
            x = this.get("x"),
            y = this.get("y"),
            w = this.get("width"),
            h = this.get("height"),
            cx,
            cy,
            dx,
            dy,
            originX,
            originY,
            translatedCenterX,
            translatedCenterY,
            oldBounds,
            newBounds,
            tx,
            ty,
            keys = [],
            matrix = this.matrix,
            rotationMatrix = this.rotationMatrix,
            i = 0,
            len = this._transforms.length;

        if(this._transforms && this._transforms.length > 0)
		{
            transformOrigin = this.get("transformOrigin");
            for(; i < len; ++i)
            {
                key = this._transforms[i].shift();
                if(key)
                {
                    if(key == "rotate")
                    {
                        tx = transformOrigin[0];
                        ty =  transformOrigin[1];
                        oldBounds = this.getBounds(matrix);
                        matrix[key].apply(matrix, this._transforms[i]);
                        rotationMatrix[key].apply(rotationMatrix, this._transforms[i]);
                        newBounds = this.getBounds(matrix);
                        cx = w * 0.5;
                        cy = h * 0.5;
                        originX = w * (tx);
                        originY = h * (ty);
                        translatedCenterX = cx - originX;
                        translatedCenterY = cy - originY;
                        translatedCenterX = (matrix.a * translatedCenterX + matrix.b * translatedCenterY);
                        translatedCenterY = (matrix.d * translatedCenterX + matrix.d * translatedCenterY);
                        translatedCenterX += originX;
                        translatedCenterY += originY;
                        matrix.dx = rotationMatrix.dx + translatedCenterX - (newBounds.right - newBounds.left)/2;
                        matrix.dy = rotationMatrix.dy + translatedCenterY - (newBounds.bottom - newBounds.top)/2;
                    }
                    else if(key == "scale")
                    {
				        transformOrigin = this.get("transformOrigin");
                        tx = x + (transformOrigin[0] * this.get("width"));
                        ty = y + (transformOrigin[1] * this.get("height")); 
                        matrix.translate(tx, ty);
                        matrix[key].apply(matrix, this._transforms[i]); 
                        matrix.translate(0 - tx, 0 - ty);
                    }
                    else
                    {
                        matrix[key].apply(matrix, this._transforms[i]); 
                        rotationMatrix[key].apply(rotationMatrix, this._transforms[i]); 
                    }
                    keys.push(key);
                }
			}
            transform = matrix.toFilterText();
		}
        dx = matrix.dx;
        dy = matrix.dy;
        this._graphic.addToRedrawQueue(this);    
        //only apply the filter if necessary as it degrades image quality
        if(Y.Array.indexOf(keys, "skew") > -1 || Y.Array.indexOf(keys, "scale") > -1)
		{
            node.style.filter = transform;
        }
        else if(Y.Array.indexOf(keys,"rotate") > -1)
        {
            node.style.rotation = this._rotation;
            dx = rotationMatrix.dx;
            dy = rotationMatrix.dy;
        }
        this._transforms = [];
        x += dx;
        y += dy;
        node.style.left = x + "px";
		node.style.top = y + "px";
    },
	
    /**
	 * Storage for translateX
	 *
	 * @private
	 */
	_translateX: 0,

	/**
	 * Storage for translateY
	 *
	 * @private
	 */
	_translateY: 0,
    
    /**
     * Storage for the transform attribute.
     *
     * @property _transform
     * @type String
     * @private
     */
    _transform: "",
	
    /**
	 * Specifies a 2d translation.
	 *
	 * @method translate
	 * @param {Number} x The value to transate on the x-axis.
	 * @param {Number} y The value to translate on the y-axis.
	 */
	translate: function(x, y)
	{
		this._translateX += x;
		this._translateY += y;
		this._addTransform("translate", arguments);
	},

	/**
	 * Translates the shape along the x-axis. When translating x and y coordinates,
	 * use the `translate` method.
	 *
	 * @method translateX
	 * @param {Number} y The value to translate.
	 */
	translateX: function(x)
    {
        this._translateX += x;
        this._addTransform("translateX", arguments);
    },

	/**
	 * Performs a translate on the y-coordinate. When translating x and y coordinates,
	 * use the `translate` method.
	 *
	 * @method translateY
	 * @param {Number} y The value to translate.
	 */
	translateY: function(y)
    {
        this._translateY += y;
        this._addTransform("translateY", arguments);
    },

    /**
     * Skews the shape around the x-axis and y-axis.
     *
     * @method skew
     * @param {Number} x The value to skew on the x-axis.
     * @param {Number} y The value to skew on the y-axis.
     */
    skew: function(x, y)
    {
        this._addTransform("skew", arguments);
    },

	/**
	 * Skews the shape around the x-axis.
	 *
	 * @method skewX
	 * @param {Number} x x-coordinate
	 */
	 skewX: function(x)
	 {
		this._addTransform("skewX", arguments);
	 },

	/**
	 * Skews the shape around the y-axis.
	 *
	 * @method skewY
	 * @param {Number} y y-coordinate
	 */
	 skewY: function(y)
	 {
		this._addTransform("skewY", arguments);
	 },


	/**
     * Storage for `rotation` atribute.
     *
     * @property _rotation
     * @type Number
	 * @private
	 */
	_rotation: 0,

	/**
	 * Rotates the shape clockwise around it transformOrigin.
	 *
	 * @method rotate
	 * @param {Number} deg The degree of the rotation.
	 */
	 rotate: function(deg)
	 {
		this._rotation += deg;
		this._addTransform("rotate", arguments);
	 },

	/**
	 * Specifies a 2d scaling operation.
	 *
	 * @method scale
	 * @param {Number} val
	 */
	scale: function(x, y)
	{
		this._addTransform("scale", arguments);
	},

	/**
	 * @private
	 */
	on: function(type, fn)
	{
		if(Y.Node.DOM_EVENTS[type])
		{
			return Y.one("#" +  this.get("id")).on(type, fn);
		}
		return Y.on.apply(this, arguments);
	},

	/**
	 * Draws the shape.
	 *
	 * @method _draw
	 * @private
	 */
	_draw: function()
	{
	},

	/**
	 * @private
	 */
	_updateHandler: function(e)
	{
		var host = this,
            node = host.node;
        host._fillChangeHandler();
        host._strokeChangeHandler();
        node.style.width = this.get("width") + "px";
        node.style.height = this.get("height") + "px"; 
        this._draw();
		host._updateTransform();
	},

	/**
	 * Creates a graphic node
	 *
	 * @method _createGraphicNode
	 * @param {String} type node type to create
	 * @param {String} specified pointer-events value
	 * @return HTMLElement
	 * @private
	 */
	_createGraphicNode: function(type)
	{
		type = type || this._type;
		return DOCUMENT.createElement('<' + type + ' xmlns="urn:schemas-microsft.com:vml" style="behavior:url(#default#VML);display:inline-block;" class="vml' + type + '"/>');
	},

	/**
	 * Value function for fill attribute
	 *
	 * @private
	 * @method _getDefaultFill
	 * @return Object
	 */
	_getDefaultFill: function() {
		return {
			type: "solid",
			cx: 0.5,
			cy: 0.5,
			fx: 0.5,
			fy: 0.5,
			r: 0.5
		};
	},

	/**
	 * Value function for stroke attribute
	 *
	 * @private
	 * @method _getDefaultStroke
	 * @return Object
	 */
	_getDefaultStroke: function() 
	{
		return {
			weight: 1,
			dashstyle: "none",
			color: "#000",
			opacity: 1.0
		};
	},

	/**
	 * @private
	 */
	set: function() 
	{
		var host = this;
		AttributeLite.prototype.set.apply(host, arguments);
		if(host.initialized)
		{
			host._updateHandler();
		}
	},

	/**
	 * Returns the bounds for a shape.
	 *
     * Calculates the a new bounding box from the original corner coordinates (base on size and position) and the transform matrix.
     * The calculated bounding box is used by the graphic instance to calculate its viewBox. 
     *
	 * @method getBounds
	 * @return Object
	 */
	getBounds: function(cfg)
	{
	    var wt,
            bounds = {},
            matrix = cfg || this.matrix,
            a = matrix.a,
            b = matrix.b,
            c = matrix.c,
            d = matrix.d,
            dx = matrix.dx,
            dy = matrix.dy,
            w = this.get("width"),
            h = this.get("height"),
            left = this.get("x"), 
            top = this.get("y"), 
            right = left + w,
            bottom = top + h,
			stroke = this.get("stroke"),
            //[x1, y1]
            x1 = (a * left + c * top + dx), 
            y1 = (b * left + d * top + dy),
            //[x2, y2]
            x2 = (a * right + c * top + dx),
            y2 = (b * right + d * top + dy),
            //[x3, y3]
            x3 = (a * left + c * bottom + dx),
            y3 = (b * left + d * bottom + dy),
            //[x4, y4]
            x4 = (a * right + c * bottom + dx),
            y4 = (b * right + d * bottom + dy);
        bounds.left = Math.min(x3, Math.min(x1, Math.min(x2, x4)));
        bounds.right = Math.max(x3, Math.max(x1, Math.max(x2, x4)));
        bounds.top = Math.min(y2, Math.min(y4, Math.min(y3, y1)));
        bounds.bottom = Math.max(y2, Math.max(y4, Math.max(y3, y1)));
        //if there is a stroke, extend the bounds to accomodate
        if(stroke && stroke.weight)
		{
			wt = stroke.weight;
            bounds.left -= wt;
            bounds.right += wt;
            bounds.top -= wt;
            bounds.bottom += wt;
		}
        bounds.width = bounds.right - bounds.left;
        bounds.height = bounds.bottom - bounds.top;
        return bounds;
	},
	
    /**
     *  Destroys shape
     *
     *  @method destroy
     */
    destroy: function()
    {
        var parentNode = this._graphic && this._graphic._node ? this._graphic._node : null,
            node = this.node;
        if(this.node)
        {   
            if(this._fillNode)
            {
                node.removeChild(this._fillNode);
            }
            if(this._strokeNode)
            {
                node.removeChild(this._strokeNode);
            }
            if(parentNode)
            {
                parentNode.removeChild(node);
            }
        }
    }
}, Y.VMLDrawing.prototype));

VMLShape.ATTRS = {
	/**
	 * An array of x, y values which indicates the transformOrigin in which to rotate the shape. Valid values range between 0 and 1 representing a 
	 * fraction of the shape's corresponding bounding box dimension. The default value is [0.5, 0.5].
	 *
	 * @config transformOrigin
	 * @type Array
	 */
	transformOrigin: {
		valueFn: function()
		{
			return [0.5, 0.5];
		}
	},
	
    /**
     * <p>A string containing, in order, transform operations applied to the shape instance. The `transform` string can contain the following values:
     *     
     *    <dl>
     *        <dt>rotate</dt><dd>Rotates the shape clockwise around it transformOrigin.</dd>
     *        <dt>translate</dt><dd>Specifies a 2d translation.</dd>
     *        <dt>skew</dt><dd>Skews the shape around the x-axis and y-axis.</dd>
     *        <dt>scale</dt><dd>Specifies a 2d scaling operation.</dd>
     *        <dt>translateX</dt><dd>Translates the shape along the x-axis.</dd>
     *        <dt>translateY</dt><dd>Translates the shape along the y-axis.</dd>
     *        <dt>skewX</dt><dd>Skews the shape around the x-axis.</dd>
     *        <dt>skewY</dt><dd>Skews the shape around the y-axis.</dd>
     *    </dl>
     * </p>
     * <p>Applying transforms through the transform attribute will reset the transform matrix and apply a new transform. The shape class also contains corresponding methods for each transform
     * that will apply the transform to the current matrix. The below code illustrates how you might use the `transform` attribute to instantiate a recangle with a rotation of 45 degrees.</p>
            var myRect = new Y.Rect({
                type:"rect",
                width: 50,
                height: 40,
                transform: "rotate(45)"
            };
     * <p>The code below would apply `translate` and `rotate` to an existing shape.</p>
    
        myRect.set("transform", "translate(40, 50) rotate(45)");
	 * @config transform
     * @type String  
	 */
	transform: {
		setter: function(val)
		{
            this.matrix.init();	
		    this._transforms = this.matrix.getTransformArray(val);
            this._transform = val;
            if(this.initialized)
            {
                this._updateTransform();
            }
            return val;
		},

        getter: function()
        {
            return this._transform;
        }
	},

	/**
	 * Indicates the x position of shape.
	 *
	 * @config x
	 * @type Number
	 */
	x: {
		value: 0
	},

	/**
	 * Indicates the y position of shape.
	 *
	 * @config y
	 * @type Number
	 */
	y: {
		value: 0
	},

	/**
	 * Unique id for class instance.
	 *
	 * @config id
	 * @type String
	 */
	id: {
		valueFn: function()
		{
			return Y.guid();
		},

		setter: function(val)
		{
			var node = this.node;
			if(node)
			{
				node.setAttribute("id", val);
			}
			return val;
		}
	},
	
	/**
	 * 
	 * @config width
	 */
	width: {
		value: 0
	},

	/**
	 * 
	 * @config height
	 */
	height: {
		value: 0
	},

	/**
	 * Indicates whether the shape is visible.
	 *
	 * @config visible
	 * @type Boolean
	 */
	visible: {
		value: true,

		setter: function(val){
			var node = this.node,
				visibility = val ? "visible" : "hidden";
			if(node)
			{
				node.style.visibility = visibility;
			}
			return val;
		}
	},

	/**
	 * Contains information about the fill of the shape. 
	 *  <dl>
	 *      <dt>color</dt><dd>The color of the fill.</dd>
	 *      <dt>opacity</dt><dd>Number between 0 and 1 that indicates the opacity of the fill. The default value is 1.</dd>
	 *      <dt>type</dt><dd>Type of fill.
	 *          <dl>
	 *              <dt>solid</dt><dd>Solid single color fill. (default)</dd>
	 *              <dt>linear</dt><dd>Linear gradient fill.</dd>
	 *              <dt>radial</dt><dd>Radial gradient fill.</dd>
	 *          </dl>
	 *      </dd>
	 *  </dl>
	 *
	 *  <p>If a gradient (linear or radial) is specified as the fill type. The following properties are used:
	 *  <dl>
	 *      <dt>stops</dt><dd>An array of objects containing the following properties:
	 *          <dl>
	 *              <dt>color</dt><dd>The color of the stop.</dd>
	 *              <dt>opacity</dt><dd>Number between 0 and 1 that indicates the opacity of the stop. The default value is 1. Note: No effect for IE <= 8</dd>
	 *              <dt>offset</dt><dd>Number between 0 and 1 indicating where the color stop is positioned.</dd> 
	 *          </dl>
	 *      </dd>
	 *      <dt></dt><dd></dd>
	 *      <dt></dt><dd></dd>
	 *      <dt></dt><dd></dd>
	 *  </dl>
	 *  </p>
	 *
	 * @config fill
	 * @type Object 
	 */
	fill: {
		valueFn: "_getDefaultFill",
		
		setter: function(val)
		{
			var i,
				fill,
				tmpl = this.get("fill") || this._getDefaultFill();
			
			if(val)
			{
				//ensure, fill type is solid if color is explicitly passed.
				if(val.hasOwnProperty("color"))
				{
					val.type = "solid";
				}
				for(i in val)
				{
					if(val.hasOwnProperty(i))
					{   
						tmpl[i] = val[i];
					}
				}
			}
			fill = tmpl;
			if(fill && fill.color)
			{
				if(fill.color === undefined || fill.color == "none")
				{
					fill.color = null;
				}
			}
			this._fillFlag = true;
            return fill;
		}
	},

	/**
	 * Contains information about the stroke of the shape.
	 *  <dl>
	 *      <dt>color</dt><dd>The color of the stroke.</dd>
	 *      <dt>weight</dt><dd>Number that indicates the width of the stroke.</dd>
	 *      <dt>opacity</dt><dd>Number between 0 and 1 that indicates the opacity of the stroke. The default value is 1.</dd>
	 *      <dt>dashstyle</dt>Indicates whether to draw a dashed stroke. When set to "none", a solid stroke is drawn. When set to an array, the first index indicates the
	 *      length of the dash. The second index indicates the length of gap.
	 *  </dl>
	 *
	 * @config stroke
	 * @type Object
	 */
	stroke: {
		valueFn: "_getDefaultStroke",
		
		setter: function(val)
		{
			var i,
				stroke,
				tmpl = this.get("stroke") || this._getDefaultStroke();
			if(val)
			{
				for(i in val)
				{
					if(val.hasOwnProperty(i))
					{   
						tmpl[i] = val[i];
					}
				}
			}
			stroke = tmpl;
            this._strokeFlag = true;
			return stroke;
		}
	},
	
	/**
	 * Indicates whether or not the instance will size itself based on its contents.
	 *
	 * @config autoSize 
	 * @type Boolean
	 */
	autoSize: {
		value: false
	},

	/**
	 * Determines whether the instance will receive mouse events.
	 * 
	 * @config pointerEvents
	 * @type string
	 */
	pointerEvents: {
		value: "visiblePainted"
	},

	/**
	 * Dom node for the shape.
	 *
	 * @config node
	 * @type HTMLElement
	 * @readOnly
	 */
	node: {
		readOnly: true,

		getter: function()
		{
			return this.node;
		}
	},

	/**
	 * Reference to the container Graphic.
	 *
	 * @config graphic
	 * @type Graphic
	 */
	graphic: {
		readOnly: true,

		getter: function()
		{
			return this._graphic;
		}
	}
};
Y.VMLShape = VMLShape;
