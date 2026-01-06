'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ShieldCheck, ShieldAlert, MoreHorizontal, UserCheck, UserX } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import axios from 'axios';
import { useToast } from "@/hooks/use-toast";

interface User {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    kycStatus: 'VERIFIED' | 'PENDING' | 'REJECTED' | 'NOT_SUBMITTED';
    role: string;
    joinedDate: string;
}

// Mock Data for fallback until backend endpoints are fully ready
const MOCK_USERS: User[] = [
    { id: 101, fullName: "Rahul Sharma", email: "rahul@example.com", phone: "9876543210", kycStatus: "VERIFIED", role: "USER", joinedDate: "2024-01-15" },
    { id: 102, fullName: "Priya V", email: "priya@test.com", phone: "9988776655", kycStatus: "PENDING", role: "USER", joinedDate: "2024-02-20" },
    { id: 103, fullName: "Amit Kumar", email: "amit.k@demo.com", phone: "8899001122", kycStatus: "NOT_SUBMITTED", role: "MERCHANT", joinedDate: "2024-03-05" },
    { id: 104, fullName: "Admin User", email: "admin@paythm.com", phone: "1234567890", kycStatus: "VERIFIED", role: "ADMIN", joinedDate: "2023-11-01" },
];

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>(MOCK_USERS);
    const [searchTerm, setSearchTerm] = useState("");
    const { toast } = useToast();

    // Ideally fetch from API
    useEffect(() => {
        // const fetchUsers = async () => { ... }
        // fetchUsers();
    }, []);

    const handleKycAction = (userId: number, action: 'APPROVE' | 'REJECT') => {
        setUsers(users.map(u =>
            u.id === userId ? { ...u, kycStatus: action === 'APPROVE' ? 'VERIFIED' : 'REJECTED' } : u
        ));

        toast({
            title: action === 'APPROVE' ? "KYC Approved" : "KYC Rejected",
            description: `User ID ${userId} status updated.`,
            variant: action === 'APPROVE' ? "default" : "destructive"
        });
    };

    const filteredUsers = users.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm)
    );

    return (
        <div className="flex flex-col gap-8 pb-10 max-w-7xl mx-auto p-6">
            <PageHeader
                title="User Management"
                description="Admin user directory, KYC verification, and access control."
            />

            <Card className="border-none shadow-md bg-white dark:bg-zinc-900">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>All Users</CardTitle>
                        <CardDescription>Manage {users.length} registered accounts.</CardDescription>
                    </div>
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, email, or phone..."
                            className="pl-9 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead>User</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>KYC Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((user) => (
                                <TableRow key={user.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                                    <TableCell className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs font-bold">
                                                {user.fullName.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{user.fullName}</span>
                                            <span className="text-xs text-muted-foreground">ID: {user.id}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-sm">
                                            <span>{user.email}</span>
                                            <span className="text-muted-foreground text-xs">{user.phone}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="border-zinc-300 dark:border-zinc-700">
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            className={
                                                user.kycStatus === 'VERIFIED' ? "bg-green-100 text-green-700 hover:bg-green-200" :
                                                    user.kycStatus === 'PENDING' ? "bg-amber-100 text-amber-700 hover:bg-amber-200" :
                                                        user.kycStatus === 'REJECTED' ? "bg-red-100 text-red-700 hover:bg-red-200" :
                                                            "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                                            }
                                        >
                                            {user.kycStatus === 'VERIFIED' && <ShieldCheck className="w-3 h-3 mr-1" />}
                                            {user.kycStatus === 'REJECTED' && <ShieldAlert className="w-3 h-3 mr-1" />}
                                            {user.kycStatus === 'PENDING' && <span className="w-2 h-2 rounded-full bg-amber-500 mr-2 animate-pulse" />}
                                            {user.kycStatus.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id.toString())}>
                                                    Copy User ID
                                                </DropdownMenuItem>
                                                {user.kycStatus === 'PENDING' && (
                                                    <>
                                                        <DropdownMenuItem onClick={() => handleKycAction(user.id, 'APPROVE')} className="text-green-600 focus:text-green-700">
                                                            <UserCheck className="mr-2 h-4 w-4" /> Approve KYC
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleKycAction(user.id, 'REJECT')} className="text-red-600 focus:text-red-700">
                                                            <UserX className="mr-2 h-4 w-4" /> Reject KYC
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                                <DropdownMenuItem className="text-red-500">
                                                    Block Account
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
