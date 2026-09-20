import React from 'react';
import { StatusBadge } from './StatusBadge';

export function Badge({ status, text, ...props }) {
  return <StatusBadge status={status} customLabel={text} {...props} />;
}
