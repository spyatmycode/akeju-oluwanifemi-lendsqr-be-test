export interface User {
    id: string;
    name: string;
    email: string;
    karmaStatus: 'clean' | 'blacklisted';
    createdAt: Date;
  }