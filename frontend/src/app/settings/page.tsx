'use client';

import React from 'react';
import { PageHeader } from "@/components/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Lock, Bell, Moon, Sun, Shield, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Cookies from 'js-cookie';
import { useSearchParams } from 'next/navigation';

export default function SettingsPage() {
    const { toast } = useToast();
    const [user, setUser] = React.useState<any>(null);

    React.useEffect(() => {
        const stored = localStorage.getItem("user");
        if (stored) {
            const parsed = JSON.parse(stored);
            setUser(parsed.user || parsed);
        }
    }, []);

    const handleSave = () => {
        toast({ title: "Settings Saved", description: "Your changes have been updated successfully." });
    };

    const handleLogout = () => {
        Cookies.remove("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
    };

    const searchParams = useSearchParams();
    const defaultTab = searchParams.get('tab') || 'profile';

    if (!user) return <div className="p-8">Loading...</div>;

    return (
        <div className="flex flex-col gap-8 pb-10 max-w-5xl mx-auto">
            <PageHeader title="Settings & Support" description="Manage your account, security, and get help." />

            <Tabs defaultValue={defaultTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="preferences">Preferences</TabsTrigger>
                    <TabsTrigger value="help">Help</TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-4 py-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Update your public profile details.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-6">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={user.avatarUrl} />
                                    <AvatarFallback className="text-xl bg-indigo-100 text-indigo-700">{user.fullName?.[0]}</AvatarFallback>
                                </Avatar>
                                <Button variant="outline">Change Avatar</Button>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" defaultValue={user.fullName} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" defaultValue={user.email} disabled className="bg-muted" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input id="phone" defaultValue={user.phone} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="paythmid">PayThm ID</Label>
                                    <Input id="paythmid" defaultValue={user.paythmId || user.id + "@paythm"} disabled className="bg-muted" />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSave}>Save Changes</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security" className="space-y-4 py-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Password & Security</CardTitle>
                            <CardDescription>Manage your password and 2FA settings.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="current-pass">Current Password</Label>
                                <Input id="current-pass" type="password" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-pass">Transactions PIN (4-digit)</Label>
                                <Input id="new-pass" type="password" maxLength={4} placeholder="Update PIN" />
                            </div>
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Two-Factor Authentication</Label>
                                    <p className="text-sm text-muted-foreground">Add an extra layer of security.</p>
                                </div>
                                <Switch />
                            </div>
                        </CardContent>
                        <CardFooter className="justify-between">
                            <Button variant="destructive" onClick={handleLogout}>
                                <LogOut className="mr-2 h-4 w-4" /> Log out of all devices
                            </Button>
                            <Button onClick={handleSave}>Update Security</Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-red-500">Danger Zone</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                            <Button variant="destructive" className="border-red-200 text-red-600 hover:bg-red-50">Delete Account</Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Preferences Tab */}
                <TabsContent value="preferences" className="space-y-4 py-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>App Preferences</CardTitle>
                            <CardDescription>Customize your experience.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Email Notifications</Label>
                                    <p className="text-sm text-muted-foreground">Receive emails about new features and activities.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Transaction Alerts</Label>
                                    <p className="text-sm text-muted-foreground">Get notified for every transaction.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSave}>Save Preferences</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* Help Tab */}
                <TabsContent value="help" className="space-y-4 py-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Help & Support</CardTitle>
                            <CardDescription>We're here to help you with any issues.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg">Frequently Asked Questions</h3>
                                <div className="space-y-2">
                                    <details className="group p-4 border rounded-lg open:bg-zinc-50 dark:open:bg-zinc-900">
                                        <summary className="font-medium cursor-pointer list-none flex justify-between items-center text-sm">
                                            How do I reset my transaction PIN?
                                            <span className="group-open:rotate-180 transition-transform">▼</span>
                                        </summary>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Go to the Security tab and enter a new PIN in the "Transactions PIN" field, then click Update Security.
                                        </p>
                                    </details>
                                    <details className="group p-4 border rounded-lg open:bg-zinc-50 dark:open:bg-zinc-900">
                                        <summary className="font-medium cursor-pointer list-none flex justify-between items-center text-sm">
                                            What if my payment fails?
                                            <span className="group-open:rotate-180 transition-transform">▼</span>
                                        </summary>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            If a payment fails, the amount will be refunded to your wallet within 24-48 hours. Secure the Transaction ID for support.
                                        </p>
                                    </details>
                                    <details className="group p-4 border rounded-lg open:bg-zinc-50 dark:open:bg-zinc-900">
                                        <summary className="font-medium cursor-pointer list-none flex justify-between items-center text-sm">
                                            How to complete KYC?
                                            <span className="group-open:rotate-180 transition-transform">▼</span>
                                        </summary>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            KYC is verified automatically upon signup using your bank details. Status is shown in your profile dropdown.
                                        </p>
                                    </details>
                                </div>
                            </div>

                            <div className="pt-4 border-t">
                                <h3 className="font-semibold text-lg mb-4">Contact Support</h3>
                                <div className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="subject">Subject</Label>
                                        <Input id="subject" placeholder="I have an issue with..." />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="message">Message</Label>
                                        <textarea
                                            id="message"
                                            className="min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                            placeholder="Describe your issue in detail..."
                                        />
                                    </div>
                                    <Button onClick={() => toast({ title: "Ticket Submitted", description: "Support team will contact you shortly via email." })}>
                                        Submit Ticket
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
