{{-- Modal component - laravel/blade variant --}}
@php
    // Set default attributes
    if (!isset($attributes)) {
        $attributes = [];
    } else if (is_string($attributes)) {
        $attributes = [$attributes];
    }

    // Set any default classes for the component
    if (!isset($classes)) {
        $classes = [];
    } else if (is_string($classes)) {
        $classes = [$classes];
    }
    $classes[] = 'ui-modal';

    // Set default mode or validate
    if (!isset($mode)) {
        $mode = 'modal';
    } else {
        $modes = ['modal', 'alert', 'confirm', 'prompt'];
        $mode = in_array($mode, $modes) ? $mode : 'modal';
    }

    // Set default scroll
    if (!isset($scroll)) {
        $scroll = 'inner';
    }

    // Set outer scroll if requested
    if ($scroll == 'outer') {
        $classes[] = 'ui-modal--outer-scroll';
    }

    // Build attributes
    if (isset($id) && is_string($id)) {
        $attributes[] = 'id="' . $id . '"';
    }
    $attributes[] = 'class="' . join(' ', $classes) . '"';
    $attributes[] = 'data-mode="' . $mode . '"';

    // Layout info
    $default_header = [
        'title' => null,
        'custom' => null,
        'controls' => [
            'custom' => null,
        ],
    ];
    $header = !isset($header) ? $default_header : array_merge_recursive($default_header, $header);
    if (!isset($template)) {
        $template = null;
    }
    if (!isset($content)) {
        $content = '';
    }
    $default_footer = [
        'custom' => null,
        'controls' => [
            'custom' => null,
        ],
    ];
    $footer = !isset($footer) ? $default_footer : array_merge_recursive($default_footer, $footer);
@endphp
{{-- Component markup --}}
<section is="ui-modal" {!! join(' ', $attributes) !!}>
    <div class="ui-modal__wrap" {!! $scroll == 'outer' ? 'tabindex="0"' : '' !!}>
        <dialog class="ui-modal__dialog">
            @if($header)
                <div class="ui-modal__dialog-header">
                    @if(!empty($header['title']))
                        <h3 class="ui-modal__dialog-title">{!! $header['title'] !!}</h3>
                    @endif
                    @if(!empty($header['custom']))
                        {!! $header['custom'] !!}
                    @endif
                    @if(!empty($header['controls']))
                        <div class="ui-modal__dialog-controls">
                            @if(!empty($header['controls']['custom']))
                                {!! $header['controls']['custom'] !!}
                            @else
                                <button class="ui-modal__button ui-modal__button--close {{ $buttons['closetop'] ?? 'ui-button ui-button--icon ui-button--icon-only' }}" type="button" data-modal="ctrl:close">
                                    <span class="ui-modal__icon ui-icon" data-icon="{{ $icons['closetop'] ?? 'close' }}"><span></span></span>
                                    <span class="ui-modal__label">{{ $i18n['closetop'] ?? 'Close' }}</span>
                                </button>
                            @endif
                        </div>
                    @endif
                </div>
            @endif
            @if($scroll == 'outer')
            <div class="ui-modal__dialog-scrollable" tabindex="0">
            @else
            <div class="ui-modal__dialog-wrap">
            @endif
                <div class="ui-modal__dialog-content">
                    @if(!empty($template) && is_array($content))
                        @include($template, $content)
                    @elseif(is_string($content) && !empty($content))
                        {!! $content !!}
                    @endif
                </div>
            </div>
            @if($footer)
                <div class="ui-modal__dialog-footer">
                    @if(!empty($footer['custom']))
                        {!! $footer['custom'] !!}
                    @endif
                    @if(!empty($footer['controls']))
                        <div class="ui-modal__dialog-controls">
                            @if(!empty($footer['controls']['custom']))
                                {!! $footer['controls']['custom'] !!}
                            @elseif($mode == 'modal')
                                <button class="ui-modal__button ui-modal__button--close {{ $buttons['close'] ?? 'ui-button ui-button--icon' }}" type="button" data-modal="ctrl:close">
                                    <span class="ui-modal__icon ui-icon" data-icon="{{ $icons['close'] ?? 'close' }}"><span></span></span>
                                    <span class="ui-modal__label">{{ $i18n['close'] ?? 'Close' }}</span>
                                </button>
                            @elseif($mode == 'alert')
                                <button class="ui-modal__button ui-modal__button--ok {{ $buttons['ok'] ?? 'ui-button ui-button--icon ui-button--accept' }}" type="button" data-modal="ctrl:close">
                                    <span class="ui-modal__icon ui-icon" data-icon="{{ $icons['ok'] ?? 'ok' }}"><span></span></span>
                                    <span class="ui-modal__label">{{ $i18n['ok'] ?? 'Ok' }}</span>
                                </button>
                            @elseif($mode == 'confirm' || $mode == 'prompt')
                                <button class="ui-modal__button ui-modal__button--cancel {{ $buttons['cancel'] ?? 'ui-button ui-button--icon ui-button--cancel' }}" type="button" data-modal="ctrl:close">
                                    <span class="ui-modal__icon ui-icon" data-icon="{{ $icons['cancel'] ?? 'cancel' }}"><span></span></span>
                                    <span class="ui-modal__label">{{ $i18n['cancel'] ?? 'Cancel' }}</span>
                                </button>
                                <button class="ui-modal__button ui-modal__button--confirm {{ $buttons['confirm'] ?? 'ui-button ui-button--icon ui-button--confirm' }}" type="button" data-modal="ctrl:{{ mode }}.confirm">
                                    <span class="ui-modal__icon ui-icon" data-icon="{{ $icons['confirm'] ?? 'confirm' }}"><span></span></span>
                                    <span class="ui-modal__label">{{ $i18n['confirm'] ?? 'Confirm' }}</span>
                                </button>
                            @endif
                        </div>
                    @endif
                </div>
            @endif
        </dialog>
    </div>
</section>
