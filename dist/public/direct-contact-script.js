// EmailJS Direct Integration for Published Website
(function() {
  // EmailJS configuration
  const EMAILJS_CONFIG = {
    serviceId: 'service_n7zgxbq',
    templateId: 'template_g6lecup',
    publicKey: 'HavT3ToZ0D-sRv5-c'
  };

  // Initialize EmailJS
  function initEmailJS() {
    if (typeof emailjs !== 'undefined') {
      emailjs.init(EMAILJS_CONFIG.publicKey);
    }
  }

  // Wait for page to load
  document.addEventListener('DOMContentLoaded', function() {
    // Load EmailJS library
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    script.onload = function() {
      initEmailJS();
      setupContactForm();
    };
    document.head.appendChild(script);
  });

  function setupContactForm() {
    // Wait for React to render the form
    setTimeout(function() {
      const contactForm = document.getElementById('contactForm');
      
      if (contactForm) {
        // Remove existing event listeners
        const newForm = contactForm.cloneNode(true);
        contactForm.parentNode.replaceChild(newForm, contactForm);
        
        newForm.addEventListener('submit', async function(e) {
          e.preventDefault();
          
          const formData = {
            from_name: document.getElementById('name')?.value || '',
            from_email: document.getElementById('email')?.value || '',
            company: document.getElementById('company')?.value || 'Not provided',
            phone: getPhoneNumber(),
            service: document.getElementById('service')?.value || '',
            message: document.getElementById('message')?.value || ''
          };
          
          const submitButton = newForm.querySelector('button[type="submit"]');
          const originalText = submitButton.textContent;
          submitButton.textContent = 'Sending...';
          submitButton.disabled = true;
          
          try {
            // Send via EmailJS
            await emailjs.send(
              EMAILJS_CONFIG.serviceId,
              EMAILJS_CONFIG.templateId,
              formData
            );
            
            // Show success message
            const formStatus = document.getElementById('formStatus');
            if (formStatus) {
              formStatus.classList.remove('hidden');
              formStatus.style.display = 'block';
              newForm.style.display = 'none';
            } else {
              alert('Thank you! Your message has been sent successfully. We\'ll respond within 24 hours.');
            }
            
            newForm.reset();
            
          } catch (error) {
            console.error('EmailJS error:', error);
            alert('Error sending message. Please try again or contact us directly at info@biforgrowth.com');
          } finally {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
          }
        });
      }
    }, 3000); // Wait 3 seconds for React to fully load
  }

  function getPhoneNumber() {
    const countryCode = document.getElementById('countryCode')?.value || '';
    const telephone = document.getElementById('telephone')?.value || '';
    
    if (countryCode && telephone) {
      return countryCode.split('_')[0] + ' ' + telephone;
    }
    return telephone || 'Not provided';
  }
})();
