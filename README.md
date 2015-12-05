# svlt/front

A web interface for `svlt/back`

## Requirements
- PHP 5.6+/HHVM
- Composer
- Bower
- Gulp

## Installation

Clone the repository, then run these:

```
composer install
cp config-sample.php config.php
cd assets/
bower install
gulp scss app_js vendor_js
```

Further setup information (connecting to `svlt/back`, setting up URL rewrites, etc.) soon!
