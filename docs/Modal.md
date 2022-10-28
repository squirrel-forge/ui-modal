### @squirrel-forge/ui-modal

> [Back to table of contents](../README.md#table-of-contents)

# Documentation

### Javascript / Modal

> [Table of contents](../README.md#table-of-contents) <[ Modal ]> [Plugins](Plugins.md)

## Table of contents

 - [UiModalComponent](#uimodalcomponent)
 - [UiModalTemplate](#uimodaltemplate)
 - [Styling](#component-styling)
 - [Markup](#component-markup)

---

### UiModalComponent

UiModalComponent class - Modal component with events and plugins support.  
The component extends [UiComponent](https://github.com/squirrel-forge/ui-core/blob/main/docs/Abstracts.md#UiComponent) from [@squirrel-forge/ui-core](https://github.com/squirrel-forge/ui-core) module.

#### Component settings

Component settings might be changed or extended through plugins, you can find additional notes on how settings can be used in the [ui-core](https://github.com/squirrel-forge/ui-core/blob/main/docs/Abstracts.md#settings-mechanics) module readme.

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

For more details check the [UiModalComponent source file](../src/js/Modal/UiModalComponent.js).

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

It is recommended to use one of the provided templates, or adapt one:

##### Blade template

A blade template for usage with laravel: [blade/modal.blade.php](../src/blade/modal.blade.php).
Copy the template to your *resources/views* folder and use following data structure:

```php
$data = [
    'id' => null|string,
    'mode' => 'modal'|'alert'|'confirm'|'prompt',
    'classes' => null|string|array,
    'attributes' => null|string|array,
    'header' => null|[
        'title' => null,
        'custom' => null,
        'controls' => null|bool|[
            'custom' => null,
        ],
    ],
    'template' => null|string,
    'content' => string|array,
    'scroll' => null|'inner'|'outer',
    'footer' => null|[
        'custom' => null,
        'controls' => null|bool[
            'custom' => null,
        ],
    ],
    'icons' => null|[
        'closetop' => null|string,
        'close' => null|string,
        'ok' => null|string,
        'cancel' => null|string,
        'confirm' => null|string,
    ],
    'i18n' => null|[
        'closetop' => null|string,
        'close' => null|string,
        'ok' => null|string,
        'cancel' => null|string,
        'confirm' => null|string,
    ],
    'buttons' => null|[
        'closetop' => null|string,
        'close' => null|string,
        'ok' => null|string,
        'cancel' => null|string,
        'confirm' => null|string,
    ],
];
```

##### Twig templates

Two twig implementations are a available:

**Simple adaptable** [twig/modal.twig](../src/twig/modal.twig) with following data structure:
```javascript
const data = {
    id : undefined|false|null|String,
    classes : undefined|false|null|String,
    mode : 'modal'|'alert'|'confirm'|'prompt',
    attributes : undefined|null|String,
    header : undefined|null|Boolean|{
        title : undefined|null|false|String,
        custom : undefined|null|String,
        controls : undefined|null|Boolean|{
            custom : undefined|null|String,
        },
    },
    template : undefined|null|String,
    content : String|{...},
    footer : undefined|null|Boolean|{
        custom : undefined|null|String,
        controls : undefined|null|Boolean|{
            custom : undefined|null|String,
        },
    },
    icons : undefined|null|{
        closetop : undefined|null|String,
        close : undefined|null|String,
        ok : undefined|null|String,
        cancel : undefined|null|String,
        confirm : undefined|null|String,
    },
    i18n : undefined|null|{
        closetop : undefined|null|String,
        close : undefined|null|String,
        ok : undefined|null|String,
        cancel : undefined|null|String,
        confirm : undefined|null|String,
    },
    buttons : undefined|null|{
        closetop : undefined|null|String,
        close : undefined|null|String,
        ok : undefined|null|String,
        cancel : undefined|null|String,
        confirm : undefined|null|String,
    },
};
```
 
**TwigHouse variant** [twig/modal.th.twig](../src/twig/modal.th.twig) made for usage with [twighouse](https://github.com/squirrel-forge/node-twighouse) following an example, the data structure is the same as the simple template only wrapped into the component object:
```json
{
  "__directives": ["tagAttributes:attributes","resolveFileReferences:__custom"],
  "__custom": "~@squirrel-forge/ui-modal/modal",
  "attributes": {"id": "example-modal", "data-mode": "modal"},
  "header": {
    "title": "Title",
    "controls": true
  },
  "footer": {
    "controls": true
  },
  "content": "Raw content"
}
```

Instead of using raw content you may load a custom template as following:
```json
{
  "__directives": ["resolveFileReferences:template"],
  "template": "template/reference",
  "content": {
    "passed on": "to the given template",
    "as": "content",
    "including the": "document data object"
  }
}
```

##### HTML static for adaption

You may use the [html/modal.html](../src/html/modal.html) static template to adapt your own version without working around template syntax.

##### Minimal markup

Following the minimum markup required for default functionality.  
*Note* that you are not required to use type ```<section>``` and ```<dialog>```, they may also be ```<div>``` elements,
the component will attempt to set aria options when required.
The content remains optional, but beware that when not using a title or content wrapper the corresponding shorthand access on the component class wont be available and generate an error when used.

```html
<section is="ui-modal">
    <dialog class="ui-modal__dialog">
        <h3 class="ui-modal__dialog-title">Title</h3>
        <div class="ui-modal__dialog-content">Content</div>
        <button type="button" data-modal="ctrl:close">Close</button>
    </dialog>
</section>
```

#### Component styling

It is recommended the use the sass module, or adapt it.  


##### Sass module

A Sass module built for the @use syntax, including extension and configuration.

```scss
@use '~@squirrel-forge/ui-modal' as modal with (
  // ...
);

// Define css custom properties
:root {
  @include modal.properties($extend);
}

// Output configured styles
@include modal.styles {
  &--custom {
    // ...
  }
}
```

Explore the [sass module](../src/scss/_modal.scss) or checkout the ([example](../src/scss-example/modal.scss)) for full configuration and extension options.

##### CSS styles

A precompiled css version that can be themed with custom properties.

 - [modal.css](../src/css/modal.css)
 - [modal.min.css](../src/css/modal.min.css)

##### Minimal styling

Following the minimum styling required for default functionality.
*Note* that default animation is done via transitions between state classes,
but can be run via js, see the [settings](#component-settings) for details.

```scss
:root {
  --ui-modal-z-index: 1000;
  --ui-modal-transition: 0.3s ease;
  --ui-modal-background-color: white;
  --ui-modal-backdrop-color: rgba(0,0,0,.9);
}
[is="ui-modal"] {
  z-index: var(--ui-modal-z-index);
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  opacity: 1;
  transition: var(--ui-modal-transition);

  &::before {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--ui-modal-backdrop-color);
    content: '';
  }

  &:not([data-state="open"]) {
    pointer-events: none;
    height: 0;
    opacity: 0;
  }

  &__dialog {
    position: relative;
    margin: auto;
    background-color: var(--ui-modal-background-color);
  }
}
```

---

> [Table of contents](../README.md#table-of-contents) <[ Modal ]> [Plugins](Plugins.md)
