/**
 * Requires
 */
import { UiComponent } from '@squirrel-forge/ui-core';
import { EventDispatcher, Exception, getFocusable, tabFocusLock, bindNodeList } from '@squirrel-forge/ui-util';

/**
 * Ui modal component exception
 * @class
 * @extends Exception
 */
class UiModalComponentException extends Exception {}

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
     * @param {HTMLElement|HTMLOListElement} element - List element
     * @param {null|Object} settings - Config object
     * @param {Object} defaults - Default config
     * @param {Array<Object>} extend - Extend default config
     * @param {Object} states - States definition
     * @param {Array<Function|Array<Function,*>>} plugins - Plugins to load
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

        // Check element type
        if ( !( element instanceof HTMLElement ) ) throw new UiModalComponentException( 'Argument element must be a HTMLElement' );

        /**
         * Default config
         * @type {Object}
         */
        defaults = defaults || {

            // Interaction mode
            // @type {('modal')}
            mode : 'modal',

            // Available modes
            // @type {Array<mode>}
            availableModes : [ 'modal' ],

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
        if ( !EventDispatcher.isCompat( this.config.context ) ) {
            throw new UiModalComponentException( 'Option context must be an EventTarget compatible object' );
        }

        // Default aria properties
        const native = this.getDomRefs( 'native', false );
        if ( !native ) {
            this.dom.setAttribute( 'role', 'dialog' );
            this.dom.setAttribute( 'aria-modal', 'true' );
        }

        // Initialize tab focus locking
        tabFocusLock( this.dom, () => { return this.config.get( 'restrictFocus' ); }, true, this.config.get( 'dom.focusable' ) );

        // Bind events
        this.bind();

        // Complete init
        super.init();
    }

    /**
     * Bind component related events
     * @public
     * @return {void}
     */
    bind() {

        // Component events
        this.addEventList( [
            [ 'click', () => { if ( this.#is_mode_true( 'easyHide' ) ) this.hide(); } ],
            [ 'modal.shown', () => { this.#focus_on_shown(); } ],
        ] );

        this.dialog.addEventListener( 'click', ( event ) => {
            if ( this.#is_mode_true( 'easyHide' ) ) event.stopPropagation();
        } );

        // Allow for close by escape key if enabled
        document.addEventListener( 'keyup', ( event ) => {
            if ( ( event.keyCode === 27 || event.key === 'Escape' ) && this.open ) {
                if ( this.#is_mode_true( 'easyHide' ) ) this.hide();
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
     * @private
     * @param {string} name - Config option name
     * @return {boolean} - Option enabled
     */
    #is_mode_true( name ) {
        const option = this.config.get( name );
        if ( option === true ) return true;
        if ( option instanceof Array ) {
            if ( option.includes( this.mode ) ) return true;
            if ( option.includes( 'all!' ) && !option.includes( '!' + this.mode ) ) return true;
        }
        return false;
    }

    /**
     * Focus first available element after modal.shown event
     * @private
     * @return {void}
     */
    #focus_on_shown() {
        if ( this.#is_mode_true( 'focusOnShown' ) ) {
            const element = getFocusable( this.dom, this.#is_mode_true( 'focusLast' ), this.config.get( 'dom.focusable' ) );
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
        if ( this.mode !== name ) this.config.set( 'mode', name );
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
     * dialog element getter
     * @public
     * @return {HTMLElement} - Dialog element
     */
    get dialog() {
        return this.getDomRefs( 'dialog', false );
    }

    /**
     * Show modal
     * @param {null|HTMLElement} origin - Last focused element before opening
     * @param {boolean} events - Fire events
     * @param {boolean} instant - No transition
     * @return {void}
     */
    show( origin = null, events = true, instant = false ) {
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
                const options = this.config.get( 'animOptions' );

                // Use slide animator
                if ( animator === 'slide' ) {
                    animator = ( complete ) => {
                        slideShow( this.dom, instant ? 0 : options.speed, options.easing, complete );
                    };
                } else if ( typeof animator !== 'function' ) {

                    // Use fade animator by default
                    animator = ( complete ) => {
                        fadeIn( this.dom, instant ? 0 : options.speed, options.easing, complete );
                    };
                }
            }

            // Set props and states
            const native = this.getDomRefs( 'native', false );
            if ( native ) native.setAttribute( 'open', '' );
            this.states.set( 'open' );
            ( native || this.dom ).setAttribute( 'aria-hidden', 'false' );

            // Run animator
            animator( () => {
                this.states.unset( 'animating' );
                if ( events ) this.dispatchEvent( 'modal.shown' );
            }, this );
        }
    }

    /**
     * Hide panel
     * @param {boolean} events - Fire events
     * @param {boolean} instant - No transition
     * @return {void}
     */
    hide( events = true, instant = false ) {
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
                const options = this.config.get( 'animOptions' );

                // Use slide animator
                if ( animator === 'slide' ) {
                    animator = ( complete ) => {
                        slideHide( this.dom, instant ? 0 : options.speed, options.easing, complete );
                    };
                } else if ( typeof animator !== 'function' ) {

                    // Use fade animator by default
                    animator = ( complete ) => {
                        fadeOut( this.dom, instant ? 0 : options.speed, options.easing, complete );
                    };
                }
            }

            // Set props and states
            const native = this.getDomRefs( 'native', false );
            if ( native ) native.removeAttribute( 'open' );
            this.states.set( 'closed' );
            ( native || this.dom ).setAttribute( 'aria-hidden', 'true' );

            // Run animator
            animator( () => {
                this.states.unset( 'animating' );
                if ( this.#origin && this.config.get( 'focusResetOnHidden' ) ) {
                    this.#origin.focus();
                }
                if ( events ) this.dispatchEvent( 'modal.hidden' );
                this.#origin = null;
            }, this );
        }
    }
}
