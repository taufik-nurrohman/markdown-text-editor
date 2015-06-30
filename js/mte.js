/*!
 * ----------------------------------------------------------
 *  MARKDOWN TEXT EDITOR PLUGIN 1.4.0
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
        _u00B7 = '\u00B7', // middle dot

        base = this,
        win = window,
        doc = document,
        editor = new Editor(elem),
        defaults = {
            tabSize: '    ',
            toolbar: true,
            shortcut: false,
            areaClass: 'editor-area',
            toolbarClass: 'editor-toolbar',
            toolbarIconClass: 'fa fa-%s',
            toolbarButtonClass: 'editor-toolbar-button editor-toolbar-button-%s',
            toolbarSeparatorClass: 'editor-toolbar-separator',
            toolbarPosition: "before", // before or after `<textarea>` ?
            dropClass: 'custom-drop custom-%s-drop',
            modalClass: 'custom-modal custom-modal-%s',
            modalHeaderClass: 'custom-modal-header custom-modal-%s-header',
            modalContentClass: 'custom-modal-content custom-modal-%s-content',
            modalFooterClass: 'custom-modal-action custom-modal-%s-action',
            modalOverlayClass: 'custom-modal-overlay custom-modal-%s-overlay',
            closeATXHeaders: false, // `true` for `#### Heading ####`
            STRONG: '**',
            EM: '_',
            UL: '- ',
            OL: '%d. ',
            HR: '---',
            CODE: '`',
            PRE: '    ', // Use ~~~\n%s\n~~~ or ```\n%s\n``` to enable fenced code block syntax in "Markdown Extra"
            buttons: {
                ok: 'OK',
                yes: 'Yes',
                no: 'No',
                cancel: 'Cancel',
                open: 'Open',
                close: 'Close',
                bold: 'Bold',
                italic: 'Italic',
                code: 'Code',
                quote: 'Quote',
                heading: 'H1 ' + _u2013 + ' H6',
                link: 'Link',
                image: 'Image',
                ol: 'Ordered List',
                ul: 'Unordered List',
                rule: 'Horizontal Rule',
                undo: 'Undo',
                redo: 'Redo'
            },
            prompts: {
                link_title: 'link title goes here' + _u2026,
                link_title_title: 'Link Title',
                link_url: 'http://',
                link_url_title: 'Link URL',
                image_url: 'http://',
                image_url_title: 'Image URL'
            },
            placeholders: {
                text: 'text goes here' + _u2026,
                heading_text: 'Heading',
                link_text: 'link text',
                list_ul_text: 'List item',
                list_ol_text: 'List item',
                image_alt: 'Image'
            },
            update: function() {},
            keydown: function() {},
            click: function() {},
            ready: function() {},
            copy: function() {},
            cut: function() {},
            paste: function() {}
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
        noop = function() {},

        // Rewrite some methods for better JS minification
        _AREA = elem,
        _INDENT = editor.indent,
        _INSERT = editor.insert,
        _OUTDENT = editor.outdent,
        _REPLACE = editor.replace,
        _SELECT = editor.select,
        _SELECTION = editor.selection,
        _UPDATE_HISTORY = editor.updateHistory,
        _WRAP = editor.wrap;

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
        if(is_function(elem[event])) {
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
        _INSERT(str, function() {
            _SELECT(s.end + 1, _UPDATE_HISTORY);
        });
        return false;
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

    // Access the Generated DOM
    base.DOM = {
        overlay: overlay,
        modal: modal,
        drop: drop
    };

    // Escapes for `RegExp()`
    var re_UL = escape(opt.UL).replace(/\\[-+*]/g, '[-+*]'),
        re_OL = escape(opt.OL).replace(/%d/g, '[0-9]+'),
        re_TAB = escape(opt.tabSize),
        re_PRE = escape(opt.PRE);

    // Base Shortcut
    base.shortcuts = [];
    base.shortcut = function(code, callback) {
        base.shortcuts[code.toLowerCase()] = callback;
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
        page.appendChild(overlay);
        page.appendChild(modal);
        win.setTimeout(function() {
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
        }, 10);
        if (is_function(callback)) callback(overlay, modal);
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
        page.appendChild(drop);
        win.setTimeout(function() {
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
        }, 10);
        if (is_function(callback)) callback(drop);
    };

    // Custom Prompt Modal
    base.prompt = function(title, value, required, callback, offset) {
        base.modal('prompt', function(o, m) {
            var success = function(value) {
                if (is_function(callback)) {
                    base.close();
                    callback(value);
                } else {
                    base.close(true);
                }
            };
            var input = doc.createElement('input');
                input.type = 'text';
                input.value = value;
            addEvent(input, "keydown", function(e) {
                var k = e.keyCode;
                if (k == 27) return base.close(true), false;
                if (k == 40) return OK.focus(), false;
                if (required) {
                    if (k == 13 && this.value !== "" && this.value !== value) {
                        return success(this.value), false;
                    }
                } else {
                    if (k == 13) {
                        return success(this.value == value ? "" : this.value), false;
                    }
                }
            });
            var OK = doc.createElement('button');
                OK.innerHTML = opt.buttons.ok;
            addEvent(OK, "click", function() {
                if (required) {
                    if (input.value !== "" && input.value !== value) success(input.value);
                } else {
                    success(input.value == value ? "" : input.value);
                }
                return false;
            });
            var CANCEL = doc.createElement('button');
                CANCEL.innerHTML = opt.buttons.cancel;
            addEvent(CANCEL, "click", function() {
                return base.close(true), false;
            });
            addEvent(OK, "keydown", function(e) {
                var k = e.keyCode;
                if (k == 27) return base.close(true), false;
                if (k == 38) return input.focus(), false;
                if (k == 39) return CANCEL.focus(), false;
            });
            addEvent(CANCEL, "keydown", function(e) {
                var k = e.keyCode;
                if (k == 27) return base.close(true), false;
                if (k == 37) return OK.focus(), false;
                if (k == 38) return input.focus(), false;
            });
            m.children[0].innerHTML = title ? title : "";
            m.children[1].appendChild(input);
            m.children[2].appendChild(OK);
            m.children[2].appendChild(doc.createTextNode(' '));
            m.children[2].appendChild(CANCEL);
            win.setTimeout(function() {
                input.select();
            }, 10);
        }, offset);
    };

    // Custom Alert Modal
    base.alert = function(title, message, callback, offset) {
        base.modal('alert', function(o, m) {
            var OK = doc.createElement('button');
                OK.innerHTML = opt.buttons.ok;
            addEvent(OK, "click", function() {
                if (is_function(callback)) {
                    base.close();
                    callback();
                } else {
                    base.close(true);
                }
                return false;
            });
            addEvent(OK, "keydown", function(e) {
                if (e.keyCode == 27) return base.close(true), false;
            });
            m.children[0].innerHTML = title ? title : "";
            m.children[1].innerHTML = message ? message : "";
            m.children[2].appendChild(OK);
            win.setTimeout(function() {
                OK.focus();
            }, 10);
        }, offset);
    };

    // Custom Confirm Modal
    base.confirm = function(title, message, callback, offset) {
        base.modal('confirm', function(o, m) {
            var OK = doc.createElement('button');
                OK.innerHTML = opt.buttons.ok;
            addEvent(OK, "click", function() {
                if (is_set(callback)) {
                    if (is_function(callback.OK)) {
                        base.close();
                        callback.OK();
                    } else {
                        base.close(true);
                    }
                } else {
                    base.close(true);
                }
                return false;
            });
            var CANCEL = doc.createElement('button');
                CANCEL.innerHTML = opt.buttons.cancel;
            addEvent(CANCEL, "click", function() {
                if (is_set(callback)) {
                    if (is_function(callback.CANCEL)) {
                        base.close();
                        callback.CANCEL();
                    } else {
                        base.close(true);
                    }
                } else {
                    base.close(true);
                }
                return false;
            });
            addEvent(OK, "keydown", function(e) {
                var k = e.keyCode;
                if (k == 27) return base.close(true), false;
                if (k == 39) return CANCEL.focus(), false;
            });
            addEvent(CANCEL, "keydown", function(e) {
                var k = e.keyCode;
                if (k == 27) return base.close(true), false;
                if (k == 37) return OK.focus(), false;
            });
            m.children[0].innerHTML = title ? title : "";
            m.children[1].innerHTML = message ? message : "";
            m.children[2].appendChild(OK);
            m.children[2].appendChild(doc.createTextNode(' '));
            m.children[2].appendChild(CANCEL);
            win.setTimeout(function() {
                CANCEL.focus();
            }, 10);
        }, offset);
    };

    // Close Drop and Modal
    base.close = function(select) {
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
        base.close(true);
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
        _AREA.parentNode.insertBefore(nav, opt.toolbarPosition == "before" ? _AREA : null);
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
        var btn = doc.createElement('a'), pos;
            btn.className = opt.toolbarButtonClass.replace(/%s/g, key);
            btn.setAttribute('tabindex', -1);
            btn.href = '#' + key.replace(' ', ':').replace(/[^a-z0-9\:]/gi, '-').replace(/-+/g,'-').replace(/^-|-$/g, "");
            btn.innerHTML = data.text ? data.text.replace(/%s/g, key) : '<i class="' + opt.toolbarIconClass.replace(/%s/g, key) + '"></i>';
        if (data.title) btn.title = data.title;
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
                base.close();
                button = btn;
                data.click(e, base);
                opt.click(e, base, hash);
                opt.update(e, base, hash);
                return false;
            }
        });
        addEvent(btn, "keydown", function(e) {
            if (e.keyCode == 27) return base.close(true), false;
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

    editor.toggle = function(open, close, callback, placeholder) {
        var s = _SELECTION();
        if (s.before.slice(-open.length) != open && s.after.slice(0, close.length) != close) {
            _WRAP(open, close, (s.value.length === 0 && placeholder ? function() {
                _REPLACE(/^.*$/, placeholder === true ? opt.placeholders.text : placeholder);
            } : 1));
        } else {
            var clean_B = s.before.slice(-open.length) == open ? s.before.slice(0, -open.length) : s.before,
                clean_A = s.after.slice(0, close.length) == close ? s.after.slice(close.length) : s.after;
            _AREA.value = clean_B + s.value + clean_A;
            _SELECT(clean_B.length, clean_B.length + s.value.length, _UPDATE_HISTORY);
        }
        if (is_function(callback)) callback();
    };

    var _TOGGLE = editor.toggle, T = 0, btn = opt.buttons;

    var toolbars = {
        'bold': {
            title: btn.bold,
            click: function() {
                var strong = opt.STRONG;
                _TOGGLE(strong, strong, 1, true);
            }
        },
        'italic': {
            title: btn.italic,
            click: function() {
                var em = opt.EM;
                _TOGGLE(em, em, 1, true);
            }
        },
        'code': {
            title: btn.code,
            click: function() {
                var v = _SELECTION().value,
                    code = opt.CODE,
                    pre = opt.PRE;
                if (v.indexOf('\n') !== -1 && v.length > 0) {
                    if (pre.indexOf('%s') === -1) {
                        var match = '(' + re_PRE + '|\\t| {4})';
                        editor[v.match(new RegExp('^' + match)) ? 'outdent' : 'indent'](pre);
                    } else {
                        var wrap = pre.split('%s');
                        _TOGGLE(wrap[0], wrap[1] || wrap[0]);
                    }
                } else {
                    _TOGGLE(code, code, 1, true);
                }
            }
        },
        'quote-right': {
            title: btn.quote,
            click: function() {
                var s = _SELECTION(),
                    clean_B = trim_(s.before),
                    clean_V = trim(s.value),
                    clean_A = _trim(s.after),
                    s_B = clean_B.length > 0 ? '\n\n' : "",
                    placeholder = opt.placeholders.text, end;
                if (clean_V == placeholder) {
                    _SELECT(s.start, s.end);
                } else {
                    if (clean_V.length > 0) {
                        editor[clean_V[0] == '>' ? 'outdent' : 'indent']('> ');
                    } else {
                        _AREA.value = clean_B + s_B + '> ' + placeholder + '\n\n' + clean_A;
                        end = clean_B.length + s_B.length + 2;
                        _SELECT(end, end + placeholder.length, _UPDATE_HISTORY);
                    }
                }
            }
        },
        'header': {
            title: btn.heading,
            click: function() {
                var s = _SELECTION(),
                    h = ["", '=', '-', '###', '####', '#####', '######'],
                    clean_B = trim_(s.before.replace(/#+ $/, "")),
                    clean_V = trim(s.value.replace(/#+ | #+|\n+[-=]+/g, "").replace(/\n+/g, ' ')),
                    clean_A = _trim(s.after.replace(/^( #+|\n+[-=]+)/g, "")),
                    s_B = clean_B.length > 0 ? '\n\n' : "", end;
                T = T < h.length - 1 ? T + 1 : 0;
                if (s.value.length > 0) {
                    if (T > 0 && T < 3) {
                        _AREA.value = clean_B + s_B + clean_V + '\n' + clean_V.replace(/./g, h[T]) + '\n\n' + clean_A;
                        end = clean_B.length + s_B.length;
                        _SELECT(end, end + clean_V.length, _UPDATE_HISTORY);
                    } else {
                        var space = T > 0 ? ' ' : "";
                        _AREA.value = clean_B + s_B + h[T] + space + clean_V + (opt.closeATXHeaders ? space + h[T] : "") + '\n\n' + clean_A;
                        end = clean_B.length + s_B.length + h[T].length + space.length;
                        _SELECT(end, end + clean_V.length, _UPDATE_HISTORY);
                    }
                } else {
                    var placeholder = opt.placeholders.heading_text;
                    T = 1;
                    _AREA.value = clean_B + s_B + placeholder + '\n' + placeholder.replace(/./g, h[T]) + '\n\n' + clean_A;
                    end = clean_B.length + s_B.length;
                    _SELECT(end, end + placeholder.length, _UPDATE_HISTORY);
                }
            }
        },
        'link': {
            title: btn.link,
            click: function(e) {
                var s = _SELECTION(),
                    title, url, placeholder = opt.placeholders.link_text;
                base.prompt(opt.prompts.link_url_title, opt.prompts.link_url, true, function(r) {
                    url = r;
                    base.prompt(opt.prompts.link_title_title, opt.prompts.link_title, false, function(r) {
                        title = r.replace(/'/g, '&apos;').replace(/"/g, '&quot;');
                        _WRAP('[', '](' + url + (title !== "" ? ' \"' + title + '\"' : "") + ')', (s.value.length === 0 ? function() {
                            _REPLACE(/^/, placeholder);
                        } : 1));
                        opt.update(e, base);
                    });
                });
            }
        },
        'image': {
            title: btn.image,
            click: function(e) {
                base.prompt(opt.prompts.image_url_title, opt.prompts.image_url, true, function(r) {
                    var s = _SELECTION(),
                        clean_B = trim_(s.before),
                        clean_A = _trim(s.after),
                        s_B = clean_B.length > 0 ? '\n\n' : "",
                        alt = decodeURIComponent(
                            r.substring(
                                r.lastIndexOf('/') + 1, r.lastIndexOf('.')
                            ).replace(/[-+._]+/g, ' ')
                        ).toLowerCase().replace(/(?:^|\s)\S/g, function(a) {
                            return a.toUpperCase();
                        });
                    alt = alt.indexOf('/') === -1 && r.indexOf('.') !== -1 ? alt : opt.placeholders.image_alt;
                    _AREA.value = clean_B + s_B + '![' + alt + '](' + r + ')\n\n' + clean_A;
                    _SELECT(clean_B.length + s_B.length + 2 + alt.length + 2 + r.length + 3, function() {
                        opt.update(e, base), _UPDATE_HISTORY();
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
                if (s.value.length > 0) {
                    if (s.value == placeholder) {
                        _SELECT(s.start, s.end);
                    } else {
                        if (!s.value.match(new RegExp('^ *' + re_OL))) {
                            _INDENT("", function() {
                                _REPLACE(new RegExp('(^|\\n) *' + re_UL + ' *', 'g'), '$1', noop);
                                _REPLACE(/^[^\n]/gm, function(str) {
                                    ol++;
                                    return str.replace(/^/, ' ' + opt.OL.replace(/%d/g, ol));
                                });
                            });
                        } else {
                            _OUTDENT(' *' + re_OL, 1, true);
                        }
                    }
                } else {
                    if (!s.before.match(/(^|\n{2,})$/)) {
                        var match = new RegExp('(^|\\n) *' + re_OL + '(.*?)$'),
                            clean_B = s.before.replace(match, '$1$2');
                        if (!s.before.match(match)) {
                            var e = new RegExp('(?:^|\\n) *(' + re_OL + ').*?\n.*?$').exec(s.before),
                                OL = ' ' + opt.OL.replace(/%d/g, e && e[1] ? parseInt(e[1], 10) + 1 : 1);
                            s.before = s.before.replace(new RegExp('(^|\\n) *' + re_UL + '(.*?)$'), '$1$2').replace(/(^|\n)(.*?)$/, '$1' + OL + '$2');
                            _AREA.value = s.before + s.after;
                            _SELECT(s.before.length, _UPDATE_HISTORY);
                        } else {
                            _AREA.value = clean_B + s.after;
                            _SELECT(clean_B.length, _UPDATE_HISTORY);
                        }
                    } else {
                        var s_B = s.before.length > 0 ? '\n\n' : "",
                            OL = ' ' + opt.OL.replace(/%d/g, 1),
                            clean_B = trim_(s.before),
                            end = clean_B.length + s_B.length;
                        placeholder = OL + placeholder;
                        _AREA.value = clean_B + s_B + placeholder + s.after;
                        _SELECT(end + OL.length, end + placeholder.length, _UPDATE_HISTORY);
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
                if (s.value.length > 0) {
                    if (s.value == placeholder) {
                        _SELECT(s.start, s.end);
                    } else {
                        _REPLACE(new RegExp('(^|\\n) *' + re_OL + ' *', 'g'), '$1', noop);
                        editor[s.value.match(new RegExp('^ *' + re_UL)) ? 'outdent' : 'indent'](UL);
                    }
                } else {
                    if (!s.before.match(/(^|\n{2,})$/)) {
                        var match = new RegExp('(^|\\n) *' + re_UL + '(.*?)$'),
                            clean_B = s.before.replace(match, '$1$2');
                        if (!s.before.match(match)) {
                            s.before = s.before.replace(new RegExp('(^|\\n) *' + re_OL + '(.*?)$'), '$1$2').replace(/(^|\n) *(.*?)$/, '$1' + UL + '$2');
                            _AREA.value = s.before + s.after;
                            _SELECT(s.before.length, _UPDATE_HISTORY);
                        } else {
                            _AREA.value = clean_B + s.after;
                            _SELECT(clean_B.length, _UPDATE_HISTORY);
                        }
                    } else {
                        var s_B = s.before.length > 0 ? '\n\n' : "",
                            clean_B = trim_(s.before),
                            end = clean_B.length + s_B.length;
                        placeholder = UL + placeholder;
                        _AREA.value = clean_B + s_B + placeholder + s.after;
                        _SELECT(end + UL.length, end + placeholder.length, _UPDATE_HISTORY);
                    }
                }
            }
        },
        'ellipsis-h': {
            title: btn.rule,
            click: function() {
                var s = _SELECTION(),
                    clean_B = trim_(s.before),
                    clean_A = _trim(s.after),
                    s_B = clean_B.length > 0 ? '\n\n' : "";
                _AREA.value = clean_B + s_B + opt.HR + '\n\n' + clean_A;
                _SELECT(clean_B.length + s_B.length + opt.HR.length + 2, _UPDATE_HISTORY);
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

    addEvent(_AREA, "focus", base.close);

    addEvent(_AREA, "copy", function(e) {
        var s = _SELECTION();
        win.setTimeout(function() {
            opt.copy(s), opt.update(e, base);
        }, 1);
    });

    addEvent(_AREA, "cut", function(e) {
        var s = _SELECTION();
        win.setTimeout(function() {
            s.end = s.start;
            opt.cut(s), opt.update(e, base), _UPDATE_HISTORY();
        }, 1);
    });

    addEvent(_AREA, "paste", function(e) {
        var s = _SELECTION();
        win.setTimeout(function() {
            s.end = _SELECTION().end;
            s.value = _AREA.value.substring(s.start, s.end);
            opt.paste(s), opt.update(e, base), _UPDATE_HISTORY();
        }, 1);
    });

    addEvent(_AREA, "keydown", function(e) {

        var s = _SELECTION(),
            sb = s.before,
            sv = s.value,
            sa = s.after,
            ss = s.start,
            se = s.end,
            k = e.keyCode,
            ctrl = e.ctrlKey,
            shift = e.shiftKey,
            alt = e.altKey,
            tab = k == 9;

        win.setTimeout(function() {
            opt.keydown(e, base), opt.update(e, base);
        }, 1);

        for (var i in base.shortcuts) {
            var shc = i.split('+'), valid = 0;
            for (var j in shc) {
                if (
                    shc[j] == 'ctrl' && ctrl ||
                    shc[j] == 'shift' && shift ||
                    shc[j] == 'alt' && alt ||
                    shc[j] == 'tab' && tab ||
                    parseInt(shc[j], 10) == k
                ) valid++;
            }
            if (valid === shc.length) return base.shortcuts[i](e, base);
        }

        // Disable the end bracket key if character before
        // cursor is match with character after cursor
        var b = sb, a = sa[0], esc = b.slice(-1) == '\\';
        if (
            b.indexOf('(') !== -1 && shift && k == 48 && a == ')' && !esc ||
            b.indexOf('{') !== -1 && shift && k == 221 && a == '}' && !esc ||
            b.indexOf('[') !== -1 && k == 221 && a == ']' && !esc ||
            b.indexOf('"') !== -1 && shift && k == 222 && a == '"' && !esc ||
            b.indexOf("'") !== -1 && !shift && k == 222 && a == "'" && !esc ||
            b.indexOf('`') !== -1 && !shift && k == 192 && a == '`' && !esc ||
            b.indexOf('<') !== -1 && shift && k == 190 && a == '>' && !esc
        ) {
            _SELECT(se + 1); // move caret by 1 character to the right
            return false;
        }

        // Auto close for `(`
        if (shift && k == 57 && !esc) {
            return insert('(' + sv + ')', s);
        }

        // Auto close for `{`
        if (shift && k == 219 && !esc) {
            return insert('{' + sv + '}', s);
        }

        // Auto close for `[`
        if (!shift && k == 219 && !esc) {
            return insert('[' + sv + ']', s);
        }

        // Auto close for `"`
        if (shift && k == 222 && !esc) {
            return insert('"' + sv + '"', s);
        }

        // Auto close for `'`
        if (!shift && k == 222 && !esc) {
            return insert("'" + sv + "'", s);
        }

        // Auto close for ```
        if (!shift && k == 192 && !esc) {
            return insert('`' + sv + '`', s);
        }

        // Auto close for `<`
        if (shift && k == 188 && !esc) {
            return insert('<' + sv + '>', s);
        }

        // `Shift + Tab` to "outdent"
        if (shift && tab) {
            _OUTDENT('( *' + re_OL + '| *' + re_UL + '|> *|' + re_TAB + ')', 1, true);
            return false;
        }

        if (tab) {
            // Auto close for HTML tags
            // Case `<div|>`
            if (sb.match(/<[^\/>]*?$/) && sa[0] == '>') {
                var match = /<([^\/>]*?)$/.exec(sb);
                _AREA.value = sb + ' ' + sv + '></' + match[1].split(' ')[0] + sa;
                _SELECT(ss + 1, _UPDATE_HISTORY);
                return false;
            }
            // `Tab` to "indent"
            _INDENT(opt.tabSize);
            return false;
        }

        // `Ctrl + Z` to "undo"
        if (ctrl && k == 90) {
            editor.undo();
            return false;
        }

        // `Ctrl + Y` to "redo"
        if (ctrl && k == 89) {
            editor.redo();
            return false;
        }

        if (opt.shortcut) {

            // `Ctrl + B` for "bold"
            if (ctrl && k == 66) {
                toolbars.bold.click();
                return false;
            }

            // `Ctrl + G` for "image"
            if (ctrl && k == 71) {
                toolbars.image.click();
                return false;
            }

            // `Ctrl + H` for "heading"
            if (ctrl && k == 72) {
                toolbars.header.click();
                return false;
            }

            // `Ctrl + I` for "italic"
            if (ctrl && k == 73) {
                toolbars.italic.click();
                return false;
            }

            // `Ctrl + K` for "code"
            if (ctrl && !shift && k == 75) {
                toolbars.code.click();
                return false;
            }

            // `Ctrl + L` for "link"
            if (ctrl && k == 76) {
                toolbars.link.click();
                return false;
            }

            // `Ctrl + Q` for "blockquote"
            if (ctrl && k == 81) {
                toolbars['quote-right'].click();
                return false;
            }

            // `Ctrl + R` for "horizontal rule"
            if (ctrl && k == 82) {
                toolbars['ellipsis-h'].click();
                return false;
            }

            // `Ctrl + 1` for "ordered list"
            if (ctrl && k == 49) {
                toolbars['list-ol'].click();
                return false;
            }

            // `Ctrl + -` for "unordered list"
            if (ctrl && k == 173) {
                toolbars['list-ul'].click();
                return false;
            }

        }

        // Add a space at the beginning of the list item when user starts
        // pressing the space bar after typing `1.` or `*` or `-` or `+`
        if (k == 32) {
            var match = '(^|\\n)(' + trim_(re_OL) + '|' + trim_(re_UL) + ')';
            if (sb.match(new RegExp(match + '$'))) {
                _AREA.value = sb.replace(new RegExp(match + '$'), '$1 $2 ') + sv + sa;
                _SELECT(se + 2, _UPDATE_HISTORY);
                return false;
            }
        }

        // `Enter` key was pressed
        if (k == 13) {

            // `Alt + Enter` for creating carriage return arrow
            if (alt && sv.length === 0) return _INSERT(_u21B5), false;

            // Automatic list (+blockquote) increment
            var listItems = new RegExp('(?:^|\\n)( *)(' + re_OL + '|' + re_UL + '|> )( *)(.*?)$');
            if (sb.match(listItems)) {
                var take = listItems.exec(sb),
                    list = new RegExp(re_OL).test(take[2]) ? opt.OL.replace(/%d/g, (parseInt(take[2], 10) + 1)) : take[2]; // `<ol>` or `<ul>` ?
                _INSERT('\n' + take[1] + list + take[3], 1);
                base.scroll();
                return false;
            }

            // Automatic indentation
            var indentBefore = (new RegExp('(?:^|\\n)((' + re_TAB + ')+)(.*?)$')).exec(sb),
                indent = indentBefore ? indentBefore[1] : "";
            if (sb.match(/[\(\{\[]$/) && sa.match(/^[\]\}\)]/) || sb.match(/<[^\/]*?>$/) && sa.match(/^<\//)) {
                _INSERT('\n' + indent + re_TAB + '\n' + indent, function() {
                    _SELECT(ss + indent.length + opt.tabSize.length + 1, _UPDATE_HISTORY);
                });
                base.scroll();
                return false;
            }

            _INSERT('\n' + indent);
            base.scroll();
            return false;

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
            '.': _u00B7
        };

        if (sv.length > 0) {

            if (alt) {

                // Convert some combination of printable characters
                // into their corresponding Unicode characters
                _REPLACE(/'([^']*?)'/g, _u2018 + '$1' + _u2019, noop);
                _REPLACE(/"([^"]*?)"/g, _u201C + '$1' + _u201D, noop);
                for (var i in type) {
                    _REPLACE(new RegExp(escape(i), 'g'), type[i], noop);
                }
                _UPDATE_HISTORY();
                return false;

            }

        } else {

            if (alt) {

                if (sb.indexOf('"') !== -1 && sa[0] == '"') {
                    _AREA.value = sb.replace(/"([^"]*?)$/, _u201C + '$1') + _u201D + sa.slice(1);
                    _SELECT(se, _UPDATE_HISTORY);
                    return false;
                }

                if (sb.indexOf("'") !== -1 && sa[0] == "'") {
                    _AREA.value = sb.replace(/'([^']*?)$/, _u2018 + '$1') + _u2019 + sa.slice(1);
                    _SELECT(se, _UPDATE_HISTORY);
                    return false;
                }

                if (sb.slice(-2).match(/\w'$/i)) {
                    _AREA.value = sb.slice(0, -1) + _u2019 + sa;
                    _SELECT(se, _UPDATE_HISTORY);
                    return false;
                }

                if (sb.match(/\((c|p|sm|tm|r)$/i) && sa[0] == ')') {
                    var s_ = sb.match(/\((sm|tm)$/i) ? 2 : 1;
                    _AREA.value = sb.slice(0, -(s_ + 1)) + type['(' + sb.slice(-s_).toLowerCase() + ')'] + sa.slice(1);
                    _SELECT(se - s_, _UPDATE_HISTORY);
                    return false;
                }

                var _sb = sb.replace(/&lt;/g, '<').replace(/&gt;/g, '>'),
                    _sa = sa.replace(/&lt;/g, '<').replace(/&gt;/g, '>');

                if (_sb.indexOf('<<') !== -1 && _sa.indexOf('>>') === 0) {
                    _AREA.value = sb.replace(/(?:<<|&lt;&lt;)([^<]*)$/, _u00AB + '$1') + sa.replace(/^(?:>>|&gt;&gt;)/, _u00BB);
                    _SELECT(_sb.length - 1, _UPDATE_HISTORY);
                    return false;
                }

                if (_sb.indexOf('<') !== -1 && _sa.indexOf('>') === 0) {
                    _AREA.value = sb.replace(/(?:<|&lt;)([^<]*)$/, _u2039 + '$1') + sa.replace(/^(?:>|&gt;)/, _u203A);
                    _SELECT(_sb.length, _UPDATE_HISTORY);
                    return false;
                }

                // Convert some combination of printable characters
                // into their corresponding Unicode characters
                for (var i in type) {
                    if (sb.slice(-i.length) == i) {
                        _AREA.value = sb.slice(0, -i.length) + type[i] + sa;
                        _SELECT(ss - i.length + 1, _UPDATE_HISTORY);
                        return false;
                    }
                }

                // `Alt + Arrow Key(s)` for creating arrows
                if (k == 37) return _INSERT(_u2190), false;
                if (k == 38) return _INSERT(_u2191), false;
                if (k == 39) return _INSERT(_u2192), false;
                if (k == 40) return _INSERT(_u2193), false;

            }

            // `Backspace` was pressed
            if (k == 8) {

                // Remove empty list item (+blockquote) quickly
                var match = ' *(' + re_OL + '|' + re_UL + '|> )';
                if(sb.match(new RegExp(match + '$'))) {
                    _OUTDENT(match, 1, true);
                    return false;
                }

                // Remove indentation quickly
                if(sb.match(new RegExp(re_TAB + '$'))) {
                    _OUTDENT(opt.tabSize);
                    return false;
                }

                // Remove HTML tag quickly
                if (sb.match(/<\/?[^>]*?>$/)) {
                    _OUTDENT('<\/?[^>]*?>', 1, true);
                    return false;
                }

                // Remove closing bracket and quotes quickly
                switch (sb.slice(-1)) {
                    case '(': return _TOGGLE('(', ')'), false;
                    case '{': return _TOGGLE('{', '}'), false;
                    case '[': return _TOGGLE('[', ']'), false;
                    case '"': return _TOGGLE('"', '"'), false;
                    case "'": return _TOGGLE("'", "'"), false;
                    case '<': return _TOGGLE('<', '>'), false;
                    case '*': return _TOGGLE('*', '*'), false;
                    case '_': return _TOGGLE('_', '_'), false;
                    case '~': return _TOGGLE('~', '~'), false;
                    case '`': return _TOGGLE('`', '`'), false;
                    case _u201C: return _TOGGLE(_u201C, _u201D), false;
                    case _u2018: return _TOGGLE(_u2018, _u2019), false;
                    case _u00AB: return _TOGGLE(_u00AB, _u00BB), false;
                    case _u2039: return _TOGGLE(_u2039, _u203A), false;
                }

            }

        }

        // `Right Arrow` key was pressed
        if (k == 39) {

            // Jump out from the closing tag quickly
            if (sa.match(/^<\/.*?>/)) {
                _SELECT(se + sa.indexOf('>') + 1);
                return false;
            }

        }

        // `Esc` to release focus from `<textarea>`
        if (k == 27) {
            release.focus();
            return false;
        }

        if (!alt && !ctrl && !shift) {
            win.setTimeout(_UPDATE_HISTORY, 1);
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