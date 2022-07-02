/* !
 * @module      : @squirrel-forge/ui-accordion
 * @version     : 0.8.0
 * @license     : MIT
 * @copyright   : 2022 squirrel-forge
 * @author      : Daniel Hartwell aka. siux <me@siux.info>
 * @description : An accessible accordion with events and plugin support, made for the browser and babel compatible.
 */

/**
 * Accordion
 */
export { UiModalComponent } from './Accordion/UiAccordionComponent.js';
export { UiAccordionPanelComponent } from './Accordion/UiAccordionPanelComponent.js';

/**
 * Plugins
 */
export { UiModalPluginPrompt } from './Plugins/UiAccordionPluginToggle.js';
export { UiModalPluginAlert } from './Plugins/UiAccordionPluginSafemode.js';
export { UiModalPluginConfirm } from './Plugins/UiAccordionPluginScroller.js';
