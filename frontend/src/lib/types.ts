export type Transaction = {
  id: string;
  date: string;
  name: string;
  type: 'Credit' | 'Debit';
  amount: number;
  status: 'Completed' | 'Pending' | 'Failed';
  category: 'Send Money' | 'Bill Payment' | 'Recharge' | 'Merchant Payment' | 'Wallet Top-up';
};

export type User = {
  id: string;
  name: string;
  phone: string;
  email: string;
  joinDate: string;
  kycStatus: 'Verified' | 'Pending' | 'Not Submitted';
  avatarUrl: string;
};

export type BillCategory = {
  id: string;
  name: string;
  icon: React.ElementType;
};

export type BillSplit = {
  id: string;
  description: string;
  totalAmount: number;
  participants: { name: string; amount: number; status: 'Paid' | 'Unpaid' }[];
  date: string;
  status: 'Settled' | 'Pending';
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  achieved: boolean;
};
