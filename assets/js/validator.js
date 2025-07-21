


document.addEventListener('DOMContentLoaded', function () {
  const forms = document.querySelectorAll('form.wpcf7-form');
        forms.forEach(form => {
        const formIdInput = form.querySelector('input[name="_wpcf7"]');
        if (!formIdInput) return;

        const formId = formIdInput.value;
        const settings = cf7EnhancerSettings.forms[formId];
        console.log(settings);
        
// console.log(cf7EnhancerSettings.forms[formId].radio_custom_validation);
        
        
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
             // const type = field.type || field.tagName.toLowerCase();
              const type = field.getAttribute('type') || field.tagName.toLowerCase();
              //const required = field.classList.contains('wpcf7-validates-as-required');
              const pattern = field.getAttribute('pattern') || field.dataset.pattern;
              const required = field.classList.contains('wpcf7-validates-as-required') ||
                            (field.closest('.wpcf7-form-control')?.classList.contains('wpcf7-validates-as-required'));
            
              let errorWrap;
              if (type === 'checkbox' || type === 'radio') {
                errorWrap = form.querySelector(`.wpcf7-form-control-wrap[data-name="${field.name.replace(/\[\]$/, '')}"]`);
              } else {
                errorWrap = field.closest('.wpcf7-form-control-wrap');
              }
            
              // Remove existing error
              const existingError = errorWrap?.querySelector('.cf7-enhancer-error');
              if (existingError) existingError.remove();
            
              // Reset invalid styles
              field.classList.remove('cf7-invalid');
              field.setAttribute('aria-invalid', 'false');
            
              let valid = true;
              let message = '';
            
            //   console.log(type);
              if (!required  && type != 'radio') return true;
              if (type === 'checkbox' || (type === 'radio' && settings.radio_custom_validation == 1 )) {
            //console.log('Type=> '+ type);
                  
                const groupName = field.name.replace(/\[\]$/, '');
                const groupFields = form.querySelectorAll(`[name="${groupName}"], [name="${groupName}[]"]`);
                const anyChecked = Array.from(groupFields).some(f => f.checked);
                if (!anyChecked) {
            // console.log(groupFields);
                  valid = false;
                  message = 'This field is required.';
                //   if (field !== groupFields[0]) return true; // show error only once
                  
                //   groupFields.forEach(f => f.classList.add('cf7-invalid'));
                //   groupFields.forEach(f => f.setAttribute('aria-invalid', 'true'));
                }
                
              } else {
                const value = field.value.trim();
                if (value === '') {
                  valid = false;
                  message = 'This field is required.';
                  field.classList.add('cf7-invalid');
                  field.setAttribute('aria-invalid', 'true');
                } else if (type === 'email') {
                  const emailPattern = /^\S+@\S+\.\S+$/;
                  if (!emailPattern.test(value)) {
                    valid = false;
                    message = 'Please enter a valid email.';
                    field.classList.add('cf7-invalid');
                    field.setAttribute('aria-invalid', 'true');
                  }
                } else if (type === 'url') {
                  if (!/^https?:\/\/.+/.test(value)) {
                    valid = false;
                    message = 'Please enter a valid URL.';
                    field.classList.add('cf7-invalid');
                    field.setAttribute('aria-invalid', 'true');
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
                        field.classList.add('cf7-invalid');
                        field.setAttribute('aria-invalid', 'true');
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
              }
            
                  if (!valid && message && errorWrap) {
                      
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'cf7-enhancer-error';
                    errorDiv.innerText = message;
                    // if(type == 'checkbox'){
                        
                    //   console.log("type = "+type);
                    //   console.log(field);
                    // console.log(errorDiv);
                    // }
                    errorWrap.appendChild(errorDiv);
                  }
            
              return valid;
            };
            
              
            const validateForm = () => {
                let valid = true;
                const fields = form.querySelectorAll('input, select, textarea');
                const summary = settings.error_display === 'top' ? summaryTop :
                            settings.error_display === 'bottom' ? summaryBottom : null;
                
                if (summary) summary.innerHTML = '';
                fields.forEach(field => {
                  if (!validateField(field)) valid = false;
                });
                
                if (!valid && summary) {
                    summary.innerHTML = '<p>Please correct the errors.</p>';
                    // if (settings.auto_scroll) summary.scrollIntoView({ behavior: 'smooth' });
                    
                    const firstInvalidField = form.querySelector('.cf7-invalid');
                    if (firstInvalidField) {
                        const scrollTarget = firstInvalidField.closest('.wpcf7-form-control-wrap') || firstInvalidField;
                        scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                    
                    
                }
                return valid;
              };
            
            // Realtime validation
            if (settings.realtime_validation === '1') {
                form.querySelectorAll('input, textarea, select').forEach(field => {
                    const eventType = ['checkbox', 'radio'].includes(field.type) ? 'change' : 'input';
                    // console.log(eventType);
                    field.addEventListener(eventType, () => validateField(field));
                });
            }
            form.addEventListener('submit', function (e) {
                // Run your validation first
                if (!validateForm()) {
                  // If not valid, prevent CF7 AJAX submit and native submit
                  e.preventDefault();
                  e.stopImmediatePropagation();
                  return false; // just in case
                }
                
                if (settings.loading_indicator) {
                        const extension = settings.loading_indicator.url.split('.').pop().split(/\#|\?/)[0].toLowerCase();
                        console.log('Image extension:', extension);
                        const spinner = document.querySelector('.wpcf7-spinner');
                        
                        if (spinner) {
                            spinner.style.backgroundImage = 'url("'+settings.loading_indicator.url+'")';
                            spinner.style.backgroundSize = 'contain';
                            spinner.style.backgroundColor = 'transparent';
                            spinner.style.backgroundRepeat = 'no-repeat';
                            spinner.style.backgroundPosition = 'center';
                            // spinner.style.width = '24px';   // or your desired width
                            // spinner.style.height = '24px';  // or your desired height
                            if(settings.loading_indicator.position == 'bottom'){
                               spinner.style.display="block"; 
                               spinner.style.marginTop="20px"; 
                            }
                            if(settings.loading_indicator.position == 'right'){
                               spinner.style.float = "right";
                                
                            }
                            if(extension != 'gif'){
                            spinner.style.transformOrigin = '8px 8px';
                            spinner.style.animationName = 'spin';
                            spinner.style.animationDuration = '1000ms';
                            spinner.style.animationTimingFunction = 'linear';
                            spinner.style.animationIterationCount = 'infinite';
                            }
                            const style = document.createElement('style');
                            style.innerHTML = `
                              .wpcf7-spinner::before {
                                display: none !important;
                              }
                               @keyframes spin {
                                from { transform: rotate(0deg); }
                                to { transform: rotate(360deg); }
                              }
                            `;
                            document.head.appendChild(style);

                        }
                        // form.classList.add('cf7-enhancer-loading');
                    }
            });
        });
  // Optional: reposition CF7 response message if needed
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
})
