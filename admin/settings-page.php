<?php


// Plugin Settings Page
add_action('admin_menu', function () {
    add_menu_page(
        'CF7 Enhancer Settings',
        'CF7 Enhancer',
        'manage_options',
        'cf7-enhancer',
        'cf7_enhancer_render_settings_page'
    );
});

function cf7_enhancer_render_settings_page()
{
    echo '<label for="form_id"><strong>Select Form:</strong></label> ';

    $selected_form_id = isset($_GET['form_id']) ? intval($_GET['form_id']) : 0;

    // Fetch all Contact Form 7 forms
    $forms = get_posts([
        'post_type' => 'wpcf7_contact_form',
        'posts_per_page' => -1
    ]);
    
    echo '<div class="wrap"><h1>CF7 Enhancer Settings</h1>';

    echo '<form method="get">';
    echo '<input type="hidden" name="page" value="cf7-enhancer">';
    echo '<label for="form_id">Select Form: </label>';
    echo '<select name="form_id" id="form_id" onchange="this.form.submit()">';
    echo '<option value="">Select a Form</option>';
    foreach ($forms as $form) {
        $selected = ($form->ID == $selected_form_id) ? 'selected' : '';
        echo "<option value='{$form->ID}' $selected>{$form->post_title}</option>";
    }
    echo '</select>';
    echo '</form>';

    if ($selected_form_id) {
        // Load saved settings for the selected form
        $settings = get_post_meta($selected_form_id, '_cf7_enhancer_settings', true) ?: [];

        echo '<form method="post">';
        echo '<input type="hidden" name="form_id" value="' . esc_attr($selected_form_id) . '">';
        echo '<table class="form-table">';
        echo "<tbody>";
        wp_nonce_field('cf7_enhancer_save_settings', 'cf7_enhancer_nonce');
        // Radio settings
        cf7_enhancer_settings_field_radio('error_display', 'Error Display Mode', [
            'below' => 'Below Each Field',
            'top' => 'Top Summary',
            'bottom' => 'Bottom Summary'
        ], $settings);

        cf7_enhancer_settings_field_radio('response_position', 'Response Message Position', [
            'top' => 'Top of Form',
            'bottom' => 'Bottom of Form'
        ], $settings);

        // Checkbox settings
        $toggles = ['realtime_validation', 'floating_labels', 'loading_indicator', 'highlight_invalid', 'auto_scroll'];
        foreach ($toggles as $toggle) {
            cf7_enhancer_settings_field_checkbox($toggle, ucfirst(str_replace('_', ' ', $toggle)), $settings);
        }
        
        $has_radio = get_post_meta($selected_form_id, '_cf7_has_radio', true);
        // print_r($has_radio);
        // print_r($settings['radio_custom_validation']);
            // Default: if setting not saved, treat as enabled ('1')
            // $enabled = isset($settings['radio_custom_validation']) ? $settings['radio_custom_validation'] : '1';
            // $checked = $enabled === '1' ? 'checked' : '';
            $checked = '1' ? 'checked' : '';
            $value = '1';
            // !isset($settings['radio_custom_validation']) ||  &&  $has_radio
            if ($has_radio ) {
                $input_id = 'cf7_enhancer_radio_custom_validation';
                echo "<tr>";
                echo "<th>Custom Radio Validation</th>";
                echo "<td>";
                echo "<p><label for='$input_id'>";
                if(isset($settings['radio_custom_validation']) && $settings['radio_custom_validation'] == 0){
                ?>
                
                <input type="checkbox" id="<?php echo $input_id; ?>" name="cf7_enhancer_settings[radio_custom_validation]" value="<?php echo $value ?>" >
                    Enable custom radio button validation?
                </label></p>
                <?php
                }else{
                ?>
                
                    <input type="checkbox" id="<?php echo $input_id; ?>" name="cf7_enhancer_settings[radio_custom_validation]" value="<?php echo $value ?>" <?php echo $checked ?>>
                    Enable custom radio button validation?
                </label></p> <?php }
                echo "</td>";
                echo "</tr>";
            } else {
                echo "<tr><th>Custom Radio Validation</th><td><em>This form does not contain any radio buttons.</em></td></tr>";
            }
        echo "</table>";
        echo "</tbody>";
        submit_button('Save Settings');
        echo '</form>';
    }

    echo '</div>';
}

function cf7_enhancer_settings_field_radio($id, $label, $options, $settings)
{
    echo "<tr>";
    echo "<th>$label</th>";
    echo "<td>";
    foreach ($options as $value => $text) {
        $input_id = "cf7_enhancer_{$id}_{$value}";
        $checked = (!empty($settings[$id]) && $settings[$id] === $value) ? 'checked' : '';
        echo "<p><label for='$input_id'>
            <input type='radio' id='$input_id' name='cf7_enhancer_settings[$id]' value='$value' $checked>
            $text
        </label></p>";
    }
    echo "</td>";
    echo "</tr>";
}


function cf7_enhancer_settings_field_checkbox($id, $label, $settings)
{
    $input_id = "cf7_enhancer_{$id}";
    $checked = !empty($settings[$id]) ? 'checked' : '';
    echo "<tr>";
    echo "<th>$label</th>";
    echo "<td>";
    echo "<p><label for='$input_id'>
        <input type='checkbox' id='$input_id' name='cf7_enhancer_settings[$id]' value='1' $checked>
        
    </label></p>";
    echo "</td>";
    echo "</tr>";
}

// Save Settings
add_action('admin_init', function () {
    if (
        isset($_POST['cf7_enhancer_settings'], $_POST['form_id']) &&
        check_admin_referer('cf7_enhancer_save_settings', 'cf7_enhancer_nonce')
    ) {
        $form_id = intval($_POST['form_id']);
        $settings = $_POST['cf7_enhancer_settings'];
        if (!isset($settings['radio_custom_validation'])) {
            $settings['radio_custom_validation'] = '0';
            // echo "hello".$settings['radio_custom_validation'];
            // die;
        }
        update_post_meta($form_id, '_cf7_enhancer_settings', $settings);
        add_action('admin_notices', function () {
            echo '<div class="updated"><p>Settings saved successfully.</p></div>';
        });
    }
});


add_action('wpcf7_add_meta_boxes', function () {
    add_meta_box(
        'cf7-enhancer-radio-settings',
        __('Radio Button Validation', 'cf7-enhancer'),
        'render_radio_validation_setting', // ✅ No namespace
        'wpcf7_contact_form',
        'form',
        'default'
    );

});


add_filter('wpcf7_validate_radio*', 'cf7_enhancer_bypass_radio_validation_if_disabled', 5, 2);
add_filter('wpcf7_validate_radio', 'cf7_enhancer_bypass_radio_validation_if_disabled', 5, 2);

function cf7_enhancer_bypass_radio_validation_if_disabled($result, $tag) {
    if (is_admin()) return $result;

    $submission = WPCF7_Submission::get_instance();
    if (!$submission) return $result;

    $form = $submission->get_contact_form();
    if (!$form) return $result;

    $form_id = $form->id();
    $settings = get_post_meta($form_id, '_cf7_enhancer_settings', true);

    if (isset($settings['radio_custom_validation']) && $settings['radio_custom_validation'] === '0') {
        // Remove invalidation for radio field if it was marked invalid
        $field_name = $tag->name;

        // get current invalid fields
        $invalid_fields = $result->get_invalid_fields();
        error_log(print_r($invalid_fields,true));
        if (isset($invalid_fields[$field_name])) {
            // Use reflection to clear the private invalid field
            $ref = new ReflectionClass($result);
            if ($ref->hasProperty('invalid_fields')) {
                $prop = $ref->getProperty('invalid_fields');
                $prop->setAccessible(true);
                $current_invalids = $prop->getValue($result);
                unset($current_invalids[$field_name]);
                $prop->setValue($result, $current_invalids);
            }
        }

        // Return result without adding any error
        return $result;
    }

    return $result;
}




// add_filter('wpcf7_validate', 'cf7_enhancer_force_valid_submission_if_radio_disabled', 20, 2);

// function cf7_enhancer_force_valid_submission_if_radio_disabled($result, $tags) {
//     $submission = WPCF7_Submission::get_instance();
//     error_log("submission");
//     error_log(print_r($submission,true));
//     if (!$submission) return $result;

//     $form = $submission->get_contact_form();
//     if (!$form) return $result;

//     $form_id = $form->id();
//     error_log("$form_id");
//     error_log(print_r($form_id,true));
//     $settings = get_post_meta($form_id, '_cf7_enhancer_settings', true);
//     if (isset($settings['radio_custom_validation']) && $settings['radio_custom_validation'] === '0') {
//         if (!$result->is_valid()) {
//             $invalid_fields = $result->get_invalid_fields();
//             $only_radios = true;

//             foreach ($invalid_fields as $field_name => $msg) {
//                 foreach ($tags as $tag) {
//                     if ($tag->name === $field_name && $tag->type !== 'radio') {
//                         $only_radios = false;
//                         break 2;
//                     }
//                 }
//             }

//             if ($only_radios) {
//                 // Create a new result object and mark it valid
//                 $new_result = new WPCF7_Validation();
//                 $new_result->set_valid(true);
//                 return $new_result;
//             }
//         }
//     }

//     return $result;
// }




function render_radio_validation_setting($post) {
    $form_id = $post->ID;
    $has_radio = get_post_meta($form_id, '_cf7_has_radio', true);
    $settings = get_post_meta($form_id, '_cf7_enhancer_settings', true);

    $enabled = $settings['radio_custom_validation'] ?? '1'; // default to enabled

    if (!$has_radio) {
        echo '<p><em>This form does not contain any radio buttons.</em></p>';
        return;
    }

    ?>
    <label>
        <input type="checkbox" name="cf7_enhancer_radio_custom_validation" value="1" <?php checked($enabled, '1'); ?>>
        <?php esc_html_e('Enable custom radio button validation?', 'cf7-enhancer'); ?>
    </label>
    <?php }; ?>