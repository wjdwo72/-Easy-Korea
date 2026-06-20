'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import {
  Luggage,
  MapPin,
  CreditCard,
  Hotel,
  Stethoscope,
  Star,
  Crown,
} from 'lucide-react';
import ComingSoonModal from './ComingSoonModal';

const SERVICES = [
  {
    id: 'luggage',
    icon: Luggage,
    active: true,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    hover: 'hover:bg-blue-100',
    route: '/booking/luggage',
  },
  {
    id: 'tours',
    icon: MapPin,
    active: false,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    hover: 'hover:bg-emerald-100',
  },
  {
    id: 'localcard',
    icon: CreditCard,
    active: false,
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
    hover: 'hover:bg-cyan-100',
  },
  {
    id: 'hotel',
    icon: Hotel,
    active: false,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    hover: 'hover:bg-orange-100',
  },
  {
    id: 'medical',
    icon: Stethoscope,
    active: false,
    color: 'text-red-600',
    bg: 'bg-red-50',
    hover: 'hover:bg-red-100',
  },
  {
    id: 'experience',
    icon: Star,
    active: false,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    hover: 'hover:bg-yellow-100',
  },
  {
    id: 'vip',
    icon: Crown,
    active: false,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    hover: 'hover:bg-purple-100',
  },
] as const;

export default function ServiceGrid() {
  const { t } = useTranslation();
  const router = useRouter();
  const [modal, setModal] = useState<{ id: string; name: string } | null>(null);

  const handleClick = (svc: (typeof SERVICES)[number]) => {
    if (svc.active && 'route' in svc) {
      router.push(svc.route);
    } else {
      setModal({ id: svc.id, name: t(`services.${svc.id}.label`) });
    }
  };

  return (
    <>
      <div className="grid grid-cols-4 sm:flex sm:flex-nowrap sm:justify-center gap-3 sm:gap-4 w-full px-2 pt-3 pb-1">
        {SERVICES.map(svc => {
          const Icon = svc.icon;
          return (
            <button
              key={svc.id}
              onClick={() => handleClick(svc)}
              className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl ${svc.bg} ${svc.hover} transition-all duration-200 w-[76px] shrink-0 group cursor-pointer`}
            >
              <div className="p-3 rounded-xl bg-white shadow-sm group-hover:shadow transition-shadow">
                <Icon size={28} className={svc.color} />
              </div>
              <span className="text-[11px] font-medium text-gray-700 text-center whitespace-nowrap">
                {t(`services.${svc.id}.label`)}
              </span>
              {svc.active ? (
                <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                  NEW
                </span>
              ) : (
                <span className="absolute -top-1.5 -right-1.5 bg-gray-400 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                  Soon
                </span>
              )}
            </button>
          );
        })}
      </div>

      {modal && (
        <ComingSoonModal
          serviceCode={modal.id}
          serviceName={modal.name}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
