/*!
 * ----------------------------------------------------------
 *  MARKDOWN TEXT EDITOR PLUGIN 1.5.1
 * ----------------------------------------------------------
 * Author: Taufik Nurrohman <http://latitudu.com>
 * Licensed under the MIT license.
 *
 * REQUIRES:
 * ==========================================================
 * [1]. https://github.com/tovic/simple-text-editor-library
 * [2]. https://fortawesome.github.io/Font-Awesome/icons
 * ==========================================================
 * ----------------------------------------------------------
 *
 */

var MTE = function(elem, o) {

    var _u2018 = '\u2018', // left single quotation mark
        _u2019 = '\u2019', // right single quotation mark
        _u201C = '\u201C', // left double quotation mark
        _u201D = '\u201D', // right double quotation mark
        _u2013 = '\u2013', // N-dash
        _u2014 = '\u2014', // M-dash
        _u2026 = '\u2026', // horizontal ellipsis
        _u00A6 = '\u00A6', // broken bar
        _u00A9 = '\u00A9', // copyright sign
        _u2117 = '\u2117', // sound recording copyright sign
        _u2120 = '\u2120', // service mark
        _u2122 = '\u2122', // trade mark sign
        _u00AE = '\u00AE', // registered sign
        _u00B1 = '\u00B1', // plus-minus sign
        _u00D7 = '\u00D7', // multiplication sign
        _u00F7 = '\u00F7', // division sign
        _u00B0 = '\u00B0', // degree sign
        _u2039 = '\u2039', // left pointing single angle quotation mark
        _u203A = '\u203A', // right pointing single angle quotation mark
        _u00AB = '\u00AB', // left pointing double angle quotation mark
        _u00BB = '\u00BB', // right pointing double angle quotation mark
        _u2264 = '\u2264', // less than or equal to
        _u2265 = '\u2265', // greater than or equal to
        _u2260 = '\u2260', // not equal to
        _u2190 = '\u2190', // leftwards arrow
        _u2192 = '\u2192', // rightwards arrow
        _u2191 = '\u2191', // upwards arrow
        _u2193 = '\u2193', // downwards arrow
        _u21B5 = '\u21B5', // carriage return arrow
        _u2318 = '\u2318', // command sign
        _u00B7 = '\u00B7', // middle dot
        _u2116 = '\u2116', // `No` sign

        base = this,
        win = window,
        doc = document,
        editor = new Editor(elem),
        noop = function() {},
        defaults = {
            tabSize: '    ',
            toolbar: true,
            shortcut: false,
            dir: 'ltr',
            areaClass: 'editor-area',
            toolbarClass: 'editor-toolbar',
            toolbarIconClass: 'fa fa-%s',
            toolbarButtonClass: 'editor-toolbar-button editor-toolbar-button-%s',
            toolbarSeparatorClass: 'editor-toolbar-separator',
            toolbarPosition: "before", // before or after `<textarea>` ?
            dropClass: 'custom-drop custom-drop-%s',
            modalClass: 'custom-modal custom-modal-%s',
            modalHeaderClass: 'custom-modal-header custom-modal-%s-header',
            modalContentClass: 'custom-modal-content custom-modal-%s-content',
            modalFooterClass: 'custom-modal-footer custom-modal-%s-footer',
            modalOverlayClass: 'custom-modal-overlay custom-modal-%s-overlay',
            autoComplete: true,
            autoIndent: true,
            emptyElementSuffix: '>', // used to determine the end character of self-closing HTML tags
            enableSETextHeader: true, // `false` for `# Heading 1` and `## Heading 2`
            closeATXHeader: false, // `true` for `#### Heading ####`
            STRONG: '**',
            EM: '_',
            UL: '- ',
            OL: '%d. ',
            HR: '---',
            CODE: '`',
            PRE: '    ', // Use ~~~\n%s\n~~~ or ```\n%s\n``` to enable fenced code block syntax in "Markdown Extra"
            BLOCKQUOTE: '> ',
            actions: {
                ok: 'OK',
                cancel: 'Cancel',
                yes: 'Yes',
                no: 'No',
                open: 'Open',
                close: 'Close'
            },
            buttons: {
                bold: ['Bold', _u2318 + '+B'],
                italic: ['Italic', _u2318 + '+I'],
                code: ['Code', _u2318 + '+K'],
                quote: ['Quote', _u2318 + '+Q'],
                heading: ['H1 ' + _u2013 + ' H6', _u2318 + '+H'],
                link: ['Link', _u2318 + '+L'],
                image: ['Image', _u2318 + '+G'],
                ol: ['Ordered List', _u2318 + '++'],
                ul: ['Unordered List', _u2318 + '+-'],
                rule: ['Horizontal Rule', _u2318 + '+R'],
                undo: ['Undo', _u2318 + '+Z'],
                redo: ['Redo', _u2318 + '+Y']
            },
            placeholders: {
                text: 'text goes here' + _u2026,
                heading_text: 'Heading',
                link_text: 'link text',
                list_ul_text: 'List item',
                list_ol_text: 'List item',
                image_alt: 'Image'
            },
            prompts: {
                link_title: 'link title goes here' + _u2026,
                link_title_title: 'Link Title',
                link_url: 'http://',
                link_url_title: 'Link URL',
                image_title: 'image title goes here' + _u2026,
                image_title_title: 'Image Title',
                image_url: 'http://',
                image_url_title: 'Image URL'
            },
            update: noop,
            keydown: noop,
            click: noop,
            ready: noop,
            copy: noop,
            cut: noop,
            paste: noop
        };

    var page = doc.body,
        overlay = doc.createElement('div'),
        modal = doc.createElement('div'),
        drop = doc.createElement('div'),
        scroll = 0,
        button = null,
        drag = null,
        x_e = 0,
        y_e = 0,
        x_m = 0,
        y_m = 0,
        v_w = page.parentNode.offsetWidth,
        v_h = win.innerHeight > page.parentNode.offsetHeight ? win.innerHeight : page.parentNode.offsetHeight,
        NN = '\n\n',
        SS = ' ',

        // Rewrite some methods for better JS minification
        _AREA = elem,
        _INDENT = editor.indent,
        _INSERT = editor.insert,
        _KEY = editor.key,
        _OUTDENT = editor.outdent,
        _REPLACE = editor.replace,
        _SELECT = editor.select,
        _SELECTION = editor.selection,
        _UPDATE_HISTORY = editor.updateHistory,
        _WRAP = editor.wrap,
        _TIMER = win.setTimeout;

    function is_set(elem) {
        return typeof elem !== "undefined";
    }

    function is_string(elem) {
        return typeof elem === "string";
    }

    function is_number(elem) {
        return typeof elem === "number";
    }

    function is_function(elem) {
        return typeof elem === "function";
    }

    function is_object(elem) {
        return typeof elem === "object";
    }

    function addEvent(elem, event, fn) {
        event = 'on' + event;
        if (fn === null) {
            return elem[event] = null;
        }
        if (is_function(elem[event])) {
            fn = (function(fn_1, fn_2) {
                return function() {
                    return fn_1.apply(this, arguments), fn_2.apply(this, arguments);
                }
            })(elem[event], fn);
        }
        elem[event] = fn;
    }

    function extend(target, source) {
        target = target || {};
        for (var prop in source) {
            if (is_object(source[prop])) {
                target[prop] = extend(target[prop], source[prop]);
            } else {
                target[prop] = source[prop];
            }
        }
        return target;
    }

    function css(elem, rule) {
        var ruleJS = rule.replace(/\-(\w)/g, function(match, $1) {
            return $1.toUpperCase();
        }), value = 0;
        if (doc.defaultView && doc.defaultView.getComputedStyle) {
            value = doc.defaultView.getComputedStyle(elem, null).getPropertyValue(rule);
        } else {
            value = elem.style[ruleJS];
        }
        return value;
    }

    function insert(str, s) {
        return _INSERT(str, function() {
            _SELECT(s.end + 1, true);
        }), false;
    }

    function trim(str) {
        return str.replace(/^\s+|\s+$/g, "");
    }

    function _trim(str) {
        return str.replace(/^\s+/, "");
    }

    function trim_(str) {
        return str.replace(/\s+$/, "");
    }

    function escape(str) {
        return str.replace(editor.escape, '\\$1');
    }

    function node_exist(node) {
        return node.parentNode;
    }

    var opt = extend(defaults, o),
        nav = doc.createElement('span');

    // Configuration (original)
    // @see `base.grip.config`
    base.config = JSON.parse(JSON.stringify(opt));

    // DOM Accessor
    base.DOM = {
        overlay: overlay,
        modal: modal,
        drop: drop
    };

    // Escapes for `RegExp()`
    var re_UL = escape(opt.UL).replace(/\\[-+*]/g, '[-+*]'),
        re_OL = escape(opt.OL).replace(/%d/g, '\\d+'),
        re_TAB = escape(opt.tabSize),
        re_PRE = escape(opt.PRE),
        re_BLOCKQUOTE = escape(opt.BLOCKQUOTE);

    // Base Shortcut
    base.shortcuts = [];
    base.shortcut = function(code, callback) {
        base.shortcuts[code.toLowerCase()] = callback;
        base.shortcuts = (function() {
            var _in = Object.keys(base.shortcuts).sort().reverse(),
                _out = {};
            for (var i = 0, len = _in.length; i < len; ++i) {
                _out[_in[i]] = base.shortcuts[_in[i]];
            }
            return _out;
        })();
    };

    // Base Event Listener
    base.event = function(event, elem, fn) {
        return addEvent(elem, event, fn);
    };

    // Base Modal
    base.modal = function(type, callback, offset) {
        if (is_function(type)) {
            offset = callback;
            callback = type;
            type = 'default';
        }
        type = type || 'default';
        offset = offset || {};
        scroll = page.scrollTop || page.parentNode.scrollTop;
        overlay.className = opt.modalOverlayClass.replace(/%s/g, type);
        modal.className = opt.modalClass.replace(/%s/g, type);
        modal.innerHTML = '<div class="' + opt.modalHeaderClass.replace(/%s/g, type) + '"></div><div class="' + opt.modalContentClass.replace(/%s/g, type) + '"></div><div class="' + opt.modalFooterClass.replace(/%s/g, type) + '"></div>';
        var m_s = modal.style,
            fx_left = 'left' in offset,
            fx_top = 'top' in offset;
        m_s.visibility = 'hidden';
        _TIMER(function() {
            page.appendChild(overlay);
            page.appendChild(modal);
        }, .1);
        _TIMER(function() {
            var w = modal.offsetWidth,
                h = modal.offsetHeight;
            m_s.position = 'absolute';
            m_s.left = fx_left ? offset.left + 'px' : '50%';
            m_s.top = fx_top ? offset.top + 'px' : '50%';
            m_s.zIndex = '9999';
            m_s.marginLeft = (fx_left ? 0 : 0 - (w / 2)) + 'px';
            m_s.marginTop = (fx_top ? 0 : scroll - (h / 2)) + 'px';
            m_s.visibility = "";
            if (modal.offsetLeft < 0 && !fx_left) {
                m_s.left = 0;
                m_s.marginLeft = 0;
                fx_left = true;
                offset.left = 0;
            }
            if (modal.offsetTop < 0 && !fx_top) {
                m_s.top = 0;
                m_s.marginTop = 0;
                fx_top = true;
                offset.top = 0;
            }
            var handle = modal.children[0];
            addEvent(handle, "mousedown", function() {
                drag = modal;
                x_m = x_e - drag.offsetLeft;
                y_m = y_e - drag.offsetTop;
                return false;
            });
            addEvent(page, "mousemove", null);
            addEvent(page, "mousemove", function(e) {
                x_e = e.pageX;
                y_e = e.pageY + scroll;
                var m_left = fx_left ? 0 : w / 2,
                    m_top = fx_top ? 0 : h / 2,
                    left, top;
                if (drag !== null) {
                    var WW = fx_left ? w : 0,
                        HH = fx_top ? h : 0;
                    left = x_e - x_m + m_left;
                    top = y_e - y_m + m_top;
                    if (left < m_left) left = m_left;
                    if (top < m_top) top = m_top;
                    if (left + m_left + WW > v_w) left = v_w - m_left - WW;
                    if (top + m_top + HH > v_h) top = v_h - m_top - HH;
                    m_s.left = left + 'px';
                    m_s.top = (top - scroll) + 'px';
                }
            });
        }, .2);
        // `callback(overlay, modal, header, content, footer)`
        var ch = modal.children;
        if (is_function(callback)) callback(overlay, modal, ch[0], ch[1], ch[2]);
    };

    // Base Drop
    base.drop = function(type, callback, offset) {
        if (is_function(type)) {
            offset = callback;
            callback = type;
            type = 'default';
        }
        if (!offset && button) {
            offset = {
                left: button.offsetLeft,
                top: button.offsetTop + button.offsetHeight // drop!
            };
        }
        type = type || 'default';
        offset = offset || {};
        scroll = page.scrollTop || page.parentNode.scrollTop;
        drop.className = opt.dropClass.replace(/%s/g, type);
        var d_s = drop.style,
            fx_left = 'left' in offset,
            fx_top = 'top' in offset;
        d_s.visibility = 'hidden';
        _TIMER(function() {
            page.appendChild(drop);
        }, .1);
        _TIMER(function() {
            var w = drop.offsetWidth,
                h = drop.offsetHeight;
            d_s.position = 'absolute';
            d_s.left = fx_left ? offset.left + 'px' : '50%';
            d_s.top = fx_top ? offset.top + 'px' : '50%';
            d_s.zIndex = '9999';
            d_s.marginLeft = (fx_left ? 0 : 0 - (w / 2)) + 'px';
            d_s.marginTop = (fx_top ? 0 : scroll - (h / 2)) + 'px';
            d_s.visibility = "";
            if (offset.left + w > v_w) {
                d_s.left = (v_w - w) + 'px';
                d_s.marginLeft = 0;
            }
            if (offset.top + h > v_h) {
                d_s.top = (v_h - h) + 'px';
                d_s.marginTop = 0;
            }
        }, .2);
        if (is_function(callback)) callback(drop);
    };

    // Custom Prompt Modal
    base.prompt = function(title, value, required, callback, offset) {
        base.modal('prompt', function(o, m, h, c, f) {
            var success = function(value) {
                if (is_function(callback)) {
                    base.exit();
                    callback(value);
                } else {
                    base.exit(true);
                }
            };
            var input = doc.createElement('input');
                input.type = 'text';
                input.value = value;
            addEvent(input, "keydown", function(e) {
                var k = _KEY(e);
                if (k == 'escape') return base.exit(true), false;
                if (k == 'arrowdown') return OK.focus(), false;
                if (required) {
                    if (k == 'enter' && this.value !== "" && this.value !== value) {
                        return success(this.value), false;
                    }
                } else {
                    if (k == 'enter') {
                        return success(this.value == value ? "" : this.value), false;
                    }
                }
            });
            var OK = doc.createElement('button');
                OK.innerHTML = opt.actions.ok;
            addEvent(OK, "click", function() {
                if (required) {
                    if (input.value !== "" && input.value !== value) success(input.value);
                } else {
                    success(input.value == value ? "" : input.value);
                }
                return false;
            });
            var CANCEL = doc.createElement('button');
                CANCEL.innerHTML = opt.actions.cancel;
            addEvent(CANCEL, "click", function() {
                return base.exit(true), false;
            });
            addEvent(OK, "keydown", function(e) {
                var k = _KEY(e);
                if (k == 'escape') return base.exit(true), false;
                if (k == 'arrowup') return input.focus(), false;
                if (k == 'arrowright') return CANCEL.focus(), false;
                if (k.match(/^arrow(left|down)$/)) return false;
            });
            addEvent(CANCEL, "keydown", function(e) {
                var k = _KEY(e);
                if (k == 'escape') return base.exit(true), false;
                if (k == 'arrowup') return input.focus(), false;
                if (k == 'arrowleft') return OK.focus(), false;
                if (k.match(/^arrow(right|down)$/)) return false;
            });
            h.innerHTML = title ? title : "";
            c.appendChild(input);
            f.appendChild(OK);
            f.appendChild(doc.createTextNode(' '));
            f.appendChild(CANCEL);
            _TIMER(function() {
                input.select();
            }, .2);
        }, offset);
    };

    // Custom Alert Modal
    base.alert = function(title, message, callback, offset) {
        base.modal('alert', function(o, m, h, c, f) {
            var OK = doc.createElement('button');
                OK.innerHTML = opt.actions.ok;
            addEvent(OK, "click", function() {
                if (is_function(callback)) {
                    base.exit();
                    callback();
                } else {
                    base.exit(true);
                }
                return false;
            });
            addEvent(OK, "keydown", function(e) {
                if (_KEY(e, 'escape')) return base.exit(true), false;
            });
            h.innerHTML = title ? title : "";
            c.innerHTML = message ? message : "";
            f.appendChild(OK);
            _TIMER(function() {
                OK.focus();
            }, .2);
        }, offset);
    };

    // Custom Confirm Modal
    base.confirm = function(title, message, callback, offset) {
        base.modal('confirm', function(o, m, h, c, f) {
            var OK = doc.createElement('button');
                OK.innerHTML = opt.actions.ok;
            addEvent(OK, "click", function() {
                if (is_set(callback)) {
                    if (is_function(callback.OK)) {
                        base.exit();
                        callback.OK();
                    } else {
                        base.exit(true);
                    }
                } else {
                    base.exit(true);
                }
                return false;
            });
            var CANCEL = doc.createElement('button');
                CANCEL.innerHTML = opt.actions.cancel;
            addEvent(CANCEL, "click", function() {
                if (is_set(callback)) {
                    if (is_function(callback.CANCEL)) {
                        base.exit();
                        callback.CANCEL();
                    } else {
                        base.exit(true);
                    }
                } else {
                    base.exit(true);
                }
                return false;
            });
            addEvent(OK, "keydown", function(e) {
                var k = _KEY(e);
                if (k == 'escape') return base.exit(true), false;
                if (k == 'arrowright') return CANCEL.focus(), false;
                if (k.match(/^arrow(down|left)$/)) return false;
            });
            addEvent(CANCEL, "keydown", function(e) {
                var k = _KEY(e);
                if (k == 'escape') return base.exit(true), false;
                if (k == 'arrowleft') return OK.focus(), false;
                if (k.match(/^arrow(down|right)$/)) return false;
            });
            h.innerHTML = title ? title : "";
            c.innerHTML = message ? message : "";
            f.appendChild(OK);
            f.appendChild(doc.createTextNode(' '));
            f.appendChild(CANCEL);
            _TIMER(function() {
                CANCEL.focus();
            }, .2);
        }, offset);
    };

    // Close Drop and Modal
    base.exit = base.close = function(select) {
        button = null;
        drag = null;
        if (node_exist(overlay)) page.removeChild(overlay);
        if (node_exist(modal)) page.removeChild(modal);
        if (node_exist(drop)) page.removeChild(drop);
        if (select && select !== false) {
            var s = _SELECTION();
            if (!is_object(select)) select = {};
            _SELECT(('start' in select ? select.start : s.start), ('end' in select ? select.end : s.end));
        }
    };

    addEvent(win, "resize", function() {
        v_w = page.parentNode.offsetWidth;
        v_h = win.innerHeight > page.parentNode.offsetHeight ? win.innerHeight : page.parentNode.offsetHeight;
    });

    addEvent(page, "mouseup", function() {
        drag = null;
    });

    addEvent(overlay, "click", function() {
        base.exit(true);
    });

    // Scroll the `<textarea>`
    base.scroll = function(pos, callback) {
        if (is_number(pos)) {
            _AREA.scrollTop = pos;
        } else {
            _AREA.scrollTop += parseInt(css(_AREA, 'line-height'), 10);
        }
        if (is_function(callback)) callback();
    };

    // Time
    base.time = function(output) {
        var time = new Date(),
            year = time.getFullYear(),
            month = (time.getMonth() + 1),
            date = time.getDate(),
            hour = time.getHours(),
            minute = time.getMinutes(),
            second = time.getSeconds(),
            millisecond = time.getMilliseconds();
        if (month < 10) month = '0' + month;
        if (date < 10) date = '0' + date;
        if (hour < 10) hour = '0' + hour;
        if (minute < 10) minute = '0' + minute;
        if (second < 10) second = '0' + second;
        if (millisecond < 10) millisecond = '0' + millisecond;
        var o = {
            'Y': "" + year,
            'm': "" + month,
            'd': "" + date,
            'H': "" + hour,
            'i': "" + minute,
            's': "" + second,
            'u': "" + millisecond
        };
        return is_set(output) ? o[output] : o;
    };

    if (opt.toolbar) {
        nav.className = opt.toolbarClass;
        addEvent(nav, "click", function() {
            return base.exit(false), false;
        });
        _AREA.parentNode.insertBefore(nav, opt.toolbarPosition.match(/^after|bottom$/i) ? null : _AREA);
    }

    var release = doc.createElement('a');
        release.href = '#esc:' + (new Date()).getTime();
        release.style.width = 0;
        release.style.height = 0;
    _AREA.parentNode.appendChild(release);

    // Custom Button
    base.button = function(key, data) {
        if (key === '|') return base.separator(data);
        data = data || {};
        if (data.title === false) return;
        if (!is_object(data.title)) data.title = [data.title];
        var btn = doc.createElement('a'), pos;
            btn.className = opt.toolbarButtonClass.replace(/%s/g, key);
            btn.setAttribute('dir', data.dir || opt.dir);
            btn.setAttribute('tabindex', -1);
            btn.href = '#' + key.replace(' ', ':').replace(/[^a-z0-9\:]/gi, '-').replace(/-+/g,'-').replace(/^-|-$/g, "");
            btn.innerHTML = data.text ? data.text.replace(/%s/g, key) : '<i class="' + opt.toolbarIconClass.replace(/%s/g, key) + '"></i>';
        if (data.title[0]) btn.title  = data.title[0];
        if (data.title[1]) btn.title += ' (' + data.title[1] + ')';
        if (is_object(data.attr)) {
            for (var i in data.attr) {
                if (is_string(data.attr[i]) && data.attr[i].slice(0, 2) == '+=') {
                    var attr_o = btn.getAttribute(i) || "";
                    btn.setAttribute(i, attr_o + data.attr[i].slice(2));
                } else {
                    btn.setAttribute(i, data.attr[i]);
                }
            }
        }
        addEvent(btn, "click", function(e) {
            if (is_function(data.click)) {
                var hash = this.hash.replace('#', "");
                button = btn;
                return data.click(e, base), opt.click(e, base, hash), opt.update(e, base, hash), false;
            }
        });
        addEvent(btn, "keydown", function(e) {
            if (_KEY(e, 'escape')) return base.exit(true), false;
        });
        if (is_number(data.position)) {
            pos = data.position < 0 ? data.position + nav.children.length + 1 : data.position - 1;
            nav.insertBefore(btn, nav.children[pos] || null);
        } else {
            nav.appendChild(btn);
        }
        defaults.buttons[key] = data;
    };

    // Toolbar Button Separator
    base.separator = function(data) {
        data = data || {};
        var sep = doc.createElement('span'), pos;
            sep.className = opt.toolbarSeparatorClass;
        if (is_object(data.attr)) {
            for (var i in data.attr) {
                if (is_string(data.attr[i]) && data.attr[i].slice(0, 2) == '+=') {
                    var attr_o = sep.getAttribute(i) || "";
                    sep.setAttribute(i, attr_o + data.attr[i].slice(2));
                } else {
                    sep.setAttribute(i, data.attr[i]);
                }
            }
        }
        if (is_number(data.position)) {
            pos = data.position < 0 ? data.position + nav.children.length + 1 : data.position - 1;
            nav.insertBefore(sep, nav.children[pos] || null);
        } else {
            nav.appendChild(sep);
        }
    };

    // `tidy` method for `Editor` library
    editor.tidy = function(b, v, a, force_tidy) {
        a = is_set(a) ? a : b;
        var s = _SELECTION(), end,
            n_B = b.indexOf('\n') === -1 && s.before.match(/\n$/),
            n_A = a.indexOf('\n') === -1 && s.after.match(/^\n/),
            clean_B = n_B ? s.before : trim_(s.before),
            clean_V = trim(s.value),
            clean_A = n_A ? s.after : _trim(s.after),
            s_B = clean_B.length && !n_B ? b : "",
            s_A = clean_A.length && !n_A ? a : "";
        if (s.value.length && !force_tidy && is_function(v)) return v(s);
        _AREA.value = clean_B + s_B + clean_V + s_A + clean_A;
        end = (clean_B + s_B).length;
        _SELECT(end, end + clean_V.length);
        if (is_function(v)) v(_SELECTION());
    };

    // `toggle` method for `Editor` library
    editor.toggle = function(open, close, callback, placeholder) {
        var s = _SELECTION();
        if (s.before.slice(-open.length) != open && s.after.slice(0, close.length) != close) {
            _WRAP(open, close, !s.value.length && placeholder ? function() {
                _REPLACE(/^/, placeholder === true ? opt.placeholders.text : placeholder, callback);
            } : true);
        } else {
            var clean_B = s.before.slice(-open.length) == open ? s.before.slice(0, -open.length) : s.before,
                clean_A = s.after.slice(0, close.length) == close ? s.after.slice(close.length) : s.after;
            _AREA.value = clean_B + s.value + clean_A;
            _SELECT(clean_B.length, (clean_B + s.value).length, callback || true);
        }
    };

    var  T = 0, btn = opt.buttons,
        _TIDY = editor.tidy,
        _TOGGLE = editor.toggle;

    var toolbars = {
        'bold': {
            title: btn.bold,
            click: function() {
                var strong = opt.STRONG;
                _TIDY(SS, function() {
                    _TOGGLE(strong, strong, true, true);
                });
            }
        },
        'italic': {
            title: btn.italic,
            click: function() {
                var em = opt.EM;
                _TIDY(SS, function() {
                    _TOGGLE(em, em, true, true);
                });
            }
        },
        'quote-right': {
            title: btn.quote,
            click: function() {
                var s = _SELECTION(),
                    quote = opt.BLOCKQUOTE,
                    clean_B = trim_(s.before),
                    clean_V = trim(s.value),
                    clean_A = _trim(s.after),
                    s_B = clean_B.length ? NN : "",
                    placeholder = opt.placeholders.text, end;
                if (clean_V == placeholder) {
                    _SELECT();
                } else {
                    if (!s.before.match(new RegExp(re_BLOCKQUOTE + '$'))) {
                        _TIDY(NN, 1, NN, true);
                    }
                    editor[clean_V.match(new RegExp('^' + re_BLOCKQUOTE)) ? 'outdent' : 'indent'](quote, !s.value.length ? function() {
                        _REPLACE(/^/, opt.placeholders.text);
                    } : true);
                }
            }
        },
        'code': {
            title: btn.code,
            click: function() {
                var s = _SELECTION(),
                    match = '(' + re_PRE + '|\\t| {4})',
                    is_block = s.before.match(new RegExp('(^|\\n)' + match + '?$')),
                    code = opt.CODE,
                    pre = opt.PRE;
                if (is_block) {
                    if (pre.indexOf('%s') === -1) {
                        _TIDY(NN, function() {
                            editor[s.value.match(new RegExp('^' + match)) ? 'outdent' : 'indent'](pre, !s.value.length ? function() {
                                _REPLACE(/^/, opt.placeholders.text);
                            } : true);
                        }, NN, true);
                    } else {
                        var wrap = pre.split('%s');
                        _TIDY(NN, function() {
                            s = _SELECTION();
                            _TOGGLE(wrap[0], (wrap[1] || wrap[0]), true, true);
                        }, NN, !s.before.match(new RegExp(escape(wrap[0]) + '$')));
                    }
                } else {
                    _TIDY(SS, function() {
                        _TOGGLE(code, code, true, true);
                    });
                }
            }
        },
        'header': {
            title: btn.heading,
            click: function() {
                var s = _SELECTION(),
                    h = ["", '#', '##', '###', '####', '#####', '######'],
                    hh = ['=', '-'],
                    clean_B = trim_(s.before.replace(/#+ $/, "")),
                    clean_V = trim(s.value.replace(/#+ | #+|\n+[-=]+/g, "").replace(/\n+/g, ' ')),
                    clean_A = _trim(s.after.replace(/^( #+|\n+[-=]+)/g, "")),
                    s_B = clean_B.length ? NN : "",
                    s_A = clean_A.length ? NN : "", end;
                T = T < h.length - 1 ? T + 1 : 0;
                if (s.value.length) {
                    if (opt.enableSETextHeader && T > 0 && T < 3) {
                        _AREA.value = clean_B + s_B + clean_V + '\n' + clean_V.replace(/./g, hh[T - 1]) + s_A + clean_A;
                        end = (clean_B + s_B).length;
                    } else {
                        var space = T > 0 ? ' ' : "";
                        _AREA.value = clean_B + s_B + h[T] + space + clean_V + (opt.closeATXHeader ? space + h[T] : "") + s_A + clean_A;
                        end = (clean_B + s_B + h[T] + space).length;
                    }
                    _SELECT(end, end + clean_V.length, true);
                } else {
                    var placeholder = opt.placeholders.heading_text;
                    T = 1;
                    if (opt.enableSETextHeader) {
                        _AREA.value = clean_B + s_B + placeholder + '\n' + placeholder.replace(/./g, hh[T - 1]) + s_A + clean_A;
                        end = (clean_B + s_B).length;
                        _SELECT(end, end + placeholder.length, true);
                    } else {
                        _TIDY(NN, function() {
                            _WRAP(h[T] + ' ', (opt.closeATXHeader ? ' ' + h[T] : ""), function() {
                                _REPLACE(/^/, placeholder);
                            });
                        }, NN, true);
                    }
                }
            }
        },
        'link': {
            title: btn.link,
            click: function(e) {
                var s = _SELECTION(),
                    title, url, placeholder = opt.placeholders.link_text;
                _UPDATE_HISTORY(); // save text selection ...
                base.prompt(opt.prompts.link_url_title, opt.prompts.link_url, true, function(r) {
                    url = r;
                    base.prompt(opt.prompts.link_title_title, opt.prompts.link_title, false, function(r) {
                        title = r.replace(/'/g, '&apos;').replace(/"/g, '&quot;');
                        _TIDY(SS, function() {
                            _WRAP('[', '](' + url + (title !== "" ? ' \"' + title + '\"' : "") + ')', !s.value.length ? function() {
                                _REPLACE(/^/, placeholder);
                            } : true);
                        });
                        opt.update(e, base);
                    });
                });
            }
        },
        'image': {
            title: btn.image,
            click: function(e) {
                var url, title;
                _UPDATE_HISTORY(); // save text selection ...
                base.prompt(opt.prompts.image_url_title, opt.prompts.image_url, true, function(r) {
                    url = r;
                    base.prompt(opt.prompts.image_title_title, opt.prompts.image_title, false, function(r) {
                        title = r.replace(/"/g, '&quot;');
                        _TIDY(NN, function() {
                            var s = _SELECTION(),
                                alt = trim(s.value.length ? s.value : decodeURIComponent(
                                    url.split('/').pop().replace(/\..*$/, "").replace(/[-+._]/g, ' ')
                                ).toLowerCase().replace(/(?:^|\s)\S/g, function(a) {
                                    return a.toUpperCase();
                                }));
                            if (!alt.length) alt = opt.placeholders.image_alt;
                            _INSERT('![' + alt + '](' + url + (title !== "" ? ' "' + title + '"' : "") + ')', function() {
                                s = _SELECTION();
                                if (!s.after.length) _AREA.value += NN;
                                _SELECT(s.end + 2, true);
                            });
                        }, NN, true);
                        opt.update(e, base);
                    });
                });
            }
        },
        'list-ol': {
            title: btn.ol,
            click: function() {
                var s = _SELECTION(),
                    placeholder = opt.placeholders.list_ol_text,
                    ol = 0;
                if (s.value.length) {
                    if (s.value == placeholder) {
                        _SELECT();
                    } else {
                        _TIDY(NN, function() {
                            if (!s.value.match(new RegExp('^\\s*' + re_OL))) {
                                _INDENT("", function() {
                                    _REPLACE(new RegExp('(^|\\n) *' + re_UL + ' *', 'g'), '$1', noop);
                                    _REPLACE(/^[^\n]/gm, function(str) {
                                        ol++;
                                        return str.replace(/^/, ' ' + opt.OL.replace(/%d/g, ol));
                                    });
                                });
                            } else {
                                _OUTDENT(' *' + re_OL, true, true);
                            }
                        }, NN, true);
                    }
                } else {
                    if (!s.before.match(/(^|\n)$/)) {
                        var match = new RegExp('(^|\\n) *' + re_OL + '(.*?)$'),
                            clean_B = s.before.replace(match, '$1$2');
                        if (!s.before.match(match)) {
                            var e = new RegExp('(?:^|\\n) *(' + re_OL + ').*?\n.*?$').exec(s.before),
                                OL = ' ' + opt.OL.replace(/%d/g, e && e[1] ? parseInt(e[1], 10) + 1 : 1);
                            s.before = s.before.replace(new RegExp('(^|\\n) *' + re_UL + '(.*?)$'), '$1$2').replace(/(^|\n)(.*?)$/, '$1' + OL + '$2');
                            _AREA.value = s.before + s.after;
                            _SELECT(s.before.length, true);
                        } else {
                            _AREA.value = clean_B + s.after;
                            _SELECT(clean_B.length, true);
                        }
                    } else {
                        var OL = ' ' + opt.OL.replace(/%d/g, 1);
                        _TIDY(NN, function() {
                            _INSERT(OL + placeholder, function() {
                                s = _SELECTION();
                                _SELECT(s.end - placeholder.length, s.end, true);
                            });
                        }, NN, true);
                    }
                }
            }
        },
        'list-ul': {
            title: btn.ul,
            click: function() {
                var s = _SELECTION(),
                    placeholder = opt.placeholders.list_ul_text,
                    UL = ' ' + opt.UL;
                if (s.value.length) {
                    if (s.value == placeholder) {
                        _SELECT();
                    } else {
                        _TIDY(NN, function() {
                            _REPLACE(new RegExp('(^|\\n) *' + re_OL + ' *', 'g'), '$1', noop);
                            if (s.value.match(new RegExp('^\\s*' + re_UL))) {
                                editor.outdent(' *' + re_UL, true, true);
                            } else {
                                editor.indent(UL);
                            }
                        }, NN, true);
                    }
                } else {
                    if (!s.before.match(/(^|\n)$/)) {
                        var match = new RegExp('(^|\\n) *' + re_UL + '(.*?)$'),
                            clean_B = s.before.replace(match, '$1$2');
                        if (!s.before.match(match)) {
                            s.before = s.before.replace(new RegExp('(^|\\n) *' + re_OL + '(.*?)$'), '$1$2').replace(/(^|\n) *(.*?)$/, '$1' + UL + '$2');
                            _AREA.value = s.before + s.after;
                            _SELECT(s.before.length, true);
                        } else {
                            _AREA.value = clean_B + s.after;
                            _SELECT(clean_B.length, true);
                        }
                    } else {
                        _TIDY(NN, function() {
                            _INSERT(UL + placeholder, function() {
                                s = _SELECTION();
                                _SELECT(s.end - placeholder.length, s.end, true);
                            });
                        }, NN, true);
                    }
                }
            }
        },
        'ellipsis-h': {
            title: btn.rule,
            click: function() {
                _TIDY(NN, function() {
                    _INSERT(opt.HR, function() {
                        var s = _SELECTION();
                        if (!s.after.length) _AREA.value += NN;
                        _SELECT(s.end + 2, true);
                    });
                }, NN, true);
            }
        },
        'undo': {
            title: btn.undo,
            click: editor.undo
        },
        'repeat': {
            title: btn.redo,
            click: editor.redo
        }
    };

    for (var i in toolbars) base.button(i, toolbars[i]);

    addEvent(_AREA, "focus", base.exit);

    addEvent(_AREA, "copy", function(e) {
        var s = _SELECTION();
        _TIMER(function() {
            opt.copy(s), opt.update(e, base);
        }, .1);
    });

    addEvent(_AREA, "cut", function(e) {
        var s = _SELECTION();
        _TIMER(function() {
            s.end = s.start;
            opt.cut(s), opt.update(e, base), _UPDATE_HISTORY();
        }, .1);
    });

    addEvent(_AREA, "paste", function(e) {
        var s = _SELECTION();
        _TIMER(function() {
            s.end = _SELECTION().end;
            s.value = _AREA.value.substring(s.start, s.end);
            opt.paste(s), opt.update(e, base), _UPDATE_HISTORY();
        }, .1);
    });

    addEvent(_AREA, "keydown", function(e) {

        var s = _SELECTION(),
            sb = s.before,
            sv = s.value,
            sa = s.after,
            ss = s.start,
            se = s.end,
            k = _KEY(e),
            ctrl = e.ctrlKey,
            shift = e.shiftKey,
            alt = e.altKey,
            tab = k == 'tab';

        _TIMER(function() {
            opt.keydown(e, base), opt.update(e, base);
        }, .1);

        for (var i in base.shortcuts) {
            var shc = i.replace(/\+/g, '\n').replace(/\n\n/g, '\n+').split(/\n/),
                valid = 0;
            for (var j in shc) {
                if (
                    shc[j].match(/^ctrl|control|command|cmd|meta$/) && ctrl ||
                    shc[j] == 'shift' && shift ||
                    shc[j].match(/^alt(ernate)?|option$/) && alt ||
                    shc[j] == 'tab' && tab ||
                    shc[j] == k
                ) valid++;
            }
            if (valid === shc.length) return base.shortcuts[i](e, base);
        }

        var b = sb, a = sa[0], esc = b.slice(-1) == '\\';

        if (opt.autoComplete && !esc) {

            // Disable the end bracket key if character before
            // cursor is match with character after cursor
            if (
                k == a && (
                    b.indexOf('(') !== -1 && a == ')' ||
                    b.indexOf('{') !== -1 && a == '}' ||
                    b.indexOf('[') !== -1 && a == ']' ||
                    b.indexOf('<') !== -1 && a == '>' ||
                    b.indexOf('"') !== -1 && a == '"' ||
                    b.indexOf("'") !== -1 && a == "'" ||
                    b.indexOf('`') !== -1 && a == '`'
                )
            ) {
                return _SELECT(se + 1), false; // move caret by 1 character to the right
            }

            // Auto close for `(`
            if (k == '(') return insert('(' + sv + ')', s);

            // Auto close for `{`
            if (k == '{') return insert('{' + sv + '}', s);

            // Auto close for `[`
            if (k == '[') return insert('[' + sv + ']', s);

            // Auto close for `<`
            if (k == '<') return insert('<' + sv + '>', s);

            // Auto close for `"`
            if (k == '"') return insert('"' + sv + '"', s);

            if (!sb.match(/\w$/)) {

                // Auto close for `'`
                if (k == "'") return insert("'" + sv + "'", s);

                // Auto close for ```
                if (k == '`') return insert('`' + sv + '`', s);

            }

        }

        // `Shift + Tab` to "outdent"
        var indented = '( *' + re_OL + '| *' + re_UL + '| *' + re_BLOCKQUOTE + '|' + re_TAB + ')';
        if (shift && tab) return _OUTDENT(opt.toolbar ? indented : re_TAB, true, true), false;

        if (tab) {
            // Auto close for HTML tags
            // Case `<div|>`
            if (sb.match(/<[^\/>]*?$/) && sa[0] == '>') {
                var match = /<([^\/>]*?)$/.exec(sb), m1 = match[1].split(' ')[0];
                if (m1.match(/^br|hr|img|input|link|meta$/)) {
                    _AREA.value = sb + ' ' + opt.emptyElementSuffix + sa.substring(1);
                } else {
                    _AREA.value = sb + ' ></' + m1 + sa;
                }
                return _SELECT(ss + 1, true), false;
            }
            // `Tab` to "indent"
            return _INDENT(opt.tabSize), false;
        }

        // `Ctrl + Z` to "undo"
        if (ctrl && k == 'z') return editor.undo(), false;

        // `Ctrl + Y` to "redo"
        if (ctrl && k == 'y') return editor.redo(), false;

        if (opt.toolbar && opt.shortcut && ctrl) {

            // `Ctrl + B` for "bold"
            if (k == 'b') return toolbars.bold.click(), false;

            // `Ctrl + G` for "image"
            if (k == 'g') return toolbars.image.click(), false;

            // `Ctrl + H` for "heading"
            if (k == 'h') return toolbars.header.click(), false;

            // `Ctrl + I` for "italic"
            if (k == 'i') return toolbars.italic.click(), false;

            // `Ctrl + K` for "code"
            if (!shift && k == 'k') return toolbars.code.click(), false;

            // `Ctrl + L` for "link"
            if (k == 'l') return toolbars.link.click(), false;

            // `Ctrl + Q` for "blockquote"
            if (k == 'q') return toolbars['quote-right'].click(), false;

            // `Ctrl + R` for "horizontal rule"
            if (k == 'r') return toolbars['ellipsis-h'].click(), false;

            // `Ctrl + +` for "ordered list"
            if (k == '+') return toolbars['list-ol'].click(), false;

            // `Ctrl + -` for "unordered list"
            if (k == '-') return toolbars['list-ul'].click(), false;

        }

        // Add a space at the beginning of the list item when user starts
        // pressing the space bar after typing `1.` or `*` or `-` or `+`
        if (opt.toolbar && k == ' ') {
            var match = '(^|\\n)(' + trim_(re_OL) + '|' + trim_(re_UL) + ')';
            if (sb.match(new RegExp(match + '$'))) {
                _AREA.value = sb.replace(new RegExp(match + '$'), '$1 $2 ') + sv + sa;
                return _SELECT(se + 2, true), false;
            }
        }

        // `Enter` key was pressed
        if (k == 'enter') {

            // `Alt + Enter` for creating carriage return arrow
            if (alt && !sv.length) return _INSERT(_u21B5), false;

            // Automatic list (+blockquote) increment
            if (opt.toolbar) {
                var mm = '( *)(' + re_OL + '|' + re_UL + '|(?:' + re_BLOCKQUOTE + ')+)( *)',
                    match = new RegExp('(?:^|\\n)' + mm + '(.*?)$');
                if (sb.match(match)) {
                    var take = match.exec(sb),
                        list = new RegExp(re_OL).test(take[2]) ? opt.OL.replace(/%d/g, (parseInt(take[2], 10) + 1)) : take[2]; // `<ol>` or `<ul>` ?
                    if (take[4] === "") {
                        _OUTDENT(mm, true, true);
                    } else {
                        _INSERT('\n' + take[1] + list + take[3], true);
                    }
                    return base.scroll(), false;
                }
            }

            // Automatic indentation
            if (opt.autoIndent) {
                var indent_B = (new RegExp('(?:^|\\n)((' + re_TAB + ')+)(.*?)$')).exec(sb),
                    indent = indent_B ? indent_B[1] : "";
                if (sb.match(/[\(\{\[]$/) && sa.match(/^[\]\}\)]/) || sb.match(/<[^\/]*?>$/) && sa.match(/^<\//)) {
                    return _INSERT('\n' + indent + re_TAB + '\n' + indent, function() {
                        _SELECT(ss + (indent + opt.tabSize).length + 1, true);
                    }), base.scroll(), false;
                }
                if (sb.match(new RegExp(re_TAB + '.*?$'))) {
                    return _INSERT('\n' + indent), base.scroll(), false;
                }
            }

        }

        var type = {
            "'": _u2019,
            '"': _u201D,
            '---': _u2014,
            '--': _u2013,
            '...': _u2026,
            '|': _u00A6,
            '(c)': _u00A9,
            '(C)': _u00A9,
            '(p)': _u2117,
            '(P)': _u2117,
            '(sm)': _u2120,
            '(SM)': _u2120,
            ' sm': _u2120,
            ' SM': _u2120,
            '(tm)': _u2122,
            '(TM)': _u2122,
            ' tm': _u2122,
            ' TM': _u2122,
            '(r)': _u00AE,
            '(R)': _u00AE,
            '+-': _u00B1,
            '-+': _u00B1,
            'x': _u00D7,
            '/': _u00F7,
            '^': _u00B0,
            '<<': _u00AB,
            '>>': _u00BB,
            '<': _u2039,
            '>': _u203A,
            '<=': _u2264,
            '>=': _u2265,
            '!=': _u2260,
            'No.': _u2116,
            'NO.': _u2116,
            'no.': _u2116,
            '.': _u00B7
        };

        if (sv.length) {

            if (alt) {

                // Convert some combination of printable characters
                // into their corresponding Unicode characters
                _REPLACE(/'([^']*?)'/g, _u2018 + '$1' + _u2019, noop);
                _REPLACE(/"([^"]*?)"/g, _u201C + '$1' + _u201D, noop);
                for (var i in type) {
                    _REPLACE(new RegExp(escape(i), 'g'), type[i], noop);
                }
                return _UPDATE_HISTORY(), false;

            }

        } else {

            if (alt) {

                if (sb.indexOf('"') !== -1 && sa[0] == '"') {
                    _AREA.value = sb.replace(/"([^"]*?)$/, _u201C + '$1') + _u201D + sa.slice(1);
                    return _SELECT(se, true), false;
                }

                if (sb.indexOf("'") !== -1 && sa[0] == "'") {
                    _AREA.value = sb.replace(/'([^']*?)$/, _u2018 + '$1') + _u2019 + sa.slice(1);
                    return _SELECT(se, true), false;
                }

                if (sb.slice(-2).match(/\w'$/i)) {
                    _AREA.value = sb.slice(0, -1) + _u2019 + sa;
                    return _SELECT(se, true), false;
                }

                if (sb.slice(-2).match(/(^|\W)'$/i)) {
                    _AREA.value = sb.slice(0, -1) + _u2018 + sa;
                    return _SELECT(se, true), false;
                }

                if (sb.match(/\((c|p|sm|tm|r)$/i) && sa[0] == ')') {
                    var s_ = sb.match(/\((sm|tm)$/i) ? 2 : 1;
                    _AREA.value = sb.slice(0, -(s_ + 1)) + type['(' + sb.slice(-s_).toLowerCase() + ')'] + sa.slice(1);
                    return _SELECT(se - s_, true), false;
                }

                var _sb = sb.replace(/&lt;/g, '<').replace(/&gt;/g, '>'),
                    _sa = sa.replace(/&lt;/g, '<').replace(/&gt;/g, '>');

                if (_sb.indexOf('<<') !== -1 && _sa.indexOf('>>') === 0) {
                    _AREA.value = sb.replace(/(?:<<|&lt;&lt;)([^<]*)$/, _u00AB + '$1') + sa.replace(/^(?:>>|&gt;&gt;)/, _u00BB);
                    return _SELECT(_sb.length - 1, true), false;
                }

                if (_sb.indexOf('<') !== -1 && _sa.indexOf('>') === 0) {
                    _AREA.value = sb.replace(/(?:<|&lt;)([^<]*)$/, _u2039 + '$1') + sa.replace(/^(?:>|&gt;)/, _u203A);
                    return _SELECT(_sb.length, true), false;
                }

                // Convert some combination of printable characters
                // into their corresponding Unicode characters
                for (var i in type) {
                    if (sb.slice(-i.length) == i) {
                        _AREA.value = sb.slice(0, -i.length) + type[i] + sa;
                        return _SELECT(ss - i.length + 1, true), false;
                    }
                }

                // `Alt + Arrow Key(s)` for creating arrows
                if (k == 'arrowleft') return _INSERT(_u2190), false;
                if (k == 'arrowup') return _INSERT(_u2191), false;
                if (k == 'arrowright') return _INSERT(_u2192), false;
                if (k == 'arrowdown') return _INSERT(_u2193), false;

            }

            // `Delete` was pressed
            if (k == 'delete') {

                // Remove HTML tag quickly
                if (sa.match(/^<\/[^\n>]*?>/)) {
                    _AREA.value = sb + sa.replace(/^<\/[^\n>]*?>/, "");
                    return _SELECT(ss, true), false;
                }

            }

            // `Backspace` was pressed
            if (k == 'backspace') {

                // Remove empty list item (+blockquote) quickly
                if (opt.toolbar) {
                    var match = '( *' + re_OL + '| *' + re_UL + '|(?:> )+)';
                    if (sb.match(new RegExp('^' + match + '$', 'm'))) {
                        return _OUTDENT(match, true, true), false;
                    }
                }

                // Remove indentation quickly
                if (sb.match(new RegExp('(^|\\n)(' + re_TAB + ')+$'))) return _OUTDENT(opt.tabSize), false;

                // Remove HTML tag quickly
                if (sb.match(/<\/?[^\n>]*?>$/)) return _OUTDENT('<\\/?[^\\n>]*?>', true, true), false;

                // Remove closing bracket and quotes quickly
                switch (sb.slice(-1)) {
                    case '(': return _TOGGLE('(', ')'), false;
                    case '{': return _TOGGLE('{', '}'), false;
                    case '[': return _TOGGLE('[', ']'), false;
                    case '<': return _TOGGLE('<', '>'), false;
                    case '"': return _TOGGLE('"', '"'), false;
                    case "'": return _TOGGLE("'", "'"), false;
                    case ' ': return _TOGGLE(' ', ' '), false; // trim white-spaces
                    case _u201C: return _TOGGLE(_u201C, _u201D), false;
                    case _u2018: return _TOGGLE(_u2018, _u2019), false;
                    case _u00AB: return _TOGGLE(_u00AB, _u00BB), false;
                    case _u2039: return _TOGGLE(_u2039, _u203A), false;
                }

            }

        }

        // `Esc` to release focus from `<textarea>`
        if (k == 'escape') return release.focus(), false;

        if (!ctrl && !shift && !alt) {
            _TIMER(_UPDATE_HISTORY, .1);
        }

    });

    // Add a class to the `<textarea>` element
    var test = new RegExp('(^|\\s)' + opt.areaClass + '(\\s|$)'),
        c = _AREA.className;
    if (!c.match(test)) {
        _AREA.className = trim(c + ' ' + opt.areaClass);
    }

    opt.ready(base);

    // Make all selection method becomes accessible outside the plugin
    base.grip = editor;
    base.grip.config = opt;

};