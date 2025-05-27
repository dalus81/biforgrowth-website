// api/contacts.js
const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const contactData = req.body;

    // Validation
    if (!contactData.name || !contactData.email || !contactData.service || !contactData.message) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const formData = {
      name: contactData.name,
      email: contactData.email,
      company: contactData.company || 'Not provided',
      service: contactData.service,
      message: contactData.message
    };

    const response = await axios.post('https://formspree.io/f/xgvkbknj', formData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (response.status >= 200 && response.status < 300) {
      return res.status(201).json({ message: "Form submitted successfully" });
    } else {
      return res.status(500).json({ message: "Formspree rejected the submission" });
    }

  } catch (error) {
    console.error("Form error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};
