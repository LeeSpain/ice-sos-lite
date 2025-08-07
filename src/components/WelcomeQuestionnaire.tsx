import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserCircle, Heart, MapPin, Phone, Globe, Plus, X } from 'lucide-react';

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

const WelcomeQuestionnaire = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    date_of_birth: '',
    address: '',
    country: '',
    language_preference: 'en',
    blood_type: '',
    medical_conditions: [] as string[],
    allergies: [] as string[],
    medications: [] as string[],
    emergency_contacts: [] as EmergencyContact[]
  });

  // Temporary input states
  const [newMedicalCondition, setNewMedicalCondition] = useState('');
  const [newAllergy, setNewAllergy] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const [newContact, setNewContact] = useState<EmergencyContact>({
    name: '',
    relationship: '',
    phone: '',
    email: ''
  });

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Load existing profile data
    loadExistingProfile();
  }, [user, navigate]);

  const loadExistingProfile = async () => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;

      if (profile) {
        setFormData({
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          phone: profile.phone || '',
          date_of_birth: profile.date_of_birth || '',
          address: profile.address || '',
          country: profile.country || '',
          language_preference: profile.language_preference || 'en',
          blood_type: profile.blood_type || '',
          medical_conditions: profile.medical_conditions || [],
          allergies: profile.allergies || [],
          medications: profile.medications || [],
          emergency_contacts: (profile.emergency_contacts as unknown as EmergencyContact[]) || []
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const addArrayItem = (field: 'medical_conditions' | 'allergies' | 'medications', value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
      
      // Clear the input
      if (field === 'medical_conditions') setNewMedicalCondition('');
      if (field === 'allergies') setNewAllergy('');
      if (field === 'medications') setNewMedication('');
    }
  };

  const removeArrayItem = (field: 'medical_conditions' | 'allergies' | 'medications', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const addEmergencyContact = () => {
    if (newContact.name && newContact.phone) {
      setFormData(prev => ({
        ...prev,
        emergency_contacts: [...prev.emergency_contacts, { ...newContact }]
      }));
      setNewContact({ name: '', relationship: '', phone: '', email: '' });
    }
  };

  const removeEmergencyContact = (index: number) => {
    setFormData(prev => ({
      ...prev,
      emergency_contacts: prev.emergency_contacts.filter((_, i) => i !== index)
    }));
  };

  const calculateCompletionPercentage = () => {
    const fields = [
      formData.first_name,
      formData.last_name,
      formData.phone,
      formData.date_of_birth,
      formData.address,
      formData.country,
      formData.language_preference,
      formData.blood_type,
      formData.medical_conditions.length > 0 ? 'has_conditions' : '',
      formData.allergies.length > 0 ? 'has_allergies' : '',
      formData.medications.length > 0 ? 'has_medications' : '',
      formData.emergency_contacts.length > 0 ? 'has_contacts' : ''
    ];
    
    const completedFields = fields.filter(field => field && field.toString().trim() !== '').length;
    return Math.round((completedFields / fields.length) * 100);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      const completionPercentage = calculateCompletionPercentage();
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user?.id,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          date_of_birth: formData.date_of_birth,
          address: formData.address,
          country: formData.country,
          language_preference: formData.language_preference,
          blood_type: formData.blood_type,
          medical_conditions: formData.medical_conditions,
          allergies: formData.allergies,
          medications: formData.medications,
          emergency_contacts: formData.emergency_contacts as any,
          profile_completion_percentage: completionPercentage,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated!",
      });

      // Redirect to member dashboard
      navigate('/full-dashboard');
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <UserCircle className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground">Personal Information</h2>
              <p className="text-muted-foreground">Let's start with your basic details</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <MapPin className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground">Location & Language</h2>
              <p className="text-muted-foreground">Where are you located?</p>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter your full address"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                placeholder="Enter your country"
              />
            </div>

            <div>
              <Label htmlFor="language">Preferred Language</Label>
              <Select value={formData.language_preference} onValueChange={(value) => setFormData(prev => ({ ...prev, language_preference: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="it">Italian</SelectItem>
                  <SelectItem value="pt">Portuguese</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Heart className="w-16 h-16 text-emergency mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground">Medical Information</h2>
              <p className="text-muted-foreground">Important for emergency situations</p>
            </div>

            <div>
              <Label htmlFor="blood_type">Blood Type</Label>
              <Select value={formData.blood_type} onValueChange={(value) => setFormData(prev => ({ ...prev, blood_type: value }))}>
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
              <Label>Medical Conditions</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newMedicalCondition}
                  onChange={(e) => setNewMedicalCondition(e.target.value)}
                  placeholder="Add medical condition"
                  onKeyPress={(e) => e.key === 'Enter' && addArrayItem('medical_conditions', newMedicalCondition)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayItem('medical_conditions', newMedicalCondition)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.medical_conditions.map((condition, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {condition}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => removeArrayItem('medical_conditions', index)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>Allergies</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  placeholder="Add allergy"
                  onKeyPress={(e) => e.key === 'Enter' && addArrayItem('allergies', newAllergy)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayItem('allergies', newAllergy)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.allergies.map((allergy, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {allergy}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => removeArrayItem('allergies', index)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>Current Medications</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newMedication}
                  onChange={(e) => setNewMedication(e.target.value)}
                  placeholder="Add medication"
                  onKeyPress={(e) => e.key === 'Enter' && addArrayItem('medications', newMedication)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayItem('medications', newMedication)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.medications.map((medication, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {medication}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => removeArrayItem('medications', index)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Phone className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground">Emergency Contacts</h2>
              <p className="text-muted-foreground">Who should we contact in an emergency?</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact_name">Name</Label>
                    <Input
                      id="contact_name"
                      value={newContact.name}
                      onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Contact name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact_relationship">Relationship</Label>
                    <Input
                      id="contact_relationship"
                      value={newContact.relationship}
                      onChange={(e) => setNewContact(prev => ({ ...prev, relationship: e.target.value }))}
                      placeholder="e.g., Spouse, Parent, Friend"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact_phone">Phone</Label>
                    <Input
                      id="contact_phone"
                      type="tel"
                      value={newContact.phone}
                      onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact_email">Email (Optional)</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={newContact.email}
                      onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={addEmergencyContact}
                  className="w-full"
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Contact
                </Button>
              </CardContent>
            </Card>

            {formData.emergency_contacts.length > 0 && (
              <div className="space-y-3">
                <Label>Your Emergency Contacts</Label>
                {formData.emergency_contacts.map((contact, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{contact.name}</h4>
                          <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                          <p className="text-sm">{contact.phone}</p>
                          {contact.email && <p className="text-sm text-muted-foreground">{contact.email}</p>}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEmergencyContact(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 5:
        const completionPercentage = calculateCompletionPercentage();
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Globe className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground">Ready to Go!</h2>
              <p className="text-muted-foreground">Review your information and complete setup</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Profile Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Progress</span>
                    <span className="font-semibold">{completionPercentage}%</span>
                  </div>
                  <Progress value={completionPercentage} className="w-full" />
                </div>
              </CardContent>
            </Card>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Summary</h4>
              <div className="text-sm space-y-1">
                <p><strong>Name:</strong> {formData.first_name} {formData.last_name}</p>
                <p><strong>Phone:</strong> {formData.phone}</p>
                <p><strong>Location:</strong> {formData.country}</p>
                <p><strong>Blood Type:</strong> {formData.blood_type}</p>
                <p><strong>Emergency Contacts:</strong> {formData.emergency_contacts.length}</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/95 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
                <Badge variant="outline">
                  Step {currentStep} of {totalSteps}
                </Badge>
              </div>
              <Progress value={progress} className="w-full" />
            </CardHeader>
            
            <CardContent className="space-y-6">
              {renderStep()}
              
              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>
                
                {currentStep < totalSteps ? (
                  <Button
                    onClick={() => setCurrentStep(prev => Math.min(totalSteps, prev + 1))}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isLoading ? 'Saving...' : 'Complete Setup'}
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