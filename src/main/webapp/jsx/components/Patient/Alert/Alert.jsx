import React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Button,
} from '@/components/ui/card';

export const Alert = ({ show, title, body, footer, onClose }) => {
  if (!show) return <></>;

  return (
    <Card className="max-w-md mx-auto mt-4">
      <CardHeader>
        <h2 className="text-lg font-bold">{title}</h2>
      </CardHeader>
      <CardContent>
        <p>{body}</p>
      </CardContent>
      <CardFooter>
        <div className="flex justify-between items-center">
          <span>{footer}</span>
          <Button onClick={onClose} className="ml-4">
            Close
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
