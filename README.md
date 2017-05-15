# CKEditor Placeholder Elements Plugin

[![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE.txt)
[![Build Status](https://img.shields.io/travis/ndm2/ckeditor-placeholder-elements/master.svg?style=flat-square)](https://travis-ci.org/ndm2/ckeditor-placeholder-elements)

This is a [CKEditor](http://ckeditor.com/) plugin that adds support for predefined placeholder elements.


## What's it good for?

Well, in case you want the user to be able to use placeholders from a predefined collection, there you go...
actually it's pretty much for my own specific use, but if it fits your needs, have fun with it.


## Requirements

This plugins requires CKEditor 4.3+ and the following plugins:

* [Rich Combo](http://ckeditor.com/addon/richcombo)
* [Widget](http://ckeditor.com/addon/widget)


## How to use?

### Installation

You can either

* use [Bower](http://bower.io)
  ```bash
  $ bower install ndm2-ckeditor-placeholder-elements
  ```

* clone or download and unpack the repository into `ckeditor/plugins/placeholder_elements/`
  ```bash
  $ git clone --depth=1 https://github.com/ndm2/ckeditor-placeholder-elements ./ckeditor/plugins/placeholder_elements/
  ```

* or use [Composer](https://getcomposer.org) (optionally in combination with a custom directory installer like for
example [mnsami/composer-installer-plugin](https://github.com/mnsami/composer-installer-plugin))
  ```bash
  $ composer require ndm2/ckeditor-placeholder-elements
  ```

If you can't install the plugin directly in the CKEditor plugin folder, use
[`CKEDITOR.plugins.addExternal()`](http://docs.ckeditor.com/#!/api/CKEDITOR.resourceManager-method-addExternal) to
point the editor to the directory where you've placed the plugin.


### Configuration

Include the name of the plugin in the ckeditor `extraPlugins` option:

```js
config.extraPlugins = 'placeholder_elements';
```

By default the UI element is appended to the [`insert` toolbar](http://docs.ckeditor.com/#!/guide/dev_toolbar).
In case you want to [place it manually](http://docs.ckeditor.com/#!/guide/dev_toolbar-section-%22item-by-item%22-configuration),
use `PlaceholderElements` as the identifier.

The following options are available for configuration:

```js
config.placeholder_elements = {
	// The CSS applied to the placeholder elements.
	css:
		'.cke_placeholder_element { background: #ffff00; }' +
		'a .cke_placeholder_element { text-decoration: underline }',

	// Defines whether the placeholders should be draggable.
	draggable: false,

	/**
	 * A list of placeholders, defined as objects with `label` and `value`
	 * properties, where the label is being displayed in the menu, and value
	 * is used as the placeholder text.
	 *
	 * Note that delimiters are added automatically, so the value should be
	 * defined without!
	 *
	 * [
	 *     {label: 'Placeholder 1', value: 'PLACEHOLDER_1'},
	 *     {label: 'Placeholder 2', value: 'PLACEHOLDER_2'},
	 *     {label: 'Placeholder 3', value: 'PLACEHOLDER_3'},
	 *     // ...
	 * ]
	 *
	 * When using the `combo` UI type, it's also possible to define groups
	 * using the `group` and `placeholders` keys, where `group` defines the
	 * title of group that is displayed in the menu, and `placeholders` is an
	 * array that holds the groups placeholders.
	 *
	 * Note that grouping is only a visual thing, placeholder values must still
	 * be unique!
	 *
	 * [
	 *     {
	 *         group: 'Group 1',
	 *         placeholders: [
	 *             {label: 'Placeholder 1', value: 'PLACEHOLDER_1'},
	 *             {label: 'Placeholder 2', value: 'PLACEHOLDER_2'}
	 *         ]
	 *     },
	 *     {
	 *         group: 'Group 2',
	 *         placeholders: [
	 *             {label: 'Placeholder 3', value: 'PLACEHOLDER_4'},
	 *             {label: 'Placeholder 4', value: 'PLACEHOLDER_5'}
	 *         ]
	 *     },
	 *     // ...
	 * ]
	 */
	placeholders: [],

	// Defines the delimiter that indicates the start of a placeholder
	startDelimiter: '{',

	// Defines the delimiter that indicates the end of a placeholder
	endDelimiter: '}'

	/**
	 * Defines the type of UI element that holds the placeholders. Either
	 * `button` or `combo`.
	 */
	uiType: 'button'
};
```


### Modifying the list of placeholders at runtime

The available placeholders can be modified at runtime using the instance of the `PlaceholdersCollection` class
associated with the corresponding plugin instance.

Changes made to this collection are automatically being applied to the editor UI and content.

```js
var editorIdentifier = 'editor1'; // in most cases this is the ID or
                                  // name of the DOM element replaced
                                  // by the editor
var editor = CKEDITOR.instances[editorIdentifier];
var plugin = editor.plugins.placeholder_elements.instances[editor.id];

/** @type {PlaceholdersCollection} */
var placeholders = plugin.placeholders;
```

Add a new placeholder
```js
var placeholder = {label: 'Foo', value: 'FOO'};
placeholders.add(placeholder);
```

Add a new placeholder to an existing group (or append a new group in case it doesn't exist yet)
```js
var placeholder = {label: 'Foo', value: 'FOO', group: 'Bar'};
placeholders.addToGroup(placeholder);
```

Remove the third placeholder
```js
placeholders.removeAt(2);
```

Modify an existing placeholder
```js
var placeholder = placeholders.getAt(2);
placeholder.label = 'New Label';
placeholders.replaceAt(2, placeholder);
```

For more check out the [`PlaceholdersCollection` class](https://github.com/ndm2/ckeditor-placeholder-elements/blob/master/plugin.js)
source.

**Note** that applying multiple consecutive changes can lead to flickering, due to the nature of `change` events causing
UI and content updates. Make use of the `PlaceholdersCollection.batchChanges()` method to avoid this, changes made from
the callback passed to this method will cause only a single `change` event to be fired afterwards.

```js
placeholders.batchChanges(function()
{
	this.replaceAt(2, {label: 'Foo', value: 'FOO'});
	this.add({label: 'Bar', value: 'BAR'});
});
```


## Issues

Please use the [issue tracker](https://github.com/ndm2/ckeditor-placeholder-elements/issues) to report problems.


## License

Licensed under [The MIT License](http://www.opensource.org/licenses/mit-license.php).