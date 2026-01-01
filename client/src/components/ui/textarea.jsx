import React from 'react';
import { useToast } from '../../hooks/use-toast'; // correct

export default function Textarea() {
  const { toast } = useToast();

  const handleBlur = () => {
    toast({ message: 'Textarea blurred!' });
  };

  return (
    <textarea
      placeholder="Type here..."
      onBlur={handleBlur}
      className="border p-2 rounded w-full"
    />
  );
}
