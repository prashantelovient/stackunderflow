import React from 'react';
import { X, Zap, ShieldCheck, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface PurchaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    courseTitle: string;
    coursePrice: number;
    isLoading: boolean;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    courseTitle,
    coursePrice,
    isLoading
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-slate-900 border-white/10 text-white rounded-[2rem] overflow-hidden shadow-2xl">
                <DialogHeader className="space-y-4">
                    <div className="mx-auto w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-400/30">
                        <CreditCard className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div className="text-center space-y-2">
                        <DialogTitle className="text-2xl font-black tracking-tight uppercase">Confirm Purchase</DialogTitle>
                        <DialogDescription className="text-slate-400 text-sm">
                            You are about to authorize a secure transaction for this course asset.
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <div className="py-6 space-y-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                        <div className="flex justify-between items-start gap-4">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Course</span>
                            <span className="text-sm font-bold text-white text-right line-clamp-2">{courseTitle}</span>
                        </div>
                        <div className="h-px bg-white/5" />
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Amount Due</span>
                            <span className="text-xl font-black text-emerald-400">₹{coursePrice}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 px-2 py-1">
                        <ShieldCheck className="w-4 h-4 text-indigo-400" />
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Secured by Vault-Fake-Pay Protocols</span>
                    </div>
                </div>

                <DialogFooter className="flex sm:flex-col gap-3">
                    <Button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 text-white font-black uppercase text-xs tracking-widest rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 animate-pulse fill-white" />
                                Processing...
                            </div>
                        ) : (
                            'Authorize Purchase'
                        )}
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isLoading}
                        className="w-full h-12 text-slate-400 hover:text-white hover:bg-white/5 font-black uppercase text-xs tracking-widest rounded-xl"
                    >
                        Abort Transaction
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
