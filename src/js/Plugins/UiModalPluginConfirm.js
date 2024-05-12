/**
 * Requires
 */
import { UiPlugin } from '@squirrel-forge/ui-core';
import { bindNodeList } from '@squirrel-forge/ui-util';

/**
 * Ui modal plugin confirm mode
 * @class
 * @extends UiPlugin
 */
export class UiModalPluginConfirm extends UiPlugin {

    /**
     * Plugin name getter
     * @public
     * @static
     * @return {string} - Plugin name
     */
    static get pluginName() {
        return 'confirm';
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
            availableModes : [ 'modal', 'confirm' ],

            // Focus last contained element when shown
            // @type {boolean|Array<config.mode>}
            focusLast : [ 'confirm' ],

            // Dom references
            // @type {Object}
            dom : {

                // Plugin references
                confirm : {

                    // Confirm buttons
                    // @type {string}
                    confirm : '[data-modal="ctrl:confirm.confirm"]',
                }
            }
        };

        // Register events
        this.registerEvents = [
            [ 'modal.initialized', ( event ) => { this.#event_initialized( event ); } ],
            [ 'modal.show', () => {
                if ( this.context.mode !== 'confirm' ) return;
                this.context.confirmed = false;
            } ],
            [ 'modal.hide', ( event ) => {
                if ( this.context.mode !== 'confirm' ) return;
                if ( !this.context.confirmed ) {
                    if ( !this.context.dispatchEvent( ( this.context.config.get( 'eventPrefix' ) || '' ) + 'confirm.cancel', null, true, true ) ) {
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
        if ( this.context.mode !== 'confirm' ) return;

        // Require buttons
        this.context.requireDomRefs( [ [ 'close', true ], [ 'confirm.confirm', false ] ] );

        // Required confirmed state
        this.context.confirmed = null;

        // Confirm buttons
        bindNodeList( this.context.getDomRefs( 'confirm.confirm' ), [
            [ 'click', ( event ) => {
                event.preventDefault();
                if ( this.context.dispatchEvent( ( this.context.config.get( 'eventPrefix' ) || '' ) + 'confirm.confirm', null, true, true ) ) {
                    this.context.confirmed = true;
                    this.context.hide();
                }
            } ]
        ] );
    }
}
