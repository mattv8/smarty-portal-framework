# Smarty Portal Framework 2.0

A lightweight PHP framework for building portal-style web applications with Smarty templating, Bootstrap 5 UI, and built-in user authentication.

## Features

- **Smarty 4 Templating**: Modern template engine with inheritance and caching
- **Bootstrap 5 UI**: Responsive design with pre-built components
- **User Authentication**: Built-in login, session management, and user administration
- **Modular Navigation**: Dynamic menu system with modal and page-based navigation
- **LDAP/Local Auth**: Flexible authentication backends
- **Page Routing**: Clean URL routing system via `index.php`
- **Admin Tools**: User management modal with CRUD operations

## Using as Git Subtree

### Initial Setup

To integrate this framework into your project using git subtree:

```bash
# From your project root
git subtree add --prefix framework https://github.com/mattv8/smarty-portal-framework.git main --squash
```

### Updating the Framework

To pull latest framework updates into your project:

```bash
git subtree pull --prefix framework https://github.com/mattv8/smarty-portal-framework.git main --squash
```

Or use the helper script pattern:

```bash
#!/bin/bash
# scripts/update-framework.sh
git subtree pull --prefix framework https://github.com/mattv8/smarty-portal-framework.git main --squash
```

### Project Structure

When using as a subtree, your project should look like:

```
your-project/
├── framework/                    # This framework (git subtree)
│   ├── framework/               # Framework core files
│   │   ├── conf/               # Configuration
│   │   ├── css/                # Framework styles
│   │   ├── js/                 # Framework JavaScript
│   │   ├── tpl/                # Framework templates
│   │   └── vendor/             # Dependencies
│   ├── index.php               # Framework router
│   └── templates/              # Framework page templates
├── index.php -> framework/index.php  # Symlink to framework router
├── api/                        # Your API endpoints
├── css/                        # Your custom CSS
├── js/                         # Your custom JavaScript
├── lib/                        # Your PHP libraries
├── templates/                  # Your Smarty templates (override framework)
├── config.local.php            # Your configuration
├── functions.php               # Your helper functions
└── *.php                       # Your page controllers (home.php, admin.php, etc.)
```

## Quick Start

### 1. Create Configuration

Copy the template and customize:

```bash
cp framework/index.local.php config.local.php
```

Edit `config.local.php`:

```php
<?php
# Database connection
$db_servername = "localhost";
$db_username = "your_user";
$db_password = "your_pass";
$db_name = "your_database";

# Authentication method
$auth_method = 'local'; // or 'ldap'

# Default page for unauthenticated users
$default_page = 'home';

# Public pages (no login required)
$public_pages = array('home', 'about');

# Navigation buttons
$nav_buttons = array(
    'home' => array(
        'title' => 'Home',
        'faclass' => 'home',
        'btn_color' => 'primary',
        'btn_type' => 'page',
    ),
    'admin' => array(
        'title' => 'Admin',
        'faclass' => 'cog',
        'btn_color' => 'secondary',
        'btn_type' => 'page',
    ),
);
```

### 2. Create Page Controllers

Create `home.php`:

```php
<?php
// Prepare data for template
$smarty->assign('page_title', 'Welcome');
$smarty->assign('message', 'Hello World!');
// Framework handles rendering via index.php
```

### 3. Create Templates

Create `templates/home.tpl`:

```smarty
<div class="container mt-4">
    <h1>{$page_title}</h1>
    <p>{$message}</p>
</div>
```

### 4. Set Up Database (for local auth)

```sql
CREATE TABLE user (
    username VARCHAR(255) PRIMARY KEY,
    password VARCHAR(255),
    active BOOLEAN DEFAULT TRUE
);

CREATE TABLE user_attr (
    username VARCHAR(255),
    attr_name VARCHAR(255),
    attr_value TEXT,
    FOREIGN KEY (username) REFERENCES user(username)
);
```

## Customization

### Override Framework Templates

Place templates with the same name in your `templates/` directory to override framework defaults:

- `templates/index.tpl` - Main layout wrapper
- `templates/menu.tpl` - Navigation menu
- `templates/login.tpl` - Login page
- `templates/header.tpl` - Custom CSS/JS includes

### Add Custom CSS/JS

In `templates/header.tpl`:

```smarty
<link rel="stylesheet" href="css/custom.css" />
<script src="js/custom.js"></script>
```

### Navigation Buttons

Configure in `config.local.php`:

```php
$nav_buttons = array(
    'pagename' => array(
        'title' => 'Display Name',
        'faclass' => 'icon-name',       // Font Awesome icon
        'btn_color' => 'primary',        // Bootstrap color
        'btn_type' => 'page',            // 'page' or 'modal'
        'modalId' => 'MyModal',          // If btn_type='modal'
    ),
);
```

## Authentication

### Local Authentication

Users stored in MySQL database. Default admin user:
- Username: `admin`
- Password: `admin` (change immediately!)

### LDAP Authentication

Set in `config.local.php`:

```php
$auth_method = 'ldap';
$ldap_server = 'ldap://your-server.com';
$ldap_base_dn = 'dc=example,dc=com';
```

## Framework Updates

**Important**: Never edit framework files directly in the `framework/` directory. Changes will be lost when updating the subtree.

To contribute framework improvements:
1. Fork https://github.com/mattv8/smarty-portal-framework
2. Make changes in your fork
3. Submit a pull request
4. Update your project's subtree after merge

## Requirements

- PHP 8.1+
- MySQL 5.7+ or MariaDB
- Apache/Nginx with mod_rewrite
- Composer (for Smarty dependencies)

## License

See LICENSE file in framework repository.

## Support

- Framework Issues: https://github.com/mattv8/smarty-portal-framework/issues
- Documentation: https://github.com/mattv8/smarty-portal-framework/wiki
