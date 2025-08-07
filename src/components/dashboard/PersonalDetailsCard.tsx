import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Edit, 
  MapPin, 
  Phone, 
  Calendar, 
  Globe, 
  Heart, 
  Users, 
  Plus, 
  Trash2, 
  AlertTriangle,
  UserPlus
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PersonalDetailsCardProps {
  profile: any;
  onProfileUpdate: () => void;
}

const PersonalDetailsCard = ({ profile, onProfileUpdate }: PersonalDetailsCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    date_of_birth: '',
    address: '',
    country: '',
    language_preference: 'en'
  });

  const [emergencyContacts, setEmergencyContacts] = useState([
    {
      id: 1,
      name: "Jane Doe",
      relationship: "Spouse",
      phone: "+1 (555) 123-4568",
      email: "jane.doe@email.com",
      primary: true
    },
    {
      id: 2,
      name: "Dr. Smith",
      relationship: "Doctor",
      phone: "+1 (555) 987-6543",
      email: "dr.smith@clinic.com",
      primary: false
    }
  ]);

  const [healthInfo, setHealthInfo] = useState({
    bloodType: "O+",
    allergies: ["Penicillin", "Peanuts"],
    medications: ["Lisinopril 10mg", "Metformin 500mg"],
    medicalConditions: ["Hypertension", "Type 2 Diabetes"],
    emergencyMedicalInfo: "Diabetic - carries glucose tablets"
  });

  const [familyMembers, setFamilyMembers] = useState([
    {
      id: 1,
      name: "Jane Doe",
      relationship: "Spouse",
      phone: "+1 (555) 123-4568",
      email: "jane.doe@email.com",
      status: "Connected"
    },
    {
      id: 2,
      name: "Mike Doe",
      relationship: "Son",
      phone: "+1 (555) 456-7890",
      email: "mike.doe@email.com",
      status: "Pending"
    }
  ]);

  const { toast } = useToast();

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        date_of_birth: profile.date_of_birth || '',
        address: profile.address || '',
        country: profile.country || '',
        language_preference: profile.language_preference || 'en'
      });
    }
  }, [profile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const savePersonalDetails = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if profile exists, if not create one
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!existingProfile) {
        // Create new profile
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            ...formData
          });

        if (insertError) throw insertError;
      } else {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update(formData)
          .eq('user_id', user.id);

        if (updateError) throw updateError;
      }

      onProfileUpdate();
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Personal details updated successfully."
      });
    } catch (error) {
      console.error('Error updating personal details:', error);
      toast({
        title: "Error",
        description: "Failed to update personal details.",
        variant: "destructive"
      });
    }
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' }
  ];

  const sections = [
    { id: 'personal', title: 'Personal', icon: User },
    { id: 'emergency', title: 'Emergency', icon: Phone },
    { id: 'health', title: 'Health', icon: Heart },
    { id: 'family', title: 'Family', icon: Users }
  ];

  return (
    <Card className="bg-white/95 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <User className="h-6 w-6 text-primary" />
            Personal Details
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (isEditing) {
                savePersonalDetails();
              } else {
                setIsEditing(true);
              }
            }}
          >
            <Edit className="h-4 w-4 mr-2" />
            {isEditing ? 'Save' : 'Edit'}
          </Button>
        </div>
        
        {/* Section Tabs */}
        <div className="flex gap-1 mt-4 p-1 bg-muted rounded-lg">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all text-sm font-medium ${
                activeSection === section.id
                  ? 'bg-white shadow-sm text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <section.icon className="h-4 w-4" />
              {section.title}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {/* Personal Information Section */}
        {activeSection === 'personal' && (
          <div className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                {isEditing ? (
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    placeholder="Enter your first name"
                  />
                ) : (
                  <p className="px-3 py-2 text-sm bg-muted/50 rounded-md">
                    {formData.first_name || 'Not provided'}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                {isEditing ? (
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    placeholder="Enter your last name"
                  />
                ) : (
                  <p className="px-3 py-2 text-sm bg-muted/50 rounded-md">
                    {formData.last_name || 'Not provided'}
                  </p>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <p className="px-3 py-2 text-sm bg-muted/50 rounded-md">
                    {formData.phone || 'Not provided'}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_of_birth" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date of Birth
                </Label>
                {isEditing ? (
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                  />
                ) : (
                  <p className="px-3 py-2 text-sm bg-muted/50 rounded-md">
                    {formData.date_of_birth 
                      ? new Date(formData.date_of_birth).toLocaleDateString()
                      : 'Not provided'
                    }
                  </p>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Address
              </Label>
              {isEditing ? (
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter your address"
                />
              ) : (
                <p className="px-3 py-2 text-sm bg-muted/50 rounded-md">
                  {formData.address || 'Not provided'}
                </p>
              )}
            </div>

            {/* Country and Language */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                {isEditing ? (
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    placeholder="Enter your country"
                  />
                ) : (
                  <p className="px-3 py-2 text-sm bg-muted/50 rounded-md">
                    {formData.country || 'Not provided'}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="language_preference" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Preferred Language
                </Label>
                {isEditing ? (
                  <select
                    id="language_preference"
                    value={formData.language_preference}
                    onChange={(e) => handleInputChange('language_preference', e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    {languages.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="px-3 py-2 text-sm bg-muted/50 rounded-md">
                    {languages.find(lang => lang.code === formData.language_preference)?.name || 'English'}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Emergency Contacts Section */}
        {activeSection === 'emergency' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Phone className="h-5 w-5 text-red-500" />
                Emergency Contacts
              </h3>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
            </div>
            <div className="space-y-3">
              {emergencyContacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                      <Phone className="h-6 w-6 text-red-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-base">{contact.name}</h4>
                        {contact.primary && (
                          <Badge className="bg-red-100 text-red-800 text-xs">Primary</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                      <p className="text-sm text-muted-foreground">{contact.phone}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Health Information Section */}
        {activeSection === 'health' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Health Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Blood Type</Label>
                <p className="px-3 py-2 text-sm bg-muted/50 rounded-md mt-1">
                  {healthInfo.bloodType}
                </p>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Allergies</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {healthInfo.allergies.map((allergy, index) => (
                  <Badge key={index} variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {allergy}
                  </Badge>
                ))}
                <Button variant="ghost" size="sm" className="h-6 px-2">
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Current Medications</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {healthInfo.medications.map((medication, index) => (
                  <Badge key={index} variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                    {medication}
                  </Badge>
                ))}
                <Button variant="ghost" size="sm" className="h-6 px-2">
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Medical Conditions</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {healthInfo.medicalConditions.map((condition, index) => (
                  <Badge key={index} variant="outline" className="bg-purple-50 text-purple-800 border-purple-200">
                    {condition}
                  </Badge>
                ))}
                <Button variant="ghost" size="sm" className="h-6 px-2">
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Emergency Medical Information</Label>
              <Textarea
                value={healthInfo.emergencyMedicalInfo}
                readOnly={!isEditing}
                className="mt-1 bg-muted/50"
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Family Connections Section */}
        {activeSection === 'family' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Family Connections
              </h3>
              <Button variant="outline" size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Family
              </Button>
            </div>
            <div className="space-y-3">
              {familyMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-base">{member.name}</h4>
                        <Badge 
                          variant={member.status === 'Connected' ? 'default' : 'secondary'}
                          className={member.status === 'Connected' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                        >
                          {member.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{member.relationship}</p>
                      <p className="text-sm text-muted-foreground">{member.phone}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PersonalDetailsCard;