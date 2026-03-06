import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  Shield,
  User,
  Phone,
  Heart,
  Users,
  Bell,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Plus,
  X,
  Loader2,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email: string;
  allow_calls: boolean;
  allow_notifications: boolean;
}

interface ProfileFormData {
  first_name: string;
  last_name: string;
  phone: string;
  date_of_birth: string;
  street_address: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  language_preference: string;
  blood_type: string;
  medical_conditions: string[];
  allergies: string[];
  medications: string[];
}

const EMPTY_CONTACT: EmergencyContact = {
  name: '',
  relationship: '',
  phone: '',
  email: '',
  allow_calls: true,
  allow_notifications: true,
};

const WIZARD_STEPS = [
  { id: 'welcome', label: 'Welcome', icon: Sparkles },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'location', label: 'Location', icon: Shield },
  { id: 'medical', label: 'Medical', icon: Heart },
  { id: 'contacts', label: 'Contacts', icon: Phone },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'complete', label: 'All Set', icon: CheckCircle2 },
] as const;

// ─── Component ───────────────────────────────────────────────────────────────

export default function OnboardingWizard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [formData, setFormData] = useState<ProfileFormData>({
    first_name: '',
    last_name: '',
    phone: '',
    date_of_birth: '',
    street_address: '',
    city: '',
    state_province: '',
    postal_code: '',
    country: '',
    language_preference: 'en',
    blood_type: '',
    medical_conditions: [],
    allergies: [],
    medications: [],
  });

  const [contacts, setContacts] = useState<EmergencyContact[]>([{ ...EMPTY_CONTACT }]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Temp inputs for array fields
  const [tempCondition, setTempCondition] = useState('');
  const [tempAllergy, setTempAllergy] = useState('');
  const [tempMedication, setTempMedication] = useState('');

  // ─── Load existing profile data ────────────────────────────────────────────

  useEffect(() => {
    if (!user?.id) return;
    loadProfile();
  }, [user?.id]);

  const loadProfile = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      const meta = user?.user_metadata;

      setFormData({
        first_name: profile?.first_name || meta?.first_name || '',
        last_name: profile?.last_name || meta?.last_name || '',
        phone: profile?.phone || meta?.phone || meta?.phone_number || '',
        date_of_birth: profile?.date_of_birth || '',
        street_address: profile?.address || meta?.current_location || '',
        city: '',
        state_province: '',
        postal_code: '',
        country: profile?.country || '',
        language_preference: profile?.language_preference || 'en',
        blood_type: profile?.blood_type || '',
        medical_conditions: profile?.medical_conditions || [],
        allergies: profile?.allergies || [],
        medications: profile?.medications || [],
      });

      const existingContacts = profile?.emergency_contacts as unknown as EmergencyContact[];
      if (existingContacts?.length) {
        setContacts(existingContacts.map(c => ({
          ...EMPTY_CONTACT,
          ...c,
          allow_calls: c.allow_calls ?? true,
          allow_notifications: c.allow_notifications ?? true,
        })));
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  // ─── Save progress (auto-save each step) ──────────────────────────────────

  const saveProgress = useCallback(async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      const address = [formData.street_address, formData.city, formData.state_province, formData.postal_code]
        .filter(Boolean).join(', ');

      const validContacts = contacts.filter(c => c.name.trim() && c.phone.trim());

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          date_of_birth: formData.date_of_birth || null,
          address: address || null,
          country: formData.country,
          language_preference: formData.language_preference,
          blood_type: formData.blood_type || null,
          medical_conditions: formData.medical_conditions,
          allergies: formData.allergies,
          medications: formData.medications,
          emergency_contacts: validContacts as any,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (err) {
      console.error('Auto-save error:', err);
    } finally {
      setSaving(false);
    }
  }, [user?.id, formData, contacts]);

  // ─── Navigation ────────────────────────────────────────────────────────────

  const totalSteps = WIZARD_STEPS.length;
  const progressPercent = Math.round((step / (totalSteps - 1)) * 100);
  const currentStepDef = WIZARD_STEPS[step];

  const canProceedFromContacts = contacts.some(c => c.name.trim() && c.phone.trim());

  const goNext = async () => {
    // Save on leaving data steps (1-5)
    if (step >= 1 && step <= 5) {
      await saveProgress();
    }
    setStep(s => Math.min(s + 1, totalSteps - 1));
  };

  const goBack = () => {
    setStep(s => Math.max(s - 1, 0));
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      // Final save
      await saveProgress();

      // Mark onboarding complete
      await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
          profile_completion_percentage: calculateCompletion(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user!.id);

      // Also update onboarding_progress if it exists
      await supabase
        .from('onboarding_progress')
        .upsert({
          user_id: user!.id,
          steps: {
            complete_profile: true,
            add_emergency_contacts: canProceedFromContacts,
            configure_sos_settings: true,
            invite_family: false,
            enable_notifications: notificationsEnabled,
            run_sos_test: false,
          } as any,
          completed: true,
          updated_at: new Date().toISOString(),
        });

      toast({ title: 'Welcome to ICE SOS!', description: 'Your safety profile is set up and ready.' });
      navigate('/member-dashboard');
    } catch (err) {
      console.error('Finish error:', err);
      toast({ title: 'Error', description: 'Failed to complete setup. Please try again.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const calculateCompletion = () => {
    const fields = [
      formData.first_name, formData.last_name, formData.phone,
      formData.date_of_birth, formData.street_address, formData.country,
      formData.blood_type,
      canProceedFromContacts ? 'yes' : '',
    ];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  };

  // ─── Array field helpers ───────────────────────────────────────────────────

  const addArrayItem = (field: 'medical_conditions' | 'allergies' | 'medications', value: string, clearFn: (v: string) => void) => {
    if (!value.trim()) return;
    setFormData(prev => ({ ...prev, [field]: [...prev[field], value.trim()] }));
    clearFn('');
  };

  const removeArrayItem = (field: 'medical_conditions' | 'allergies' | 'medications', index: number) => {
    setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };

  // ─── Contact helpers ───────────────────────────────────────────────────────

  const updateContact = (index: number, field: keyof EmergencyContact, value: any) => {
    setContacts(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addContact = () => {
    setContacts(prev => [...prev, { ...EMPTY_CONTACT }]);
  };

  const removeContact = (index: number) => {
    if (contacts.length <= 1) return;
    setContacts(prev => prev.filter((_, i) => i !== index));
  };

  // ─── Request notifications ─────────────────────────────────────────────────

  const requestNotifications = async () => {
    if (!('Notification' in window)) {
      toast({ title: 'Not Supported', description: 'Push notifications are not supported in this browser.' });
      return;
    }
    const permission = await Notification.requestPermission();
    setNotificationsEnabled(permission === 'granted');
    if (permission === 'granted') {
      toast({ title: 'Notifications Enabled', description: 'You will receive emergency alerts.' });
    }
  };

  // ─── Loading ───────────────────────────────────────────────────────────────

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  // ─── Step Renderers ────────────────────────────────────────────────────────

  const renderWelcome = () => (
    <div className="text-center space-y-6 py-4">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
        <Shield className="w-10 h-10 text-primary" />
      </div>
      <div>
        <h2 className="text-3xl font-bold">
          Welcome{formData.first_name ? `, ${formData.first_name}` : ''}!
        </h2>
        <p className="text-muted-foreground mt-2 text-lg max-w-md mx-auto">
          Let's set up your emergency safety profile. This takes about 3 minutes and ensures help reaches you fast when it matters.
        </p>
      </div>
      <div className="grid gap-3 max-w-sm mx-auto text-left">
        {[
          { icon: User, text: 'Your personal & medical details' },
          { icon: Phone, text: 'Emergency contacts who will be notified' },
          { icon: Bell, text: 'Alert preferences & notifications' },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Icon className="w-5 h-5 text-primary shrink-0" />
            <span className="text-sm">{text}</span>
          </div>
        ))}
      </div>
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 max-w-sm mx-auto">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800 dark:text-amber-200">
            ICE SOS coordinates emergency response with your contacts. It is <strong>not</strong> a replacement for 911/112.
          </p>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-5">
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold">Personal Details</h2>
        <p className="text-muted-foreground">Basic information for your safety profile</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="first_name">First Name *</Label>
          <Input id="first_name" value={formData.first_name}
            onChange={e => setFormData(p => ({ ...p, first_name: e.target.value }))}
            placeholder="First name" />
        </div>
        <div>
          <Label htmlFor="last_name">Last Name *</Label>
          <Input id="last_name" value={formData.last_name}
            onChange={e => setFormData(p => ({ ...p, last_name: e.target.value }))}
            placeholder="Last name" />
        </div>
      </div>
      <div>
        <Label htmlFor="phone">Phone Number *</Label>
        <Input id="phone" type="tel" value={formData.phone}
          onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
          placeholder="+34 600 123 456" />
        <p className="text-xs text-muted-foreground mt-1">Include country code. This is the number Clar AI will call during an emergency.</p>
      </div>
      <div>
        <Label htmlFor="dob">Date of Birth</Label>
        <Input id="dob" type="date" value={formData.date_of_birth}
          onChange={e => setFormData(p => ({ ...p, date_of_birth: e.target.value }))} />
      </div>
      <div>
        <Label>Preferred Language</Label>
        <Select value={formData.language_preference} onValueChange={v => setFormData(p => ({ ...p, language_preference: v }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="es">Espanol</SelectItem>
            <SelectItem value="nl">Nederlands</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderLocation = () => (
    <div className="space-y-5">
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold">Your Location</h2>
        <p className="text-muted-foreground">Helps emergency services locate you</p>
      </div>
      <div>
        <Label htmlFor="street">Street Address</Label>
        <Input id="street" value={formData.street_address}
          onChange={e => setFormData(p => ({ ...p, street_address: e.target.value }))}
          placeholder="Street address" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input id="city" value={formData.city}
            onChange={e => setFormData(p => ({ ...p, city: e.target.value }))}
            placeholder="City" />
        </div>
        <div>
          <Label htmlFor="state">State / Province</Label>
          <Input id="state" value={formData.state_province}
            onChange={e => setFormData(p => ({ ...p, state_province: e.target.value }))}
            placeholder="State or province" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="postal">Postal Code</Label>
          <Input id="postal" value={formData.postal_code}
            onChange={e => setFormData(p => ({ ...p, postal_code: e.target.value }))}
            placeholder="Postal code" />
        </div>
        <div>
          <Label htmlFor="country">Country *</Label>
          <Input id="country" value={formData.country}
            onChange={e => setFormData(p => ({ ...p, country: e.target.value }))}
            placeholder="Country" />
        </div>
      </div>
    </div>
  );

  const renderMedical = () => (
    <div className="space-y-5">
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold">Medical Information</h2>
        <p className="text-muted-foreground">Critical for emergency responders. All fields are optional.</p>
      </div>
      <div>
        <Label>Blood Type</Label>
        <Select value={formData.blood_type} onValueChange={v => setFormData(p => ({ ...p, blood_type: v }))}>
          <SelectTrigger><SelectValue placeholder="Select blood type" /></SelectTrigger>
          <SelectContent>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(t => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Medical Conditions */}
      <div>
        <Label>Medical Conditions</Label>
        <div className="flex gap-2">
          <Input value={tempCondition} onChange={e => setTempCondition(e.target.value)}
            placeholder="e.g. Diabetes, Asthma"
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addArrayItem('medical_conditions', tempCondition, setTempCondition))} />
          <Button type="button" variant="outline" size="icon"
            onClick={() => addArrayItem('medical_conditions', tempCondition, setTempCondition)}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.medical_conditions.map((item, i) => (
            <Badge key={i} variant="secondary" className="gap-1">
              {item}
              <X className="w-3 h-3 cursor-pointer" onClick={() => removeArrayItem('medical_conditions', i)} />
            </Badge>
          ))}
        </div>
      </div>

      {/* Allergies */}
      <div>
        <Label>Allergies</Label>
        <div className="flex gap-2">
          <Input value={tempAllergy} onChange={e => setTempAllergy(e.target.value)}
            placeholder="e.g. Penicillin, Nuts"
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addArrayItem('allergies', tempAllergy, setTempAllergy))} />
          <Button type="button" variant="outline" size="icon"
            onClick={() => addArrayItem('allergies', tempAllergy, setTempAllergy)}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.allergies.map((item, i) => (
            <Badge key={i} variant="secondary" className="gap-1">
              {item}
              <X className="w-3 h-3 cursor-pointer" onClick={() => removeArrayItem('allergies', i)} />
            </Badge>
          ))}
        </div>
      </div>

      {/* Medications */}
      <div>
        <Label>Current Medications</Label>
        <div className="flex gap-2">
          <Input value={tempMedication} onChange={e => setTempMedication(e.target.value)}
            placeholder="e.g. Metformin 500mg"
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addArrayItem('medications', tempMedication, setTempMedication))} />
          <Button type="button" variant="outline" size="icon"
            onClick={() => addArrayItem('medications', tempMedication, setTempMedication)}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.medications.map((item, i) => (
            <Badge key={i} variant="secondary" className="gap-1">
              {item}
              <X className="w-3 h-3 cursor-pointer" onClick={() => removeArrayItem('medications', i)} />
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContacts = () => (
    <div className="space-y-5">
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold">Emergency Contacts</h2>
        <p className="text-muted-foreground">
          These people will be contacted when you trigger SOS. Add at least one.
        </p>
      </div>

      <div className="space-y-4">
        {contacts.map((contact, index) => (
          <Card key={index} className="relative">
            <CardContent className="pt-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Contact {index + 1}</span>
                {contacts.length > 1 && (
                  <Button variant="ghost" size="sm" className="text-destructive h-7 px-2"
                    onClick={() => removeContact(index)}>
                    <X className="w-3 h-3 mr-1" /> Remove
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Name *</Label>
                  <Input value={contact.name} placeholder="Full name"
                    onChange={e => updateContact(index, 'name', e.target.value)} />
                </div>
                <div>
                  <Label>Relationship</Label>
                  <Select value={contact.relationship} onValueChange={v => updateContact(index, 'relationship', v)}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      {['Spouse/Partner', 'Parent', 'Child', 'Sibling', 'Friend', 'Neighbor', 'Caregiver', 'Other'].map(r => (
                        <SelectItem key={r} value={r.toLowerCase()}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Phone *</Label>
                  <Input type="tel" value={contact.phone} placeholder="+34 600 000 000"
                    onChange={e => updateContact(index, 'phone', e.target.value)} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={contact.email} placeholder="email@example.com"
                    onChange={e => updateContact(index, 'email', e.target.value)} />
                </div>
              </div>
              <div className="flex items-center gap-6 pt-1">
                <div className="flex items-center gap-2">
                  <Switch checked={contact.allow_calls}
                    onCheckedChange={v => updateContact(index, 'allow_calls', v)} />
                  <Label className="text-sm font-normal">Phone calls</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={contact.allow_notifications}
                    onCheckedChange={v => updateContact(index, 'allow_notifications', v)} />
                  <Label className="text-sm font-normal">Notifications</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button variant="outline" className="w-full border-dashed" onClick={addContact}>
        <Plus className="w-4 h-4 mr-2" /> Add Another Contact
      </Button>

      {!canProceedFromContacts && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
          <p className="text-sm text-amber-800 dark:text-amber-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            Please add at least one contact with a name and phone number to continue.
          </p>
        </div>
      )}
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold">Enable Notifications</h2>
        <p className="text-muted-foreground">
          Stay informed with real-time emergency alerts
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Bell className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Push Notifications</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Receive instant alerts when an emergency is triggered, when contacts respond, and when incidents are resolved.
              </p>
            </div>
          </div>

          {notificationsEnabled ? (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-800 dark:text-green-200">Notifications enabled</span>
            </div>
          ) : (
            <Button onClick={requestNotifications} className="w-full" size="lg">
              <Bell className="w-4 h-4 mr-2" /> Enable Notifications
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          You can change notification settings anytime from your dashboard.
        </p>
      </div>
    </div>
  );

  const renderComplete = () => {
    const completion = calculateCompletion();
    const validContactCount = contacts.filter(c => c.name.trim() && c.phone.trim()).length;

    return (
      <div className="space-y-6 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <div>
          <h2 className="text-3xl font-bold">You're All Set!</h2>
          <p className="text-muted-foreground mt-2">
            Your ICE SOS safety profile is ready. Here's a summary:
          </p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-3 text-left">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Profile Completion</span>
              <Badge variant={completion >= 75 ? 'default' : 'secondary'}>{completion}%</Badge>
            </div>
            <Progress value={completion} />

            <div className="grid gap-2 pt-2">
              <SummaryRow label="Name" value={`${formData.first_name} ${formData.last_name}`.trim()} />
              <SummaryRow label="Phone" value={formData.phone} />
              <SummaryRow label="Location" value={[formData.city, formData.country].filter(Boolean).join(', ')} />
              <SummaryRow label="Blood Type" value={formData.blood_type} />
              <SummaryRow label="Emergency Contacts" value={validContactCount > 0 ? `${validContactCount} contact${validContactCount > 1 ? 's' : ''}` : ''} />
              <SummaryRow label="Notifications" value={notificationsEnabled ? 'Enabled' : 'Not yet'} />
            </div>
          </CardContent>
        </Card>

        {completion < 100 && (
          <p className="text-sm text-muted-foreground">
            You can complete missing details anytime from your dashboard.
          </p>
        )}
      </div>
    );
  };

  // ─── Step content map ──────────────────────────────────────────────────────

  const stepContent: Record<number, React.ReactNode> = {
    0: renderWelcome(),
    1: renderProfile(),
    2: renderLocation(),
    3: renderMedical(),
    4: renderContacts(),
    5: renderNotifications(),
    6: renderComplete(),
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Step indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            {WIZARD_STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === step;
              const isDone = i < step;
              return (
                <div key={s.id} className="flex flex-col items-center gap-1 flex-1">
                  <div className={`
                    w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300
                    ${isDone ? 'bg-green-500 text-white' : isActive ? 'bg-primary text-white ring-4 ring-primary/20' : 'bg-white/20 text-white/50'}
                  `}>
                    {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className={`text-[10px] hidden sm:block ${isActive ? 'text-white font-medium' : 'text-white/50'}`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
          <Progress value={progressPercent} className="h-1.5" />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-white/60">Step {step + 1} of {totalSteps}</span>
            {saving && <span className="text-xs text-white/60 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Saving...
            </span>}
          </div>
        </div>

        {/* Card content */}
        <Card className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-xl">
          <CardContent className="p-6 sm:p-8">
            <div className="min-h-[400px] flex flex-col">
              <div className="flex-1">
                {stepContent[step]}
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-6 mt-6 border-t">
                {step > 0 ? (
                  <Button variant="ghost" onClick={goBack} disabled={saving}>
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                ) : (
                  <div />
                )}

                {step === 0 && (
                  <Button onClick={goNext} size="lg">
                    Get Started <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}

                {step > 0 && step < totalSteps - 1 && (
                  <div className="flex items-center gap-2">
                    {step !== 4 && (
                      <Button variant="ghost" onClick={goNext} disabled={saving}
                        className="text-muted-foreground text-sm">
                        Skip
                      </Button>
                    )}
                    <Button onClick={goNext}
                      disabled={saving || (step === 4 && !canProceedFromContacts)}>
                      {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                      Continue <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                )}

                {step === totalSteps - 1 && (
                  <Button onClick={handleFinish} size="lg" disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Go to Dashboard <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skip onboarding entirely (only shows on welcome step) */}
        {step === 0 && (
          <div className="text-center mt-4">
            <Button variant="link" className="text-white/60 text-sm"
              onClick={() => {
                supabase.from('profiles').update({ onboarding_completed: true, updated_at: new Date().toISOString() }).eq('user_id', user!.id);
                navigate('/member-dashboard');
              }}>
              I'll set this up later
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Helper Components ─────────────────────────────────────────────────────

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={value ? 'font-medium' : 'text-muted-foreground italic'}>
        {value || 'Not provided'}
      </span>
    </div>
  );
}
