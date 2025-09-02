// src/components/compiler/LanguageSelector.tsx

import React from 'react';
import { Language, SUPPORTED_LANGUAGES } from '@/lib/compiler/languages';
import { ChevronDown } from 'lucide-react';

interface LanguageSelectorProps {
  selectedLanguage: Language;
  onLanguageChange: (language: Language) => void;
  disabled?: boolean;
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageChange,
  disabled = false,
  className = ''
}) => {
  return (
    <div className={`relative ${className}`}>
      <select
        value={selectedLanguage.name}
        onChange={(e) => {
          const language = SUPPORTED_LANGUAGES.find(lang => lang.name === e.target.value);
          if (language) {
            onLanguageChange(language);
          }
        }}
        disabled={disabled}
        className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {SUPPORTED_LANGUAGES.map((language) => (
          <option key={language.name} value={language.name}>
            {language.name}
          </option>
        ))}
      </select>
      <ChevronDown 
        size={16} 
        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none" 
      />
    </div>
  );
};