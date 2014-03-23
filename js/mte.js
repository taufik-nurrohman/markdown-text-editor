/*!
 * ----------------------------------------------------------
 *  MARKDOWN TEXT EDITOR PLUGIN 1.0.0
 * ----------------------------------------------------------
 * Author: Taufik Nurrohman <http://latitudu.com>
 * Licensed under the MIT license.
 *
 *     REQUIRES:
 *     ======================================================
 *     1. https://github.com/tovic/simple-text-editor-library
 *     2. http://fortawesome.github.io/Font-Awesome/icons
 *     ======================================================
 *
 */

var MTE = function(elem, o) {

    var base = this,
        win = window,
        doc = document,
        editor = new Editor(elem),
        defaults = {
            tabSize: '    ',
            toolbar: true,
            toolbarClass: 'editor-toolbar',
            toolbarPosition: "before", // "before" or "after" textarea?
            appendModalTo: document.body,
            iconClassPrefix: 'fa fa-', // For `<i class="fa fa-ICON_NAME"></i>`
            buttons: {
                OK: 'OK',
                YES: 'Yes',
                NO: 'No',
                CANCEL: 'Cancel'
            },
            prompt: {
                linkTitle: 'Your link title goes here...',
                linkTitle_title: 'Link title:',
                linkURL: 'http://',
                linkURL_title: 'Link URL:',
                imageURL: 'http://',
                imageURL_title: 'Image URL:',
            },
            placeholder: {
                headingText: 'Your Heading Text Goes Here',
                linkText: 'Your link text goes here...',
                imageAlt: 'Image',
                listUL: 'List Item',
                listOL: 'List Item'
            },
            keydown: function() {},
            ready: function() {}
        };

    defaults.toolbars = {
        'bold': {
            title: 'Bold',
            click: function() {
                editor.toggle('**', '**');
            }
        },
        'italic': {
            title: 'Italic',
            click: function() {
                editor.toggle('_', '_');
            }
        },
        'code': {
            title: 'Code',
            click: function() {
                var v = editor.selection().value;
                if (v.indexOf('\n') !== -1 && v.length > 0) {
                    editor.indent(defaults.tabSize);
                } else {
                    editor.toggle('`', '`');
                }
            }
        },
        'quote-right': {
            title: 'Quote',
            click: function() {
                editor.indent('> ');
            }
        },
        'sort-amount-desc': {
            title: 'H1 \u2013 H6',
            click: function() {
                editor.heading();
            }
        },
        'link': {
            title: 'Link',
            click: function() {
                var s = editor.selection(),
                    title, url, placeholder = defaults.placeholder.linkText;
                base.prompt(defaults.prompt.linkTitle_title, defaults.prompt.linkTitle, false, function(r) {
                    title = r;
                    base.prompt(defaults.prompt.linkURL_title, defaults.prompt.linkURL, true, function(r) {
                        url = r;
                        editor.wrap('[' + (s.value.length === 0 ? placeholder : ''), '](' + url + (title !== "" ? ' \"' + title + '\"' : '') + ')', function() {
                            editor.select(s.start + 1, (s.value.length === 0 ? s.start + placeholder.length + 1 : s.end + 1), function() {
                                editor.updateHistory();
                            });
                        });
                    });
                });
            }
        },
        'picture-o': {
            title: 'Image',
            click: function() {
                base.prompt(defaults.prompt.imageURL_title, defaults.prompt.imageURL, true, function(r) {
                    var alt = decodeURIComponent(
                        r.substring(
                            r.lastIndexOf('/') + 1, r.lastIndexOf('.')
                        ).replace(/[\-\_\+]+/g, " ")
                    ).toLowerCase()
                        .replace(/(?:^|\s)\S/g, function(a) {
                            return a.toUpperCase();
                        });
                    alt = alt.indexOf('/') < 0 ? alt : defaults.placeholder.imageAlt;
                    editor.insert('\n![' + alt + '](' + r + ')\n', function() {
                        editor.updateHistory();
                    });
                });
            }
        },
        'list-ol': {
            title: 'Ordered List',
            click: function() {
                var s = editor.selection(),
                    ol = 0,
                    added = "";
                if (s.value.length > 0) {
                    editor.indent("", function() {
                        editor.replace(/^[^\n\r]/gm, function(str) {
                            ol++;
                            added += ' ' + ol + '. ';
                            return str.replace(/^/, ' ' + ol + '. ');
                        });
                    });
                } else {
                    var placeholder = ' 1. ' + defaults.placeholder.listOL;
                    editor.insert(placeholder, function() {
                        editor.select(s.start + 4, s.start + placeholder.length);
                    });
                }
            }
        },
        'list-ul': {
            title: 'Unordered List',
            click: function() {
                var s = editor.selection();
                if (s.value.length > 0) {
                    editor.indent(' * ');
                } else {
                    var placeholder = ' * ' + defaults.placeholder.listUL;
                    editor.insert(placeholder, function() {
                        editor.select(s.start + 3, s.start + placeholder.length);
                    });
                }
            }
        },
        'ellipsis-h': {
            title: 'Horizontal Rule',
            click: function() {
                editor.insert('\n---\n');
            }
        },
        'rotate-left': {
            title: 'Undo',
            click: function() {
                editor.undo();
            }
        },
        'rotate-right': {
            title: 'Redo',
            click: function() {
                editor.redo();
            }
        }
    };

    function extend(target, source) {
        target = target || {};
        for (var prop in source) {
            if (typeof source[prop] === "object") {
                target[prop] = extend(target[prop], source[prop]);
            } else {
                target[prop] = source[prop];
            }
        }
        return target;
    }

    defaults = extend(defaults, o);

    // Custom prompt box
    base.prompt = function(title, value, isRequired, callback) {
        var page = defaults.appendModalTo,
            overlay = doc.createElement('div');
            overlay.className = 'custom-modal-overlay custom-prompt-overlay';
        var modal = doc.createElement('div');
            modal.className = 'custom-modal custom-prompt';
            modal.innerHTML = '<div class="custom-modal-header custom-prompt-header">' + (title ? title : "") + '</div><div class="custom-modal-content custom-prompt-content"></div><div class="custom-modal-action custom-prompt-action"></div>';
        var onSuccess = function(value) {
            overlay.parentNode.removeChild(overlay);
            modal.parentNode.removeChild(modal);
            if (typeof callback == "function") callback(value);
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
            OK.innerHTML = defaults.buttons.OK;
            OK.onclick = function() {
                if (isRequired) {
                    if (input.value !== "" && input.value !== value) onSuccess(input.value);
                } else {
                    onSuccess(input.value == value ? "" : input.value);
                }
            };
        var CANCEL = doc.createElement('button');
            CANCEL.innerHTML = defaults.buttons.CANCEL;
            CANCEL.onclick = function() {
                overlay.parentNode.removeChild(overlay);
                modal.parentNode.removeChild(modal);
            };
        page.appendChild(overlay);
        page.appendChild(modal);
        modal.children[1].appendChild(input);
        modal.children[2].appendChild(OK);
        modal.children[2].appendChild(doc.createTextNode(' '));
        modal.children[2].appendChild(CANCEL);
        input.select();
    };

    // Custom alert box
    base.alert = function(title, message, callback) {
        var page = defaults.appendModalTo,
            overlay = doc.createElement('div');
            overlay.className = 'custom-modal-overlay custom-alert-overlay';
        var modal = doc.createElement('div');
            modal.className = 'custom-modal custom-alert';
            modal.innerHTML = '<div class="custom-modal-header custom-alert-header">' + (title ? title : "") + '</div><div class="custom-modal-content custom-alert-content">' + (message ? message : "") + '</div><div class="custom-modal-action custom-alert-action"></div>';
        var OK = doc.createElement('button');
            OK.innerHTML = defaults.buttons.OK;
            OK.onclick = function() {
                overlay.parentNode.removeChild(overlay);
                modal.parentNode.removeChild(modal);
                if (typeof callback == "function") callback();
            };
        page.appendChild(overlay);
        page.appendChild(modal);
        modal.children[2].appendChild(OK);
    };

    // Custom confirm box
    base.confirm = function(title, message, callback) {
        var page = defaults.appendModalTo,
            overlay = doc.createElement('div');
            overlay.className = 'custom-modal-overlay custom-confirm-overlay';
        var modal = doc.createElement('div');
            modal.className = 'custom-modal custom-confirm';
            modal.innerHTML = '<div class="custom-modal-header custom-confirm-header">' + (title ? title : "") + '</div><div class="custom-modal-content custom-confirm-content">' + (message ? message : "") + '</div><div class="custom-modal-action custom-confirm-action"></div>';
        var OK = doc.createElement('button');
            OK.innerHTML = defaults.buttons.OK;
            OK.onclick = function() {
                overlay.parentNode.removeChild(overlay);
                modal.parentNode.removeChild(modal);
                if (typeof callback.OK == "function") callback.OK();
            };
        var CANCEL = doc.createElement('button');
            CANCEL.innerHTML = defaults.buttons.CANCEL;
            CANCEL.onclick = function() {
                overlay.parentNode.removeChild(overlay);
                modal.parentNode.removeChild(modal);
                if (typeof callback.CANCEL == "function") callback.CANCEL();
                return false;
            };
        page.appendChild(overlay);
        page.appendChild(modal);
        modal.children[2].appendChild(OK);
        modal.children[2].appendChild(doc.createTextNode(' '));
        modal.children[2].appendChild(CANCEL);
    };

    editor.toggle = function(open, close, callback) {
        var s = editor.selection();
        if (s.before.slice(-open.length) != open && s.after.slice(0, close.length) != close) {
            editor.wrap(open, close);
        } else {
            var cleanB = s.before.substring(0, s.before.length - open.length),
                cleanA = s.after.substring(close.length);
            editor.area.value = cleanB + s.value + cleanA;
            editor.select(cleanB.length, cleanB.length + s.value.length, function() {
                editor.updateHistory();
            });
        }
        if (typeof callback == "function") callback();
    };

    var T = 0;

    editor.heading = function() {
        var s = editor.selection(),
            h = ["", '# ', '## ', '### ', '#### ', '##### ', '###### '];
        T = T < h.length - 1 ? T + 1 : 0;
        if (s.value.length > 0) {
            if (!s.before.match(/\#+ $/)) {
                editor.wrap(h[T], "", function() {
                    editor.replace(/^\#+ /, "");
                });
            } else {
                var cleanB = s.before.replace(/\#+ $/, ""),
                    cleanV = s.value.replace(/^\#+ /, "");
                editor.area.value = cleanB + h[T] + cleanV + s.after;
                editor.select(cleanB.length + h[T].length, cleanB.length + h[T].length + cleanV.length, function() {
                    editor.updateHistory();
                });
            }
        } else {
            var placeholder = defaults.placeholder.headingText;
            T = 1;
            editor.insert(h[T] + placeholder, function() {
                s = editor.selection().end;
                editor.select(s - placeholder.length - h[T].length + 2, s, function() {
                    editor.updateHistory();
                });
            });
        }
    };

    var nav = doc.createElement('nav');
        nav.className = defaults.toolbarClass;

    for (var i in defaults.toolbars) {
        var a = doc.createElement('a');
            a.href = '#' + i;
            a.innerHTML = '<i class="' + defaults.iconClassPrefix + i + '"></i>';
            a.onclick = function() {
                defaults.toolbars[this.hash.replace('#', "")].click();
                return false;
            };
        if (defaults.toolbars[i].title) {
            a.title = defaults.toolbars[i].title;
        }
        if (defaults.toolbars[i].position) {
            var pos = defaults.toolbars[i].position - 1;
            nav.insertBefore(a, nav.children[pos]);
        } else {
            nav.appendChild(a);
        }
        if (defaults.toolbar) {
            editor.area.parentNode.insertBefore(nav, defaults.toolbarPosition == "before" ? editor.area : null);
        }
    }

    var pressed = 0,
        insert = function(chars, s) {
            editor.insert(chars, function() {
                editor.select(s.end + 1, s.end + 1);
            });
            return false;
        };

    editor.area.onkeydown = function(e) {

        var s = editor.selection();

        // Update history data on every 5 key presses
        if (pressed < 5) {
            pressed++;
        } else {
            editor.updateHistory();
            pressed = 0;
        }

        // Auto close for `(`
        if (e.shiftKey && e.keyCode == 57) {
            return insert('(' + s.value + ')', s);
        }

        // Auto close for `{`
        if (e.shiftKey && e.keyCode == 219) {
            return insert('{' + s.value + '}', s);
        }

        // Auto close for `[`
        if (e.keyCode == 219) {
            return insert('[' + s.value + ']', s);
        }

        // Auto close for `"`
        if (e.shiftKey && e.keyCode == 222) {
            return insert('\"' + s.value + '\"', s);
        }

        // Auto close for `'`
        if (e.keyCode == 222) {
            return insert('\'' + s.value + '\'', s);
        }

        // Auto close for `<`
        if (e.shiftKey && e.keyCode == 188) {
            return insert('<' + s.value + '>', s);
        }

        // `Shift + Tab` to outdent
        if (e.shiftKey && e.keyCode == 9) {
            editor.outdent('( *?[0-9]+\. | *?[\\-\\+\\*] |> |' + defaults.tabSize + ')');
            return false;
        }

        // `Tab` to indent
        if (e.keyCode == 9) {
            editor.indent(defaults.tabSize);
            return false;
        }

        // `Ctrl + Z` to undo
        if (e.ctrlKey && e.keyCode == 90) {
            editor.undo();
            return false;
        }

        // `Ctrl + Y` to redo
        if (e.ctrlKey && e.keyCode == 89) {
            editor.redo();
            return false;
        }

        // Add a space before a list item when user is pressing
        // the space bar after typing `1.` or `*` or `-` or `+`
        if (e.keyCode == 32) {
            var match = /(^|\n)([0-9]+\.|[\-\+\*])$/;
            if (s.before.match(match)) {
                editor.area.value = s.before.replace(match, '$1 $2 ') + s.value + s.after;
                editor.select(s.end + 2, s.end + 2);
                return false;
            }
        }

        // `Enter` key was pressed
        if (e.keyCode == 13) {

            // Automatic list increment
            var listItems = /(^|\n)( *?)([0-9]+\.|[\-\+\*]) (.*?)$/;
            if (s.before.match(listItems)) {
                var take = listItems.exec(s.before),
                    list = /[0-9]+\./.test(take[3]) ? parseInt(take[3], 10) + 1 + '.' : take[3]; // <ol> or <ul> ?
                editor.insert('\n' + take[2] + list + ' ');
                return false;
            }

            // Automatic indentation
            var indentBefore = /(^|\n)( +)(.*?)$/.exec(s.before),
                indent = indentBefore ? indentBefore[2] : "";
            if (s.before.match(/[\[\{\(\<\>]$/) && s.after.match(/^[\]\}\)\>\<]/)) {
                editor.insert('\n' + indent + defaults.tabSize + '\n' + indent, function() {
                    editor.select(s.start + indent.length + defaults.tabSize.length + 1, s.start + indent.length + defaults.tabSize.length + 1);
                });
                return false;
            }
            editor.insert('\n' + indent);
            return false;
        }

        // `Backspace` was pressed
        if (e.keyCode == 8) {

            // Remove empty list item quickly
            if(s.value.length === 0 && s.before.match(/( *?)([0-9]+\.|[\-\+\*]) $/)) {
                editor.outdent('( *?)([0-9]+\.|[\-\+\*]) ');
                return false;
            }

            // Remove indentation quickly
            if(s.value.length === 0 && s.before.match(new RegExp(defaults.tabSize + '$'))) {
                editor.outdent(defaults.tabSize);
                return false;
            }
        }

        defaults.keydown(e, editor);

    };

    defaults.ready(editor);

    // Make all library method to be accessible outside the plugin
    base.editor = editor;

};
