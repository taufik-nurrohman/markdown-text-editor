Markdown Text Editor Plugin
===========================

As mentioned in the title above.

**2014-09-04:** [The HTML version of this editor is available!](https://github.com/tovic/html-text-editor "HTE – HTML Text Editor")

Demo
----

![markdown-text-editor](https://f.cloud.github.com/assets/1669261/2492943/8db3fa4e-b26a-11e3-8d5e-823c8d594b64.png)

→ https://rawgit.com/tovic/markdown-text-editor/master/index.html

Requires
--------

 * [This](https://github.com/tovic/simple-text-editor-library "Simple Text Editor Library") text editor library
 * Icon fonts from [Font Awesome](https://github.com/FortAwesome/Font-Awesome "Font Awesome")

Basic Usage
-----------

Put icon fonts and CSS files in the `<head>`:

~~~ .html
<link href="css/font-awesome.min.css" rel="stylesheet">
<link href="css/mte.min.css" rel="stylesheet">
~~~

Create a `<textarea>` element in the body:

~~~ .html
<textarea></textarea>
~~~

Put editor and **MTE** plugin after the `<textarea>` element then execute the plugin:

~~~ .html
<script src="js/editor.min.js"></script>
<script src="js/mte.min.js"></script>
<script>
var myEditor = new MTE(document.getElementsByTagName('textarea')[0]);
</script>
~~~

Options
-------

Read more on the [Wiki Pages](https://github.com/tovic/markdown-text-editor/wiki)