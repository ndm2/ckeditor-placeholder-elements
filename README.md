# CKEditor Placeholder Elements Plugin

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

* clone or download and unpack the repository into `ckeditor/plugins/placeholder_elements/`
* use [Bower](http://bower.io)
* or [Composer](https://getcomposer.org) (optionally in combination with
[mnsami/composer-installer-plugin](https://github.com/mnsami/composer-installer-plugin))

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
	css: '.cke_placeholder_element { background: #ffff00; } a .cke_placeholder_element { text-decoration: underline }',

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


## Issues

Please use the [issue tracker](https://github.com/ndm2/ckeditor-placeholder-elements/issues) to report problems.


## License

Licensed under [The MIT License](http://www.opensource.org/licenses/mit-license.php).