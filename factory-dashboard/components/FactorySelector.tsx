'use client';

import { Factory } from '@/types';
import { ChevronDown, MapPin } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface FactorySelectorProps {
  factories: Factory[];
  selectedFactory: Factory | null;
  onSelectFactory: (factory: Factory) => void;
}

export default function FactorySelector({
  factories,
  selectedFactory,
  onSelectFactory,
}: FactorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-600 transition-colors"
      >
        <MapPin className="w-5 h-5 text-blue-400" />
        <div className="text-left">
          <div className="text-sm font-medium text-white">
            {selectedFactory?.factory_name || 'Select Factory'}
          </div>
          <div className="text-xs text-gray-400">
            {selectedFactory?.location || 'No location'}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg border border-gray-600 shadow-xl z-50">
          <div className="p-2">
            {factories.map((factory) => (
              <button
                key={factory.id}
                onClick={() => {
                  onSelectFactory(factory);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                  selectedFactory?.id === factory.id
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-700 text-gray-300'
                }`}
              >
                <div className="font-medium">{factory.factory_name}</div>
                <div className="text-xs text-gray-400">{factory.location}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
