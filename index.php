<?php

use Composer\Semver\Semver;
use Kirby\Cms\App as Kirby;

if (Semver::satisfies(Kirby::version() ?? '0.0.0', '~4.0') === false) {
    throw new Exception('volkmann-design-code/kirby-layout-attributes requires Kirby 4');
}

Kirby::plugin('volkmann-design-code/kirby-layout-attributes', [
    'options' => [
        'allowDelete' => true,
    ]
]);
