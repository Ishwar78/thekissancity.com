const express = require('express');
const router = express.Router();
const ContactInfo = require('../models/ContactInfo');

// GET Contact Info
router.get('/', async (req, res) => {
  try {
    let contactInfo = await ContactInfo.findOne();
    if (!contactInfo) {
      contactInfo = await ContactInfo.create({});
    }
    res.json({ success: true, contactInfo });
  } catch (error) {
    console.error('Error fetching contact info:', error);
    res.status(500).json({ success: false, message: 'Server error fetching contact info' });
  }
});

// PUT Update Contact Info (Admin)
router.put('/', async (req, res) => {
  try {
    const {
      phone,
      phoneSubtext,
      email,
      emailSubtext,
      supportHours,
      supportHoursSubtext,
      serviceLocation,
      serviceLocationSubtext,
      whatsappNumber,
      companyName,
      companyAddressLine1,
      companyAddressLine2,
      companyGstin,
      companyInvoiceEmail,
      companyInvoicePhone,
      companyInvoiceFooterNote
    } = req.body;

    let contactInfo = await ContactInfo.findOne();
    if (!contactInfo) {
      contactInfo = new ContactInfo({});
    }

    if (phone !== undefined) contactInfo.phone = phone;
    if (phoneSubtext !== undefined) contactInfo.phoneSubtext = phoneSubtext;
    if (email !== undefined) contactInfo.email = email;
    if (emailSubtext !== undefined) contactInfo.emailSubtext = emailSubtext;
    if (supportHours !== undefined) contactInfo.supportHours = supportHours;
    if (supportHoursSubtext !== undefined) contactInfo.supportHoursSubtext = supportHoursSubtext;
    if (serviceLocation !== undefined) contactInfo.serviceLocation = serviceLocation;
    if (serviceLocationSubtext !== undefined) contactInfo.serviceLocationSubtext = serviceLocationSubtext;
    if (whatsappNumber !== undefined) contactInfo.whatsappNumber = whatsappNumber;
    if (companyName !== undefined) contactInfo.companyName = companyName;
    if (companyAddressLine1 !== undefined) contactInfo.companyAddressLine1 = companyAddressLine1;
    if (companyAddressLine2 !== undefined) contactInfo.companyAddressLine2 = companyAddressLine2;
    if (companyGstin !== undefined) contactInfo.companyGstin = companyGstin;
    if (companyInvoiceEmail !== undefined) contactInfo.companyInvoiceEmail = companyInvoiceEmail;
    if (companyInvoicePhone !== undefined) contactInfo.companyInvoicePhone = companyInvoicePhone;
    if (companyInvoiceFooterNote !== undefined) contactInfo.companyInvoiceFooterNote = companyInvoiceFooterNote;

    await contactInfo.save();

    console.log('[CONTACT INFO UPDATED]', contactInfo);

    res.json({ success: true, message: 'Contact information updated successfully', contactInfo });
  } catch (error) {
    console.error('Error updating contact info:', error);
    res.status(500).json({ success: false, message: 'Server error updating contact info' });
  }
});

module.exports = router;
