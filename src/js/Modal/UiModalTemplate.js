/**
 * Requires
 */
import { UiTemplate } from '@squirrel-forge/ui-core';
import { Exception } from '@squirrel-forge/ui-util';


/**
 * Ui modal template exception
 * @class
 * @extends Exception
 */
class UiModalTemplateException extends Exception {}

/**
 * @typedef {Object} UiModalTemplateData - Ui modal template data
 * @property {null|string} id - Modal id
 * @property {null|string|('modal'|'alert'|'confirm'|'prompt')} mode - Mode string, default: modal
 * @property {null|Array<string>} classes - List of classes
 * @property {null|Array<string>} attributes - List of attributes
 * @property {null|UiModalTemplateHeaderData} header - Header definition
 * @property {string} content - Modal content
 * @property {null|UiModalTemplateFooterData} footer - Footer definition
 * @property {null|UiModalTemplateIconsData} icons - Icons names
 * @property {null|UiModalTemplateI18nData} i18n - Translation data
 * @property {null|UiModalTemplateButtonsData} buttons - Buttons classes data
 */

/**
 * @typedef {Object} UiModalTemplateHeaderData - Ui modal template header data
 * @property {null|string} title - Optional title
 * @property {null|string} custom - Custom header content
 * @property {null|true|UiModalTemplateControlsData} controls - Controls
 */

/**
 * @typedef {Object} UiModalTemplateFooterData - Ui modal template footer data
 * @property {null|string} custom - Custom footer content
 * @property {null|true|UiModalTemplateControlsData} controls - Controls
 */

/**
 * @typedef {Object} UiModalTemplateControlsData - Ui modal template controls data
 * @property {null|string} custom - Custom controls content
 */

/**
 * @typedef {Object} UiModalTemplateI18nData - Ui modal template translation data
 * @property {string} closetop - Close label top text
 * @property {string} close - Close label text
 * @property {string} ok - Ok label text
 * @property {string} cancel - Cancel label text
 * @property {string} confirm - Confirm label text
 */

/**
 * @typedef {Object} UiModalTemplateIconsData - Ui modal template icons names
 * @property {string} closetop - Close top icon name
 * @property {string} close - Close icon name
 * @property {string} ok - Ok icon name
 * @property {string} cancel - Cancel icon name
 * @property {string} confirm - Confirm icon name
 */

/**
 * @typedef {Object} UiModalTemplateButtonsData - Ui modal template button classes
 * @property {string} closetop - Close top classes
 * @property {string} close - Close classes
 * @property {string} ok - Ok classes
 * @property {string} cancel - Cancel classes
 * @property {string} confirm - Confirm classes
 */

/**
 * Ui modal template
 * @class
 * @extends UiTemplate
 */
export class UiModalTemplate extends UiTemplate {

    /**
     * Available modes
     * @public
     * @property
     * @type {UiModalTemplateData.mode[]}
     */
    static availableModes = [ 'modal', 'alert', 'confirm', 'prompt' ];

    /**
     * Default template data
     * @protected
     * @property
     * @type {UiModalTemplateData}
     */
    _defaults = {
        id : null,
        classes : [],
        attributes : [],
        mode : 'modal',
        header : {
            title : null,
            custom : null,
            controls : {
                custom : null,
            }
        },
        content : null,
        footer : {
            custom : null,
            controls : {
                custom : null,
            }
        },
        icons : {
            closetop : 'close',
            close : 'close-small',
            ok : 'check',
            cancel : 'close-small',
            confirm : 'check',
        },
        i18n : {
            closetop : 'Close',
            close : 'Close',
            ok : 'Ok',
            cancel : 'Cancel',
            confirm : 'Confirm',
        },
        buttons : {
            closetop : 'ui-button ui-button--icon ui-button--label-hidden ui-button--close',
            close : 'ui-button ui-button--icon ui-button--close',
            ok : 'ui-button ui-button--icon ui-button--accept',
            cancel : 'ui-button ui-button--icon ui-button--cancel',
            confirm : 'ui-button ui-button--icon ui-button--confirm',
        }
    };

    /**
     * Template validate method
     * @protected
     * @param {UiModalTemplateData} data - Template data
     * @return {boolean} - True if data can be rendered
     */
    _validate( data ) {
        const content_is_string = typeof data.content === 'string';
        const content_has_to_string = typeof data.content.toString === 'function';
        if ( !( content_is_string || content_has_to_string ) ) throw new UiModalTemplateException( 'Requires content' );
    }

    /**
     * Render template
     * @protected
     * @param {UiModalTemplateData} data - Ui modal template data
     * @return {string} - Rendered template string
     */
    _render( data ) {

        // Set default mode
        let mode = 'modal';

        // Set mode and data attribute
        if ( data.mode && this.constructor.availableModes.includes( data.mode ) ) {
            mode = data.mode;
        }

        // Set any default classes and attributes for the component
        const classes = [ 'ui-modal' ];
        if ( data.classes instanceof Array ) classes.push( ...data.classes );
        const attributes = [ `data-mode="${mode}"` ];
        if ( data.id ) attributes.push( `id="${data.id}"` );
        if ( data.attributes instanceof Array ) {
            attributes.push( ...data.attributes );
        } else if ( typeof data.attributes === 'string' ) {
            attributes.push( data.attributes );
        }

        // Component markup
        return `<section is="ui-modal" class="${classes.join( ' ' )}" ${attributes.join( ' ' )}>` +
            `<div class="ui-modal__wrap">` +
                `<dialog class="ui-modal__dialog">` +
                    ( data.header ?
                        `<div class="ui-modal__dialog-header">` +
                        ( data.header.title ? `<h3 class="ui-modal__dialog-title">${data.header.title}</h3>` : '' ) +
                        ( data.header.custom ? data.header.custom : '' ) +
                        ( data.header.controls ?
                            `<div class="ui-modal__dialog-controls">` +
                            ( data.header.controls.custom ?
                                data.header.controls.custom
                                : `<button class="ui-modal__button ui-modal__button--close ${data.buttons.closetop}" type="button" data-modal="ctrl:close">` +
                                    `<span class="ui-modal__icon ui-icon" data-icon="${data.icons.closetop}"><span></span></span>` +
                                    `<span class="ui-modal__label ui-button__label">${data.i18n.closetop}</span></button>`
                            ) + `</div>`
                            : ''
                        ) + `</div>`
                        : ''
                    ) +
                    `<div class="ui-modal__dialog-scrollable" tabindex="0">` +
                        `<div class="ui-modal__dialog-content">${data.content}</div>` +
                    `</div>` +
                    ( data.footer ?
                        `<div class="ui-modal__dialog-footer">` +
                            ( data.footer.custom ? data.footer.custom : '' ) +
                            ( data.footer.controls ?
                                `<div class="ui-modal__dialog-controls">` +
                                    ( data.footer.controls.custom ?
                                        data.footer.controls.custom
                                        : ( mode === 'modal' ?
                                            `<button class="ui-modal__button ui-modal__button--close ${data.buttons.close}" type="button" data-modal="ctrl:close">` +
                                                `<span class="ui-modal__icon ui-icon" data-icon="${data.icons.close}"><span></span></span>` +
                                                `<span class="ui-modal__label ui-button__label">${data.i18n.close}</span></button>`
                                            : ( mode === 'alert' ?
                                                `<button class="ui-modal__button ui-modal__button--ok ${data.buttons.ok}" type="button" data-modal="ctrl:close">` +
                                                    `<span class="ui-modal__icon ui-icon" data-icon="${data.icons.ok}"><span></span></span>` +
                                                    `<span class="ui-modal__label ui-button__label">${data.i18n.ok}</span></button>`
                                                : ( mode === 'confirm' || mode === 'prompt' ?
                                                    `<button class="ui-modal__button ui-modal__button--cancel ${data.buttons.cancel}" type="button" data-modal="ctrl:close">` +
                                                        `<span class="ui-modal__icon ui-icon" data-icon="${data.icons.cancel}"><span></span></span>` +
                                                        `<span class="ui-modal__label ui-button__label">${data.i18n.cancel}</span></button>` +
                                                    `<button class="ui-modal__button ui-modal__button--confirm ${data.buttons.confirm}" type="button" data-modal="ctrl:${ mode }.confirm">` +
                                                        `<span class="ui-modal__icon ui-icon" data-icon="${data.icons.confirm}"><span></span></span>` +
                                                    `<span class="ui-modal__label ui-button__label">${data.i18n.confirm}</span></button>`
                                                    : ''
                                                  )
                                              )
                                          )
                                    ) +
                                `</div>`
                                : ''
                            ) +
                        `</div>`
                        : ''
                    ) +
                `</dialog>` +
            `</div>` +
        `</section>`;
    }

    // Inherited from: UiTemplate

    /**
     * Load template from dom
     * @name UiModalTemplate.getTemplate
     * @method
     * @public
     * @static
     * @param {string} id - Element id
     * @return {string} - Template string
     */

    /**
     * Debug object
     * @name UiModalTemplate.debug
     * @public
     * @property
     * @type {null|console|Object}
     */

    /**
     * Template render error output
     * @name UiModalTemplate#errorMessage
     * @public
     * @property
     * @type {null|string}
     */

    /**
     * Constructor
     * @name UiModalTemplate.constructor
     * @constructor
     * @param {UiModalTemplateData} data - Template data
     * @param {null|console} debug - Debug object
     */

    /**
     * Template data
     * @name UiModalTemplate#data
     * @property
     * @public
     * @type {null|UiModalTemplateData}
     */

    /**
     * Render as node
     * @name UiModalTemplate#asNode
     * @method
     * @public
     * @param {UiModalTemplateData} data - Template data
     * @return {NodeList|Array} - Rendered nodes or empty array
     */

    /**
     * Append rendered template
     * @name UiModalTemplate#append
     * @method
     * @public
     * @param {HTMLElement} to - Element to append to
     * @param {UiModalTemplateData} data - Template data
     * @return {void}
     */

    /**
     * Render template
     * @name UiModalTemplate#render
     * @method
     * @public
     * @param {UiModalTemplateData} data - Template data
     * @return {string} - Rendered template
     */

    /**
     * To string conversion
     * @name UiModalTemplate#toString
     * @method
     * @public
     * @return {string} - rendered template
     */
}
