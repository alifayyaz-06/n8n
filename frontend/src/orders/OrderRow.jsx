import React from 'react';
import { StatusBadge } from '../components/StatusBadge';
import { Button } from '../components/Button';
import { formatCurrency, formatTime, formatDate } from '../utils/formatters';
import { getWhatsAppLink } from '../utils/whatsapp';
import { Eye, CheckCircle2, XCircle, BellRing, MessageCircle } from 'lucide-react';

export function OrderRow({ order, onViewOrder, onAcceptOrder, onRejectOrder }) {
  const isNew =
    order.status === 'New' || order.status === 'Pending' || order.status === 'NEW';
  const isActionable = isNew;

  const itemsSummary = order.items
    .map((item) => `${item.quantity}x ${item.name || item.productName}`)
    .join(', ');

  const whatsappUrl = getWhatsAppLink(order.customerPhone, order.id, order.customerName);

  return (
    <>
      {/* Desktop Table Row View */}
      <tr
        className={`hidden md:table-row border-b border-slate-200 transition-colors group ${
          isNew
            ? 'bg-amber-50/80 border-l-4 border-l-amber-500 hover:bg-amber-100/80 animate-pulse'
            : 'hover:bg-slate-50'
        }`}
      >
        {/* Order # */}
        <td className="py-4 px-4 align-middle font-semibold text-xs sm:text-sm text-slate-900">
          <div className="flex items-center gap-2">
            <span className="font-mono text-emerald-700 font-bold">{order.id}</span>
            {isNew && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded-full">
                <BellRing className="w-3 h-3 text-amber-600 animate-bounce" /> New!
              </span>
            )}
          </div>
        </td>

        {/* Customer */}
        <td className="py-4 px-4 align-middle">
          <div className="text-sm font-bold text-slate-900">{order.customerName}</div>
          <div className="text-xs text-slate-500 font-mono mt-0.5">{order.customerPhone}</div>
        </td>

        {/* Items Summary */}
        <td className="py-4 px-4 align-middle max-w-sm">
          <div className="text-xs text-slate-700 line-clamp-2 leading-relaxed" title={itemsSummary}>
            {itemsSummary}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
            {order.items.length} item{order.items.length > 1 ? 's' : ''}
          </div>
        </td>

        {/* Total */}
        <td className="py-4 px-4 align-middle whitespace-nowrap">
          <div className="text-sm font-bold text-slate-900 font-mono">{formatCurrency(order.totalAmount)}</div>
          <div className="text-[10px] text-slate-500">{order.paymentMethod || 'Paid'}</div>
        </td>

        {/* Time */}
        <td className="py-4 px-4 align-middle whitespace-nowrap">
          <div className="text-xs text-slate-700 font-medium">{formatTime(order.orderTime)}</div>
          <div className="text-[11px] text-slate-500">{formatDate(order.orderTime)}</div>
        </td>

        {/* Status */}
        <td className="py-4 px-4 align-middle whitespace-nowrap">
          <StatusBadge status={order.status} />
        </td>

        {/* Actions */}
        <td className="py-4 px-4 align-middle whitespace-nowrap text-right">
          <div className="flex items-center justify-end gap-1.5">
            {/* WhatsApp Chat Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Chat on WhatsApp"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span>WhatsApp</span>
            </a>

            {/* View Details Button */}
            <button
              onClick={() => onViewOrder(order)}
              title="View Details"
              className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 transition-colors border border-slate-300 shadow-xs"
            >
              <Eye className="w-4 h-4" />
            </button>

            {isActionable && (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onAcceptOrder(order.id)}
                  className="gap-1 px-2.5 py-1 text-xs font-bold"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Accept</span>
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onRejectOrder(order)}
                  className="gap-1 px-2.5 py-1 text-xs font-bold"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </Button>
              </>
            )}
          </div>
        </td>
      </tr>

      {/* Mobile Card View */}
      <div
        className={`block md:hidden border rounded-xl p-4 space-y-3 mb-3 shadow-xs ${
          isNew
            ? 'bg-amber-50/90 border-2 border-amber-400 animate-pulse'
            : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-emerald-700 font-bold text-sm">{order.id}</span>
              <StatusBadge status={order.status} />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mt-1">{order.customerName}</h3>
            <p className="text-xs text-slate-500 font-mono">{order.customerPhone}</p>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-slate-900 font-mono">{formatCurrency(order.totalAmount)}</span>
            <p className="text-[11px] text-slate-500 mt-0.5">{formatTime(order.orderTime)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          <div className="flex items-center gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold shadow-xs"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span>WhatsApp</span>
            </a>
            <button
              onClick={() => onViewOrder(order)}
              className="flex items-center gap-1 text-xs text-slate-600 hover:text-emerald-700 font-bold transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Details</span>
            </button>
          </div>

          {isActionable && (
            <div className="flex items-center gap-2">
              <Button variant="danger" size="sm" onClick={() => onRejectOrder(order)}>
                Reject
              </Button>
              <Button variant="primary" size="sm" onClick={() => onAcceptOrder(order.id)}>
                Accept
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
