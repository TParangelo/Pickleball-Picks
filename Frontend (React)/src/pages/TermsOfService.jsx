import React from 'react';
import '../css/Legal.css';

const TermsOfService = () => {
  return (
    <div className="legal-container">
      <div className="legal-content">
        <h1>Terms of Service</h1>
        <p className="last-updated">Last Updated: March 2025</p>

        <section className="legal-section">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using Pickleball-Picks ("the Platform"), you agree to be bound by these Terms of Service. 
            If you do not agree to these terms, please do not use the Platform.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Eligibility</h2>
          <p>
            You must be at least 18 years old to use PicklePicks. By using the Platform, you represent and warrant that you meet this requirement.
            Users must also comply with all applicable laws and regulations in their jurisdiction regarding online gaming and predictions.
          </p>
        </section>

        <section className="legal-section">
          <h2>3. Account Registration</h2>
          <p>
            To access certain features, you must create an account. You agree to:
          </p>
          <ul>
            <li>Provide accurate and complete information</li>
            <li>Maintain the security of your account credentials</li>
            <li>Promptly update any changes to your information</li>
            <li>Accept responsibility for all activities under your account</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>4. Platform Rules</h2>
          <p>
            When using PicklePicks, you agree not to:
          </p>
          <ul>
            <li>Violate any applicable laws or regulations</li>
            <li>Manipulate or interfere with the Platform's operations</li>
            <li>Use the service for any fraudulent or unauthorized purpose</li>
            <li>Share account access with third parties</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>5. Virtual Currency and Predictions</h2>
          <p>
            Pickleball-Picks operates using virtual currency for entertainment purposes only. No real money is involved in any transactions.
            Predictions and their outcomes are for entertainment purposes and do not constitute gambling or betting services.
          </p>
        </section>

        <section className="legal-section">
          <h2>6. Intellectual Property</h2>
          <p>
            All content on PicklePicks, including but not limited to text, graphics, logos, and software, is the property of PicklePicks 
            and is protected by intellectual property laws. Users may not copy, modify, or distribute this content without explicit permission.
          </p>
        </section>

        <section className="legal-section">
          <h2>7. Termination</h2>
          <p>
            We reserve the right to suspend or terminate your account at our discretion, particularly if you violate these terms. 
            Upon termination, your right to use the Platform will immediately cease.
          </p>
        </section>

        <section className="legal-section">
          <h2>8. Disclaimer of Warranties</h2>
          <p>
            The Platform is provided "as is" without any warranties, express or implied. We do not guarantee that the service 
            will be uninterrupted, or error-free.
          </p>
        </section>

        <section className="legal-section">
          <h2>9. Contact Information</h2>
          <p>
            For questions about these Terms of Service, please contact us at:
            <br />
            Email: <a className="email-link" href="mailto:support@pickleball-picks.com">support@pickleball-picks.com</a>
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService; 