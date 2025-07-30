import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Edit, MapPin, Phone, Calendar, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PersonalDetailsCardProps {
  profile: any;
  onProfileUpdate: () => void;
}

const PersonalDetailsCard = ({ profile, onProfileUpdate }: PersonalDetailsCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    date_of_birth: '',
    address: '',
    country: '',
    language_preference: 'en'
  });
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

  return (
    <Card className="bg-white/95 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-500" />
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
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
};

export default PersonalDetailsCard;