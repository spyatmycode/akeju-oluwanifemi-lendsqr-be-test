

export interface Transaction {
    id: string;
    userId: string;
    type: 'FUND' | 'TRANSFER' | 'WITHDRAW';
    amount: number;
    recipientId?: string;
    status: 'PENDING' | 'SUCCESS' | 'FAILED';
    createdAt: Date;
  }