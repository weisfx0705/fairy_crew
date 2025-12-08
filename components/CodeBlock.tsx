
import React, { useState } from 'react';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';


interface CodeBlockProps {
    code: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-300 ring-1 ring-white/20">
            <button
                onClick={handleCopy}
                className="absolute top-2 right-2 p-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
                aria-label="複製腳本"
            >
                {copied ? (
                    <CheckIcon className="w-5 h-5 text-green-400" />
                ) : (
                    <ClipboardIcon className="w-5 h-5 text-gray-400" />
                )}
            </button>
            <pre><code>{code}</code></pre>
        </div>
    );
};
