import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';

interface InfoModalProps {
  title: string;
  children: React.ReactNode;
  triggerText?: string;
  triggerVariant?: 'default' | 'outline' | 'ghost' | 'link';
}

export const InfoModal: React.FC<InfoModalProps> = ({ 
  title, 
  children, 
  triggerText, 
  triggerVariant = 'link' 
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} className="p-0 h-auto font-normal text-primary">
          {triggerText && <HelpCircle className="h-4 w-4 mr-1" />}
          {triggerText || title}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};
