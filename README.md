Markdown Text Editor Plugin
===========================

As mentioned in the title above.

Requires:
---------

 * [This](https://github.com/tovic/simple-text-editor-library "Simple Text Editor Library") text editor library
 * Icon fonts from [Font Awesome](http://fortawesome.github.io/Font-Awesome/icons "Font Awesome Icons")

Basic Usage:
------------

Place the icon fonts and the CSS file in the head:

``` .html
<link href="css/font-awesome.css" rel="stylesheet">
<link href="css/style.css" rel="stylesheet">
```

Create a textarea element in the body:

``` .html
<textarea></textarea>
```

Place the library and the editor plugin after the textarea element then execute the plugin:

``` .html
<script src="js/library.js"></script>
<script src="js/mte.js"></script>
<script>
var myEditor = new MTE(document.getElementsByTagName('textarea')[0]);
</script>
```

Options:
--------
Read more on the [Wiki pages](https://github.com/tovic/markdown-text-editor/wiki)

