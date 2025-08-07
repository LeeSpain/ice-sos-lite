import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Phone, 
  Heart, 
  Users, 
  MapPin, 
  Calendar, 
  Mail,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  UserPlus,
  Activity
} from "lucide-react";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@email.com",
    phone: "+1 (555) 123-4567",
    dateOfBirth: "1975-06-15",
    address: "123 Main St, New York, NY 10001",
    country: "United States",
    language: "English"
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

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <User className="h-6 w-6 text-primary" />
              My Profile
            </CardTitle>
            <CardDescription className="text-base">
              Manage your personal information, emergency contacts, health details, and family connections
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription className="text-sm">
              Your basic profile information and contact details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                <Input
                  id="firstName"
                  value={profile.firstName}
                  onChange={(e) => setProfile(prev => ({...prev, firstName: e.target.value}))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                <Input
                  id="lastName"
                  value={profile.lastName}
                  onChange={(e) => setProfile(prev => ({...prev, lastName: e.target.value}))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile(prev => ({...prev, email: e.target.value}))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => setProfile(prev => ({...prev, phone: e.target.value}))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="dateOfBirth" className="text-sm font-medium">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={profile.dateOfBirth}
                  onChange={(e) => setProfile(prev => ({...prev, dateOfBirth: e.target.value}))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="language" className="text-sm font-medium">Language</Label>
                <Select value={profile.language} onValueChange={(value) => setProfile(prev => ({...prev, language: value}))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="German">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="address" className="text-sm font-medium">Address</Label>
              <Textarea
                id="address"
                value={profile.address}
                onChange={(e) => setProfile(prev => ({...prev, address: e.target.value}))}
                className="mt-1"
                rows={2}
              />
            </div>
            <Button className="w-full md:w-auto">
              <Edit className="h-4 w-4 mr-2" />
              Update Profile
            </Button>
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Phone className="h-5 w-5 text-red-500" />
                  Emergency Contacts
                </CardTitle>
                <CardDescription className="text-sm">
                  People to contact in case of emergency
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {emergencyContacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                      <Phone className="h-6 w-6 text-red-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-base">{contact.name}</h3>
                        {contact.primary && (
                          <Badge className="bg-red-100 text-red-800 text-xs">Primary</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                      <p className="text-sm text-muted-foreground">{contact.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Health Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Heart className="h-5 w-5 text-red-500" />
              Health Information
            </CardTitle>
            <CardDescription className="text-sm">
              Important medical information for emergency situations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bloodType" className="text-sm font-medium">Blood Type</Label>
                <Select value={healthInfo.bloodType} onValueChange={(value) => setHealthInfo(prev => ({...prev, bloodType: value}))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
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
              <Label htmlFor="emergencyMedicalInfo" className="text-sm font-medium">Emergency Medical Information</Label>
              <Textarea
                id="emergencyMedicalInfo"
                value={healthInfo.emergencyMedicalInfo}
                onChange={(e) => setHealthInfo(prev => ({...prev, emergencyMedicalInfo: e.target.value}))}
                placeholder="Additional medical information for emergency responders..."
                className="mt-1"
                rows={3}
              />
            </div>

            <Button className="w-full md:w-auto">
              <Heart className="h-4 w-4 mr-2" />
              Update Health Information
            </Button>
          </CardContent>
        </Card>

        {/* Family Connections */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Users className="h-5 w-5 text-blue-500" />
                  Family Connections
                </CardTitle>
                <CardDescription className="text-sm">
                  Connected family members who can access your location and emergency information
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Family
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {familyMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-base">{member.name}</h3>
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
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}