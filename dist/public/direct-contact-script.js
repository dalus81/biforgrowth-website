document.addEventListener('DOMContentLoaded', function() {
  const contactForm = document.getElementById('contactForm');
  
  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const formData = new FormData();
      formData.append('name', document.getElementById('name').value);
      formData.append('email', document.getElementById('email').value);
      formData.append('company', document.getElementById('company')?.value || '');
      formData.append('service', document.getElementById('service').value);
      formData.append('message', document.getElementById('message').value);
      
      const submitButton = contactForm.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.textContent;
      submitButton.textContent = 'Sending...';
      submitButton.disabled = true;
      
      try {
        const response = await fetch('https://formspree.io/f/xgvkbknj', {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          const formStatus = document.getElementById('formStatus');
          if (formStatus) {
            formStatus.classList.remove('hidden');
            contactForm.style.display = 'none';
          } else {
            alert('Thank you! Your message has been sent successfully.');
          }
          contactForm.reset();
        } else {
          alert('Error: Something went wrong. Please try again.');
        }
      } catch (error) {
        alert('An error occurred while submitting the form. Please try again.');
      } finally {
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
      }
    });
  }
});
