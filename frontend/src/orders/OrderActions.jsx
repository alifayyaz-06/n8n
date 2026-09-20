import React, { useState } from 'react';
import { Button } from '../components/Button';
import { getAvailableActions } from '../utils/statusWorkflow';
import { CompleteOrderModal } from './CompleteOrderModal';
import { RejectOrderModal } from './RejectOrderModal';
import { CheckCircle2, XCircle } from 'lucide-react';

export function OrderActions({ orderId, status, onUpdateStatus }) {
  const actions = getAvailableActions(status);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

  const handleActionClick = (actionObj) => {
    if (actionObj.targetStatus === 'Rejected') {
      setIsRejectModalOpen(true);
    } else if (actionObj.targetStatus === 'Completed') {
      setIsCompleteModalOpen(true);
    } else {
      onUpdateStatus(actionObj.targetStatus);
    }
  };

  const handleConfirmReject = (reason) => {
    onUpdateStatus('Rejected', reason);
    setIsRejectModalOpen(false);
  };

  const handleConfirmComplete = () => {
    onUpdateStatus('Completed');
    setIsCompleteModalOpen(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-3">
        Workflow Actions
      </h3>

      <div className="flex flex-wrap items-center gap-3">
        {actions.map((act) => (
          <Button
            key={act.targetStatus}
            variant={act.variant}
            size="md"
            onClick={() => handleActionClick(act)}
            className="px-5 py-2.5 shadow-xs font-semibold"
          >
            {act.label}
          </Button>
        ))}

        {status === 'Completed' && (
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-xl w-full">
            <CheckCircle2 className="w-4 h-4" />
            <span>This order has been completed successfully. No further actions needed.</span>
          </div>
        )}

        {status === 'Rejected' && (
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-4 py-2.5 rounded-xl w-full">
            <XCircle className="w-4 h-4" />
            <span>This order was rejected. No further actions can be performed.</span>
          </div>
        )}
      </div>

      {/* Modals */}
      <RejectOrderModal
        isOpen={isRejectModalOpen}
        orderId={orderId}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={handleConfirmReject}
      />

      <CompleteOrderModal
        isOpen={isCompleteModalOpen}
        orderId={orderId}
        onClose={() => setIsCompleteModalOpen(false)}
        onConfirm={handleConfirmComplete}
      />
    </div>
  );
}
