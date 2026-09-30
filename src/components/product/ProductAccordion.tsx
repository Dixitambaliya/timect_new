'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

interface AccordionItem {
  title: string;
  content: React.ReactNode;
}

interface ProductAccordionProps {
  items: AccordionItem[];
}

export default function ProductAccordion({ items }: ProductAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full mt-12 border-t border-gray-200">
      {items.map((item, index) => (
        <div key={index} className="border-b border-gray-200">
          <button
            className="w-full py-6 flex justify-between items-center text-left focus:outline-none"
            onClick={() => toggleAccordion(index)}
          >
            <span className="font-semibold text-[#0a1e36]">{item.title}</span>
            <span className="text-gray-400">
              {openIndex === index ? (
                <Minus size={20} />
              ) : (
                <Plus size={20} />
              )}
            </span>
          </button>
          
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              openIndex === index ? 'max-h-[1000px] opacity-100 pb-6' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="text-gray-600 text-sm">{item.content}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
