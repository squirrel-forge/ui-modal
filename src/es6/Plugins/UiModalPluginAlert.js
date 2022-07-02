/**
 * Requires
 */
import { UiPlugin } from '@squirrel-forge/ui-core';

/**
 * Ui modal plugin alert mode
 * @class
 * @extends UiPlugin
 */
export class UiModalPluginAlert extends UiPlugin {

    /**
     * Plugin name getter
     * @public
     * @static
     * @return {string} - Plugin name
     */
    static get pluginName() {
        return 'alert';
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
            availableModes : [ 'modal', 'alert' ],

            // Focus last contained element when shown
            // @type {boolean|Array<config.mode>}
            focusLast : [ 'alert' ],
        };
    }
}
