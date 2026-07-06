export interface UserProfile {
  name: string;
  email: string;
  passcode: string;
  accountNumber: string;
  savingsBalance: number;
  creditBalance: number;
}

export interface Transaction {
  id: string;
  amount: number;
  date: string;
  description: string;
  category: 'Food & Dining' | 'Income' | 'Shopping' | 'Utilities' | 'Subscriptions' | 'Transport' | 'Investment';
  type: 'debit' | 'credit';
  status: 'completed' | 'pending';
  referenceNumber: string;
  fee: number;
}


