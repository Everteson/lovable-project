import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, Calendar, MessageCircle, Info } from 'lucide-react';

const WorkHoursPage: React.FC = () => {
  const schedule = [
    { day: 'Monday', hours: 'Not available', available: false },
    { day: 'Tuesday', hours: '18:00 to 23:00', available: true },
    { day: 'Wednesday', hours: '18:00 to 23:00', available: true },
    { day: 'Thursday', hours: '18:00 to 23:00', available: true },
    { day: 'Friday', hours: '18:00 to 23:00', available: true },
    { day: 'Saturday', hours: 'Not available', available: false },
    { day: 'Sunday', hours: 'Not available', available: false },
  ];

  const dayNames = {
    'Monday': 'Segunda-feira',
    'Tuesday': 'Terça-feira',
    'Wednesday': 'Quarta-feira',
    'Thursday': 'Quinta-feira',
    'Friday': 'Sexta-feira',
    'Saturday': 'Sábado',
    'Sunday': 'Domingo'
  };

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-primary bg-clip-text text-transparent">
            Work Hours
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            When I'm available for communication and project work
          </p>
          <Badge variant="outline" className="text-sm">
            Timezone: UTC-3 (Brasília Time)
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Schedule Table */}
          <div className="lg:col-span-2">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-primary" />
                  Weekly Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {schedule.map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${item.available ? 'bg-success' : 'bg-destructive'}`}></div>
                          <span className="font-medium">
                            {dayNames[item.day as keyof typeof dayNames]}
                          </span>
                          <span className="text-muted-foreground text-sm">
                            ({item.day})
                          </span>
                        </div>
                        <div className="text-right">
                          {item.available ? (
                            <Badge variant="default" className="bg-success/20 text-success border-success/30">
                              {item.hours}
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-destructive/20 text-destructive border-destructive/30">
                              {item.hours}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {index < schedule.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Current Status */}
            <Card className="glass-card mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-6 h-6 text-accent" />
                  Current Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <div className="text-3xl mb-4">🎨</div>
                  <h3 className="text-xl font-semibold mb-2">Currently Working</h3>
                  <p className="text-muted-foreground mb-4">
                    Creating amazing artwork and responding to messages during work hours
                  </p>
                  <div className="flex justify-center">
                    <Badge variant="default" className="animate-pulse-glow">
                      <div className="w-2 h-2 bg-current rounded-full mr-2 animate-pulse"></div>
                      Active during work hours
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Information Panel */}
          <div className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Info className="w-5 h-5 text-accent" />
                  Important Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold text-primary mb-2">Response Time</h4>
                  <p className="text-muted-foreground">
                    I typically respond to messages within 2-4 hours during work hours, and within 24 hours on other days.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-primary mb-2">Emergency Contact</h4>
                  <p className="text-muted-foreground">
                    For urgent matters, please mark your message as "URGENT" in the subject or Discord message.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-primary mb-2">Holidays & Breaks</h4>
                  <p className="text-muted-foreground">
                    Schedule may vary during holidays or personal breaks. I'll notify clients in advance.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageCircle className="w-5 h-5 text-accent" />
                  Best Time to Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold text-success mb-2">Peak Hours</h4>
                  <p className="text-muted-foreground">
                    Tuesday to Friday, 19:00 - 22:00 (UTC-3)
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-primary mb-2">Project Updates</h4>
                  <p className="text-muted-foreground">
                    I send progress updates typically on Wednesday and Friday evenings.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-warning mb-2">Weekends</h4>
                  <p className="text-muted-foreground">
                    Limited availability. Emergency responses only.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Time Zone Info</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>UTC-3 (BRT)</span>
                    <span className="text-primary font-semibold">My Time</span>
                  </div>
                  <div className="flex justify-between">
                    <span>UTC-5 (EST)</span>
                    <span className="text-muted-foreground">-2 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span>UTC+0 (GMT)</span>
                    <span className="text-muted-foreground">+3 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span>UTC+1 (CET)</span>
                    <span className="text-muted-foreground">+4 hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className="my-12" />
        
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            Need to get in touch? I'm most responsive during my work hours.
          </p>
          <p className="text-sm text-muted-foreground">
            art by: @Limnushi • Always creating something beautiful ✨
          </p>
        </div>
      </div>
    </div>
  );
};

export default WorkHoursPage;