// Contact form handler
document.addEventListener('DOMContentLoaded', function() {
  const contactForm = document.getElementById('contactForm');
  
  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault(); // Prevent the default form submission
      
      // Get form data
      const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        company: document.getElementById('company')?.value || '',
        service: document.getElementById('service').value,
        message: document.getElementById('message').value
      };
      
      // Show loading state
      const submitButton = contactForm.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.textContent;
      submitButton.textContent = 'Sending...';
      submitButton.disabled = true;
      
      try {
        console.log('Submitting form data:', formData);
        
        // Submit to your API endpoint
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
        
        console.log('Response status:', response.status);
        
        let result;
        try {
          result = await response.json();
          console.log('Response data:', result);
        } catch (jsonError) {
          console.error('Error parsing JSON response:', jsonError);
          result = { message: 'Error processing server response' };
        }
        
        if (response.ok) {
          // Show success message
          const formStatus = document.getElementById('formStatus');
          if (formStatus) {
            formStatus.classList.remove('hidden');
            contactForm.style.display = 'none';
          } else {
            alert('Thank you! Your message has been sent successfully. We\'ll get back to you soon.');
          }
          
          // Reset form
          contactForm.reset();
        } else {
          alert('Error: ' + (result.message || 'Something went wrong. Please try again.'));
        }
      } catch (error) {
        console.error('Error submitting form:', error);
        alert('An error occurred while submitting the form. Please try again.');
      } finally {
        // Reset button state
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
      }
    });
  } else {
    console.warn('Contact form element not found on page');
  }
});
