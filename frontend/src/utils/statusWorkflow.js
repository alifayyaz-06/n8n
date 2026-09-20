/**
 * Centralized Order Status Workflow & Transition Rules
 */

import { ORDER_STATUS } from './constants';

export const ALLOWED_TRANSITIONS = {
  New: ['Accepted', 'Rejected'],
  Accepted: ['Preparing'],
  Preparing: ['Ready'],
  Ready: ['Completed'],
  Completed: [],
  Rejected: [],
};

const normalizeStatus = (status) => {
  if (!status) return '';
  const s = String(status).trim();
  if (s.toUpperCase() === 'NEW' || s.toUpperCase() === 'PENDING') return 'New';
  if (s.toUpperCase() === 'ACCEPTED') return 'Accepted';
  if (s.toUpperCase() === 'PREPARING') return 'Preparing';
  if (s.toUpperCase() === 'READY') return 'Ready';
  if (s.toUpperCase() === 'COMPLETED') return 'Completed';
  if (s.toUpperCase() === 'REJECTED') return 'Rejected';
  return s;
};

/**
 * Validates whether a status transition from currentStatus to newStatus is allowed.
 */
export function canChangeStatus(currentStatus, newStatus) {
  const normCurrent = normalizeStatus(currentStatus);
  const normTarget = normalizeStatus(newStatus);
  const allowed = ALLOWED_TRANSITIONS[normCurrent] || [];
  return allowed.includes(normTarget);
}

/**
 * Returns the next logical status in the kitchen workflow.
 */
export function getNextStatus(currentStatus) {
  const normCurrent = normalizeStatus(currentStatus);
  switch (normCurrent) {
    case 'New':
      return 'Accepted';
    case 'Accepted':
      return 'Preparing';
    case 'Preparing':
      return 'Ready';
    case 'Ready':
      return 'Completed';
    default:
      return null;
  }
}

/**
 * Returns available actions for an order based on its current status.
 */
export function getAvailableActions(status) {
  const normCurrent = normalizeStatus(status);
  switch (normCurrent) {
    case 'New':
      return [
        {
          action: 'ACCEPT',
          targetStatus: 'Accepted',
          label: 'Accept Order',
          variant: 'primary',
          requiresConfirmation: false,
        },
        {
          action: 'REJECT',
          targetStatus: 'Rejected',
          label: 'Reject Order',
          variant: 'danger',
          requiresConfirmation: true,
        },
      ];
    case 'Accepted':
      return [
        {
          action: 'PREPARE',
          targetStatus: 'Preparing',
          label: 'Mark as Preparing',
          variant: 'primary',
          requiresConfirmation: false,
        },
      ];
    case 'Preparing':
      return [
        {
          action: 'READY',
          targetStatus: 'Ready',
          label: 'Mark as Ready',
          variant: 'primary',
          requiresConfirmation: false,
        },
      ];
    case 'Ready':
      return [
        {
          action: 'COMPLETE',
          targetStatus: 'Completed',
          label: 'Mark as Completed',
          variant: 'primary',
          requiresConfirmation: true,
        },
      ];
    default:
      return [];
  }
}
