/**
 * Requires
 */
import { UiComponent } from '@squirrel-forge/ui-core';
import {
    EventDispatcher,
    Exception,
    bindNodeList,
    getFocusable,
    tabFocusLock,
    trimChar
} from '@squirrel-forge/ui-util';

/**
 * Ui modal component exception
 * @class
 * @extends Exception
 */
class UiModalComponentException extends Exception {}

/**
 * Ui modal shown callback
 * @callback UiModalCallbackShow
 * @param {Function} complete - Function to call when animation is completed
 * @param {Object|UiModalComponent} - Modal component instance
 * @return {void}
 */

/**
 * Ui modal hidden callback
 * @callback UiModalCallbackHide
 * @param {Function} complete - Function to call when animation is completed
 * @param {Object|UiModalComponent} - Modal component instance
 * @return {void}
 */

/**
 * Ui modal id getter function
 * @typedef {Function} modalIdGetter
 * @param {HTMLElement} opener - Trigger element
 * @param {Function} defaultIdGetter - Default id getter function
 * @return {string|null} - Modal id
 */

/**
 * Ui modal settings
 * @typedef {Object} UiModalSettings
 * @property {documentElement|HTMLElement} context - Context element, default: document.documentElement
 * @property {string} openInContextClass - Class set on context when modal is open, default: 'ui-modal-context--active'
 * @property {('modal'|'alert'|'confirm'|'prompt')} mode - Interaction mode, might require a corresponding plugin, should be set via the UiModalComponent.mode = <string>, default 'modal'
 * @property {Array<mode>} availableModes - Available modes, default: [ 'modal' ]
 * @property {string} modeClass - Mode class prefix, default: 'ui-modal--'
 * @property {boolean} restrictFocus - Restrict tab focus to modal content, default: true
 * @property {boolean|Array<mode>} focusOnShown - Focus first contained element when shown, default: true
 * @property {boolean|Array<mode>} focusLast - Focus last contained element when shown, focusOnShown must be active, default: false
 * @property {boolean} focusResetOnHidden - Reset focus to the element that was focused before opening the modal, default: true
 * @property {boolean|Array<mode>} easyHide - Hide on click outside dialog or keyboard escape key, default: true
 * @property {UiModalAnimators} animator - Custom animators
 * @property {UiModalDomReferences} dom - Dom references
 */

/**
 * Ui modal custom animators
 * @typedef {Object} UiModalAnimators
 * @property {null|UiModalCallbackShow} show - Show modal animator
 * @property {null|UiModalCallbackHide} hide - Hide modal animator
 * @property {number} speed - Animation speed in ms, default: 300
 */

/**
 * Ui modal dom references
 * @typedef {Object} UiModalDomReferences
 * @property {string} native - Native dialog reference, default: 'dialog'
 * @property {string} dialog - Dialog, default: '.ui-modal__dialog'
 * @property {null|string} focusable - Focusable elements, uses the tabFocusLock default selector if not set, default: null
 * @property {string} title - Modal title, default: '.ui-modal__dialog-title'
 * @property {string} content - Modal content, default: '.ui-modal__dialog-content'
 * @property {string} close - Close buttons, default: '[data-modal="ctrl:close"]'
 */

/**
 * Ui modal component states
 * @typedef {Object} UiModalStates
 * @property {ComponentStateDefinition} initialized - Initialized state
 * @property {ComponentStateDefinition} closed - Modal closed state
 * @property {ComponentStateDefinition} open - Modal open state
 * @property {ComponentStateDefinition} animating - Modal transition/animating state
 */

/**
 * Ui modal available plugins
 * @typedef {Array<(UiModalPluginAlert|UiModalPluginConfirm|UiModalPluginPrompt)>} UiModalPlugins
 */

/**
 * Ui modal component
 * @class
 * @extends UiComponent
 */
export class UiModalComponent extends UiComponent {

    /**
     * Last focus origin
     * @private
     * @property
     * @type {null|HTMLElement}
     */
    #origin = null;

    /**
     * Bind modal opener links
     * @param {Array<UiModalComponent>} modals - List of modals
     * @param {document|HTMLElement} context - Selection context
     * @param {string} selector - Opener trigger selector
     * @param {modalIdGetter|Function|null} getModalId - Modal id getter function
     * @return {void}
     */
    static bindOpeners(
        modals,
        context = document,
        selector = '[data-modal="ctrl:open"]',
        getModalId = null
    ) {

        // Modals must always be an array
        if ( !( modals instanceof Array ) ) {
            throw new UiModalComponentException( 'Argument modals must be an Array of UiModalComponent instances' );
        }

        // Context must allow us to select elements
        if ( typeof context.querySelectorAll !== 'function' ) {
            throw new UiModalComponentException( 'Argument context must supply a querySelectorAll method' );
        }

        // Element selected from context must always be a list
        const openers = context.querySelectorAll( selector );
        if ( !( openers instanceof NodeList || openers instanceof Array ) ) {
            throw new UiModalComponentException( 'Argument context.querySelectorAll must return a NodeList or Array' );
        }

        /**
         * Default modal id getter
         * @param {HTMLElement} opener - Modal trigger
         * @return {string|null} - Modal id
         */
        const defaultIdGetter = ( opener ) => {
            const attributes = [ 'data-modal-id', 'aria-controls', 'href', 'value' ];
            for ( let i = 0; i < attributes.length; i++ ) {
                if ( opener.hasAttribute( attributes[ i ] ) ) {
                    const attr_value = opener.getAttribute( attributes[ i ] );
                    if ( attr_value ) return trimChar( attr_value, '#' );
                }
            }
            return null;
        };

        // If there is no custom id getter use the default
        if ( typeof getModalId !== 'function' ) getModalId = defaultIdGetter;

        // Bind all openers
        for ( let i = 0; i < openers.length; i++ ) {
            const opener = openers[ i ];
            opener.addEventListener( 'click', ( event ) => {
                event.preventDefault();
                const modal_id = getModalId( opener, defaultIdGetter );
                if ( typeof modal_id !== 'string' || !modal_id.length ) {
                    throw new UiModalComponentException( 'Failed to get target modal id on opener' );
                }
                for ( let j = 0; j < modals.length; j++ ) {
                    if ( modals[ j ].dom.id === modal_id ) {
                        modals[ j ].open = true;
                        return;
                    }
                }
                throw new UiModalComponentException( 'Modal opener could not find the target modal for: ' + modal_id );
            } );
        }
    }

    /**
     * Element selector getter
     * @public
     * @return {string} - Element selector
     */
    static get selector() {
        return '[is="ui-modal"]:not([data-state])';
    }

    /**
     * Constructor
     * @constructor
     * @param {HTMLElement|HTMLElement} element - Block element
     * @param {null|UiModalSettings|Object} settings - Config object
     * @param {Object} defaults - Default config
     * @param {Array<UiModalSettings|Object>} extend - Extend default config
     * @param {UiModalStates|Object} states - States definition
     * @param {UiModalPlugins|Array<Function|Array<Function,*>>} plugins - Plugins to load
     * @param {null|UiComponent} parent - Parent object
     * @param {null|console|Object} debug - Debug object
     * @param {boolean} init - Run init method
     */
    constructor(
        element,
        settings = null,
        defaults = null,
        extend = null,
        states = null,
        plugins = null,
        parent = null,
        debug = null,
        init = true
    ) {

        /**
         * Default config
         * @type {Object}
         */
        defaults = defaults || {

            // Context element
            // @type {documentElement|HTMLElement}
            context : document.documentElement,

            // Class set on context when modal is open
            // @type {string}
            openInContextClass : 'ui-modal-context--active',

            // Interaction mode, should be set via the UiModalComponent.mode = <string>
            // @type {('modal')}
            mode : 'modal',

            // Available modes
            // @type {Array<mode>}
            availableModes : [ 'modal' ],

            // Mode class prefix
            // @type {string}
            modeClass : 'ui-modal--',

            // Restrict tab focus to modal content
            // @type {boolean}
            restrictFocus : true,

            // Focus first contained element when shown
            // @type {boolean|Array<config.mode>}
            focusOnShown : true,

            // Focus last contained element when shown, focusOnShown must be active
            // @type {boolean|Array<config.mode>}
            focusLast : false,

            // Reset focus to the element that was focused before opening the modal
            // @type {boolean}
            focusResetOnHidden : true,

            // Hide on click outside dialog or keyboard escape key
            // @type {boolean|Array<config.mode>}
            easyHide : true,

            // Custom animators
            // @type {Object}
            animator : {

                // Show modal animator
                // @type {null|UiModalCallbackShow}
                show : null,

                // Hide modal animator
                // @type {null|UiModalCallbackHide}
                hide : null,

                // Animation speed, default: 300ms
                // @type {number}
                speed : null,

                // Control visibility, default: true
                // @type {boolean}
                vis : true,
            },

            // Dom references
            // @type {Object}
            dom : {

                // Native dialog reference
                // @type {string}
                native : 'dialog',

                // Dialog
                // @type {string}
                dialog : '.ui-modal__dialog',

                // Focusable elements, uses the tabFocusLock default selector if not set
                // @type {null|string}
                focusable : null,

                // Modal title
                // @type {string}
                title : '.ui-modal__dialog-title',

                // Modal title
                // @type {string}
                content : '.ui-modal__dialog-content',

                // Close buttons
                // @type {string}
                close : '[data-modal="ctrl:close"]',
            }
        };

        /**
         * Default states
         * @type {Object}
         */
        states = states || {
            initialized : { classOn : 'ui-modal--initialized' },
            closed : { classOn : 'ui-modal--closed', unsets : [ 'open' ] },
            open : { classOn : 'ui-modal--open', unsets : [ 'closed' ] },
            animating : { global : false, classOn : 'ui-modal--animating' },
        };

        // Initialize parent
        super( element, settings, defaults, extend, states, plugins, parent, debug, init );
    }

    /**
     * Initialize component
     * @public
     * @return {void}
     */
    init() {

        // Check context compatibility
        if ( !EventDispatcher.isCompat( this.config.get( 'context' ) ) ) {
            throw new UiModalComponentException( 'Option context must be an EventTarget compatible object' );
        }

        // Default aria properties
        const native = this.getDomRefs( 'native', false );
        if ( !native ) {
            this.dom.setAttribute( 'role', 'dialog' );
            this.dom.setAttribute( 'aria-modal', 'true' );
        }

        // Initialize tab focus locking
        tabFocusLock( this.dom, () => { return this.open && this.config.get( 'restrictFocus' ); }, true, this.config.get( 'dom.focusable' ) );

        // Bind events
        this.bind();

        // Initial hidden state
        if ( this.config.get( 'animator.vis' ) ) this.dom.style.display = 'none';
        if ( native ) native.removeAttribute( 'open' );
        ( native || this.dom ).setAttribute( 'aria-hidden', 'true' );
        this.states.set( 'closed' );
        const context_class = this.config.get( 'openInContextClass' );
        if  ( context_class ) this.config.get( 'context' ).classList.remove( context_class );

        // Complete init and set mode class and attribute
        super.init( () => {
            this.dom.classList.add( this.config.get( 'modeClass' ) + this.mode );
            this.dom.setAttribute( 'data-mode', this.mode );
        } );
    }

    /**
     * Bind component related events
     * @public
     * @return {void}
     */
    bind() {

        // Component events
        this.addEventList( [
            [ 'click', () => { if ( this._modeOptionActive( 'easyHide' ) ) this.hide(); } ],
            [ 'modal.shown', () => { this.#focus_on_shown(); } ],
        ] );

        this.dialog.addEventListener( 'click', ( event ) => {
            if ( this._modeOptionActive( 'easyHide' ) ) event.stopPropagation();
        } );

        // Allow for close by escape key if enabled
        document.addEventListener( 'keyup', ( event ) => {
            if ( ( event.keyCode === 27 || event.key === 'Escape' ) && this.open ) {
                if ( this._modeOptionActive( 'easyHide' ) ) this.hide();
            }
        } );

        // Close buttons
        bindNodeList( this.getDomRefs( 'close' ), [
            [ 'click', ( event ) => {
                event.preventDefault();
                this.hide();
            } ]
        ] );
    }

    /**
     * Check if given config mode is true or true by mode
     * @protected
     * @param {string} name - Config option name
     * @return {boolean} - Option enabled
     */
    _modeOptionActive( name ) {
        const option = this.config.get( name );
        if ( option === true ) return true;
        if ( option instanceof Array ) {
            if ( option.includes( '!' + this.mode ) ) return false;
            if ( option.includes( this.mode ) ) return true;
            if ( option.includes( 'all!' ) ) return true;
        }
        return false;
    }

    /**
     * Focus first available element after modal.shown event
     * @private
     * @return {void}
     */
    #focus_on_shown() {
        if ( this._modeOptionActive( 'focusOnShown' ) ) {
            const element = getFocusable( this.dom, this._modeOptionActive( 'focusLast' ), this.config.get( 'dom.focusable' ) );
            if ( element ) element.focus();
        }
    }

    /**
     * Mode getter
     * @public
     * @return {string} - Mode name
     */
    get mode() {
        return this.config.get( 'mode' );
    }

    /**
     * Mode setter
     * @public
     * @param {string} name - Mode name
     * @return {void}
     */
    set mode( name ) {
        const modes = this.config.get( 'availableModes' );
        if ( !name || !modes.includes( name ) ) {
            throw new UiModalComponentException( 'Unknown mode "' + mode + '"' );
        }
        if ( this.mode !== name ) {
            this.dom.classList.remove( this.config.get( 'modeClass' ) + this.mode );
            this.config.set( 'mode', name );
            this.dom.classList.add( this.config.get( 'modeClass' ) + name );
            this.dom.setAttribute( 'data-mode', name );
        }
    }

    /**
     * Open state getter
     * @public
     * @return {boolean} - True if open
     */
    get open() {
        return this.states.global === 'open';
    }

    /**
     * Open state setter
     * @public
     * @param {boolean} state - State
     * @return {void}
     */
    set open( state ) {
        if ( typeof state !== 'boolean' ) {
            throw new UiModalComponentException( this.constructor.name + '.open must be of type boolean' );
        }
        if ( this.open !== state ) {
            if ( this.open ) {
                this.hide();
            } else {
                this.show();
            }
        }
    }

    /**
     * Animating state getter
     * @public
     * @return {boolean} - True if animating
     */
    get animating() {
        return this.states.is( 'animating' );
    }

    /**
     * Dialog element getter
     * @public
     * @return {HTMLElement} - Dialog element
     */
    get dialog() {
        return this.getDomRefs( 'dialog', false );
    }

    /**
     * Title element getter
     * @public
     * @return {HTMLElement} - Title element
     */
    get title() {
        return this.getDomRefs( 'title', false );
    }

    /**
     * Content element getter
     * @public
     * @return {HTMLElement} - Content element
     */
    get content() {
        return this.getDomRefs( 'content', false );
    }

    /**
     * Bind show/hide transition complete/fallback
     * @private
     * @param {Function} complete - Complete handler
     * @return {void}
     */
    #bind_transition_complete( complete ) {
        let speed = this.config.get( 'animator.speed' );
        speed = typeof speed === 'number' ? speed : 300;

        // Has transitionend event
        const hasTransitions = typeof this.dom.style.transition !== 'undefined';

        // Complete event via transition event
        if ( hasTransitions && speed ) {
            this.dom.addEventListener( 'transitionend', complete, { once : true } );
        }

        // Complete event via timeout
        if ( !hasTransitions || !speed ) {
            window.setTimeout( complete, speed + 1 );
        }
    }

    /**
     * Show modal
     * @param {null|HTMLElement} origin - Last focused element before opening
     * @param {boolean} events - Fire events
     * @return {void}
     */
    show( origin = null, events = true ) {
        if ( !this.open && !this.states.is( 'animating' ) ) {
            this.#origin = origin instanceof HTMLElement ? origin : document.activeElement || null;
            this.states.set( 'animating' );

            // Check if we can show
            if ( events && !this.dispatchEvent( 'modal.show', null, true, true ) ) {
                this.states.unset( 'animating' );
                return;
            }

            // Get animation callback
            let animator = this.config.get( 'animator.show' );
            if ( typeof animator !== 'function' ) {
                animator = ( complete ) => {
                    this.#bind_transition_complete( complete );
                };
            }
            if ( this.config.get( 'animator.vis' ) ) this.dom.style.display = '';
            window.setTimeout( () => {

                // Set props and states
                const native = this.getDomRefs( 'native', false );
                if ( native ) native.setAttribute( 'open', '' );
                ( native || this.dom ).setAttribute( 'aria-hidden', 'false' );
                this.states.set( 'open' );
                const context_class = this.config.get( 'openInContextClass' );
                if  ( context_class ) this.config.get( 'context' ).classList.add( context_class );

                // Run animator
                animator( () => {
                    this.states.unset( 'animating' );
                    if ( events ) this.dispatchEvent( 'modal.shown' );
                }, this );
            }, 1 );
        }
    }

    /**
     * Hide panel
     * @param {boolean} events - Fire events
     * @return {void}
     */
    hide( events = true ) {
        if ( this.open && !this.states.is( 'animating' ) ) {
            this.states.set( 'animating' );

            // Check if we can hide
            if ( events && !this.dispatchEvent( 'modal.hide', null, true, true ) ) {
                this.states.unset( 'animating' );
                return;
            }

            // Get animation callback
            let animator = this.config.get( 'animator.hide' );
            if ( typeof animator !== 'function' ) {
                animator = ( complete ) => {
                    this.#bind_transition_complete( complete );
                };
            }

            // Set props and states
            const native = this.getDomRefs( 'native', false );
            if ( native ) native.removeAttribute( 'open' );
            ( native || this.dom ).setAttribute( 'aria-hidden', 'true' );
            this.states.set( 'closed' );
            const context_class = this.config.get( 'openInContextClass' );
            if  ( context_class ) this.config.get( 'context' ).classList.remove( context_class );

            // Run animator
            animator( () => {
                this.states.unset( 'animating' );
                if ( this.config.get( 'animator.vis' ) ) this.dom.style.display = 'none';
                if ( this.#origin && this.config.get( 'focusResetOnHidden' ) ) {
                    this.#origin.focus();
                }
                if ( events ) this.dispatchEvent( 'modal.hidden' );
                this.#origin = null;
            }, this );
        }
    }

    // Inherited from: EventDispatcher

    /**
     * Check for compatibility
     * @name UiModalComponent.isCompat
     * @method
     * @static
     * @public
     * @param {*} obj - EventDispatcher target or parent
     * @return {boolean} - Is compatible
     */

    /**
     * Debug reference
     * @name UiModalComponent#debug
     * @property
     * @readonly
     * @public
     * @type {null|console|Object}
     */

    /**
     * Target reference
     * @name UiModalComponent#target
     * @property
     * @readonly
     * @public
     * @type {null|HTMLElement|EventDispatcher|EventDispatcherInterface}
     */

    /**
     * Parent reference
     * @name UiModalComponent#parent
     * @property
     * @readonly
     * @public
     * @type {null|HTMLElement|EventDispatcher|EventDispatcherInterface}
     */

    /**
     * True if no target element is set
     * @name UiModalComponent#isSimulated
     * @property
     * @readonly
     * @public
     * @type {boolean}
     */

    /**
     * Dispatch event
     * @name UiModalComponent#dispatchEvent
     * @method
     * @public
     * @param {string} name - Event name
     * @param {null|object} detail - Event data
     * @param {boolean} bubbles - Allow event to bubble
     * @param {boolean} cancelable - Allow event to be cancelled
     * @return {boolean} - False if cancelled, true otherwise
     */

    /**
     * Check name for existing handlers
     * @name UiModalComponent#hasSimulated
     * @method
     * @public
     * @param {string} name - Event name
     * @return {boolean} - True if event has listeners
     */

    /**
     * Register event listener
     * @name UiModalComponent#addEventListener
     * @method
     * @public
     * @param {string} name - Event name
     * @param {Function} callback - Callback to register for event
     * @param {boolean|Object} useCaptureOptions - Capture style or options Object
     * @return {void}
     */

    /**
     * Remove event listener
     * @name UiModalComponent#removeEventListener
     * @method
     * @public
     * @param {string} name - Event name
     * @param {function} callback - Callback to deregister from event
     * @param {boolean|Object} useCaptureOptions - Capture style or options Object
     * @return {void}
     */

    /**
     * Register an array of event listeners
     * @name UiModalComponent#addEventList
     * @method
     * @public
     * @param {Array<Array>} events - Array of addEventListener argument arrays
     * @return {void}
     */

    // Inherited from: UiComponent

    /**
     * Convert attribute value to config value
     * @name UiModalComponent.configValueFromAttr
     * @method
     * @static
     * @public
     * @param {null|string} value - Attribute value
     * @return {*} - Converted value
     */

    /**
     * Convert attribute name to config dot path
     * @name UiModalComponent.configDotNameFromAttr
     * @method
     * @static
     * @public
     * @param {string} name - Attribute name
     * @return {string} - Config name
     */

    /**
     * Convert config dot path to camel case
     * @name UiModalComponent.configCamelNameFromDot
     * @method
     * @static
     * @public
     * @param {string} name - Dot path
     * @return {string} - Camel case
     */

    /**
     * Make ui modal
     * @name UiModalTemplate.make
     * @method
     * @static
     * @public
     * @param {HTMLElement} element - Element
     * @param {null|UiModalSettings|Object} settings - Config object
     * @param {null|UiModalPlugins|Array} plugins - Plugins array
     * @param {null|EventDispatcher|HTMLElement} parent - Parent object
     * @param {null|false|console|Object} debug - Debug object
     * @param {Function} Construct - Component constructor
     * @return {UiComponent} - Component object
     */

    /**
     * Initialize all ui elements in context
     * @name UiModalTemplate.makeAll
     * @method
     * @static
     * @public
     * @param {null|UiModalSettings|Object} settings - Config object
     * @param {null|UiModalPlugins|Array} plugins - Plugins array
     * @param {null|EventDispatcher|HTMLElement} parent - Parent object
     * @param {document|HTMLElement} context - Context to initialize
     * @param {null|console|Object} debug - Debug object
     * @param {Function} Construct - Component constructor
     * @return {Array<UiComponent>} - Initialized components
     */

    /**
     * Element selector
     * @name UiModalComponent#selector
     * @property
     * @readonly
     * @public
     * @type {string}
     */

    /**
     * Component type
     * @name UiModalComponent#type
     * @property
     * @readonly
     * @public
     * @type {string}
     */

    /**
     * Component dom element
     * @name UiModalComponent#dom
     * @property
     * @readonly
     * @public
     * @type {HTMLElement}
     */

    /**
     * Component config
     * @name UiModalComponent#config
     * @property
     * @readonly
     * @public
     * @type {Config}
     */

    /**
     * Component states
     * @name UiModalComponent#states
     * @property
     * @readonly
     * @public
     * @type {ComponentStates}
     */

    /**
     * Component plugins
     * @name UiModalComponent#plugins
     * @property
     * @readonly
     * @public
     * @type {Plugins}
     */

    /**
     * Component children
     * @name UiModalComponent#children
     * @property
     * @readonly
     * @public
     * @type {Array}
     */

    /**
     * Initialize component
     * @name UiModalComponent#init
     * @method
     * @public
     * @param {null|Function} afterInitialized - Run function after initialized event
     * @return {void}
     */

    /**
     * Initialize child components
     * @name UiModalComponent#_initChildren
     * @method
     * @protected
     * @return {void}
     */

    /**
     * Cycle children
     * @name UiModalComponent#eachChild
     * @method
     * @public
     * @param {string|Array|Function} filter - Filter or callback function
     * @param {null|Function} callback - Callback when using a filter
     * @return {void}
     */

    /**
     * Get config from attributes
     * @name UiModalComponent#getConfigFromAttributes
     * @method
     * @public
     * @param {Array<string>} disregard - Disregard options names
     * @return {null|Object} - Config object
     */

    /**
     * Get dom references from config
     * @name UiModalComponent#getDomRefs
     * @method
     * @public
     * @param {string} name - Reference name
     * @param {boolean} multiple - Set false to return one element
     * @return {null|HTMLElement|NodeList} - Dom reference/s
     */

    /**
     * Require dom references
     * @name UiModalComponent#requireDomRefs
     * @method
     * @public
     * @param {Array<Array<string,boolean>>} refs - Reference requirements
     * @return {void}
     */

    /**
     * Set state from event
     * @name UiModalComponent#event_state
     * @method
     * @public
     * @param {Event} event - Event object
     * @return {void}
     */
}
