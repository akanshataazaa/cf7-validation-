<?php 

// in hooks.php
namespace CF7Enhancer;

// add_filter('wpcf7_form_elements', __NAMESPACE__ . '\\move_response_output', 999);
function move_response_output($content) {
    $settings = get_option('cf7_enhancer_settings', []);
    if (!empty($settings['response_position']) && $settings['response_position'] === 'top') {
        $content = preg_replace('/(<div class="wpcf7-response-output[^"]*">.*?<\/div>)/is', '', $content);
        $content = '<div class="wpcf7-response-output"></div>' . $content;
    }
    return $content;
}



?>

