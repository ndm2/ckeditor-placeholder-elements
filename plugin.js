/**
 * CKEditor Placeholder Elements Plugin
 *
 * Licensed under The MIT License.
 *
 * @author  Oliver Nowak <info@nowak-media.de>
 * @see     https://github.com/ndm2/ckeditor-placeholder-elements
 * @license http://www.opensource.org/licenses/mit-license.php MIT License
 */

(function() {

	/**
	 * Quotes a string for use in a regular expression.
	 *
	 * @param {string} value The string to quote
	 * @returns {string} The quoted string
	 */
	function regexQuote(value)
	{
		return value.replace(/[\\\^\$\*\+\?\.\(\)\|\{\}\[\]]/g, '\\$&');
	}

	CKEDITOR.plugins.add('placeholder_elements', {
		hidpi: true,
		icons: 'placeholderelements',
		lang: ['en', 'de'],
		requires: ['richcombo', 'widget'],

		init: function(editor)
		{
			var defaults = {
				css: '.cke_placeholder_element { background: #ffff00; } a .cke_placeholder_element { text-decoration: underline }',
				draggable: false,
				placeholders: [],
				startDelimiter: '{',
				endDelimiter: '}',
				uiType: 'button'
			};
			var config = editor.config.placeholder_elements = CKEDITOR.tools.extend(editor.config.placeholder_elements || {}, defaults);
			var lang = editor.lang.placeholder_elements;

			CKEDITOR.addCss(config.css);

			var menuGroup = 'placeholderElementsButton';
			editor.addMenuGroup(menuGroup);

			var placeholders = config.placeholders;
			var uiMenuItems = {};
			var uiMenuItemStates = {};
			for(var i = 0; i < placeholders.length; i ++)
			{
				uiMenuItems[placeholders[i].value] = {
					label: placeholders[i].label,
					value: config.startDelimiter + placeholders[i].value + config.endDelimiter,
					group: menuGroup,
					onClick: function()
					{
						editor.insertText(this.value);
					}
				};
				uiMenuItemStates[placeholders[i].value] = CKEDITOR.TRISTATE_OFF;
			}
			editor.addMenuItems(uiMenuItems);

			switch(config.uiType)
			{
				case 'button':
					editor.ui.add('PlaceholderElements', CKEDITOR.UI_MENUBUTTON, {
						label: lang.label,
						title: lang.title,
						toolbar: 'insert',

						onMenu: function()
						{
							return uiMenuItemStates;
						}
					});
					break;

				case 'combo':
					editor.ui.add('PlaceholderElements', CKEDITOR.UI_RICHCOMBO, {
						label: lang.label,
						title: lang.title,
						toolbar: 'insert',

						panel: {
							css: [CKEDITOR.skin.getPath('editor')].concat(editor.config.contentsCss),
							multiSelect: false,
							attributes: {
								'aria-label': lang.title
							}
						},

						init: function()
						{
							this.startGroup(lang.label);
							for(var i = 0; i < placeholders.length; i ++)
							{
								var placeholder = placeholders[i];
								this.add(
									config.startDelimiter + placeholder.value + config.endDelimiter,
									placeholder.label,
									placeholder.label
								);
							}
						},

						onClick: function(value)
						{
							editor.insertText(value);
						}
					});
					break;
			}

			editor.widgets.add('placeholder_elements', {
				draggable: config.draggable,
				pathName: lang.pathName,

				init: function()
				{
					this.setData('name', this.element.getText());
				},

				data: function(data)
				{
					this.element.setText(this.data.name);
				},

				downcast: function()
				{
					return new CKEDITOR.htmlParser.text(this.data.name);
				}
			});
		},

		afterInit: function(editor)
		{
			var config = editor.config.placeholder_elements;
			var placeholders = config.placeholders;

			var placeholderMatches = [];
			for(var i = 0; i < placeholders.length; i ++)
			{
				placeholderMatches.push(regexQuote(placeholders[i].value));
			}

			var startDelimiter = regexQuote(config.startDelimiter);
			var endDelimiter = regexQuote(config.endDelimiter);

			var regexp = new RegExp(
				'(' + startDelimiter + '(' + placeholderMatches.join('|') + ')' + endDelimiter + ')', 'g'
			);

			editor.dataProcessor.dataFilter.addRules({
				text: function(text, node)
				{
					return text.replace(regexp, function(match)
					{
						var element = new CKEDITOR.htmlParser.element('span', {
							'class': 'cke_placeholder_element'
						});
						element.add(new CKEDITOR.htmlParser.text(match));

						return editor.widgets.wrapElement(element, 'placeholder_elements').getOuterHtml();
					});
				}
			});
		}
	});

})();