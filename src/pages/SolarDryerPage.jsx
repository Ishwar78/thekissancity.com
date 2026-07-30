import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Check, Shield, Zap, Thermometer, CloudLightning } from 'lucide-react';

export default function SolarDryerPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    city: '',
    state: '',
    agricultureType: '',
    companyName: '',
    dryerSize: '',
    purpose: '',
    remarks: '',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const baseUrl = (import.meta.env.VITE_API_URL || 'https://thekissancity.com').replace(/\/$/, '');
      const res = await fetch(`${baseUrl}/api/solar-inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        alert('Thank you! Your Solar Dryer Inquiry has been submitted successfully. Our team will contact you soon.');
        setFormData({
          name: '', email: '', mobile: '', city: '', state: '',
          agricultureType: '', companyName: '', dryerSize: '', purpose: '', remarks: ''
        });
      } else {
        alert(data.message || 'Failed to submit inquiry. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting solar inquiry:', err);
      alert('Error submitting inquiry. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="solar-dryer-page">
      <Navbar />
      
      <main className="solar-main">
        {/* Hero Section */}
        <section className="solar-hero">
          <div className="container">
            <div className="solar-hero__grid">
              <div className="solar-hero__content">
                <div className="solar-hero__badge">
                  <span>🔅</span> SUSTAINABLE TECHNOLOGY
                </div>
                <h1 className="solar-hero__title">
                  Harness the Power<br/>of <span>Solar Drying</span>
                </h1>
                <p className="solar-hero__text">
                  Revolutionizing food preservation with eco-friendly solar technology. Get in touch to learn how our drying solutions can help your farm or business.
                </p>
              </div>
              <div className="solar-hero__image-wrap">
                <img src="/formsolar.png" alt="Solar Food Dryer Setup" className="solar-hero__image" />
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="solar-content">
          <div className="container">
            <div className="solar-content__grid">
              
              {/* Left side: Features & Benefits */}
              <div className="solar-features">
                <div className="solar-features__cards">
                  <div className="solar-feature-card">
                    <div className="solar-feature-card__icon"><Shield size={20} /></div>
                    <h3 className="solar-feature-card__title">Food Hygiene</h3>
                    <p className="solar-feature-card__text">Protects against dust, insects, and unpredictable weather.</p>
                  </div>
                  <div className="solar-feature-card">
                    <div className="solar-feature-card__icon"><Zap size={20} /></div>
                    <h3 className="solar-feature-card__title">Zero Fuel Cost</h3>
                    <p className="solar-feature-card__text">Runs entirely on free solar energy, saving money.</p>
                  </div>
                  <div className="solar-feature-card">
                    <div className="solar-feature-card__icon"><Thermometer size={20} /></div>
                    <h3 className="solar-feature-card__title">Maintains Nutrients</h3>
                    <p className="solar-feature-card__text">Carefully controlled temp preserves natural goodness.</p>
                  </div>
                  <div className="solar-feature-card">
                    <div className="solar-feature-card__icon"><CloudLightning size={20} /></div>
                    <h3 className="solar-feature-card__title">Weather Resistant</h3>
                    <p className="solar-feature-card__text">Drying continues rain or shine with hybrid models.</p>
                  </div>
                </div>

                <div className="solar-benefits">
                  <h3 className="solar-benefits__title">Why Choose Solar?</h3>
                  <p className="solar-benefits__desc">
                    Solar drying is the most eco-friendly and cost-effective way to preserve food. It extends shelf life without compromising on nutritional value, taste, or aroma.
                  </p>
                  <ul className="solar-benefits__list">
                    <li><Check size={16} className="text-green" /> Reduces post-harvest loss significantly</li>
                    <li><Check size={16} className="text-green" /> Increase shelf-life up to 12 months</li>
                    <li><Check size={16} className="text-green" /> Better quality, color and flavor retention</li>
                    <li><Check size={16} className="text-green" /> Zero electricity bills on sunny days</li>
                    <li><Check size={16} className="text-green" /> Eco-friendly, zero carbon footprint</li>
                    <li><Check size={16} className="text-green" /> Easy to operate and maintain</li>
                  </ul>
                  <p className="solar-benefits__desc mt-4">
                    Join the green revolution and elevate your farming or business with our state-of-the-art solar drying solutions.
                  </p>
                </div>
              </div>

              {/* Right side: Form */}
              <div className="solar-form-wrapper">
                <div className="solar-form-card">
                  <h2 className="solar-form__title">Inquiry Form</h2>
                  <p className="solar-form__subtitle">Fill out the form below to receive a custom quote for your requirements.</p>

                  <form className="solar-form" onSubmit={handleSubmit}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Enter your name" />
                      </div>
                      <div className="form-group">
                        <label>Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Enter your email" />
                      </div>
                    </div>

                    <div className="form-row form-row--three">
                      <div className="form-group">
                        <label>Mobile No.</label>
                        <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} required placeholder="e.g. 9876543210" />
                      </div>
                      <div className="form-group">
                        <label>City</label>
                        <input type="text" name="city" value={formData.city} onChange={handleChange} required placeholder="Your city" />
                      </div>
                      <div className="form-group">
                        <label>State</label>
                        <input type="text" name="state" value={formData.state} onChange={handleChange} required placeholder="Your state" />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Agriculture Type</label>
                        <input type="text" name="agricultureType" value={formData.agricultureType} onChange={handleChange} placeholder="e.g. Farmer, FPO, Processor" />
                      </div>
                      <div className="form-group">
                        <label>Company Name (Optional)</label>
                        <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Your business name" />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Type of Solar Dryer Size</label>
                      <select name="dryerSize" value={formData.dryerSize} onChange={handleChange} required>
                        <option value="">Select Size / Capacity</option>
                        <option value="10kg - 50kg (Small)">10kg - 50kg (Small)</option>
                        <option value="50kg - 100kg (Medium)">50kg - 100kg (Medium)</option>
                        <option value="100kg - 500kg (Large)">100kg - 500kg (Large)</option>
                        <option value="500kg+ (Industrial)">500kg+ (Industrial)</option>
                        <option value="Not Sure / Need Consultation">Not Sure / Need Consultation</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Purpose of Use</label>
                      <textarea name="purpose" value={formData.purpose} onChange={handleChange} required placeholder="What do you want to dry? (e.g. Fruits, Vegetables, Spices, Herbs)" rows="3"></textarea>
                    </div>

                    <div className="form-group">
                      <label>Remarks</label>
                      <textarea name="remarks" value={formData.remarks} onChange={handleChange} placeholder="Any additional requirements or questions..." rows="2"></textarea>
                    </div>

                    <button type="submit" className="solar-form__submit">Submit Inquiry</button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
