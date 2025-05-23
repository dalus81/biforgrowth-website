// api/contact.js - Vercel Serverless Function

module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get the form data from request body
    const contactData = req.body;
    
    // Basic validation
    if (!contactData.name || !contactData.email || !contactData.service || !contactData.message) {
      return res.status(400).json({
        message: 'Missing required fields',
      });
    }

    // Log the contact submission (will appear in Vercel logs)
    console.log('New contact form submission:', {
      name: contactData.name,
      email: contactData.email,
      company: contactData.company,
      service: contactData.service
    });
    
    // Format the data for FormSpree
    const formData = {
      name: contactData.name,
      email: contactData.email,
      company: contactData.company || 'Not provided',
      service: contactData.service,
      message: contactData.message
    };
    
    // Send the request to FormSpree using native fetch
    const response = await fetch('https://formspree.io/f/xgvkbknj', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    const responseData = await response.json();
    
    if (response.ok) {
      console.log("Email sent successfully via FormSpree to info@biforgrowth.com");
      
      return res.status(201).json({
        message: "Contact form submitted successfully"
      });
    } else {
      console.error("FormSpree error:", responseData);
      return res.status(500).json({
        message: "Error sending email"
      });
    }
  } catch (error) {
    console.error("Error handling contact form submission:", error);
    
    return res.status(500).json({
      message: "An error occurred while processing your request"
    });
  }
};
