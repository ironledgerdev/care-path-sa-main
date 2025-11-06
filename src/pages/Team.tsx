import React from 'react';
import { Linkedin, Mail, Crown, Users, TrendingUp, Phone, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';

const Team = () => {
  const teamMembers = [
    {
      name: 'Ofentse Mashau',
      role: 'Founder & CEO',
      icon: <Crown className="h-6 w-6" />,
      image: 'https://cdn.builder.io/api/v1/image/assets%2Faf68e484decf46379ccbfc0f4be45e74%2F367b8b1b56084f9b8f9f2ed827964001?format=webp&width=800',
      description: 'Visionary leader with extensive experience in healthcare technology and business strategy. Passionate about transforming South African healthcare through innovation.',
      gradient: 'from-primary to-primary-soft',
      expertise: ['Strategic Leadership', 'Healthcare Innovation', 'Business Development', 'Technology Vision']
    },
    {
      name: 'Tshepo Nomtshongwa',
      role: 'Chief Operating Officer',
      icon: <Users className="h-6 w-6" />,
      image: 'https://cdn.builder.io/api/v1/image/assets%2Faf68e484decf46379ccbfc0f4be45e74%2F066892fc0be64bc9abc64d28cf414f8a?format=webp&width=800',
      description: 'Operations expert ensuring seamless platform functionality and exceptional user experience. Masters in optimizing healthcare delivery systems.',
      gradient: 'from-blue-500 to-blue-600',
      expertise: ['Operations Management', 'Process Optimization', 'Quality Assurance', 'Team Leadership']
    },
    {
      name: 'Steve Thabethe',
      role: 'Director of Marketing',
      icon: <TrendingUp className="h-6 w-6" />,
      image: 'https://cdn.builder.io/api/v1/image/assets%2Faf68e484decf46379ccbfc0f4be45e74%2F5b8e901410a840c58eba4a41a7f85103?format=webp&width=800',
      description: 'Creative marketing strategist driving brand awareness and user acquisition across South Africa. Expert in digital marketing and brand positioning.',
      gradient: 'from-green-500 to-green-600',
      expertise: ['Digital Marketing', 'Brand Strategy', 'User Acquisition', 'Content Strategy']
    },
    {
      name: 'Sakhile Mabaso',
      role: 'Director of Customer Service',
      icon: <Phone className="h-6 w-6" />,
      image: 'https://cdn.builder.io/api/v1/image/assets%2Faf68e484decf46379ccbfc0f4be45e74%2F0486c5972e4f4e07aa15aeb1f4a7650a?format=webp&width=800',
      imagePosition: 'top',
      description: 'Customer experience champion ensuring every interaction exceeds expectations. Dedicated to building trust and satisfaction among our community.',
      gradient: 'from-purple-500 to-purple-600',
      expertise: ['Customer Experience', 'Support Operations', 'Relationship Management', 'Service Excellence']
    },
    {
      name: 'Kuhlula Madumo',
      role: 'Head of Sales',
      icon: <Target className="h-6 w-6" />,
      description: 'Sales leader focused on expanding our network of healthcare providers and driving platform growth. Expert in building strategic partnerships.',
      gradient: 'from-orange-500 to-orange-600',
      expertise: ['Sales Strategy', 'Partnership Development', 'Revenue Growth', 'Market Expansion']
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Meet Our Team</span>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold text-medical-gradient mb-6">
            The People Behind MedMap
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Our diverse team of healthcare technology experts, business leaders, and customer advocates 
            are united by a common vision: revolutionizing healthcare access across South Africa.
          </p>
        </div>

        {/* Team Introduction */}
        <Card className="medical-hero-card mb-16 max-w-4xl mx-auto">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold text-medical-gradient mb-4">
              Driven by Purpose, United by Vision
            </h2>
            <p className="text-lg text-foreground leading-relaxed mb-6">
              Each member of our leadership team brings unique expertise and a shared commitment to 
              making healthcare more accessible, transparent, and efficient for all South Africans. 
              Together, we're building more than just a platform – we're creating a movement.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">25+</div>
                <div className="text-sm text-muted-foreground">Years Combined Experience</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground">South African Leadership</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">1</div>
                <div className="text-sm text-muted-foreground">Shared Vision</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Members Grid */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">
          {teamMembers.map((member) => (
            <Card key={member.name} className="medical-hero-card hover:scale-105 transition-all duration-500">
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  {/* Avatar photo if provided, else gradient placeholder */}
                  {('image' in member && (member as any).image) ? (
                    <img
                      src={(member as any).image}
                      alt={member.name}
                      className={`w-20 h-20 rounded-2xl object-cover ${('imagePosition' in (member as any) && (member as any).imagePosition === 'top') ? 'object-top' : 'object-center'} ring-2 ring-primary/30 flex-shrink-0`}
                      loading="lazy"
                    />
                  ) : (
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${member.gradient} flex items-center justify-center text-white flex-shrink-0`}>
                      {member.icon}
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-medical-gradient mb-1">
                      {member.name}
                    </h3>
                    <p className="text-primary font-medium mb-4">{member.role}</p>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                      {member.description}
                    </p>
                    
                    {/* Expertise Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {member.expertise.map((skill) => (
                        <span 
                          key={skill}
                          className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    
                    {/* Contact Actions */}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="text-xs">
                        <Linkedin className="h-3 w-3 mr-1" />
                        LinkedIn
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs">
                        <Mail className="h-3 w-3 mr-1" />
                        Email
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="medical-hero-card max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-medical-gradient mb-4">
                Want to Join Our Mission?
              </h2>
              <p className="text-muted-foreground mb-6">
                We're always looking for passionate individuals who share our vision 
                of transforming healthcare in South Africa.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="btn-medical-primary">
                  View Open Positions
                </Button>
                <Button variant="outline" className="btn-medical-secondary">
                  Contact Our Team
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Team;
