import React from 'react';
import { User, Phone, MapPin, Mail, MessageCircle } from 'lucide-react';
import { getWhatsAppLink } from '../utils/whatsapp';

export function CustomerInfo({ order }) {
  if (!order) return null;

  const whatsappUrl = getWhatsAppLink(order.customerPhone, order.id, order.customerName);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Customer & Delivery Details
        </h3>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
        >
          <MessageCircle className="w-4 h-4 fill-current" />
          <span>Chat on WhatsApp</span>
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        {/* Customer Name */}
        <div className="space-y-1">
          <span className="text-slate-500 flex items-center gap-1.5 font-medium">
            <User className="w-4 h-4 text-slate-400" /> Customer Name
          </span>
          <p className="text-sm font-bold text-slate-900">{order.customerName}</p>
        </div>

        {/* Phone Number & WhatsApp Button */}
        <div className="space-y-1">
          <span className="text-slate-500 flex items-center gap-1.5 font-medium">
            <Phone className="w-4 h-4 text-slate-400" /> Phone Number
          </span>
          <div className="flex items-center gap-2">
            <p className="text-sm font-mono text-slate-900 font-bold">{order.customerPhone}</p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-emerald-700 hover:underline font-bold flex items-center gap-1"
            >
              (Open Chat)
            </a>
          </div>
        </div>

        {/* Email if available */}
        {order.customerEmail && (
          <div className="space-y-1">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <Mail className="w-4 h-4 text-slate-400" /> Email Address
            </span>
            <p className="text-sm text-slate-700">{order.customerEmail}</p>
          </div>
        )}

        {/* Delivery Address */}
        <div className="space-y-1 sm:col-span-2 pt-2 border-t border-slate-200">
          <span className="text-slate-500 flex items-center gap-1.5 font-medium mb-1">
            <MapPin className="w-4 h-4 text-blue-600" /> Delivery Address
          </span>
          <p className="text-xs sm:text-sm text-slate-900 font-bold bg-slate-50 p-3 rounded-xl border border-slate-200">
            {order.deliveryAddress || 'Standard Local Delivery'}
          </p>
        </div>
      </div>
    </div>
  );
}
