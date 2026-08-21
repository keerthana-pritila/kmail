export interface EmailInterface {
  id?: string;
  sender: string;
  senderEmail: string;
  to: string;
  subject: string;
  message: string;
  category: 'primary' | 'promotions' | 'social' | 'sent' |'draft'  ;
  date: string;

  // true = email has been opened
  // false = email is unread
  read: boolean;

  starred: boolean;
  attachmentName?: string;
  attachmentUrl?: string;
  
}
