document.addEventListener('DOMContentLoaded', function () {
    const forms = document.querySelectorAll('form.wpcf7-form');
    forms.forEach(form => {
        const formIdInput = form.querySelector('input[name="_wpcf7"]');
        if (!formIdInput) return;

        const formId = formIdInput.value;
        const settings = cf7EnhancerSettings.forms[formId];
// console.log(cf7EnhancerSettings.forms[formId].radio_custom_validation);
        // console.log(settings);
        
        if (!settings) {
            console.log(`No settings found for form ID ${formId}`);
            return;
        }

    
        const summaryTop = document.createElement('div');
        summaryTop.className = 'cf7-enhancer-summary cf7-enhancer-summary-top';

        const summaryBottom = document.createElement('div');
        summaryBottom.className = 'cf7-enhancer-summary cf7-enhancer-summary-bottom';

        if (settings.error_display === 'top') form.prepend(summaryTop);
        if (settings.error_display === 'bottom') form.append(summaryBottom);

        const validateField = (field) => {
            const value = field.value.trim();
            const type = field.getAttribute('type') || field.tagName.toLowerCase();
            const pattern = field.getAttribute('pattern') || field.dataset.pattern;
            const required = field.classList.contains('wpcf7-validates-as-required') ||
                (field.closest('.wpcf7-form-control')?.classList.contains('wpcf7-validates-as-required'));
            
            const errorWrap = field.closest('.wpcf7-form-control-wrap') || field.parentElement;
            // console.log(errorWrap);
            let valid = true;
            let message = '';

            // Handle required fields
            if (required) {
                if (['checkbox'].includes(type)) {
                    const cleanName = field.name.replace(/\[\]$/, '');
                    const groupFields = form.querySelectorAll(`[name^="${cleanName}"]`);
                    const isChecked = [...groupFields].some(f => f.checked);
                    
                    if (!isChecked) {
                        valid = false;
                        message = 'This field is required.';
                        if (field !== groupFields[0]){
                        // console.log(valid);    
                        return valid;
                        }
                    }
                } else if (!value && type !== 'file') {
                    valid = false;
                    message = 'This field is required.';
                }
                
                
            }
            if (['radio'].includes(type)) {
                // console.log("value"+value);
                    // console.log("radio_custom_validation:", settings?.radio_custom_validation);
                    const cleanName = field.name.replace(/\[\]$/, '');
                    const groupFields = form.querySelectorAll(`[name^="${cleanName}"]`);
                    const isChecked = [...groupFields].some(f => f.checked);
                   
                    if (settings?.radio_custom_validation == 1 && isChecked == false) {
                        // console.log("in radio");
                        valid = false;
                        message = 'This field is required.';
                        if (field !== groupFields[0]){
                        // console.log(valid);    
                        return valid;
                        }
                    }
                } else if (!value && type !== 'file') {
                    valid = false;
                    message = 'This field is required.';
                }
            // Type-specific validation
            if (valid && type === 'email' && value && !/^\S+@\S+\.\S+$/.test(value)) {
                valid = false;
                message = 'Please enter a valid email.';
            }

            if (valid && type === 'url' && value && !/^https?:\/\/.+/.test(value)) {
                valid = false;
                message = 'Please enter a valid URL.';
            }

            if (valid && type === 'tel' && value && !/^[0-9\-\+\(\)\s]+$/.test(value)) {
                valid = false;
                message = 'Invalid phone number.';
            }

            if (valid && type === 'number' && value) {
                const num = Number(value);
                const min = field.getAttribute('min');
                const max = field.getAttribute('max');
                if (isNaN(num)) {
                    valid = false;
                    message = 'Please enter a valid number.';
                } else {
                    if (min && num < Number(min)) {
                        valid = false;
                        message = `Value must be at least ${min}.`;
                    }
                    if (max && num > Number(max)) {
                        valid = false;
                        message = `Value must be no more than ${max}.`;
                    }
                }
            }

            if (valid && type === 'date' && value && isNaN(Date.parse(value))) {
                valid = false;
                message = 'Please enter a valid date.';
            }

            if (valid && type === 'file') {
                const accept = field.getAttribute('accept');
                const maxSize = parseInt(field.dataset.maxSize || '0', 10);
                const file = field.files[0];

                if (required && !file) {
                    valid = false;
                    message = 'Please upload a file.';
                } else if (file) {
                    if (maxSize && file.size > maxSize * 1024) {
                        valid = false;
                        message = 'File size exceeds limit.';
                    } else if (accept) {
                        const acceptedTypes = accept.split(',').map(type => type.trim());
                        const isAccepted = acceptedTypes.some(type => {
                            if (type.endsWith('/*')) {
                                const base = type.split('/')[0];
                                return file.type.startsWith(base + '/');
                            }
                            return file.type === type;
                        });
                        if (!isAccepted) {
                            valid = false;
                            message = 'Invalid file type.';
                        }
                    }
                }
            }

            if (valid && pattern && value && !(new RegExp(pattern).test(value))) {
                valid = false;
                message = 'Invalid format.';
            }

            if (
                valid &&
                field.tagName.toLowerCase() === 'select' &&
                required &&
                (field.selectedIndex === 0 || field.value === '')
            ) {
                valid = false;
                message = 'Please select an option.';
            }

            if (valid && field.classList.contains('wpcf7-acceptance') && !field.checked) {
                valid = false;
                message = 'You must accept this field.';
            }

            // Remove existing errors
            if (['checkbox', 'radio'].includes(type)) {
                // const cleanName = field.name.replace(/\[\]$/, '');
                // console.log(cleanName);
                // form.querySelectorAll(`[name^="${cleanName}"]`).forEach(f => {
                //     const wrap = f.closest('.wpcf7-form-control-wrap') || f.parentElement;
                //     const existingError = wrap.querySelector('.cf7-enhancer-error');
                //     console.log(existingError);
                //     if (existingError) existingError.remove();
                // });
                form.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(field => {
                    field.addEventListener('change', () => {
                        const type = field.type;
                        const cleanName = field.name.replace(/\[\]$/, '');
                        const targets = type === 'radio'
                            ? form.querySelectorAll(`input[type="radio"][name="${cleanName}"]`)
                            : [field];
                
                        targets.forEach(f => {
                            const wrap = f.closest('.wpcf7-form-control-wrap') || f.parentElement;
                            wrap?.querySelector('.cf7-enhancer-error')?.remove();
                        });
                    });
                });

            } else {
                const existingError = errorWrap.querySelector('.cf7-enhancer-error');
                if (existingError) existingError.remove();
            }

            // Show new error
            if (!valid) {
                const msg = document.createElement('div');
                msg.className = 'cf7-enhancer-error';
                msg.innerText = message;

                if (['checkbox', 'radio'].includes(type)) {
                    const cleanName = field.name.replace(/\[\]$/, '');
                    const firstField = form.querySelector(`[name^="${cleanName}"]`);
                    const wrap = firstField.closest('.wpcf7-form-control-wrap') || firstField.parentElement;
                    wrap.querySelectorAll('.cf7-enhancer-error').forEach(el => el.remove());
                    wrap.appendChild(msg);
                } else 
                if (errorWrap) {
                    errorWrap.appendChild(msg);
                } else {
                    field.insertAdjacentElement('afterend', msg);
                }

                field.classList.add('cf7-invalid');
            } else {
                field.classList.remove('cf7-invalid');
            }

            return valid;
        };

        const validateForm = () => {
            let valid = true;
            const fields = form.querySelectorAll('input, textarea, select');
            // console.log(fields);
            const summary = settings.error_display === 'top' ? summaryTop :
                            settings.error_display === 'bottom' ? summaryBottom : null;

            if (summary) summary.innerHTML = '';

            fields.forEach(field => {
                if (!validateField(field)) valid = false;
            });

            if (!valid && summary) {
                summary.innerHTML = '<p>Please correct the errors below.</p>';
                if (settings.auto_scroll) summary.scrollIntoView({ behavior: 'smooth' });
            }

            return valid;
        };

        // Realtime validation
        if (settings.realtime_validation === '1') {
            form.querySelectorAll('input, textarea, select').forEach(field => {
                const eventType = ['checkbox', 'radio'].includes(field.type) ? 'change' : 'input';
                console.log(eventType);
                field.addEventListener(eventType, () => validateField(field));
            });
        }

        // On form submit
        form.addEventListener('submit', function (e) {
            if (!validateForm()) {
                e.preventDefault();
                e.stopImmediatePropagation();
                return false;
            }
            if (settings.loading_indicator) {
                form.classList.add('cf7-enhancer-loading');
            }
        });
    });

    // Response message reposition
    document.addEventListener('wpcf7mailsent', function (event) {
        const form = event.target;
        const formIdInput = form.querySelector('input[name="_wpcf7"]');
        if (!formIdInput) return;

        const formId = formIdInput.value;
        const settings = cf7EnhancerSettings.forms?.[formId] || {};
        const response = form.querySelector('.wpcf7-response-output');

        if (response && settings.response_position === 'top') {
            response.remove();
            form.prepend(response);
        }
    });
});