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
        // Submit to your API endpoint
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
          // Show success message
          const formStatus = document.getElementById('formStatus');
          if (formStatus) {
            formStatus.classList.remove('hidden');
            contact
