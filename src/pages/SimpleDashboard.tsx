import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Phone, Mail } from "lucide-react";

const SimpleDashboard = () => {
  const { user, signOut } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-white text-center">
          <p>No user found. Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pt-8">
          <h1 className="text-3xl font-bold text-white">ICE SOS Dashboard</h1>
          <Button 
            onClick={signOut} 
            variant="outline" 
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            Sign Out
          </Button>
        </div>

        {/* User Info Card */}
        <Card className="bg-white/95 backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-500" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Email:</span>
                <span>{user.email}</span>
              </div>
              
              {user.user_metadata?.first_name && (
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Name:</span>
                  <span>{user.user_metadata.first_name} {user.user_metadata.last_name}</span>
                </div>
              )}
              
              {user.user_metadata?.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Phone:</span>
                  <span>{user.user_metadata.phone}</span>
                </div>
              )}
              
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Account created: {new Date(user.created_at).toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  User ID: {user.id}
                </p>
                <p className="text-sm text-muted-foreground">
                  Email confirmed: {user.email_confirmed_at ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p>✅ Account created successfully</p>
              <p>✅ Authentication working</p>
              <p>🔄 Ready to add subscription plans</p>
              
              <div className="pt-4">
                <Button 
                  onClick={() => window.location.href = '/register'}
                  className="w-full"
                >
                  Complete Your Subscription Setup
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SimpleDashboard;