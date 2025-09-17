import React from 'react';

interface StructuredDataProps {
  type: 'Organization' | 'Product' | 'Service' | 'LocalBusiness' | 'FAQPage' | 'Article' | 'WebPage';
  data?: any;
  className?: string;
}

const generateOrganizationData = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  'name': 'ICE SOS Lite',
  'description': 'Professional emergency response and family safety monitoring services with AI-powered protection',
  'url': 'https://icesoslite.com',
  'logo': 'https://icesoslite.com/logo.png',
  'foundingDate': '2024',
  'contactPoint': {
    '@type': 'ContactPoint',
    'telephone': '+34-900-000-000',
    'contactType': 'Customer Service',
    'availableLanguage': ['English', 'Spanish'],
    'areaServed': ['ES', 'GB', 'NL']
  },
  'address': {
    '@type': 'PostalAddress',
    'addressCountry': 'ES',
    'addressRegion': 'Madrid'
  },
  'sameAs': [
    'https://twitter.com/icesoslite',
    'https://facebook.com/icesoslite',
    'https://linkedin.com/company/icesoslite'
  ],
  'serviceArea': {
    '@type': 'GeoCircle',
    'geoMidpoint': {
      '@type': 'GeoCoordinates',
      'latitude': 40.4168,
      'longitude': -3.7038
    },
    'geoRadius': '1000000'
  }
});

const generateServiceData = (serviceType: string) => {
  const baseService = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    'provider': {
      '@type': 'Organization',
      'name': 'ICE SOS Lite'
    },
    'areaServed': ['ES', 'GB', 'NL'],
    'hasOfferCatalog': {
      '@type': 'OfferCatalog',
      'name': 'Emergency Protection Services',
      'itemListElement': [
        {
          '@type': 'Offer',
          'itemOffered': {
            '@type': 'Service',
            'name': '24/7 Emergency Monitoring'
          }
        }
      ]
    }
  };

  switch (serviceType) {
    case 'emergency-response':
      return {
        ...baseService,
        'name': 'Emergency Response Services',
        'description': '24/7 professional emergency response and monitoring services with AI-powered detection',
        'serviceType': 'Emergency Response',
        'category': 'Emergency Services'
      };
    case 'ai-assistant':
      return {
        ...baseService,
        'name': 'AI Emergency Assistant',
        'description': 'Intelligent emergency detection and response using advanced AI technology',
        'serviceType': 'AI Emergency Detection',
        'category': 'Technology Services'
      };
    case 'family-monitoring':
      return {
        ...baseService,
        'name': 'Family Safety Monitoring',
        'description': 'Comprehensive family safety monitoring with real-time location tracking',
        'serviceType': 'Family Monitoring',
        'category': 'Safety Services'
      };
    case 'senior-protection':
      return {
        ...baseService,
        'name': 'Senior Emergency Protection',
        'description': 'Specialized emergency protection for seniors with medical alert integration',
        'serviceType': 'Senior Care',
        'category': 'Healthcare Services'
      };
    default:
      return baseService;
  }
};

const generateProductData = (productType: string) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  'name': 'ICE SOS Lite Emergency Protection',
  'description': 'Complete emergency protection system with AI monitoring and professional response',
  'brand': {
    '@type': 'Brand',
    'name': 'ICE SOS Lite'
  },
  'manufacturer': {
    '@type': 'Organization',
    'name': 'ICE SOS Lite'
  },
  'category': 'Emergency Safety Equipment',
  'offers': {
    '@type': 'Offer',
    'priceCurrency': 'EUR',
    'price': '29.99',
    'priceValidUntil': '2025-12-31',
    'availability': 'https://schema.org/InStock',
    'seller': {
      '@type': 'Organization',
      'name': 'ICE SOS Lite'
    }
  },
  'aggregateRating': {
    '@type': 'AggregateRating',
    'ratingValue': '4.8',
    'reviewCount': '1247',
    'bestRating': '5',
    'worstRating': '1'
  }
});

const StructuredData: React.FC<StructuredDataProps> = ({ 
  type, 
  data = {}, 
  className = '' 
}) => {
  let structuredData;

  switch (type) {
    case 'Organization':
      structuredData = generateOrganizationData();
      break;
    case 'Service':
      structuredData = generateServiceData(data?.serviceType || 'general');
      break;
    case 'Product':
      structuredData = generateProductData(data?.productType || 'general');
      break;
    case 'LocalBusiness':
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        ...generateOrganizationData(),
        'priceRange': '€€',
        'openingHours': 'Mo,Tu,We,Th,Fr,Sa,Su 00:00-23:59'
      };
      break;
    default:
      structuredData = data;
  }

  // Merge any custom data
  if (data && typeof data === 'object') {
    structuredData = { ...structuredData, ...data };
  }

  return (
    <script 
      type="application/ld+json"
      className={className}
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
    />
  );
};

export default StructuredData;