// Direct FormSpree Integration for Published Website
// This bypasses all React components and directly handles form submission
(function() {
  console.log('Direct contact script loaded');
  
  function setupDirectFormHandler() {
    // Wait for the page to fully load and React to render
    setTimeout(function() {
      const contactForm = document.getElementById('contactForm');
      
      if (!contactForm) {
        console.log('Contact form not found, retrying...');
        setupDirectFormHandler();
        return;
      }
      
      console.log('Contact form found, setting up direct handler');
      
      // Remove all existing event listeners by cloning the form
      const newForm = contactForm.cloneNode(true);
      contactForm.parentNode.replaceChild(newForm, contactForm);
      
      // Add our custom handler
      newForm.addEventListener('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('Form submission intercepted');
        
        // Get form data
        const name = document.getElementById('name')?.value || '';
        const email = document.getElementById('email')?.value || '';
        const company = document.getElementById('company')?.value || '';
        const service = document.getElementById('service')?.value || '';
        const message = document.getElementById('message')?.value || '';
        const countryCode = document.getElementById('countryCode')?.value || '';
        const telephone = document.getElementById('telephone')?.value || '';
        
        // Format phone number
        let phone = 'Not provided';
        if (countryCode && telephone) {
          phone = countryCode.split('_')[0] + ' ' + telephone;
        } else if (telephone) {
          phone = telephone;
        }
        
        // Validate required fields
        if (!name || !email || !service || !message) {
          alert('Please fill in all required fields.');
          return;
        }
        
        // Update button state
        const submitButton = newForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;
        
        // Create FormData for FormSpree
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('company', company);
        formData.append('service', service);
        formData.append('message', message);
        formData.append('phone', phone);
        formData.append('_subject', 'New Business Inquiry - ' + service);
        
        // Submit to FormSpree
        fetch('https://formspree.io/f/xgvkbknj', {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        })
        .then(function(response) {
          if (response.ok) {
            console.log('Form submitted successfully');
            
            // Show success message
            const formStatus = document.getElementById('formStatus');
            if (formStatus) {
              formStatus.classList.remove('hidden');
              formStatus.style.display = 'block';
              newForm.style.display = 'none';
            } else {
              alert('Thank you! Your message has been sent successfully. We\'ll respond within 24 hours.');
            }
            
            // Reset form
            newForm.reset();
            
          } else {
            console.error('Form submission failed');
            alert('Error sending message. Please try again or contact us directly at info@biforgrowth.com');
          }
        })
        .catch(function(error) {
          console.error('Network error:', error);
          alert('Network error. Please check your connection and try again.');
        })
        .finally(function() {
          // Restore button
          submitButton.textContent = originalText;
          submitButton.disabled = false;
        });
      });
      
    }, 2000); // Wait 2 seconds for React to render
  }
  
  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupDirectFormHandler);
  } else {
    setupDirectFormHandler();
  }
  
})();
