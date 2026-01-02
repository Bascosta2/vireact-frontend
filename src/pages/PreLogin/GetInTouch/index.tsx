import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import PreLoginPage from "@/components/Layout/PreLoginPage";    
import SectionHeader from "@/components/SectionHeader";
import TextField from "@/components/FormikFields/TextField";
import TextArea from "@/components/FormikFields/TextArea";
import Dropdown from "@/components/FormikFields/Dropdown";
import { IoSparkles, IoMail, IoCall, IoLocation, IoTime, IoGlobe } from "react-icons/io5";
import { FaFacebook, FaXTwitter, FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa6";
import { SuccessNotification, ErrorNotification } from "@/utils/toast";
import { EMAIL_REGEX, PHONE_NUMBER_REGEX } from "@/constants";

// Contact form validation schema
const ContactFormSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .matches(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces')
    .required('First name is required'),
  lastName: Yup.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .matches(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces')
    .required('Last name is required'),
  email: Yup.string()
    .matches(EMAIL_REGEX, 'Please enter a valid email address')
    .required('Email is required'),
  phone: Yup.string()
    .matches(PHONE_NUMBER_REGEX, 'Please enter a valid 10-digit phone number')
    .required('Phone number is required'),
  company: Yup.string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must be less than 100 characters')
    .required('Company name is required'),
  subject: Yup.string()
    .min(5, 'Subject must be at least 5 characters')
    .max(100, 'Subject must be less than 100 characters')
    .required('Subject is required'),
  message: Yup.string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters')
    .required('Message is required'),
  inquiryType: Yup.string()
    .required('Please select an inquiry type'),
});

// Contact form initial values
const initialValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  company: '',
  subject: '',
  message: '',
  inquiryType: '',
};

// Inquiry type options
const inquiryTypeOptions = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'support', label: 'Technical Support' },
  { value: 'sales', label: 'Sales & Pricing' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'feedback', label: 'Feedback & Suggestions' },
  { value: 'other', label: 'Other' },
];

// Contact information data
const contactInfo = [
  {
    icon: IoMail,
    title: 'Email Us',
    details: ['hello@vireact.com', 'support@vireact.com'],
    description: 'We\'ll respond within 24 hours'
  },
  {
    icon: IoCall,
    title: 'Call Us',
    details: ['+1 (555) 123-4567', '+1 (555) 987-6543'],
    description: 'Mon-Fri 9AM-6PM EST'
  },
  {
    icon: IoLocation,
    title: 'Visit Us',
    details: ['123 Innovation Drive', 'Tech Valley, CA 94000'],
    description: 'Schedule a meeting with us'
  },
  {
    icon: IoTime,
    title: 'Business Hours',
    details: ['Monday - Friday: 9AM-6PM', 'Saturday: 10AM-4PM'],
    description: 'Sunday: Closed'
  }
];

// Social media links
const socialLinks = [
  { icon: FaFacebook, href: '#', label: 'Facebook' },
  { icon: FaXTwitter, href: '#', label: 'Twitter' },
  { icon: FaInstagram, href: '#', label: 'Instagram' },
  { icon: FaLinkedin, href: '#', label: 'LinkedIn' },
  { icon: FaYoutube, href: '#', label: 'YouTube' },
];

function GetInTouch() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: typeof initialValues, { resetForm }: any) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would typically make an API call:
      // const response = await Axios.post('/contact', values);
      
      SuccessNotification('Thank you! Your message has been sent successfully. We\'ll get back to you soon.');
      resetForm();
    } catch (error) {
      ErrorNotification('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PreLoginPage>
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header Section */}
        <SectionHeader
          badge="Get In Touch"
          title="Talk to us - We are listening!"
          icon={<IoSparkles className="w-4 h-4 text-gray-400" />}
          className="pt-12"
        />

        <div className="grid lg:grid-cols-3 gap-12 mb-16">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="glassmorphism rounded-2xl p-8 border border-gradient-primary">
              <h3 className="text-2xl font-bold text-white mb-8">Get in Touch</h3>
              
              <div className="space-y-8">   
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                      <info.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-white mb-2">{info.title}</h4>
                      <div className="space-y-1">
                        {info.details.map((detail, detailIndex) => (
                          <p key={detailIndex} className="text-gray-300 text-sm">{detail}</p>
                        ))}
                      </div>
                      <p className="text-gray-400 text-xs mt-2">{info.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Media Links */}
              <div className="mt-12 pt-8 border-t border-gray-700">
                <h4 className="text-lg font-semibold text-white mb-4">Follow Us</h4>
                <div className="flex gap-4">
                  {socialLinks.map((social, index) => (
                    <a
                      target='_blank'
                      key={index}
                      href={social.href}
                      className="w-10 h-10 bg-gray-700 border-gradient-primary rounded-lg flex items-center justify-center transition-all duration-300 group"
                      aria-label={social.label}
                    >
                      <social.icon className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors duration-300" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="glassmorphism rounded-2xl p-8 border border-gradient-primary">
              <h3 className="text-2xl font-bold text-white mb-8">Send us a Message</h3>
              
              <Formik
                initialValues={initialValues}
                validationSchema={ContactFormSchema}
                onSubmit={handleSubmit}
              >
                {({ isValid, dirty }) => (
                  <Form className="space-y-6">
                    {/* Name Fields */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <TextField
                        field="firstName"
                        label_text="First Name"
                        placeholder="Enter your first name"
                        required
                        autoComplete="given-name"
                      />
                      <TextField
                        field="lastName"
                        label_text="Last Name"
                        placeholder="Enter your last name"
                        required
                        autoComplete="family-name"
                      />
                    </div>

                    {/* Contact Fields */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <TextField
                        field="email"
                        label_text="Email Address"
                        type="email"
                        placeholder="Enter your email address"
                        required
                        autoComplete="email"
                      />
                      <TextField
                        field="phone"
                        label_text="Phone Number"
                        type="tel"
                        placeholder="Enter your phone number"
                        required
                        autoComplete="tel"
                      />
                    </div>

                    {/* Company and Subject */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <TextField
                        field="company"
                        label_text="Company Name"
                        placeholder="Enter your company name"
                        required
                        autoComplete="organization"
                      />
                      <Dropdown
                        field="inquiryType"
                        label_text="Inquiry Type"
                        placeholder="Select inquiry type"
                        options={inquiryTypeOptions}
                        required
                      />
                    </div>

                    {/* Subject */}
                    <TextField
                      field="subject"
                      label_text="Subject"
                      placeholder="Enter message subject"
                      required
                      autoComplete="off"
                    />

                    {/* Message */}
                    <TextArea
                      field="message"
                      label_text="Message"
                      placeholder="Tell us about your inquiry..."
                      required
                      rows={6}
                      maxLength={1000}
                      helpText="Maximum 1000 characters"
                    />

                    {/* Submit Button */}
                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={!isValid || !dirty || isSubmitting}
                        className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Sending Message...
                          </div>
                        ) : (
                          'Send Message'
                        )}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </div>
    </PreLoginPage>
  );
}

export default GetInTouch;
