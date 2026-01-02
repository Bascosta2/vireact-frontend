import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import TextField from '@/components/FormikFields/TextField';
import TextArea from '@/components/FormikFields/TextArea';
import { SuccessNotification, ErrorNotification } from '@/utils/toast';
import { EMAIL_REGEX } from '@/constants';
import { FaEnvelope, FaGem, FaLightbulb, FaUser } from 'react-icons/fa';
import ButtonLoader from '@/components/UI/ButtonLoader';
import Axios from '@/api';

// Early Access form validation schema
const EarlyAccessSchema = Yup.object().shape({
  fullName: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .matches(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
    .required('Name is required'),
  email: Yup.string()
    .matches(EMAIL_REGEX, 'Please enter a valid email address')
    .required('Email is required'),
  phone: Yup.string()
    .matches(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number')
    .optional(),
  goal: Yup.string()
    .min(5, 'Please provide at least 5 characters')
    .max(500, 'Goal description must be less than 500 characters')
    .required('Please tell us about your content creation/AI goals'),
});

// Initial values
const initialValues = {
  fullName: '',
  email: '',
  phone: '',
  goal: '',
};

interface FormProps {
  onSuccess: () => void;
}

function EarlyAccessForm({ onSuccess }: FormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: typeof initialValues, { resetForm }: any) => {
    setIsSubmitting(true);

    try {
      // Map form values to API expected format
      const apiData = {
        name: values.fullName,
        email: values.email,
        phone: values.phone || undefined, // Only include if provided
        contentGoalNote: values.goal
      };

      // Make API call to early access endpoint
      const response = await Axios.post('/early-access/create', apiData);

      if (response.data.success) {
        SuccessNotification('Welcome to the future! You\'re now on our exclusive early access list.');
        onSuccess();
        resetForm();
      } else {
        throw new Error(response.data.message || 'Failed to join early access');
      }
    } catch (error: any) {
      console.error('Early access submission error:', error);
      
      // Handle different error types
      if (error.response?.data?.message) {
        ErrorNotification(error.response.data.message);
      } else if (error.response?.status === 409) {
        ErrorNotification('You\'re already on our early access list!');
      } else if (error.response?.status === 400) {
        ErrorNotification('Please check your information and try again.');
      } else {
        ErrorNotification('Failed to join early access. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">

      {/* Form Card */}
      <div className="relative bg-black/80 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
        <div className="text-center mb-8">
          <h1>
            Get Early Access
          </h1>
          <p className="text-gray-300 sm:max-w-lg mx-auto">
            Be the first to experience the future of intelligent content creation.
          </p>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={EarlyAccessSchema}
          onSubmit={handleSubmit}
        >
          {({ isValid, dirty }) => (
            <Form className="space-y-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <TextField
                Icon={FaUser}
                field="fullName"
                label_text="Full Name"
                placeholder="eg. John Doe"
                required
                autoComplete="name"
              />

              {/* Email */}
              <TextField
                Icon={FaEnvelope}
                field="email"
                label_text="Email Address"
                type="email"
                placeholder="eg. username@domain.com"
                required
                autoComplete="email"
              />

              {/* Phone with Perk */}
                <TextField
                  Icon={FaGem}
                  field="phone"
                  label_text="Phone Number (Optional)"
                  type="tel"
                  placeholder="eg. +1 6175551234"
                  autoComplete="tel"
                  helpText="Phone = access to our private growth community"
                />


              {/* Goal Question */}
   
                <TextArea
                  Icon={FaLightbulb}
                  field="goal"
                  label_text="What is Your Goal with Content Creation/AI?"
                  placeholder="Tell us about your content creation goals"
                  required
                  rows={1}
                  maxLength={500}
                  helpText="Help us personalize your experience (10-500 characters)"
                />
  

              {/* Submit Button */}
              <div className="flex flex-col items-center gap-4 md:col-span-2">
                <button
                  type="submit"
                  disabled={!isValid || !dirty || isSubmitting}
                  className="btn-primary"
                >
                  {isSubmitting ?
                    <ButtonLoader text="Joining Early Access" />
                    : 'Join Early Access'}
                </button>
                {/* Privacy Note */}
                <p className="text-center text-light-gray text-sm max-w-md mx-auto">
                  We respect your privacy. No spam, just exclusive updates.
                </p>
              </div>

            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default EarlyAccessForm;
