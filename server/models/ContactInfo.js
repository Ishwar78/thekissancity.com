const mongoose = require('mongoose');

const contactInfoSchema = new mongoose.Schema({
  phone: {
    type: String,
    default: '+91 8295780500'
  },
  phoneSubtext: {
    type: String,
    default: 'Monday to Saturday'
  },
  email: {
    type: String,
    default: 'connect@thekissancity.com'
  },
  emailSubtext: {
    type: String,
    default: 'Reply within 24 working hours'
  },
  supportHours: {
    type: String,
    default: '9:00 AM – 7:00 PM'
  },
  supportHoursSubtext: {
    type: String,
    default: 'Monday to Saturday'
  },
  serviceLocation: {
    type: String,
    default: 'Across India'
  },
  serviceLocationSubtext: {
    type: String,
    default: 'Delivering happiness nationwide'
  },
  whatsappNumber: {
    type: String,
    default: '918295780500'
  },
  companyName: {
    type: String,
    default: 'The Kissan City'
  },
  companyAddressLine1: {
    type: String,
    default: 'Rohtak Road, Near Bus Stand'
  },
  companyAddressLine2: {
    type: String,
    default: 'Rohtak, Haryana - 124001'
  },
  companyGstin: {
    type: String,
    default: '06AAAAA0000A1Z5'
  },
  companyInvoiceEmail: {
    type: String,
    default: 'connect@thekissancity.com'
  },
  companyInvoicePhone: {
    type: String,
    default: '+91 8295780500'
  },
  companyInvoiceFooterNote: {
    type: String,
    default: 'Fresh products. Honest sourcing. Trusted delivery.'
  }
}, { timestamps: true });

module.exports = mongoose.model('ContactInfo', contactInfoSchema);
