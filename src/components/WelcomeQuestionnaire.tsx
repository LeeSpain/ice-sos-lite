import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { updateProfileCompletion } from '@/lib/profileUtils';
import { UserCircle, Heart, Shield, Phone, Globe, ChevronRight, CheckCircle } from 'lucide-react';

interface ProfileData {
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  country: string;
  date_of_birth: string;
  blood_type: string;
  language_preference: string;
  medical_conditions: string[];
  allergies: string[];
  medications: string[];
  emergency_contacts: Array<{
    name: string;
    relationship: string;
    phone: string;
  }>;
  location_sharing_enabled: boolean;
}

const WelcomeQuestionnaire = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState<ProfileData>({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    country: '',
    date_of_birth: '',
    blood_type: '',
    language_preference: 'en',
    medical_conditions: [],
    allergies: [],
    medications: [],
    emergency_contacts: [{ name: '', relationship: '', phone: '' }],
    location_sharing_enabled: true
  });

  const steps = [
    { id: 1, title: 'Personal Details', icon: UserCircle },
    { id: 2, title: 'Health Information', icon: Heart },
    { id: 3, title: 'Emergency Contacts', icon: Phone },
    { id: 4, title: 'Preferences', icon: Globe }
  ];

  const totalSteps = steps.length;
  const progress = (currentStep / totalSteps) * 100;

  useEffect(() => {
    loadExistingProfile();
  }, [user]);

  const loadExistingProfile = async () => {
    if (!user) return;

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading profile:', error);
        return;
      }

      if (profile) {
        setProfileData({
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          phone: profile.phone || '',
          address: profile.address || '',
          country: profile.country || '',
          date_of_birth: profile.date_of_birth || '',
          blood_type: profile.blood_type || '',
          language_preference: profile.language_preference || 'en',
          medical_conditions: profile.medical_conditions || [],
          allergies: profile.allergies || [],
          medications: profile.medications || [],
          emergency_contacts: profile.emergency_contacts && Array.isArray(profile.emergency_contacts) && profile.emergency_contacts.length > 0 
            ? profile.emergency_contacts as Array<{name: string; relationship: string; phone: string}>
            : [{ name: '', relationship: '', phone: '' }],
          location_sharing_enabled: profile.location_sharing_enabled ?? true
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayFieldChange = (field: 'medical_conditions' | 'allergies' | 'medications', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    handleInputChange(field, items);
  };

  const addEmergencyContact = () => {
    setProfileData(prev => ({
      ...prev,
      emergency_contacts: [...prev.emergency_contacts, { name: '', relationship: '', phone: '' }]
    }));
  };

  const updateEmergencyContact = (index: number, field: string, value: string) => {
    const updatedContacts = [...profileData.emergency_contacts];
    updatedContacts[index] = { ...updatedContacts[index], [field]: value };
    handleInputChange('emergency_contacts', updatedContacts);
  };

  const removeEmergencyContact = (index: number) => {
    if (profileData.emergency_contacts.length > 1) {
      const updatedContacts = profileData.emergency_contacts.filter((_, i) => i !== index);
      handleInputChange('emergency_contacts', updatedContacts);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const saveProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          phone: profileData.phone,
          address: profileData.address,
          country: profileData.country,
          date_of_birth: profileData.date_of_birth || null,
          blood_type: profileData.blood_type,
          language_preference: profileData.language_preference,
          medical_conditions: profileData.medical_conditions,
          allergies: profileData.allergies,
          medications: profileData.medications,
          emergency_contacts: profileData.emergency_contacts.filter(contact => 
            contact.name.trim() && contact.phone.trim()
          ),
          location_sharing_enabled: profileData.location_sharing_enabled,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      // Update profile completion percentage
      await updateProfileCompletion(user.id);

      toast({
        title: "Profile Updated Successfully",
        description: "Your information has been saved and your account is now complete!",
      });

      // Navigate to member dashboard
      navigate('/member-dashboard');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error Saving Profile",
        description: "Please try again or contact support if the issue persists.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={profileData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  value={profileData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  placeholder="Enter your last name"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+34 600 123 456"
              />
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={profileData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter your full address"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="country">Country</Label>
                <Select value={profileData.country} onValueChange={(value) => handleInputChange('country', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ES">Spain</SelectItem>
                    <SelectItem value="FR">France</SelectItem>
                    <SelectItem value="DE">Germany</SelectItem>
                    <SelectItem value="IT">Italy</SelectItem>
                    <SelectItem value="PT">Portugal</SelectItem>
                    <SelectItem value="NL">Netherlands</SelectItem>
                    <SelectItem value="BE">Belgium</SelectItem>
                    <SelectItem value="AT">Austria</SelectItem>
                    <SelectItem value="CH">Switzerland</SelectItem>
                    <SelectItem value="GB">United Kingdom</SelectItem>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="CA">Canada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={profileData.date_of_birth}
                  onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="blood_type">Blood Type</Label>
              <Select value={profileData.blood_type} onValueChange={(value) => handleInputChange('blood_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select blood type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="medical_conditions">Medical Conditions</Label>
              <Textarea
                id="medical_conditions"
                value={profileData.medical_conditions.join(', ')}
                onChange={(e) => handleArrayFieldChange('medical_conditions', e.target.value)}
                placeholder="Enter conditions separated by commas (e.g., Diabetes, Hypertension)"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="allergies">Allergies</Label>
              <Textarea
                id="allergies"
                value={profileData.allergies.join(', ')}
                onChange={(e) => handleArrayFieldChange('allergies', e.target.value)}
                placeholder="Enter allergies separated by commas (e.g., Peanuts, Shellfish)"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="medications">Current Medications</Label>
              <Textarea
                id="medications"
                value={profileData.medications.join(', ')}
                onChange={(e) => handleArrayFieldChange('medications', e.target.value)}
                placeholder="Enter medications separated by commas"
                rows={3}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-foreground">Emergency Contacts</h4>
              <Button type="button" onClick={addEmergencyContact} variant="outline" size="sm">
                Add Contact
              </Button>
            </div>
            
            {profileData.emergency_contacts.map((contact, index) => (
              <Card key={index} className="p-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor={`contact_name_${index}`}>Name</Label>
                    <Input
                      id={`contact_name_${index}`}
                      value={contact.name}
                      onChange={(e) => updateEmergencyContact(index, 'name', e.target.value)}
                      placeholder="Contact name"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`contact_relationship_${index}`}>Relationship</Label>
                    <Input
                      id={`contact_relationship_${index}`}
                      value={contact.relationship}
                      onChange={(e) => updateEmergencyContact(index, 'relationship', e.target.value)}
                      placeholder="e.g., Spouse, Parent"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`contact_phone_${index}`}>Phone</Label>
                    <div className="flex gap-2">
                      <Input
                        id={`contact_phone_${index}`}
                        value={contact.phone}
                        onChange={(e) => updateEmergencyContact(index, 'phone', e.target.value)}
                        placeholder="+34 600 123 456"
                      />
                      {profileData.emergency_contacts.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeEmergencyContact(index)}
                          variant="outline"
                          size="sm"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="language_preference">Preferred Language</Label>
              <Select value={profileData.language_preference} onValueChange={(value) => handleInputChange('language_preference', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="it">Italiano</SelectItem>
                  <SelectItem value="pt">Português</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-semibold text-foreground">Location Sharing</h4>
                <p className="text-sm text-muted-foreground">
                  Allow emergency services to access your location during emergencies
                </p>
              </div>
              <Button
                type="button"
                onClick={() => handleInputChange('location_sharing_enabled', !profileData.location_sharing_enabled)}
                variant={profileData.location_sharing_enabled ? "default" : "outline"}
              >
                {profileData.location_sharing_enabled ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">Privacy Notice</h4>
              <p className="text-sm text-muted-foreground">
                Your personal information is securely encrypted and only accessible to you and authorized emergency responders during active emergencies. We never share your data with third parties for marketing purposes.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Complete Your Profile
            </h1>
            <p className="text-xl text-white/90 mb-6">
              Help us provide better emergency protection by completing your profile
            </p>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-medium">Progress</span>
                <span className="text-white">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>

          {/* Steps Navigation */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-2">
              {steps.map((step) => {
                const Icon = step.icon;
                const isActive = step.id === currentStep;
                const isCompleted = step.id < currentStep;
                
                return (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      isCompleted ? 'bg-emergency text-white' :
                      isActive ? 'bg-white text-primary' : 
                      'bg-white/20 text-white'
                    }`}>
                      {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    {step.id < totalSteps && (
                      <div className={`w-8 h-0.5 mx-2 ${isCompleted ? 'bg-emergency' : 'bg-white/20'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Step Content */}
          <Card className="bg-white/95 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                {React.createElement(steps[currentStep - 1].icon, { className: "w-6 h-6 text-primary" })}
                Step {currentStep}: {steps[currentStep - 1].title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderStepContent()}
              
              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <Button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  variant="outline"
                >
                  Previous
                </Button>
                
                {currentStep < totalSteps ? (
                  <Button onClick={nextStep} className="bg-primary hover:bg-primary/90">
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    onClick={saveProfile} 
                    disabled={loading}
                    className="bg-emergency hover:bg-emergency/90"
                  >
                    {loading ? 'Saving...' : 'Complete Profile'}
                    <Shield className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WelcomeQuestionnaire;