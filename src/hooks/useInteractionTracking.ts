import { useCallback } from 'react';
import { trackCustomEvent } from '@/hooks/usePageTracking';
import { useLocation } from 'react-router-dom';

export function useInteractionTracking() {
  const location = useLocation();

  const trackButtonClick = useCallback((buttonType: string, buttonText?: string, additionalData?: Record<string, any>) => {
    trackCustomEvent('button_click', {
      button_type: buttonType,
      button_text: buttonText,
      page_path: location.pathname,
      timestamp: new Date().toISOString(),
      ...additionalData
    });
  }, [location.pathname]);

  const trackLinkClick = useCallback((linkType: string, linkDestination: string, linkText?: string) => {
    trackCustomEvent('link_click', {
      link_type: linkType,
      link_destination: linkDestination,
      link_text: linkText,
      page_path: location.pathname,
      timestamp: new Date().toISOString()
    });
  }, [location.pathname]);

  const trackFormSubmission = useCallback((formType: string, formName: string, success: boolean, errors?: string[]) => {
    trackCustomEvent('form_submission', {
      form_type: formType,
      form_name: formName,
      success,
      errors: errors?.join(', '),
      page_path: location.pathname,
      timestamp: new Date().toISOString()
    });
  }, [location.pathname]);

  const trackSOSAction = useCallback((action: string, details?: Record<string, any>) => {
    trackCustomEvent('sos_action', {
      action,
      page_path: location.pathname,
      timestamp: new Date().toISOString(),
      ...details
    });
  }, [location.pathname]);

  const trackChatInteraction = useCallback((action: string, context?: string, messageLength?: number) => {
    trackCustomEvent('chat_interaction', {
      action,
      context,
      message_length: messageLength,
      page_path: location.pathname,
      timestamp: new Date().toISOString()
    });
  }, [location.pathname]);

  const trackDownloadAction = useCallback((downloadType: string, fileName?: string) => {
    trackCustomEvent('download_action', {
      download_type: downloadType,
      file_name: fileName,
      page_path: location.pathname,
      timestamp: new Date().toISOString()
    });
  }, [location.pathname]);

  const trackVideoInteraction = useCallback((action: string, videoId?: string, videoTitle?: string, watchTime?: number) => {
    trackCustomEvent('video_interaction', {
      action,
      video_id: videoId,
      video_title: videoTitle,
      watch_time_seconds: watchTime,
      page_path: location.pathname,
      timestamp: new Date().toISOString()
    });
  }, [location.pathname]);

  const trackRegistrationStep = useCallback((step: string, success: boolean, planType?: string) => {
    trackCustomEvent('registration_step', {
      step,
      success,
      plan_type: planType,
      page_path: location.pathname,
      timestamp: new Date().toISOString()
    });
  }, [location.pathname]);

  return {
    trackButtonClick,
    trackLinkClick,
    trackFormSubmission,
    trackSOSAction,
    trackChatInteraction,
    trackDownloadAction,
    trackVideoInteraction,
    trackRegistrationStep
  };
}