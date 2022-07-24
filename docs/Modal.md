### @squirrel-forge/ui-modal
> [Back to table of contents](../README.md#table-of-contents)

# Documentation
### Javascript / Modal
> [Table of contents](../README.md#table-of-contents) <[ Modal ]> [Plugins](Plugins.md)

## Table of contents
 - [UiModalComponent](#UiModalComponent)

---

### UiModalComponent
UiModalComponent class - Modal component with events and plugins support.
The component extends [UiComponent](https://github.com/squirrel-forge/ui-core/blob/main/docs/Abstracts.md#UiComponent) from [@squirrel-forge/ui-core](https://github.com/squirrel-forge/ui-core) module.

#### Component settings
Component settings might be changed or extended through plugins.
```javascript
const defaults = {

    // Context element
    // @type {documentElement|HTMLElement}
    context : document.documentElement,

    // Class set on context when modal is open
    // @type {string}
    openInContextClass : 'ui-modal-context--active',

    // Interaction mode, should be set via the UiModalComponent.mode = <boolean>
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
```

#### Class overview
```javascript
class UiModalComponent extends UiComponent {
  static selector : String
  constructor( element, settings = null, defaults = null, extend = null, states = null, plugins = null, parent = null, debug = null, init = true ) {}
  mode : String
  open : Boolean
  animating : Boolean
  dialog : HTMLElement|HTMLDialogElement
  title : HTMLElement|HTMLHeadingElement
  content : HTMLElement|HTMLDivElement
  show( origin = null, events = true ) {} // void
  hide( events = true ) {} // void
}
```
For more details check the [UiModalComponent source file](../src/es6/Modal/UiModalComponent.js).

#### Events
 - modal.show - Fired before the modal opens, can be prevented with event.preventDefault().
 - modal.shown - Fired after the modal has opened.
 - modal.hide - Fired before the modal closes, can be prevented with event.preventDefault().
 - modal.hidden - Fired after the modal has closed.

#### Using the component
For details refer to the settings, class overview and code file mentioned above.
```javascript
import { UiModalComponent } from '@squirrel-forge/ui-modal';

// Will initialize a specific modal
UiModalComponent.make( document.querySelector( '.ui-modal' ) );

// Will initialize all modals in the current document
const modals = UiModalComponent.makeAll();

// Bind all openers for the initialized modals
UiModalComponent.bindOpeners( modals );
```

#### Component markup
Following markup is required for a modal.
```html
<section is="ui-modal" class="ui-modal">
    <div class="ui-modal__wrap">
        <dialog class="ui-modal__dialog">
            <div class="ui-modal__dialog-wrap">
                <div class="ui-modal__dialog-header">
                    <h3 class="ui-modal__dialog-title">Title</h3>
                    <div class="ui-modal__dialog-controls">
                        <button class="ui-modal__button ui-modal__button--close" type="button" data-modal="ctrl:close"><span class="button__label">Close</span></button>
                    </div>
                </div>
                <div class="ui-modal__dialog-scrollable" tabindex="0">
                    <div class="ui-modal__dialog-content">Content</div>
                </div>
                <div class="ui-modal__dialog-footer">
                    <div class="ui-modal__dialog-controls">
                        <button class="ui-modal__button ui-modal__button--close button button--primary" type="button" data-modal="ctrl:close"><span class="button__label">Close</span></button>
                    </div>
                </div>
            </div>
        </dialog>
    </div>
</section>
```
Set a JSON config the following way:
```html
<section data-config='{"option":{"name":true},"optionName":true}'></section>
```
Set individual config options via following attribute syntax:
```html
<!-- Will resolve to: option.name & optionName = true -->
<section data-option-name="true"></section>
```
---

> [Table of contents](../README.md#table-of-contents) <[ Modal ]> [Plugins](Plugins.md)
