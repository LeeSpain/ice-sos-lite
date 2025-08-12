import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Mail, Lock, ArrowLeft, Phone, User, Smartphone, QrCode } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import QRCode from 'qrcode';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const AuthPage = () => {
  useScrollToTop();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [iosQr, setIosQr] = useState("");
  const [androidQr, setAndroidQr] = useState("");
  const navigate = useNavigate();

  // App store URLs
  const iosUrl = "https://apps.apple.com/app/ice-sos-lite/id123456789";
  const androidUrl = "https://play.google.com/store/apps/details?id=com.icesos.lite";

  // Generate QR codes
  useEffect(() => {
    const generateQRCodes = async () => {
      try {
        const iosQrCode = await QRCode.toDataURL(iosUrl, {
          width: 150,
          margin: 2,
          color: { dark: '#000000', light: '#FFFFFF' }
        });
        const androidQrCode = await QRCode.toDataURL(androidUrl, {
          width: 150,
          margin: 2,
          color: { dark: '#000000', light: '#FFFFFF' }
        });
        setIosQr(iosQrCode);
        setAndroidQr(androidQrCode);
      } catch (error) {
        console.error('Error generating QR codes:', error);
      }
    };
    generateQRCodes();
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (!firstName || !lastName || !phoneNumber) {
        setError("Please fill in all required fields including name and phone number.");
        return;
      }

      const redirectUrl = `${window.location.origin}/sos`;
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: firstName,
            last_name: lastName,
            phone: phoneNumber
          }
        }
      });

      if (authError) {
        if (authError.message.includes("already registered")) {
          setError("This email is already registered. Please try signing in instead.");
        } else {
          setError(authError.message);
        }
        return;
      }

      // Create profile record if user was created successfully
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: authData.user.id,
            first_name: firstName,
            last_name: lastName,
            phone: phoneNumber,
            emergency_contacts: [],
            medical_conditions: [],
            allergies: [],
            medications: []
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
          // Don't show this error to user as the auth was successful
        }
      }

      setMessage("Account created successfully! Check your email for the confirmation link.");
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setError("Invalid email or password. Please check your credentials and try again.");
        } else {
          setError(error.message);
        }
      } else {
        // Successfully signed in, redirect to dashboard
        navigate("/sos");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center text-white hover:text-white/80 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <Shield className="h-8 w-8 text-emergency" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">ICE SOS</h1>
          <p className="text-white/80">Emergency Protection Platform</p>
        </div>

        <Card className="bg-white/95 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-center">Welcome</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              {/* Sign In Tab */}
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              {/* Sign Up Tab */}
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-firstName">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-firstName"
                          type="text"
                          placeholder="Enter your first name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-lastName">Last Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-lastName"
                          type="text"
                          placeholder="Enter your last name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                        minLength={6}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Password must be at least 6 characters long
                    </p>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Messages */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            {message && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-600">{message}</p>
              </div>
            )}

            {/* Testing Links */}
            <div className="mt-4 text-center space-y-2">
              <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
                <Link to="/full-dashboard">Members Dashboard (Testing) →</Link>
              </Button>
              <br />
              <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
                <Link to="/admin-dashboard">Admin Dashboard (Testing) →</Link>
              </Button>
              <br />
              <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
                <Link to="/admin-setup">Admin Setup (Create Test Account) →</Link>
              </Button>
            </div>


            {/* Additional Info */}
            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>
                By signing up, you agree to our Terms of Service and Privacy Policy
              </p>
              <p className="mt-2 text-xs">
                Sign up to create your account, then visit the subscription page to select your emergency protection plan.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Mobile App Download Section */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-xl mt-6">
          <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-2 mb-2">
              <Smartphone className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl">Get the Mobile App</CardTitle>
            </div>
            <CardDescription>
              Download ICE SOS Lite for instant emergency access on your mobile device
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* QR Codes Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center space-y-3">
                <div className="flex justify-center items-center gap-2">
                  <QrCode className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-medium">iOS App Store</h3>
                </div>
                {iosQr && (
                  <div className="flex justify-center">
                    <img src={iosQr} alt="iOS QR Code" className="border-2 border-gray-200 rounded-lg" loading="lazy" decoding="async" />
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(iosUrl, '_blank')}
                  className="w-full"
                >
                  Download for iOS
                </Button>
              </div>
              
              <div className="text-center space-y-3">
                <div className="flex justify-center items-center gap-2">
                  <QrCode className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-medium">Google Play Store</h3>
                </div>
                {androidQr && (
                  <div className="flex justify-center">
                    <img src={androidQr} alt="Android QR Code" className="border-2 border-gray-200 rounded-lg" loading="lazy" decoding="async" />
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(androidUrl, '_blank')}
                  className="w-full"
                >
                  Download for Android
                </Button>
              </div>
            </div>

            {/* Benefits */}
            <div className="text-center text-sm text-muted-foreground">
              <p className="mb-2">📱 Quick emergency access • 🔔 Push notifications • 📍 GPS location sharing</p>
              <p className="text-xs">Scan the QR code with your phone's camera or download directly from the app stores</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;