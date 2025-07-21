jQuery(document).ready(function($) {
    $('.upload_image_button').click(function(e) {
        e.preventDefault();
        var button = $(this);
        var custom_uploader = wp.media({
            title: 'Select Loader Image',
            button: { text: 'Use this image' },
            multiple: false
        })
        .on('select', function() {
            var attachment = custom_uploader.state().get('selection').first().toJSON();
            button.prev('input[type="text"]').val(attachment.url);
        })
        .open();
    });
});
