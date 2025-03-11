import React, { useState, useEffect } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import "../css/About.css";

const FAQ = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="faq-item">
      <button className={`faq-question ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        {question}
        {isOpen ? <FaChevronUp /> : <FaChevronDown />}
      </button>
      <div className={`faq-answer ${isOpen ? 'active' : ''}`}>
        {answer}
      </div>
    </div>
  );
};

const About = () => {
  const faqs = [
    {
      question: "Is Pickleball-Picks free to use?",
      answer: "Yes! Pickleball-Picks is completely free to use. You start with 10,000 dinks (virtual currency) to make predictions and engage with the platform without any real money involved. More Dinks will be added to your account at the start of each tournament."
    },
    {
      question: "How do I get started?",
      answer: "Simply create an account, and you'll receive starting credits to begin making picks. Browse upcoming matches, analyze the odds, and start making your predictions!"
    },
    {
      question: "How are odds calculated?",
      answer: "Our odds are calculated using a machine learning model that takes into account a combination of team rankings, historical performance, and current form. The odds are displayed in American format (+150, -200, etc.)."
    },
    {
      question: "Can I change my picks after submitting?",
      answer: "No, once picks are submitted, they cannot be modified. This ensures fair play for all users. Make sure to review your picks carefully before submitting!"
    }
  ];

  useEffect(() => {
    
    // Optional: Cleanup function to remove the CSS when component unmounts
    return () => {
      const link = document.querySelector('link[href="/src/css/About.css"]');
      if (link) {
        document.head.removeChild(link);
      }
    };
  }, []);

  return (
    <div className="about-container">
      <div className="about-content">
        <h1>About Pickleball-Picks</h1>
        
        <section className="about-section">
          <h2>Our Platform</h2>
          <p>
            Welcome to PickleballPicks, your premier destination for pickleball match predictions.
            We provide a unique platform where pickleball enthusiasts can engage with the sport in an
            exciting way. Risk Dinks, a virtual currency, to have a stake in the game without real money.
            Pickleball-Picks is not affiliated with the PPA/MLP/APP tours.
          </p>
        </section>

        <section className="about-section">
          <h2>How It Works</h2>
          <ul>
            <li>Browse upcoming pickleball matches</li>
            <li>View detailed odds and match statistics</li>
            <li>Place single predictions or create parlays</li>
            <li>Track your picks and stats</li>
            <li>Connect with other pickleball fans</li>
          </ul>
        </section>

        <section className="about-section">
          <h2>Our Mission</h2>
          <p>
            We aim to enhance the pickleball experience by providing a secure and engaging
            platform for match predictions. Our goal is to grow the sport's community while
            maintaining the highest standards of fair play and responsible gaming. Please
            note that this platform runs best during progressive draw pickleball tournaments.
          </p>
        </section>

        <section className="about-section">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-container">
            {faqs.map((faq, index) => (
              <FAQ key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </section>

        <section className="about-section">
          <h2>Contact Us</h2>
          <p>
            Have questions or suggestions? We'd love to hear from you!<br />
            Email: <a className="email-link" href="mailto:support@pickleball-picks.com">support@pickleball-picks.com</a><br />
            Follow us on social media for updates and announcements.
          </p>
        </section>
      </div>
    </div>
  );
};

export default About; 