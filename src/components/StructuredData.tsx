import React from 'react';

interface OrganizationSchemaProps {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  telephone?: string;
  address?: {
    streetAddress: string;
    addressLocality: string;
    addressCountry: string;
    postalCode: string;
  };
  sameAs?: string[];
}

export const OrganizationSchema: React.FC<OrganizationSchemaProps> = ({
  name,
  url,
  logo = '/lovable-uploads/7ad599e6-d1cd-4a1b-84f4-9b6b1e4242e1.png',
  description = 'ICE SOS Lite provides advanced emergency protection services with AI-powered assistance and 24/7 monitoring.',
  telephone = '+44 123 456 789',
  address = {
    streetAddress: '123 Emergency Lane',
    addressLocality: 'London',
    addressCountry: 'GB',
    postalCode: 'SW1A 1AA'
  },
  sameAs = [
    'https://facebook.com/icesoslite',
    'https://twitter.com/icesoslite',
    'https://linkedin.com/company/icesoslite'
  ]
}) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": name,
    "url": url,
    "logo": logo,
    "description": description,
    "telephone": telephone,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": address.streetAddress,
      "addressLocality": address.addressLocality,
      "addressCountry": address.addressCountry,
      "postalCode": address.postalCode
    },
    "sameAs": sameAs,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": telephone,
      "contactType": "customer service",
      "availableLanguage": ["English", "Spanish", "Dutch"]
    }
  };

  return (
    <script 
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};

interface ServiceSchemaProps {
  name: string;
  description: string;
  provider: string;
  serviceType: string;
  areaServed?: string;
  availableChannel?: string[];
}

export const ServiceSchema: React.FC<ServiceSchemaProps> = ({
  name,
  description,
  provider,
  serviceType,
  areaServed = 'Worldwide',
  availableChannel = ['https://icesoslite.com', 'Mobile Application', 'Emergency Hotline']
}) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": name,
    "description": description,
    "provider": {
      "@type": "Organization",
      "name": provider
    },
    "serviceType": serviceType,
    "areaServed": areaServed,
    "availableChannel": availableChannel,
    "category": "Emergency Response Service"
  };

  return (
    <script 
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};

interface AppSchemaProps {
  name: string;
  description: string;
  operatingSystem: string[];
  applicationCategory: string;
  downloadUrl?: {
    ios?: string;
    android?: string;
  };
}

export const SoftwareApplicationSchema: React.FC<AppSchemaProps> = ({
  name,
  description,
  operatingSystem,
  applicationCategory,
  downloadUrl = {
    ios: 'https://apps.apple.com/app/ice-sos-lite/id123456789',
    android: 'https://play.google.com/store/apps/details?id=com.icesos.lite'
  }
}) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": name,
    "description": description,
    "operatingSystem": operatingSystem,
    "applicationCategory": applicationCategory,
    "downloadUrl": [downloadUrl.ios, downloadUrl.android].filter(Boolean),
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "2847"
    }
  };

  return (
    <script 
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};

export default {
  OrganizationSchema,
  ServiceSchema,
  SoftwareApplicationSchema
};