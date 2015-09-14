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

	'use strict';

	var config;
	var editor;
	var placeholdersCollection;
	var placeholdersRegexLoose;
	var placeholdersRegexExact;
	var placeholdersMap = {};
	var uiElement;
	var menuButtonStates = {};
	var menuButtonGroup = 'placeholderElementsButton';

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
	 * @param {Placeholder[]} placeholders
	 * @returns {boolean}
	 */
	function hasGroups(placeholders)
	{
		for(var i = 0; i < placeholders.length; i ++)
		{
			if(!!placeholders[i].group)
			{
				return true;
			}
		}
		return false;
	}

	/**
	 * @callback processPlaceholdersCallback
	 * @param {Placeholder} placeholder
	 * @param {string} [group]
	 */

	/**
	 * Iterates over all placeholders in the given list, and invokes
	 * the callback function for every placeholder, where the
	 * placeholder object is passed as a parameter.
	 *
	 * When a group is encountered, the callback receives an additional
	 * argument for the first placeholder in the group, containing the
	 * title of the group.
	 *
	 * @param {Placeholder[]} placeholders
	 * @param {processPlaceholdersCallback} callback
	 */
	function processPlaceholders(placeholders, callback)
	{
		var currentGroup = null;
		for(var i = 0; i < placeholders.length; i ++)
		{
			var placeholder = placeholders[i];
			if(!!placeholder.group && (currentGroup === null || placeholder.group !== currentGroup))
			{
				currentGroup = placeholder.group;
				callback(placeholder, currentGroup);
			}
			else
			{
				callback(placeholder);
			}
		}
	}

	/**
	 * Updates the placeholders regexp objects based on the currently
	 * configured placeholders.
	 *
	 * It generates two objects, one for a loose match, and one for an
	 * exact match.
	 */
	function updatePlaceholdersRegex()
	{
		var matches = [];
		processPlaceholders(placeholdersCollection.toArray(), function(placeholder)
		{
			matches.push(regexQuote(placeholder.value));
		});
		var startDelimiter = regexQuote(config.startDelimiter);
		var endDelimiter = regexQuote(config.endDelimiter);
		var pattern = '(' + startDelimiter + '(' + matches.join('|') + ')' + endDelimiter + ')';

		placeholdersRegexLoose = new RegExp(pattern, 'g');
		placeholdersRegexExact = new RegExp('^' + pattern + '$', 'g');
	}

	/**
	 * Updates the placeholders map based on the currently configured
	 * placeholders.
	 *
	 * The map is used for fast retrieval of a placeholder based on its
	 * formatted placeholder value (ie the value surrounded by possible
	 * delimiters).
	 */
	function updatePlaceholdersMap()
	{
		placeholdersMap = {};
		processPlaceholders(placeholdersCollection.toArray(), function(placeholder)
		{
			placeholdersMap[config.startDelimiter + placeholder.value + config.endDelimiter] = placeholder;
		});
	}

	/**
	 * Updates the user interface based on the currently configured
	 * placeholders.
	 *
	 * @param {Placeholder[]} oldPlaceholders
	 */
	function updateUI(oldPlaceholders)
	{
		if(!uiElement)
		{
			return;
		}
		switch(config.uiType)
		{
			case 'button':
				if(!!uiElement._.menu)
				{
					// Remove all menu items, this has to be done via the "hidden"
					// menu object, as there is no public API for this available
					// on the menu button element itself.
					uiElement._.menu.removeAll();
				}

				processPlaceholders(oldPlaceholders, function(placeholder)
				{
					editor.removeMenuItem(placeholder.value);
				});

				populateMenuButton();
				break;

			case 'combo':
				if(!!uiElement._.list)
				{
					// Clear the listbox... again there is no public API for this
					// task, we need to hack our way through all this "hidden" stuff
					// and empty it ourself.
					uiElement._.list._.pendingList = [];
					uiElement._.list._.pendingList = [];
					uiElement._.list._.items = [];
					uiElement._.list._.groups = [];
					uiElement._.list.element.setHtml('');

					popuplateRichCombo();

					// Commit the changes... you guessed it, the API doesn't really
					// support this, we need to hack into the "hidden" internals and
					// reset the committed state.
					uiElement._.committed = false;
					uiElement.commit();
				}
				break;
		}
	}

	/**
	 * Populates the RichCombo UI element based on the currently
	 * configured placeholders.
	 */
	function popuplateRichCombo()
	{
		var placeholders = placeholdersCollection.toArray();
		if(!hasGroups(placeholders))
		{
			var lang = editor.lang.placeholder_elements;
			uiElement.startGroup(lang.label);
		}

		processPlaceholders(placeholders, function(placeholder, group)
		{
			if(!!group)
			{
				uiElement.startGroup(group);
			}

			uiElement.add(
				config.startDelimiter + placeholder.value + config.endDelimiter,
				placeholder.label,
				placeholder.label
			);
		});
	}

	/**
	 * Populates the MenuButton UI element based on the currently
	 * configured placeholders.
	 */
	function populateMenuButton()
	{
		var uiMenuItems = {};
		menuButtonStates = {};

		processPlaceholders(placeholdersCollection.toArray(), function(placeholder)
		{
			uiMenuItems[placeholder.value] = {
				label: placeholder.label,
				value: config.startDelimiter + placeholder.value + config.endDelimiter,
				group: menuButtonGroup,
				onClick: function()
				{
					editor.insertText(this.value);
				}
			};
			menuButtonStates[placeholder.value] = CKEDITOR.TRISTATE_OFF;
		});
		editor.addMenuItems(uiMenuItems);
	}

	/**
	 * Updates the editor content so that the registered data processor
	 * filters are being invoked.
	 */
	function updateContent()
	{
		editor.setData(editor.getData());
	}

	/**
	 * @typedef {Object} Placeholder
	 * @property {String} label
	 * @property {String} value
	 * @property {String} group
	 */

	/**
	 * @typedef {Object} PlaceholdersCollection~GroupRange
	 * @property {number} begin
	 * @property {number} end
	 */

	/**
	 * @event PlaceholdersCollection#change
	 * @type {Object}
	 * @property {Placeholder[]} placeholders The placeholders contained
	 * in the collection before the change took place.
	 */

	/**
	 * @method
	 * @name PlaceholdersCollection#on
	 * @param {String} eventName The event name to which listen.
	 * @param {Function} listenerFunction The function listening to the
	 * event. A single {@link CKEDITOR.eventInfo} object instanced
	 * is passed to this function containing all the event data.
	 * @param {Object} [scopeObj] The object used to scope the listener
	 * call (the `this` object). If omitted, the current object is used.
	 * @param {Object} [listenerData] Data to be sent as the
	 * {@link CKEDITOR.eventInfo#listenerData} when calling the
	 * listener.
	 * @param {Number} [priority=10] The listener priority. Lower priority
	 * listeners are called first. Listeners with the same priority
	 * value are called in registration order.
	 * @returns {Object} An object containing the `removeListener`
	 * function, which can be used to remove the listener at any time.
	 */

	/**
	 * @method
	 * @name PlaceholdersCollection#fire
	 * @param {String} eventName The event name to fire.
	 * @param {Object} [data] Data to be sent as the
	 * {@link CKEDITOR.eventInfo#data} when calling the listeners.
	 * @param {CKEDITOR.editor} [editor] The editor instance to send as the
	 * {@link CKEDITOR.eventInfo#editor} when calling the listener.
	 * @returns {Boolean/Object} A boolean indicating that the event is to be
	 * canceled, or data returned by one of the listeners.
	 */

	/**
	 * @method
	 * @name PlaceholdersCollection#removeListener
	 * @param {String} eventName The event name.
	 * @param {Function} listenerFunction The listener function to unregister.
	 */

	/**
	 * @method
	 * @name PlaceholdersCollection#removeAllListeners
	 */

	/**
	 * @method
	 * @name PlaceholdersCollection#hasListeners
	 * @param {String} eventName The event name.
	 * @returns {Boolean}
	 */

	/**
	 * @class
	 * @constructor
	 * @fires PlaceholdersCollection#change
	 */
	function PlaceholdersCollection()
	{
		CKEDITOR.event.implementOn(this);

		var items = [];

		var suppressEvents = false;

		/**
		 * Adds a placeholder.
		 *
		 * @param {Placeholder} placeholder
		 * @returns {number} The new length of the collection.
		 */
		this.add = function(placeholder)
		{
			var old = this.toArray();
			items.push(placeholder);
			if(!suppressEvents) this.fire('change', {placeholders: old});
			return items.length;
		};

		/**
		 * Adds a placeholder at the given index.
		 *
		 * @param {number} index
		 * @param {Placeholder} placeholder
		 * @returns {number} The new length of the collection.
		 */
		this.addAt = function(index, placeholder)
		{
			var old = this.toArray();
			items.splice(index, 0, placeholder);
			if (!suppressEvents) this.fire('change', { placeholders: old });
			return items.length;
		};

		/**
		 * Adds a placeholder to its defined group.
		 *
		 * @param {Placeholder} placeholder
		 * @returns {number} The new length of the collection.
		 */
		this.addToGroup = function(placeholder)
		{
			var range = this.getGroupRange(placeholder.group);
			if(range !== null)
			{
				this.addAt(range.end + 1, placeholder);
			}
			return items.length;
		};

		/**
		 * Adds a placeholder to its defined group at the given index.
		 *
		 * The index is relative to the first placeholder in the group,
		 * ie an index of `0` adds the placeholder to the beginning of
		 * the group.
		 *
		 * @param {number} index
		 * @param {Placeholder} placeholder
		 * @returns {number} The new length of the collection.
		 */
		this.addToGroupAt = function(index, placeholder)
		{
			var range = this.getGroupRange(placeholder.group);
			if(range !== null)
			{
				this.addAt(Math.min(range.begin + index, range.end + 1), placeholder);
			}
			return items.length;
		};

		/**
		 * Retrieves the placeholder at the given index.
		 *
		 * @param {number} index
		 * @returns {Placeholder|null}
		 */
		this.getAt = function(index)
		{
			if(index in items)
			{
				return items[index];
			}
			return null;
		};

		/**
		 * Returns the range of the given group.
		 *
		 * @param {string} group
		 * @returns {PlaceholdersCollection~GroupRange|null}
		 */
		this.getGroupRange = function(group)
		{
			var range = {
				begin: -1,
				end: -1
			};

			var foundGroup = false;
			for(var i = 0; i < items.length; i ++)
			{
				var item = items[i];
				if(!foundGroup && item.group === group)
				{
					range.begin = i;
					foundGroup = true;
				}
				if(foundGroup)
				{
					if(item.group !== group)
					{
						range.end = i - 1;
						break;
					}
					else if(i === items.length - 1)
					{
						range.end = i;
						break;
					}
				}
			}

			if(range.begin === -1 || range.end === -1)
			{
				return null;
			}

			return range;
		};

		/**
		 * Retrieves the index of the given placeholder.
		 *
		 * @param {Placeholder} placeholder
		 * @returns {number}
		 */
		this.indexOf = function(placeholder)
		{
			for(var i = 0; i < items.length; i ++)
			{
				var item = items[i];
				if(
					item.label === placeholder.label &&
					item.value === placeholder.value &&
					item.group === placeholder.group
				)
				{
					return i;
				}
			}
			return -1;
		};

		/**
		 * Retrieves the index of the given placeholder in its defined
		 * group.
		 *
		 * @param {Placeholder} placeholder
		 * @returns {number}
		 */
		this.indexOfInGroup = function(placeholder)
		{
			var range = this.getGroupRange(placeholder.group);
			if(range !== null)
			{
				for(var i = range.begin; i <= range.end; i ++)
				{
					var item = items[i];
					if(
						item.label === placeholder.label &&
						item.value === placeholder.value &&
						item.group === placeholder.group
					)
					{
						return i - range.begin;
					}
				}
			}
			return -1;
		};

		/**
		 * Removes the given placeholder.
		 *
		 * @param {Placeholder} placeholder
		 * @returns {number} The new length of the collection.
		 */
		this.remove = function(placeholder)
		{
			return this.removeAt(this.indexOf(placeholder));
		};

		/**
		 * Removes the placeholder at the given index.
		 *
		 * @param {number} index
		 * @returns {number} The new length of the collection.
		 */
		this.removeAt = function(index)
		{
			if(index in items)
			{
				var old = this.toArray();
				items.splice(index, 1);
				if (!suppressEvents) this.fire('change', { placeholders: old });
			}
			return items.length;
		};

		/**
		 * Returns the length of the collection.
		 *
		 * @returns {number}
		 */
		this.length = function()
		{
			return items.length;
		};

		/**
		 * Returns an array containing the elements of this collection.
		 *
		 * @returns {Placeholder[]}
		 */
		this.toArray = function()
		{
			return items.slice();
		};

		/**
		 * Replace the elements of this collection with the supplied array.
		 * @param {Placeholder[]}
		 * @returns {number} The new length of the collection.
		 */
		this.fromArray = function (placeholders) {
		    if(!(placeholders instanceof Array)) return items.length;

		    var old = this.toArray();

		    suppressEvents = true;

		    items = [];

		    for (var x = 0; x < placeholders.length; x++) {
		        var placeholder = placeholders[x];

		        if (placeholder.group !== undefined && this.getGroupRange(placeholder.group) !== null) {
		            this.addToGroup(placeholder);
		        }
		        else {
		            this.add(placeholder);
		        }
		    }

		    suppressEvents = false;

		    this.fire('change', { placeholders: old });
		    return items.length;
		};
	}

	placeholdersCollection = new PlaceholdersCollection();

	CKEDITOR.plugins.add('placeholder_elements', {
		hidpi: true,
		icons: 'placeholderelements',
		lang: ['en', 'de'],
		requires: ['richcombo', 'widget'],

		placeholders: placeholdersCollection,

		init: function(ed)
		{
			editor = ed;

			var defaults = {
				css:
					'.cke_placeholder_element { background: #ffff00; } ' +
					'a .cke_placeholder_element { text-decoration: underline }',
				draggable: false,
				placeholders: [],
				startDelimiter: '{',
				endDelimiter: '}',
				uiType: 'button'
			};
			config =
				editor.config.placeholder_elements =
					CKEDITOR.tools.extend(editor.config.placeholder_elements || {}, defaults);

			CKEDITOR.addCss(config.css);

			var currentGroup = null;
			for(var i = 0; i < config.placeholders.length; i ++)
			{
				var placeholder = config.placeholders[i];
				if(!!placeholder.group && !!placeholder.placeholders)
				{
					if(placeholder.group !== currentGroup)
					{
						currentGroup = placeholder.group;
					}

					for(var j = 0; j < placeholder.placeholders.length; j ++)
					{
						var groupedPlaceholder = placeholder.placeholders[j];
						placeholdersCollection.add({
							label: groupedPlaceholder.label,
							value: groupedPlaceholder.value,
							group: currentGroup
						});
					}
				}
				else
				{
					placeholdersCollection.add({
						label: placeholder.label,
						value: placeholder.value
					});
				}
			}

			updatePlaceholdersRegex();
			updatePlaceholdersMap();

			placeholdersCollection.on('change', function(event)
			{
				updatePlaceholdersRegex();
				updatePlaceholdersMap();
				updateUI(event.data.placeholders);
				updateContent();
			});

			var lang = editor.lang.placeholder_elements;
			switch(config.uiType)
			{
				case 'button':
					editor.addMenuGroup(menuButtonGroup);

					editor.ui.add('PlaceholderElements', CKEDITOR.UI_MENUBUTTON, {
						label: lang.label,
						title: lang.title,
						toolbar: 'insert',

						onRender: function()
						{
							uiElement = this;
						},

						onMenu: function()
						{
							return menuButtonStates;
						}
					});

					populateMenuButton();
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
							uiElement = this;
							popuplateRichCombo();
						},

						onClick: function(value)
						{
							editor.insertText(value);
						},

						onRender: function()
						{
							editor.on('selectionChange', function(ev)
							{
								var currentValue = this.getValue();

								var elements = ev.data.path.elements;
								for(var i = 0; i < elements.length; i ++)
								{
									var element = elements[i];
									var text = element.$.textContent.toString();
									if (text !== currentValue && text.match(placeholdersRegexExact)) {
										this.setValue(text, placeholdersMap[text].label);
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

				data: function()
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
			editor.dataProcessor.dataFilter.addRules({
				text: function(text)
				{
					return text.replace(placeholdersRegexLoose, function(match)
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