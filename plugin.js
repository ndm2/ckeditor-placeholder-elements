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

	/**
	 * Checks whether the given placeholders contain any groups.
	 *
	 * @param {Object[]} placeholders
	 * @returns {boolean}
	 */
	function hasGroups(placeholders)
	{
		for(var i = 0; i < placeholders.length; i ++)
		{
			if('group' in placeholders[i])
			{
				return true;
			}
		}
		return false;
	}

	var placeholdersRegex;

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

			var placeholders = config.placeholders;
			var placeholderMatches = [];
			var placeholdersValueLabelMap = {};
			for(var i = 0; i < placeholders.length; i ++)
			{
				var placeholder = placeholders[i];
				if('group' in placeholder)
				{
					for(var j = 0; j < placeholder.placeholders.length; j ++)
					{
						placeholderMatches.push(regexQuote(placeholder.placeholders[j].value));
						placeholdersValueLabelMap[config.startDelimiter + placeholder.placeholders[j].value + config.endDelimiter] = placeholder.placeholders[j].label;
					}
				}
				else
				{
					placeholderMatches.push(regexQuote(placeholder.value));
					placeholdersValueLabelMap[config.startDelimiter + placeholder.value + config.endDelimiter] = placeholder.label;
				}
			}

			var startDelimiter = regexQuote(config.startDelimiter);
			var endDelimiter = regexQuote(config.endDelimiter);
			placeholdersRegex = '(' + startDelimiter + '(' + placeholderMatches.join('|') + ')' + endDelimiter + ')';

			CKEDITOR.addCss(config.css);

			var menuGroup = 'placeholderElementsButton';
			editor.addMenuGroup(menuGroup);

			var uiMenuItems = {};
			var uiMenuItemStates = {};
			for(i = 0; i < placeholders.length; i ++)
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
							if(!hasGroups(placeholders))
							{
								this.startGroup(lang.label);
							}

							for(var i = 0; i < placeholders.length; i ++)
							{
								var placeholder = placeholders[i];
								if('group' in placeholder)
								{
									this.startGroup(placeholder.group);
									for(var j = 0; j < placeholder.placeholders.length; j ++)
									{
										var groupedPlaceholder = placeholder.placeholders[j];
										this.add(
											config.startDelimiter + groupedPlaceholder.value + config.endDelimiter,
											groupedPlaceholder.label,
											groupedPlaceholder.label
										);
									}
								}
								else
								{
									this.add(
										config.startDelimiter + placeholder.value + config.endDelimiter,
										placeholder.label,
										placeholder.label
									);
								}
							}
						},

						onClick: function(value)
						{
							editor.insertText(value);
						},

						onRender: function()
						{
							editor.on('selectionChange', function(ev)
								{
									var regexp = new RegExp('^' + placeholdersRegex + '$');
									var currentValue = this.getValue();

									var elements = ev.data.path.elements;
									for(var i = 0; i < elements.length; i ++)
									{
										var element = elements[i];
										var text = element.$.innerText.toString();
										if(text !== currentValue && text.match(regexp))
										{
											this.setValue(text, placeholdersValueLabelMap[text]);
											return;
										}
									}

									this.setValue('');
								},
								this);
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
			var regexp = new RegExp(placeholdersRegex, 'g');

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