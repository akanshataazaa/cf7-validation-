<?php
namespace CF7Enhancer;

if (!defined('ABSPATH')) exit;

// Register Global Settings
add_action('admin_init', function () {
    register_setting('cf7_enhancer_global_group', 'cf7_enhancer_global_settings');

    if (
        isset($_POST['cf7_enhancer_global_settings']) &&
        check_admin_referer('cf7_enhancer_save_global_settings', 'cf7_enhancer_global_nonce')
    ) {
        $raw = $_POST['cf7_enhancer_global_settings'];
        $settings = [];

        // Save radio settings
        foreach (['error_display', 'response_position'] as $field) {
            if (isset($raw[$field])) {
                $settings[$field] = sanitize_text_field($raw[$field]);
            }
        }

        // Save checkbox settings
        foreach (['realtime_validation', 'floating_labels', 'highlight_invalid', 'auto_scroll', 'radio_custom_validation'] as $field) {
            $settings[$field] = isset($raw[$field]) ? '1' : '0';
        }

        // Loader settings
        $settings['loading_indicator'] = [
            'url' => sanitize_text_field($raw['loading_indicator']['url'] ?? ''),
            'position' => sanitize_text_field($raw['loading_indicator']['position'] ?? 'right'),
            'enabled' => !empty($raw['loading_indicator']['url']) ? '1' : '0'
        ];

        update_option('cf7_enhancer_global_settings', $settings);

        add_action('admin_notices', function () {
            echo '<div class="updated"><p>Global settings saved successfully.</p></div>';
        });
    }
});

function render_global_settings_page() {
    $settings = get_option('cf7_enhancer_global_settings', []);
    print_r($settings);
    echo '<div class="wrap"><h1>CF7 Enhancer - Global Settings</h1>';
    echo '<form method="post">';
    wp_nonce_field('cf7_enhancer_save_global_settings', 'cf7_enhancer_global_nonce');
    echo '<table class="form-table"><tbody>';

    cf7_enhancer_global_field_radio('error_display', 'Error Display Mode', [
        'below' => 'Below Each Field',
        'top' => 'Top Summary',
        'bottom' => 'Bottom Summary'
    ], $settings);

    cf7_enhancer_global_field_radio('response_position', 'Response Message Position', [
        'top' => 'Top of Form',
        'bottom' => 'Bottom of Form'
    ], $settings);

    foreach (['realtime_validation', 'floating_labels', 'highlight_invalid', 'auto_scroll'] as $field) {
        cf7_enhancer_global_field_checkbox($field, ucfirst(str_replace('_', ' ', $field)), $settings);
    }

    // echo "<tr><th>Custom Radio Validation</th><td>";
    // echo "<p><label><input type='checkbox' name='cf7_enhancer_global_settings[radio_custom_validation]' value='1' " . checked($settings['radio_custom_validation'] ?? '0', '1', false) . "> Enable custom radio button validation?</label></p>";
    // echo "</td></tr>";
    // Set default for radio_custom_validation to '1' if not set
    $radio_custom_validation = isset($settings['radio_custom_validation']) ? $settings['radio_custom_validation'] : '1';

    echo "<tr><th>Custom Radio Validation</th><td>";
    echo "<p><label><input type='checkbox' name='cf7_enhancer_global_settings[radio_custom_validation]' value='1' " . checked($radio_custom_validation, '1', false) . "> Enable custom radio button validation?</label></p>";
    echo "</td></tr>";

    // Loader
    $loader_url = $settings['loading_indicator']['url'] ?? '';
    $loader_position = $settings['loading_indicator']['position'] ?? 'right';

    echo "<tr><th>Custom Loader Settings</th><td>";
    echo '<label>Loader Image: </label>';
    echo '<input type="text" name="cf7_enhancer_global_settings[loading_indicator][url]" value="' . esc_attr($loader_url) . '" />';
    echo '<input type="button" class="button upload_image_button" value="Upload Image" /><br><br>';

    echo '<label>Loader Position: </label>';
    echo '<select name="cf7_enhancer_global_settings[loading_indicator][position]">';
    foreach (['left', 'right', 'bottom'] as $pos) {
        echo '<option value="' . $pos . '"' . selected($loader_position, $pos, false) . '>' . ucfirst($pos) . '</option>';
    }
    echo '</select>';
    echo "</td></tr>";

    echo '</tbody></table>';
    submit_button('Save Global Settings');
    echo '</form></div>';
}

// Unique function for global checkbox
function cf7_enhancer_global_field_checkbox($field, $label, $settings) {
    $checked = isset($settings[$field]) && $settings[$field] === '1' ? 'checked' : '';
    echo "<tr><th><label for='$field'>$label</label></th><td>";
    echo "<input type='checkbox' id='$field' name='cf7_enhancer_global_settings[$field]' value='1' $checked />";
    echo "</td></tr>";
}

// Unique function for global radio
function cf7_enhancer_global_field_radio($field, $label, $options, $settings) {
    echo "<tr><th>$label</th><td>";
    foreach ($options as $val => $text) {
        $checked = (isset($settings[$field]) && $settings[$field] === $val) ? 'checked' : '';
        echo "<label><input type='radio' name='cf7_enhancer_global_settings[$field]' value='$val' $checked> $text</label><br>";
    }
    echo "</td></tr>";
}