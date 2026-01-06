'use client';

import React from 'react';
import { PageHeader } from "@/components/page-header";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function HelpPage() {
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast({ title: "Message Sent", description: "Our support team will contact you shortly." });
    };

    return (
        <div className="flex flex-col gap-8 pb-10 max-w-5xl mx-auto">
            <PageHeader title="Help & Support" description="Get assistance and find answers to common questions." />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* FAQs */}
                <Card>
                    <CardHeader>
                        <CardTitle>Frequently Asked Questions</CardTitle>
                        <CardDescription>Quick answers to common queries.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger>How do I reset my UPI PIN?</AccordionTrigger>
                                <AccordionContent>
                                    Go to Payment Settings &gt; UPI &gt; Forgot PIN. You will need your debit card details to set a new PIN.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2">
                                <AccordionTrigger>Where can I see my transaction history?</AccordionTrigger>
                                <AccordionContent>
                                    You can view your recent transactions on the Dashboard or go to the "Payments" tab for a full history.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-3">
                                <AccordionTrigger>Is my wallet balance safe?</AccordionTrigger>
                                <AccordionContent>
                                    Yes, PayThm uses bank-grade security and encryption to keep your money and data safe.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-4">
                                <AccordionTrigger>How to complete KYC?</AccordionTrigger>
                                <AccordionContent>
                                    Visit Profile Settings &gt; KYC Certification. Upload your PAN card and Aadhaar details for instant verification.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>

                {/* Contact Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Contact Support</CardTitle>
                        <CardDescription>Can't find what you're looking for? Message us.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Input placeholder="Your Name" required />
                                </div>
                                <div className="space-y-2">
                                    <Input placeholder="Email Address" type="email" required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Input placeholder="Subject" required />
                            </div>
                            <div className="space-y-2">
                                <Textarea placeholder="Describe your issue..." className="min-h-[120px]" required />
                            </div>
                            <Button type="submit" className="w-full">Send Message</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* Direct Contact Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="text-center group hover:border-indigo-500 transition-colors cursor-pointer">
                    <CardContent className="pt-6 flex flex-col items-center gap-3">
                        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full group-hover:scale-110 transition-transform">
                            <Phone className="h-6 w-6" />
                        </div>
                        <h3 className="font-bold">Call Us</h3>
                        <p className="text-sm text-muted-foreground">+91 1800-123-4567</p>
                    </CardContent>
                </Card>
                <Card className="text-center group hover:border-indigo-500 transition-colors cursor-pointer">
                    <CardContent className="pt-6 flex flex-col items-center gap-3">
                        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full group-hover:scale-110 transition-transform">
                            <Mail className="h-6 w-6" />
                        </div>
                        <h3 className="font-bold">Email Us</h3>
                        <p className="text-sm text-muted-foreground">support@paythm.com</p>
                    </CardContent>
                </Card>
                <Card className="text-center group hover:border-indigo-500 transition-colors cursor-pointer">
                    <CardContent className="pt-6 flex flex-col items-center gap-3">
                        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full group-hover:scale-110 transition-transform">
                            <MessageSquare className="h-6 w-6" />
                        </div>
                        <h3 className="font-bold">Chat Now</h3>
                        <p className="text-sm text-muted-foreground">Available 24/7</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
