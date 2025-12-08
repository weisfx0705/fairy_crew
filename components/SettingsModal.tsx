import React, { useState, useEffect } from 'react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const [apiKey, setApiKey] = useState('');
    const [model, setModel] = useState('gemini-1.5-flash');

    useEffect(() => {
        if (isOpen) {
            const storedKey = localStorage.getItem('gemini_api_key') || '';
            const storedModel = localStorage.getItem('gemini_model') || 'gemini-1.5-flash';
            setApiKey(storedKey);
            setModel(storedModel);
        }
    }, [isOpen]);

    const handleSave = () => {
        localStorage.setItem('gemini_api_key', apiKey);
        localStorage.setItem('gemini_model', model);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-4">設定</h2>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                        Google API Key
                    </label>
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Enter your API Key"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        您的 API Key 僅會儲存在您的瀏覽器中。
                    </p>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                        模型 (Model)
                    </label>
                    <select
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                        <option value="gemini-1.5-flash">Gemini 1.5 Flash (快速)</option>
                        <option value="gemini-1.5-pro">Gemini 1.5 Pro (強大)</option>
                        <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash Exp (最新)</option>
                    </select>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-500 transition-colors font-semibold"
                    >
                        儲存
                    </button>
                </div>
            </div>
        </div>
    );
};
