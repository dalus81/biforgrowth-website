// Simple contact form handler for Vercel
const https = require('https');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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

    // Log the contact submission
    console.log('New contact form submission:', {
      name: contactData.name,
      email: contactData.email,
      company: contactData.company,
      service: contactData.service
    });
    
    // Format the data for FormSpree
    const formData = JSON.stringify({
      name: contactData.name,
      email: contactData.email,
      company: contactData.company || 'Not provided',
      service: contactData.service,
      message: contactData.message
    });
    
    // Send the request to FormSpree using native https module
    const postData = formData;
    
    const options = {
      hostname: 'formspree.io',
      port: 443,
      path: '/f/xgvkbknj',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    return new Promise((resolve, reject) => {
      const request = https.request(options, (response) => {
        let data = '';

        response.on('data', (chunk) => {
          data += chunk;
        });

        response.on('end', () => {
          if (response.statusCode >= 200 && response.statusCode < 300) {
            console.log("Email sent successfully via FormSpree to info@biforgrowth.com");
            res.status(201).json({
              message: "Contact form submitted successfully"
            });
            resolve();
          } else {
            console.error("FormSpree error:", data);
            res.status(500).json({
              message: "Error sending email"
            });
            resolve();
          }
        });
      });

      request.on('error', (error) => {
        console.error("Error sending to FormSpree:", error);
        res.status(500).json({
          message: "An error occurred while processing your request"
        });
        resolve();
      });

      request.write(postData);
      request.end();
    });

  } catch (error) {
    console.error("Error handling contact form submission:", error);
    
    return res.status(500).json({
      message: "An error occurred while processing your request"
    });
  }
};