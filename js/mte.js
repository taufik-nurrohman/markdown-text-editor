/*!
 * ----------------------------------------------------------
 *  MARKDOWN TEXT EDITOR PLUGIN 1.1.6
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

    // Backward Compatibility
    if (typeof o.prompt != "undefined") o.prompts = o.prompt;
    if (typeof o.placeholder != "undefined") o.placeholders = o.placeholder;

    var base = this,
        win = window,
        doc = document,
        editor = new Editor(elem),
        defaults = {
            tabSize: '    ',
            toolbar: true,
            shortcut: false,
            toolbarClass: 'editor-toolbar',
            toolbarPosition: "before", // before or after `<textarea>` ?
            buttonClassPrefix: 'editor-toolbar-button editor-toolbar-button-', // for `<a class="editor-toolbar-button editor-toolbar-button-ICON_NAME"></a>`
            iconClassPrefix: 'fa fa-', // for `<i class="fa fa-ICON_NAME"></i>`
            STRONG: '**',
            EM: '_',
            UL: '- ',
            OL: '%d. ',
            HR: '---',
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
                heading: 'H1 \u2013 H6',
                link: 'Link',
                image: 'Image',
                ol: 'Ordered List',
                ul: 'Unordered List',
                rule: 'Horizontal Rule',
                undo: 'Undo',
                redo: 'Redo'
            },
            prompts: {
                link_title: 'link title goes here\u2026',
                link_title_title: 'Link Title',
                link_url: 'http://',
                link_url_title: 'Link URL',
                image_url: 'http://',
                image_url_title: 'Image URL'
            },
            placeholders: {
                text: 'text goes here\u2026',
                heading_text: 'Heading',
                link_text: 'link text',
                list_ul_text: 'List Item',
                list_ol_text: 'List Item',
                image_alt: 'Image'
            },
            keydown: function() {},
            click: function() {},
            ready: function() {}
        };

    var overlay = doc.createElement('div'),
        modal = doc.createElement('div');

    // Base Modal
    base.modal = function(type, callback) {
        type = type || 'modal';
        var page = doc.body,
            scroll = page.scrollTop || doc.documentElement.scrollTop;
        overlay.className = 'custom-modal-overlay custom-modal-' + type + '-overlay';
        overlay.onclick = function() {
            base.close(true);
        };
        modal.className = 'custom-modal custom-modal-' + type;
        modal.innerHTML = '<div class="custom-modal-header custom-modal-' + type + '-header"></div><div class="custom-modal-content custom-modal-' + type + '-content"></div><div class="custom-modal-action custom-modal-' + type + '-action"></div>';
        modal.style.visibility = "hidden";
        page.appendChild(overlay);
        page.appendChild(modal);
        win.setTimeout(function() {
            var w = modal.offsetWidth,
                h = modal.offsetHeight;
            modal.style.position = 'absolute';
            modal.style.top = '50%';
            modal.style.left = '50%';
            modal.style.zIndex = '9999';
            modal.style.marginTop = (scroll - (h / 2)) + 'px';
            modal.style.marginLeft = '-' + (w / 2) + 'px';
            modal.style.visibility = "";
            if (modal.offsetTop < 0) {
                modal.style.top = 0;
                modal.style.marginTop = 0;
            }
            if (modal.offsetLeft < 0) {
                modal.style.left = 0;
                modal.style.marginLeft = 0;
            }
        }, 10);
        if (typeof callback == "function") callback(overlay, modal);
    };

    // Close Modal
    base.close = function(select) {
        if (overlay) doc.body.removeChild(overlay);
        if (modal) doc.body.removeChild(modal);
        if (typeof select != "undefined" && select === true) {
            var s = editor.selection();
            editor.select(s.start, s.end);
        }
    };

    // Custom Prompt Modal
    base.prompt = function(title, value, isRequired, callback) {
        base.modal('prompt', function(o, m) {
            var onSuccess = function(value) {
                if (typeof callback == "function") {
                    base.close();
                    callback(value);
                } else {
                    base.close(true);
                }
            };
            var input = doc.createElement('input');
                input.type = "text";
                input.value = value;
                input.onkeyup = function(e) {
                    if (isRequired) {
                        if (e.keyCode == 13 && this.value !== "" && this.value !== value) onSuccess(this.value);
                    } else {
                        if (e.keyCode == 13) onSuccess(this.value == value ? "" : this.value);
                    }
                };
            var OK = doc.createElement('button');
                OK.innerHTML = opt.buttons.ok;
                OK.onclick = function() {
                    if (isRequired) {
                        if (input.value !== "" && input.value !== value) onSuccess(input.value);
                    } else {
                        onSuccess(input.value == value ? "" : input.value);
                    }
                };
            var CANCEL = doc.createElement('button');
                CANCEL.innerHTML = opt.buttons.cancel;
                CANCEL.onclick = function() {
                    base.close(true);
                };
            m.children[0].innerHTML = title ? title : "";
            m.children[1].appendChild(input);
            m.children[2].appendChild(OK);
            m.children[2].appendChild(doc.createTextNode(' '));
            m.children[2].appendChild(CANCEL);
            win.setTimeout(function() {
                input.select();
            }, 10);
        });
    };

    // Custom Alert Modal
    base.alert = function(title, message, callback) {
        base.modal('alert', function(o, m) {
            var OK = doc.createElement('button');
                OK.innerHTML = opt.buttons.ok;
                OK.onclick = function() {
                    if (typeof callback == "function") {
                        base.close();
                        callback();
                    } else {
                        base.close(true);
                    }
                };
            m.children[0].innerHTML = title ? title : "";
            m.children[1].innerHTML = message ? message : "";
            m.children[2].appendChild(OK);
        });
    };

    // Custom Confirm Modal
    base.confirm = function(title, message, callback) {
        base.modal('confirm', function(o, m) {
            var OK = doc.createElement('button');
                OK.innerHTML = opt.buttons.ok;
                OK.onclick = function() {
                    if (typeof callback == "undefined") {
                        base.close(true);
                    } else {
                        if (typeof callback.OK == "function") {
                            base.close();
                            callback.OK();
                        } else {
                            base.close(true);
                        }
                    }
                };
            var CANCEL = doc.createElement('button');
                CANCEL.innerHTML = opt.buttons.cancel;
                CANCEL.onclick = function() {
                    if (typeof callback == "undefined") {
                        base.close(true);
                    } else {
                        if (typeof callback.CANCEL == "function") {
                            base.close();
                            callback.CANCEL();
                        } else {
                            base.close(true);
                        }
                    }
                    return false;
                };
            m.children[0].innerHTML = title ? title : "";
            m.children[1].innerHTML = message ? message : "";
            m.children[2].appendChild(OK);
            m.children[2].appendChild(doc.createTextNode(' '));
            m.children[2].appendChild(CANCEL);
        });
    };

    function extend(target, source) {
        target = target || {};
        for (var prop in source) {
            if (typeof source[prop] == "object") {
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

    var opt = extend(defaults, o), nav = doc.createElement('span');

    // Escapes for `RegExp()`
    var re_ = /([!$^*\(\)\-+=\{\}\[\].,?\\\/])/g,
        // re_UL = opt.UL.replace(re_, '\\$1').replace(/\s*$/, ""),
        re_UL = opt.UL.replace(re_, '\\$1').replace(/\\[-+*]/g, '[-+*]'),
        re_OL = opt.OL.replace(re_, '\\$1').replace(/%d/g, '[0-9]+'),
        re_TAB = opt.tabSize.replace(re_, '\\$1'),
        re_PRE = opt.PRE.replace(re_, '\\$1');

    if (opt.toolbar) {
        nav.className = opt.toolbarClass;
        editor.area.parentNode.insertBefore(nav, opt.toolbarPosition == "before" ? editor.area : null);
    }

    base.button = function(key, data) {
        if (data.title === false) return;
        var a = doc.createElement('a');
            a.className = opt.buttonClassPrefix + key;
            a.href = '#' + key.replace(' ', ':').replace(/[^a-z0-9\:]/gi, '-').replace(/-+/g,'-').replace(/^-+|-+$/g, "");
            a.setAttribute('tabindex', -1);
            a.innerHTML = data.text ? data.text.replace(/%s/g, key) : '<i class="' + opt.iconClassPrefix + key + '"></i>';
            a.onclick = function(e) {
                data.click(e, base);
                opt.click(e, base, this.hash.replace('#', ""));
                return false;
            };
        if (data.title) a.title = data.title;
        if (data.position) {
            nav.insertBefore(a, nav.children[data.position - 1]);
        } else {
            nav.appendChild(a);
        }
    };

    editor.toggle = function(open, close, callback) {
        var s = editor.selection();
        if (s.before.slice(-open.length) != open && s.after.slice(0, close.length) != close) {
            editor.wrap(open, close);
        } else {
            var clean_B = s.before.slice(-open.length) == open ? s.before.substring(0, s.before.length - open.length) : s.before,
                clean_A = s.after.substring(0, close.length) == close ? s.after.substring(close.length) : s.after;
            editor.area.value = clean_B + s.value + clean_A;
            editor.select(clean_B.length, clean_B.length + s.value.length, function() {
                editor.updateHistory();
            });
        }
        if (typeof callback == "function") callback();
    };

    var T = 0, btn = opt.buttons;

    var toolbars = {
        'bold': {
            title: btn.bold,
            click: function() {
                editor.toggle(opt.STRONG, opt.STRONG);
            }
        },
        'italic': {
            title: btn.italic,
            click: function() {
                editor.toggle(opt.EM, opt.EM);
            }
        },
        'code': {
            title: btn.code,
            click: function() {
                var v = editor.selection().value;
                if (v.indexOf('\n') !== -1 && v.length > 0) {
                    if (opt.PRE.indexOf('%s') === -1) {
                        var match = '(' + re_PRE + '|\\t| {4})';
                        if (v.match(new RegExp('^' + match))) {
                            editor.outdent(match);
                        } else {
                            editor.indent(re_PRE);
                        }
                    } else {
                        var wrap = opt.PRE.split('%s');
                        editor.toggle(wrap[0], wrap[1] ? wrap[1] : wrap[0]);
                    }
                } else {
                    editor.toggle('`', '`');
                }
            }
        },
        'quote-right': {
            title: btn.quote,
            click: function() {
                var v = editor.selection().value;
                if (v[0] === '>') {
                    editor.outdent('> ');
                } else {
                    editor.indent('> ');
                }
            }
        },
        'header': {
            title: btn.heading,
            click: function() {
                var s = editor.selection(),
                    h = ["", "", "", '### ', '#### ', '##### ', '###### '];
                T = T < h.length - 1 ? T + 1 : 0;
                if (s.value.length > 0) {
                    var clean_B = s.before.replace(/\#+ $/, ""),
                        clean_V = s.value.replace(/^\#+ |\n+[-=]+/, "").replace(/\n+/g, ' '),
                        clean_A = s.after.replace(/\n+[-=]+/, "");
                    if (T > 0 && T < 3) {
                        editor.area.value = clean_B + clean_V + '\n' + clean_V.replace(/./g, T === 1 ? '=' : '-') + clean_A;
                        editor.select(clean_B.length, clean_B.length + clean_V.length, function() {
                            editor.updateHistory();
                        });
                    } else {
                        editor.area.value = clean_B + h[T] + clean_V + clean_A;
                        editor.select(clean_B.length + h[T].length, clean_B.length + h[T].length + clean_V.length, function() {
                            editor.updateHistory();
                        });
                    }
                } else {
                    var placeholder = opt.placeholders.heading_text;
                    T = 1;
                    editor.insert(placeholder + '\n' + placeholder.replace(/./g, '='), function() {
                        s = editor.selection().end - 1;
                        editor.select(s - (placeholder.length * 2), s - placeholder.length, function() {
                            editor.updateHistory();
                        });
                    });
                }
            }
        },
        'link': {
            title: btn.link,
            click: function() {
                var s = editor.selection(),
                    title, url, placeholder = opt.placeholders.link_text;
                base.prompt(opt.prompts.link_title_title, opt.prompts.link_title, false, function(r) {
                    title = r;
                    base.prompt(opt.prompts.link_url_title, opt.prompts.link_url, true, function(r) {
                        url = r;
                        editor.wrap('[' + (s.value.length === 0 ? placeholder : ""), '](' + url + (title !== "" ? ' \"' + title + '\"' : "") + ')', function() {
                            editor.select(s.start + 1, (s.value.length === 0 ? s.start + placeholder.length + 1 : s.end + 1), function() {
                                editor.updateHistory();
                            });
                        });
                    });
                });
            }
        },
        'image': {
            title: btn.image,
            click: function() {
                base.prompt(opt.prompts.image_url_title, opt.prompts.image_url, true, function(r) {
                    var alt = decodeURIComponent(
                        r.substring(
                            r.lastIndexOf('/') + 1, r.lastIndexOf('.')
                        ).replace(/[-+._]+/g, ' ')
                    ).toLowerCase().replace(/(?:^|\s)\S/g, function(a) {
                        return a.toUpperCase();
                    });
                    alt = alt.indexOf('/') === -1 && r.indexOf('.') !== -1 ? alt : opt.placeholders.image_alt;
                    editor.insert('\n![' + alt + '](' + r + ')\n');
                });
            }
        },
        'list-ol': {
            title: btn.ol,
            click: function() {
                var s = editor.selection(),
                    ol = 0;
                if (s.value == opt.placeholders.list_ol_text) {
                    editor.select(s.start, s.end);
                } else {
                    if (s.value.length > 0) {
                        editor.indent("", function() {
                            editor.replace(/^[^\n]/gm, function(str) {
                                ol++;
                                return str.replace(/^/, ' ' + opt.OL.replace(/%d/g, ol));
                            });
                        });
                    } else {
                        var OL = ' ' + opt.OL.replace(/%d/g, 1),
                            placeholder = OL + opt.placeholders.list_ol_text;
                        editor.insert(placeholder, function() {
                            editor.select(s.start + OL.length, s.start + placeholder.length, function() {
                                editor.updateHistory();
                            });
                        });
                    }
                }
            }
        },
        'list-ul': {
            title: btn.ul,
            click: function() {
                var s = editor.selection();
                if (s.value == opt.placeholders.list_ul_text) {
                    editor.select(s.start, s.end);
                } else {
                    var UL = ' ' + opt.UL;
                    if (s.value.length > 0) {
                        editor.indent(UL);
                    } else {
                        var placeholder = UL + opt.placeholders.list_ul_text;
                        editor.insert(placeholder, function() {
                            editor.select(s.start + UL.length, s.start + placeholder.length, function() {
                                editor.updateHistory();
                            });
                        });
                    }
                }
            }
        },
        'ellipsis-h': {
            title: btn.rule,
            click: function() {
                editor.insert('\n' + opt.HR + '\n');
            }
        },
        'undo': {
            title: btn.undo,
            click: function() {
                editor.undo();
            }
        },
        'repeat': {
            title: btn.redo,
            click: function() {
                editor.redo();
            }
        }
    };

    for (var i in toolbars) base.button(i, toolbars[i]);

    var insert = function(chars, s) {
        editor.insert(chars, function() {
            editor.select(s.end + 1);
        });
        return false;
    };

    editor.area.onkeydown = function(e) {

        var EA = this,
            s = editor.selection(),
            k = e.keyCode,
            ctrl = e.ctrlKey,
            shift = e.shiftKey,
            alt = e.altKey,
            scroll = EA.scrollTop + parseInt(css(EA, 'line-height'), 10);

        win.setTimeout(function() {
            opt.keydown(e, base);
        }, 10);

        // Disable the end bracket key if character before
        // cursor is matched with character after cursor
        var b = s.before, a = s.after[0], esc = b.slice(-1) == '\\';
        if (
            b.indexOf('(') !== -1 && shift && k == 48 && a == ')' && !esc ||
            b.indexOf('{') !== -1 && shift && k == 221 && a == '}' && !esc ||
            b.indexOf('[') !== -1 && k == 221 && a == ']' && !esc ||
            b.indexOf('"') !== -1 && shift && k == 222 && a == '"' && !esc ||
            b.indexOf('\'') !== -1 && !shift && k == 222 && a == '\'' && !esc ||
            b.indexOf('`') !== -1 && !shift && k == 192 && a == '`' && !esc ||
            b.indexOf('<') !== -1 && shift && k == 190 && a == '>' && !esc
        ) {
            editor.select(s.end + 1); // move caret by 1 character to the right
            return false;
        }

        // Auto close for `(`
        if (shift && k == 57 && !esc) {
            return insert('(' + s.value + ')', s);
        }

        // Auto close for `{`
        if (shift && k == 219 && !esc) {
            return insert('{' + s.value + '}', s);
        }

        // Auto close for `[`
        if (!shift && k == 219 && !esc) {
            return insert('[' + s.value + ']', s);
        }

        // Auto close for `"`
        if (shift && k == 222 && !esc) {
            return insert('\"' + s.value + '\"', s);
        }

        // Auto close for `'`
        if (!shift && k == 222 && !esc) {
            return insert('\'' + s.value + '\'', s);
        }

        // Auto close for ```
        if (!shift && k == 192 && !esc) {
            return insert('`' + s.value + '`', s);
        }

        // Auto close for `<`
        if (shift && k == 188 && !esc) {
            return insert('<' + s.value + '>', s);
        }

        // `Shift + Tab` to outdent
        if (shift && k == 9) {
            editor.outdent('( *' + re_OL + '| *' + re_UL + '|> *|' + re_TAB + ')');
            return false;
        }

        if (k == 9) {
            // Auto close for HTML tags
            // Case `<div|>`
            if (s.before.match(/<[^\/>]*?$/) && s.after[0] == '>') {
                var match = /<([^\/>]*?)$/.exec(s.before);
                EA.value = s.before + ' ' + s.value + '></' + match[1].split(' ')[0] + s.after;
                editor.select(s.start + 1, function() {
                    editor.updateHistory();
                });
                return false;
            }
            // `Tab` to indent
            editor.indent(re_TAB);
            return false;
        }

        // `Ctrl + Z` to undo
        if (ctrl && k == 90) {
            editor.undo();
            return false;
        }

        // `Ctrl + Y` or `Ctrl + R` to redo
        if (ctrl && k == 89 || ctrl && k == 82) {
            editor.redo();
            return false;
        }

        if (opt.shortcut) {

            // `Ctrl + B` for "bold"
            if (ctrl && k == 66) {
                toolbars.bold.click();
                return false;
            }

            // `Ctrl + I` for "italic"
            if (ctrl && k == 73) {
                toolbars.italic.click();
                return false;
            }

            // `Ctrl + Q` for "blockquote"
            if (ctrl && k == 81) {
                toolbars['quote-right'].click();
                return false;
            }

            // `Shift + Q` or `Shift + Alt + Q` for "quote"
            if (shift && k == 81 && s.value.length > 0) {
                if (alt) {
                    editor.toggle('\u2018', '\u2019'); // single quote
                } else {
                    editor.toggle('\u201C', '\u201D'); // double quote
                }
                return false;
            }

            // `Ctrl + H` for heading
            if (ctrl && k == 72) {
                toolbars.header.click();
                return false;
            }

            // `Ctrl + L` for link
            if (ctrl && k == 76) {
                toolbars.link.click();
                return false;
            }

            // `Ctrl + G` for image
            if (ctrl && k == 71) {
                toolbars.image.click();
                return false;
            }

        }

        // Add a space at the beginning of the list item when user start
        // pressing the space bar after typing `1.` or `*` or `-` or `+`
        if (k == 32) {
            var match = '(^|\\n)(' + re_OL.replace(/\s*$/, "") + '|' + re_UL.replace(/\s*$/, "") + ')';
            if (s.before.match(new RegExp(match + '$'))) {
                EA.value = s.before.replace(new RegExp(match + '$'), '$1 $2 ') + s.value + s.after;
                editor.select(s.end + 2, function() {
                    editor.updateHistory();
                });
                return false;
            }
        }

        // `Enter` key was pressed
        if (k == 13) {

            // Automatic list increment
            var listItems = new RegExp('(?:^|\\n)( *)(' + re_OL + '|' + re_UL + ')( *)(.*?)$');
            if (s.before.match(listItems)) {
                var take = listItems.exec(s.before),
                    list = new RegExp(re_OL).test(take[2]) ? opt.OL.replace(/%d/g, (parseInt(take[2], 10) + 1)) : take[2]; // `<ol>` or `<ul>` ?
                editor.insert('\n' + take[1] + list + take[3], null);
                EA.scrollTop = scroll;
                return false;
            }

            // Automatic indentation
            var indentBefore = (new RegExp('(?:^|\\n)((' + re_TAB + ')+)(.*?)$')).exec(s.before),
                indent = indentBefore ? indentBefore[1] : "";
            if (s.before.match(/[\(\{\[]$/) && s.after.match(/^[\]\}\)]/) || s.before.match(/<[^\/]*?>$/) && s.after.match(/^<\//)) {
                editor.insert('\n' + indent + re_TAB + '\n' + indent, function() {
                    editor.select(s.start + indent.length + opt.tabSize.length + 1, function() {
                        editor.updateHistory();
                    });
                });
                EA.scrollTop = scroll;
                return false;
            }

            editor.insert('\n' + indent);
            EA.scrollTop = scroll;
            return false;

        }

        // `Backspace` was pressed
        if (k == 8) {

            if (s.value.length === 0) {

                // Remove empty list item quickly
                var match = ' *(' + re_OL + '|' + re_UL + ')';
                if(s.before.match(new RegExp(match + '$'))) {
                    editor.outdent(match);
                    return false;
                }

                // Remove indentation quickly
                if(s.before.match(new RegExp(re_TAB + '$'))) {
                    editor.outdent(re_TAB);
                    return false;
                }

                // Remove HTML tag quickly
                if (s.before.match(/<\/?[^>]*?>$/)) {
                    editor.outdent('<\/?[^>]*?>');
                    return false;
                }

                // Remove closing bracket and quotes quickly
                switch (s.before.slice(-1)) {
                    case '(':
                        editor.toggle('(', ')');
                        return false;
                    break;
                    case '{':
                        editor.toggle('{', '}');
                        return false;
                    break;
                    case '[':
                        editor.toggle('[', ']');
                        return false;
                    break;
                    case '"':
                        editor.toggle('"', '"');
                        return false;
                    break;
                    case '\'':
                        editor.toggle('\'', '\'');
                        return false;
                    break;
                    case '<':
                        editor.toggle('<', '>');
                        return false;
                    break;
                    case '*':
                        editor.toggle('*', '*');
                        return false;
                    break;
                    case '_':
                        editor.toggle('_', '_');
                        return false;
                    break;
                    case '~':
                        editor.toggle('~', '~');
                        return false;
                    break;
                    case '`':
                        editor.toggle('`', '`');
                        return false;
                    break;
                }

            }

        }

        if (!alt && !ctrl && !shift) {
            editor.updateHistory();
        }

    };

    opt.ready(base);

    // Make all selection method becomes accessible outside the plugin
    base.grip = editor;
    base.grip.config = opt;

};