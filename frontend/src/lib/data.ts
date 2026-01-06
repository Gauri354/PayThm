import type { Transaction, User, BillCategory, BillSplit, Achievement } from '@/lib/types';
import placeholderImagesData from './placeholder-images.json';
const imagePlaceholders = placeholderImagesData.placeholderImages;
import { Landmark, UsersRound, Receipt, Send, ScanQrCode, QrCode, Store, ShieldCheck, LayoutDashboard, ArrowRightLeft, Lightbulb, UserCog, BotMessageSquare, Award, Star, Zap, PieChart } from 'lucide-react';
import type { ImagePlaceholder } from './placeholder-images';

export const placeholderImages: ImagePlaceholder[] = imagePlaceholders;

export const userProfile: User = {
  id: 'user-001',
  name: 'Ananya Sharma',
  phone: '+91 98765 43210',
  email: 'ananya.sharma@example.com',
  joinDate: '2023-01-15',
  kycStatus: 'Verified',
  avatarUrl: placeholderImages.find(p => p.id === 'user1')?.imageUrl || '',
};

export const transactions: Transaction[] = [
  { id: 'txn-001', date: '2024-07-20T10:30:00Z', name: 'Starbucks', type: 'Debit', amount: 450.00, status: 'Completed', category: 'Merchant Payment' },
  { id: 'txn-002', date: '2024-07-20T09:15:00Z', name: 'Wallet Top-up', type: 'Credit', amount: 5000.00, status: 'Completed', category: 'Wallet Top-up' },
  { id: 'txn-003', date: '2024-07-19T18:00:00Z', name: 'Rahul Verma', type: 'Debit', amount: 2000.00, status: 'Completed', category: 'Send Money' },
  { id: 'txn-004', date: '2024-07-19T12:45:00Z', name: 'Adani Electricity', type: 'Debit', amount: 1250.50, status: 'Completed', category: 'Bill Payment' },
  { id: 'txn-005', date: '2024-07-18T14:20:00Z', name: 'Jio Recharge', type: 'Debit', amount: 299.00, status: 'Completed', category: 'Recharge' },
  { id: 'txn-006', date: '2024-07-18T11:00:00Z', name: 'Amazon India', type: 'Debit', amount: 1200.00, status: 'Pending', category: 'Merchant Payment' },
  { id: 'txn-007', date: '2024-07-17T20:05:00Z', name: 'Netflix', type: 'Debit', amount: 649.00, status: 'Completed', category: 'Bill Payment' },
  { id: 'txn-008', date: '2024-07-17T08:00:00Z', name: 'Vikram Singh', type: 'Credit', amount: 1000.00, status: 'Completed', category: 'Send Money' },
];

export const users: User[] = [
  userProfile,
  { id: 'user-002', name: 'Rahul Verma', phone: '+91 98765 12345', email: 'rahul.verma@example.com', joinDate: '2023-02-20', kycStatus: 'Pending', avatarUrl: placeholderImages.find(p => p.id === 'user2')?.imageUrl || '' },
  { id: 'user-003', name: 'Priya Patel', phone: '+91 99887 76655', email: 'priya.patel@example.com', joinDate: '2023-03-10', kycStatus: 'Not Submitted', avatarUrl: 'https://picsum.photos/seed/user3/100/100' },
  { id: 'user-004', name: 'Amit Kumar', phone: '+91 91234 56789', email: 'amit.kumar@example.com', joinDate: '2023-04-01', kycStatus: 'Verified', avatarUrl: 'https://picsum.photos/seed/user4/100/100' },
];

export const billCategories: BillCategory[] = [
  { id: 'bill-01', name: 'Mobile Recharge', icon: Receipt },
  { id: 'bill-02', name: 'Electricity', icon: Receipt },
  { id: 'bill-03', name: 'DTH Recharge', icon: Receipt },
  { id: 'bill-04', name: 'Gas Cylinder', icon: Receipt },
  { id: 'bill-05', name: 'Broadband', icon: Receipt },
  { id: 'bill-06', name: 'Water Bill', icon: Receipt },
  { id: 'bill-07', name: 'Credit Card', icon: Receipt },
  { id: 'bill-08', name: 'More', icon: Receipt },
];

export const billSplits: BillSplit[] = [
  {
    id: 'split-001',
    description: 'Dinner at Punjab Grill',
    totalAmount: 3500.00,
    date: '2024-07-18',
    status: 'Pending',
    participants: [
      { name: 'You', amount: 1166.00, status: 'Paid' },
      { name: 'Rahul Verma', amount: 1167.00, status: 'Unpaid' },
      { name: 'Priya Patel', amount: 1167.00, status: 'Unpaid' },
    ]
  },
  {
    id: 'split-002',
    description: 'Weekend Trip Fuel',
    totalAmount: 2500.00,
    date: '2024-07-12',
    status: 'Settled',
    participants: [
      { name: 'You', amount: 833.00, status: 'Paid' },
      { name: 'Amit Kumar', amount: 833.00, status: 'Paid' },
      { name: 'Priya Patel', amount: 834.00, status: 'Paid' },
    ]
  },
];

export const achievements: Achievement[] = [
  { id: 'ach-001', title: 'First Payment', description: 'Made your first transaction.', icon: Award, achieved: true },
  { id: 'ach-002', title: 'Bill Master', description: 'Paid 3 bills in a month.', icon: Star, achieved: true },
  { id: 'ach-003', title: 'Quick Payer', description: 'Sent money using Scan & Pay.', icon: Zap, achieved: false },
  { id: 'ach-004', title: 'Top-up Pro', description: 'Added money to your wallet 5 times.', icon: Award, achieved: false },
];

export const navLinks = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/send-money',
    label: 'Payments',
    icon: ArrowRightLeft,
  },
  {
    href: '/bills',
    label: 'Bill Payments',
    icon: Receipt,
  },
  {
    href: '/split-bill',
    label: 'Split Bill',
    icon: UsersRound,
  },
  {
    href: '/insights',
    label: 'AI Insights',
    icon: BotMessageSquare,
  },
  {
    href: '/savings',
    label: 'Savings Goals',
    icon: Landmark,
  },
  {
    href: '/budget',
    label: 'Budget Planner',
    icon: PieChart,
  },
  {
    href: '/rewards',
    label: 'Rewards & Deals',
    icon: Award,
  }
];

export const adminNavLinks = [
  {
    href: '/admin',
    label: 'Admin Panel',
    icon: ShieldCheck,
  },
  {
    href: '/merchant',
    label: 'Merchant Dashboard',
    icon: Store,
  },
  {
    href: '/admin?tab=users',
    label: 'User Management',
    icon: UsersRound,
  },
];
