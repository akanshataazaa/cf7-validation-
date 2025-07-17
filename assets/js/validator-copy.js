



document.addEventListener('DOMContentLoaded', function () {
    const settings = window.cf7EnhancerSettings || {};
    const forms = document.querySelectorAll('form.wpcf7-form');

    forms.forEach(form => {
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
            // const required = field.classList.contains('wpcf7-validates-as-required');
            const required =
                field.classList.contains('wpcf7-validates-as-required') ||
                (field.closest('.wpcf7-form-control') && field.closest('.wpcf7-form-control').classList.contains('wpcf7-validates-as-required'));

            const errorWrap = field.closest('.wpcf7-form-control-wrap') || field.parentElement;

            let valid = true;
            let message = '';

            // Required fields
            // if (required) {
            //     if ((type === 'checkbox' || type === 'radio') && !field.checked) {
            //         valid = false;
            //         message = 'This field is required.';
            //     } else if (!value && !['checkbox', 'radio', 'file'].includes(type)) {
            //         valid = false;
            //         message = 'This field is required.';
            //     }
            // }
            
            // Required fields
            if (required) {
            
                console.log(field);
                if (type === 'checkbox' || type === 'radio') {
                    // Remove [] for proper name selection
                    const cleanName = field.name.replace(/\[\]$/, '');
                    const groupFields = form.querySelectorAll(`[name^="${cleanName}"]`);
                    const isChecked = Array.from(groupFields).some(f => f.checked);
            
                    if (!isChecked) {
                        valid = false;
                        message = 'This field is required.';
            
                        // Only validate and show error on the first element of the group
                        if (field !== groupFields[0]) {
                            return valid;
                        }
                    }
                } else if (!value && type !== 'file') {
                    valid = false;
                    message = 'This field is required.';
                }
            }


            // Type-based validations
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

            // if (valid && type === 'number' && value && isNaN(Number(value))) {
            //     valid = false;
            //     message = 'Please enter a valid number.';
            // }
            
            if (valid && type === 'number' && value) {
                const num = Number(value);
                const min = field.getAttribute('min');
                const max = field.getAttribute('max');
            
                if (isNaN(num)) {
                    valid = false;
                    message = 'Please enter a valid number.';
                } else {
                    if (min !== null && num < Number(min)) {
                        valid = false;
                        message = `Value must be at least ${min}.`;
                    }
                    if (max !== null && num > Number(max)) {
                        valid = false;
                        message = `Value must be no more than ${max}.`;
                    }
                }
           


            if (valid && type === 'date' && value && isNaN(Date.parse(value))) {
                valid = false;
                message = 'Please enter a valid date.';
            }
 }
            // File validation
            // if (valid && type === 'file') {
            //     const accept = field.getAttribute('accept');
            //     console.log("accept "+ accept)
            //     const maxSize = parseInt(field.dataset.maxSize || '0', 10);
            //     const file = field.files[0];
            //     console.log("file"+ file.type);
            //     if (required && !file) {
            //         valid = false;
            //         message = 'Please upload a file.';
            //     } else if (file) {
            //         if (maxSize && file.size > maxSize * 1024) {
            //             valid = false;
            //             message = 'File size exceeds limit.';
            //         } else if (accept && !file.type.match(accept.replace('*', '.*'))) {
            //             valid = false;
            //             message = 'Invalid file type.';
            //         }
            //     }
            // }
            
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
                                const baseType = type.split('/')[0];
                                return file.type.startsWith(baseType + '/');
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


            // Pattern
            if (valid && pattern && value && !(new RegExp(pattern).test(value))) {
                valid = false;
                message = 'Invalid format.';
            }

            // Dropdown
            // // if (valid && field.tagName.toLowerCase() === 'select' && required && !value) {
            // if (valid && field.tagName.toLowerCase() === 'select' && required && !value) {
            //     valid = false;
            //     message = 'Please select an option.';
            // }
            
            
            // Dropdown (Select)
            if (
                valid &&
                field.tagName.toLowerCase() === 'select' &&
                required &&
                (field.selectedIndex === 0 || field.value === '')
            ) {
                valid = false;
                message = 'Please select an option.';
            }

            
            // if (
            //     valid &&
            //     field.tagName.toLowerCase() === 'select' &&
            //     required &&
            //     (!value || value === '' || value === '0')
            // ) {
            //     valid = false;
            //     message = 'Please select an option.';
            // }
            
            // Acceptance checkbox
            if (valid && field.classList.contains('wpcf7-acceptance') && !field.checked) {
                valid = false;
                message = 'You must accept this field.';
            }

            // Remove old error
            // const existingError = errorWrap.querySelector('.cf7-enhancer-error');
            // if (existingError) existingError.remove();
            
            // Remove previous errors
            if (type === 'checkbox' || type === 'radio') {
                const cleanName = field.name.replace(/\[\]$/, '');
                const groupFields = form.querySelectorAll(`[name^="${cleanName}"]`);
                groupFields.forEach(f => {
                    const wrap = f.closest('.wpcf7-form-control-wrap') || f.parentElement;
                    const existingError = wrap.querySelector('.cf7-enhancer-error');
                    if (existingError) existingError.remove();
                });
            } else {
                const existingError = errorWrap.querySelector('.cf7-enhancer-error');
                if (existingError) existingError.remove();
            }


            // Show new error
            // if (!valid) {
            //     const msg = document.createElement('div');
            //     msg.className = 'cf7-enhancer-error';
            //     msg.innerText = message;
            //     field.insertAdjacentElement('afterend', msg);
            //     field.classList.add('cf7-invalid');
            // } else {
            //     field.classList.remove('cf7-invalid');
            // }
            
            if (!valid) {
                const msg = document.createElement('div');
                msg.className = 'cf7-enhancer-error';
                msg.innerText = message;
            
                if (type === 'checkbox') {
                    const cleanName = field.name.replace(/\[\]$/, '');
                    const firstField = form.querySelector(`[name^="${cleanName}"]`);
                    const wrap = firstField.closest('.wpcf7-form-control-wrap') || firstField.parentElement;
                    wrap.appendChild(msg);
                } else {
                    if (errorWrap && errorWrap !== field) {
                        errorWrap.appendChild(msg);
                    } else {
                        field.insertAdjacentElement('afterend', msg);
                    }
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
            
            const summary = settings.error_display === 'top' ? summaryTop : (settings.error_display === 'bottom' ? summaryBottom : null);
            if (summary) summary.innerHTML = '';

            fields.forEach(field => {
                console.log("field "+field.type);
                const isValid = validateField(field);
                if (!isValid) {
                    valid = false;
                }
            });

            if (!valid && summary) {
                summary.innerHTML = '<p>Please correct the errors below.</p>';
                if (settings.auto_scroll) summary.scrollIntoView({ behavior: 'smooth' });
            }

            return valid;
        };

        // Realtime validation
        if (settings.realtime_validation) {
            // console.log("hello");
            // form.querySelectorAll('input, textarea, select').forEach(field => {
            //     field.addEventListener('input', () => validateField(field));
            // });
            form.querySelectorAll('input, textarea, select').forEach(field => {
                console.log("fieldnew " + field.type);
                const eventType = (field.type === 'checkbox') ? 'change' : 'input';
                field.addEventListener(eventType, () => validateField(field));
            });

        }

        // Form submit
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

    // Success message handling (once globally)
    document.addEventListener('wpcf7mailsent', function (event) {
        const form = event.target;
        const settings = window.cf7EnhancerSettings || {};
        const response = form.querySelector('.wpcf7-response-output');

        // Prevent duplicate message positioning
        if (response && settings.response_position === 'top') {
            response.remove(); // remove from current spot
            form.prepend(response); // move to top
        }
    });
}