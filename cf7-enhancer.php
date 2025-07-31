<?php
namespace CF7Enhancer;
ob_start();
/**
 * Plugin Name: CF7 Enhancer
 * Description: Enhances Contact Form 7 with modern client-side validation, UI improvements, and admin-configurable behavior.
 * Version: 1.0.0
 * Author: Akansha Gupta
 * Author URI: https://akanshagupta.co.in/
 * Text Domain: cf7-enhancer
 */


if (!defined('ABSPATH')) exit;

// Define constants
define(__NAMESPACE__ . '\\PLUGIN_DIR', plugin_dir_path(__FILE__));
define(__NAMESPACE__ . '\\PLUGIN_URL', plugin_dir_url(__FILE__));

// Load required files
require_once PLUGIN_DIR . 'includes/hooks.php';
// Admin menu structure: top-level + submenu
add_action('admin_menu', function () {
    // Top-level menu
    add_menu_page(
        'CF7 Enhancer',
        'CF7 Enhancer',
        'manage_options',
        'cf7-enhancer',
        'CF7Enhancer\\cf7_enhancer_render_settings_page',
        'dashicons-admin-generic',
        80
    );

    // Submenu for Global Settings
    add_submenu_page(
        'cf7-enhancer',
        'Global Settings',
        'Global Settings',
        'manage_options',
        'cf7-enhancer-global',
        'CF7Enhancer\\render_global_settings_page'
    );
});
// require_once PLUGIN_DIR . 'includes/helper-functions.php';
require_once PLUGIN_DIR . 'admin/global-settings-page.php';
require_once PLUGIN_DIR . 'admin/settings-page.php';

// Load assets
add_action('wp_enqueue_scripts', __NAMESPACE__ . '\\enqueue_assets');
function enqueue_assets() {
    wp_register_script(
        'cf7-enhancer-validator',
        PLUGIN_URL . 'assets/js/validator.js',
        ['jquery'],
        '1.0',
        true // footer = true
    );

    $forms = get_posts([
        'post_type' => 'wpcf7_contact_form',
        'posts_per_page' => -1,
        'fields' => 'ids',
    ]);

    function cf7_enhancer_get_settings($form_id = null) {
    $global = get_option('cf7_enhancer_global_settings', []);
    if ($form_id) {
        $form_settings = get_post_meta($form_id, '_cf7_enhancer_settings', true) ?: [];
        return array_replace_recursive($global, $form_settings); // Form-specific overrides global
    }
    return $global;
}
    $form_settings = [];
    foreach ($forms as $form_id) {
        $settings = cf7_enhancer_get_settings($form_id);
        if (!empty($settings)) {
            $form_settings[$form_id] = $settings;
        }
    }       

    wp_localize_script('cf7-enhancer-validator', 'cf7EnhancerSettings', [
        'forms' => $form_settings,
    ]);

    wp_enqueue_script('cf7-enhancer-validator');
    wp_enqueue_style('cf7-enhancer-style', PLUGIN_URL . 'assets/css/styles.css', [], '1.0');
}



add_action('wpcf7_save_contact_form', function ($cf7) {
    $form_id = $cf7->id();
    $form_html = $cf7->prop('form');

    // Set has_radio meta
    if (strpos($form_html, 'type="radio"') !== false || strpos($form_html, '[radio') !== false) {
        update_post_meta($form_id, '_cf7_has_radio', true);
        $settings['radio_custom_validation'] = '1';
        
    } else {
        delete_post_meta($form_id, '_cf7_has_radio');
        $settings['radio_custom_validation'] = '0';
    }

    // Merge/update settings safely
    $settings = get_post_meta($form_id, '_cf7_enhancer_settings', true);
    $settings = is_array($settings) ? $settings : [];

    update_post_meta($form_id, '_cf7_enhancer_settings', $settings);
});


  add_action('admin_enqueue_scripts', function () {
    wp_enqueue_media();
    wp_enqueue_script('cf7-enhancer-admin-upload', PLUGIN_URL . 'assets/js/admin-upload.js', ['jquery'], null, true);
});


add_action('wp_footer', function () {
    if (defined('WP_DEBUG_DISPLAY') && WP_DEBUG_DISPLAY) {
        echo '<pre>';
        print_r(error_get_last());
        echo '</pre>';
    }
});

file_put_contents(__DIR__ . '/debug-output.txt', ob_get_clean());
