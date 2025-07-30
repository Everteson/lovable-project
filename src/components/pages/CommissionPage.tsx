import React, { useState, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { MessageSquare, CheckCircle, AlertCircle, FileImage, Info } from 'lucide-react';
import { AppContext } from '@/contexts/AppContext';

interface CommissionPageProps {
  setCurrentPage: (page: string) => void;
}

const CommissionPage: React.FC<CommissionPageProps> = ({ setCurrentPage }) => {
  const { commissionsOpen, addCommissionRequest } = useContext(AppContext);
  const [formData, setFormData] = useState({
    fullName: '',
    discordId: '',
    email: '',
    description: '',
    fileReference: ''
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!commissionsOpen) {
      toast({
        title: "Commissions Closed",
        description: "Sorry, commissions are currently closed. Please check back later!",
        variant: "destructive"
      });
      return;
    }

    if (!formData.fullName || !formData.discordId || !formData.email || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (!agreeToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the Terms of Service to proceed.",
        variant: "destructive"
      });
      return;
    }

    if (formData.description.length > 2000) {
      toast({
        title: "Description Too Long",
        description: "Project description must be under 2000 characters.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      addCommissionRequest({
        fullName: formData.fullName,
        discordId: formData.discordId,
        email: formData.email,
        description: formData.description,
        fileReference: formData.fileReference || undefined
      });

      toast({
        title: "Request Sent Successfully! ✨",
        description: "I'll contact you within 24 hours via Discord or email.",
        variant: "default"
      });

      // Reset form
      setFormData({
        fullName: '',
        discordId: '',
        email: '',
        description: '',
        fileReference: ''
      });
      setAgreeToTerms(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send commission request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-primary bg-clip-text text-transparent">
            Commission Request
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Ready to bring your vision to life? Let's create something amazing together!
          </p>
          
          {/* Commission Status */}
          <Badge 
            variant={commissionsOpen ? "default" : "secondary"}
            className={`text-lg px-6 py-2 mb-8 ${commissionsOpen ? 'animate-pulse-glow' : ''}`}
          >
            {commissionsOpen ? (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Commissions: OPEN
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 mr-2" />
                Commissions: CLOSED
              </>
            )}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Commission Form */}
          <div className="lg:col-span-2">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-primary" />
                  Commission Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      placeholder="Your full name"
                      className="mt-1"
                      disabled={!commissionsOpen}
                    />
                  </div>
                  <div>
                    <Label htmlFor="discordId">Discord ID *</Label>
                    <Input
                      id="discordId"
                      value={formData.discordId}
                      onChange={(e) => handleInputChange('discordId', e.target.value)}
                      placeholder="username#1234"
                      className="mt-1"
                      disabled={!commissionsOpen}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your.email@example.com"
                    className="mt-1"
                    disabled={!commissionsOpen}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Project Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your project in detail. Include preferred style, character details, pose, background, deadline, and intended usage..."
                    className="mt-1 min-h-32"
                    maxLength={2000}
                    disabled={!commissionsOpen}
                  />
                  <div className="text-right text-sm text-muted-foreground mt-1">
                    {formData.description.length}/2000 characters
                  </div>
                </div>

                <div>
                  <Label htmlFor="fileReference">Reference Files (Optional)</Label>
                  <Input
                    id="fileReference"
                    value={formData.fileReference}
                    onChange={(e) => handleInputChange('fileReference', e.target.value)}
                    placeholder="Link to reference images or files"
                    className="mt-1"
                    disabled={!commissionsOpen}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Provide links to reference images, character sheets, or inspiration
                  </p>
                </div>

                {/* Terms Agreement */}
                <div className="border-t border-border/50 pt-6">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={agreeToTerms}
                      onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                      disabled={!commissionsOpen}
                    />
                    <div className="text-sm">
                      <Label htmlFor="terms" className="cursor-pointer">
                        I agree to the{' '}
                        <Button
                          variant="link"
                          className="p-0 h-auto text-primary"
                          onClick={() => setCurrentPage('terms')}
                        >
                          Terms of Service
                        </Button>
                        {' '}and understand the commission process.
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  variant="hero"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={!commissionsOpen || isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    "Sending Request..."
                  ) : (
                    <>
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Send Commission Request
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Tips & Information */}
          <div className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Info className="w-5 h-5 text-accent" />
                  Tips for a Precise Quote
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold text-primary mb-2">Be Detailed</h4>
                  <p className="text-muted-foreground">
                    Describe your project thoroughly including character appearance, pose, background, and style preferences.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-primary mb-2">Include References</h4>
                  <p className="text-muted-foreground">
                    Provide reference images, color palettes, or similar artworks to help convey your vision.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-primary mb-2">Mention Deadline</h4>
                  <p className="text-muted-foreground">
                    If you have a specific deadline, please mention it in your description.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-primary mb-2">Usage Rights</h4>
                  <p className="text-muted-foreground">
                    Let me know how you plan to use the artwork (personal, commercial, streaming, etc.).
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileImage className="w-5 h-5 text-accent" />
                  Quick Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage('pricing')}
                  className="w-full justify-start"
                >
                  View Pricing Table
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage('terms')}
                  className="w-full justify-start"
                >
                  Terms of Service
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage('portfolio')}
                  className="w-full justify-start"
                >
                  Portfolio Gallery
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage('hours')}
                  className="w-full justify-start"
                >
                  Work Hours
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommissionPage;