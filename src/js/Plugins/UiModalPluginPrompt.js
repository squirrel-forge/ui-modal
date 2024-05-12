/**
 * Requires
 */
import { UiPlugin } from '@squirrel-forge/ui-core';
import { Exception, bindNodeList } from '@squirrel-forge/ui-util';


/**
 * Ui modal plugin prompt exception
 * @class
 * @extends Exception
 */
class UiModalPluginPromptException extends Exception {}

/**
 * Ui modal plugin prompt mode
 * @class
 * @extends UiPlugin
 */
export class UiModalPluginPrompt extends UiPlugin {

    /**
     * Plugin name getter
     * @public
     * @static
     * @return {string} - Plugin name
     */
    static get pluginName() {
        return 'prompt';
    }

    /**
     * Constructor
     * @constructor
     * @param {null|Object} options - Options object
     * @param {Object|UiModalComponent} context - Plugin context
     * @param {null|console|Object} debug - Debug object
     */
    constructor( options, context, debug ) {
        super( options, context, debug );

        // Extend default config
        this.extendConfig = {

            // Available modes
            // @type {Array<mode>}
            availableModes : [ 'modal', 'prompt' ],

            // Focus first contained element when shown
            // @type {boolean|Array<config.mode>}
            focusOnShown : [ '!prompt' ],

            // Dom references
            // @type {Object}
            dom : {

                // Plugin references
                prompt : {

                    // Input element reference
                    // @type {string}
                    input : '[name="value"]',

                    // Confirm buttons
                    // @type {string}
                    confirm : '[data-modal="ctrl:prompt.confirm"]',
                }
            }
        };

        // Register events
        this.registerEvents = [
            [ 'modal.initialized', ( event ) => { this.#event_initialized( event ); } ],
            [ 'modal.show', () => {
                if ( this.context.mode !== 'prompt' ) return;
                this.context.confirmed = false;

                // TODO: clear/reset value input to original state?
            } ],
            [ 'modal.shown', () => { this.#focus_on_shown(); } ],
            [ 'modal.hide', ( event ) => {
                if ( this.context.mode !== 'prompt' ) return;
                if ( !this.context.confirmed ) {
                    if ( !this.context.dispatchEvent( ( this.context.config.get( 'eventPrefix' ) || '' ) + 'prompt.cancel', null, true, true ) ) {
                        event.preventDefault();
                    }
                }
            } ],
        ];
    }

    /**
     * Event initialized
     * @private
     * @param {Event} event - Initialized event
     * @return {void}
     */
    #event_initialized( event ) {
        if ( event.detail.target !== this.context ) return;
        if ( this.context.mode !== 'prompt' ) return;

        // Require buttons
        this.context.requireDomRefs( [ [ 'close', true ], [ 'prompt.confirm', false ] ] );

        // Required confirmed state
        this.context.confirmed = null;

        // Confirm buttons
        bindNodeList( this.context.getDomRefs( 'prompt.confirm' ), [
            [ 'click', ( event ) => {
                event.preventDefault();
                if ( this.context.dispatchEvent( ( this.context.config.get( 'eventPrefix' ) || '' ) + 'prompt.confirm', { value : this.#get_input_value() }, true, true ) ) {
                    this.context.confirmed = true;
                    this.context.hide();
                }
            } ]
        ] );

        // TODO: bind key enter to confirm when input/s focused?
    }

    /**
     * Focus prompt input after modal.shown event
     * @private
     * @return {void}
     */
    #focus_on_shown() {
        if ( this.context.mode !== 'prompt' ) return;
        const element = this.context.getDomRefs( 'prompt.input', false );
        if ( element ) element.focus();
    }

    /**
     * Get input value
     * @private
     * @return {null|boolean}
     */
    #get_input_value() {
        const input = this.context.getDomRefs( 'prompt.input', false );
        if ( !input || ![ 'input', 'select', 'textarea' ].includes( input.tagName.toLowerCase() ) ) {
            throw new UiModalPluginPromptException( 'Missing or invalid prompt input element' );
        }
        if ( input.type === 'checkbox' ) {
            if ( input.checked ) return input.value || true;
            return false;
        } else if ( input.type === 'radio' ) {
            const inputs = this.context.getDomRefs( 'prompt.input' );
            for ( let i = 0; i < inputs.length; i++ ) {
                if ( input.checked ) return input.value;
            }
            return null;
        }
        return input.value || null;
    }
}
