import React from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardShell from '@/components/layout/dashboard-shell';
import EmergencyButton from '@/components/emergency/emergency-button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Helmet } from 'react-helmet';
import { 
  AlertTriangle, 
  AlertOctagon, 
  PhoneCall, 
  Cross, 
  Car, 
  Shield, 
  Clock
} from 'lucide-react';

export default function DriverEmergencyPage() {
  const { user } = useAuth();
  
  // Fetch active trip for driver
  const { 
    data: activeTrip,
    isLoading: isLoadingTrip
  } = useQuery({
    queryKey: ['/api/trips/active'],
    enabled: !!user,
  });
  
  // Fetch emergency contacts
  const {
    data: emergencyContacts,
    isLoading: isLoadingContacts
  } = useQuery({
    queryKey: ['/api/emergency-contacts'],
    enabled: !!user,
  });

  return (
    <DashboardShell requireAuth={true} allowedRoles={['driver']}>
      <Helmet>
        <title>Emergency - ShuttleMate</title>
        <meta name="description" content="Access emergency procedures and alert system for school bus transportation incidents." />
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Emergency Procedures</h1>
        </div>
        
        <Card className="bg-red-50 border border-red-200">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center">
              <AlertOctagon className="h-6 w-6 mr-2" />
              Emergency Alert
            </CardTitle>
            <CardDescription className="text-red-600">
              Press the button below ONLY in case of genuine emergency. This will alert school officials, transportation department, and emergency services if necessary.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingTrip ? (
              <div className="animate-pulse">
                <div className="h-16 bg-red-200 rounded"></div>
              </div>
            ) : !activeTrip ? (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      You need an active trip to use the emergency alert. Please start a trip from the Students page first.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <EmergencyButton
                tripId={activeTrip.id}
                driverId={user!.id}
                size="lg"
                className="w-full py-8 text-xl"
              />
            )}
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="flex flex-col items-center py-6 h-auto">
                  <Clock className="h-8 w-8 mb-2 text-yellow-500" />
                  <span>Report Delay</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center py-6 h-auto">
                  <Cross className="h-8 w-8 mb-2 text-red-500" />
                  <span>Medical Assistance</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center py-6 h-auto">
                  <Car className="h-8 w-8 mb-2 text-blue-500" />
                  <span>Vehicle Issue</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center py-6 h-auto">
                  <PhoneCall className="h-8 w-8 mb-2 text-green-500" />
                  <span>Contact Dispatch</span>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contacts</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingContacts ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-16 bg-gray-200 rounded"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center">
                      <AlertOctagon className="h-6 w-6 text-red-500 mr-3" />
                      <div>
                        <h3 className="font-semibold text-red-700">Emergency Services</h3>
                        <p className="text-red-600">911</p>
                      </div>
                    </div>
                    <Button variant="destructive" size="sm" className="rounded-full w-10 h-10 p-0">
                      <PhoneCall className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  {emergencyContacts && Array.isArray(emergencyContacts) && emergencyContacts.map((contact: any) => (
                    <div key={contact.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center">
                        <Shield className="h-6 w-6 text-royal-blue mr-3" />
                        <div>
                          <h3 className="font-semibold">{contact.name}</h3>
                          <p className="text-gray-600">{contact.phone}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="rounded-full w-10 h-10 p-0">
                        <PhoneCall className="h-5 w-5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Emergency Procedures</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="medical">
                <AccordionTrigger>
                  <div className="flex items-center">
                    <Cross className="h-5 w-5 mr-2 text-red-500" />
                    <span>Medical Emergency</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Stop the bus in a safe location away from traffic</li>
                    <li>Put on hazard lights and set up reflective triangles if needed</li>
                    <li>Assess the situation and provide first aid if you are trained to do so</li>
                    <li>Use the Emergency Button for serious medical issues</li>
                    <li>Call 911 if it's a life-threatening emergency</li>
                    <li>Contact dispatch to inform them of the situation</li>
                    <li>Do not move a seriously injured person unless they are in immediate danger</li>
                    <li>Keep other students calm and away from the affected student</li>
                    <li>Document the incident after resolution</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="vehicle">
                <AccordionTrigger>
                  <div className="flex items-center">
                    <Car className="h-5 w-5 mr-2 text-blue-500" />
                    <span>Vehicle Breakdown</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Pull over to a safe location away from traffic</li>
                    <li>Activate hazard lights</li>
                    <li>Set up reflective triangles according to regulations</li>
                    <li>Contact dispatch immediately to report the breakdown</li>
                    <li>Keep students on the bus unless there is a safety concern</li>
                    <li>If evacuation is necessary, move students to a safe location</li>
                    <li>Remain with students at all times</li>
                    <li>Wait for replacement transportation or mechanical assistance</li>
                    <li>Document the incident after resolution</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="behavior">
                <AccordionTrigger>
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-purple-500" />
                    <span>Severe Behavior Issues</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Stop the bus in a safe location if necessary</li>
                    <li>Use verbal de-escalation techniques</li>
                    <li>Separate students involved in conflicts</li>
                    <li>Contact dispatch or school administration if needed</li>
                    <li>Do not physically intervene unless there is imminent danger</li>
                    <li>Document specific behaviors, statements, and actions taken</li>
                    <li>Follow up with appropriate school personnel</li>
                    <li>Consider assigned seating to prevent future incidents</li>
                    <li>File a formal incident report through the ShuttleMate app</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="weather">
                <AccordionTrigger>
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
                    <span>Severe Weather</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Monitor weather conditions and alerts during your route</li>
                    <li>In case of severe weather, find a safe location to stop</li>
                    <li>Avoid stopping under trees, power lines, or bridges</li>
                    <li>For tornados, evacuate to a nearby sturdy building if possible</li>
                    <li>If evacuation isn't possible, have students assume the protective position</li>
                    <li>Contact dispatch to report your situation and location</li>
                    <li>Wait for the severe weather to pass before continuing</li>
                    <li>Follow district procedures for weather emergencies</li>
                    <li>Document the incident after resolution</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
