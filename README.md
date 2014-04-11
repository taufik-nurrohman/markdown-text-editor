Markdown Text Editor Plugin
===========================

As mentioned in the title above.

Demo
----

![b2d6d8be-af36-11e3-8b6f-9d0cf3518fb7](https://f.cloud.github.com/assets/1669261/2492943/8db3fa4e-b26a-11e3-8d5e-823c8d594b64.png)

&rarr; http://rawgithub.com/tovic/markdown-text-editor/master/index.html

Requires
--------

 * [This](https://github.com/tovic/simple-text-editor-library "Simple Text Editor Library") text editor library
 * Icon fonts from [Font Awesome](http://fortawesome.github.io/Font-Awesome/icons "Font Awesome Icons")

Basic Usage
-----------

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

Options
-------

Read more on the [Wiki pages](https://github.com/tovic/markdown-text-editor/wiki)