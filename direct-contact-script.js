// Contact form handler - Direct FormSpree submission
document.addEventListener('DOMContentLoaded', function() {
  const contactForm = document.getElementById('contactForm');
  
  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Get form data
      const formData = new FormData();
      formData.append('name', document.getElementById('name').value);
      formData.append('email', document.getElementById('email').value);
      formData.append('company', document.getElementById('company')?.value || '');
      formData.append('service', document.getElementById('service').value);
      formData.append('message', document.getElementById('message').value);
      
      // Show loading state
      const submitButton = contactForm.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.textContent;
      submitButton.textContent = 'Sending...';
      submitButton.disabled = true;
      
      try {
        // Submit directly to FormSpree
        const response = await fetch('https://formspree.io/f/xgvkbknj', {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          // Show success message
          const formStatus = document.getElementById('formStatus');
          if (formStatus) {
            formStatus.classList.remove('hidden');
            contactForm.style.display = 'none';
          } else {
            alert('Thank you! Your message has been sent successfully. We\'ll get back to you soon.');
          }
          contactForm.reset();
        } else {
          alert('Error: Something went wrong. Please try again.');
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
  }
});
