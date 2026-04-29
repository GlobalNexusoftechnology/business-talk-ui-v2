'use client';

import { Suspense } from 'react';
import MessagesClient from './MessagesClient';

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading messages...</div>}>
      <MessagesClient />
    </Suspense>
  );
}